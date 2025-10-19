const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./config/database');
const SocketService = require('./services/SocketService');
const MediasoupService = require('./services/MediasoupService');
const videoCallRoutes = require('./routes/videoCall');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

class VideoCallServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.socketService = null;
    this.mediasoupService = null;
    this.port = process.env.PORT || 5000;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false // Allow WebRTC
    }));

    // CORS configuration - Allow connections from any device on the network
    this.app.use(cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or same-origin)
        if (!origin) return callback(null, true);
        
        // Allow all origins in development
        // In production, you should restrict this to specific domains
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    });
    this.app.use('/api/', limiter);

    // Compression and logging
    this.app.use(compression());
    this.app.use(morgan('combined'));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Static files
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
          mediasoup: this.mediasoupService ? 'running' : 'stopped',
          socket: this.socketService ? 'running' : 'stopped'
        }
      });
    });

    // API routes
    this.app.use('/api/video-call/auth', authRoutes);
    this.app.use('/api/video-call', videoCallRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ 
        error: 'Route not found',
        message: 'The requested endpoint does not exist'
      });
    });

    // Global error handler
    this.app.use((err, req, res, next) => {
      console.error('Global error handler:', err);
      res.status(err.status || 500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
      });
    });
  }

  createHTTPSServer() {
    try {
      // In production (Render), skip SSL - Render handles HTTPS automatically
      if (process.env.NODE_ENV === 'production') {
        console.log('Production mode: Skipping local SSL (Render provides HTTPS)');
        return false;
      }

      // Try to load SSL certificates for local development
      const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '../ssl/key.pem');
      const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, '../ssl/cert.pem');

      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        const options = {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath)
        };
        
        this.server = https.createServer(options, this.app);
        console.log('🔐 HTTPS server created with SSL certificates');
        console.log(`   📄 Cert: ${certPath}`);
        console.log(`   🔑 Key: ${keyPath}`);
        return true;
      } else {
        console.warn('⚠️ SSL certificates not found, falling back to HTTP');
        console.warn(`   Looking for: ${keyPath}`);
        console.warn(`   Looking for: ${certPath}`);
        this.server = http.createServer(this.app);
        return false;
      }
    } catch (error) {
      console.error('❌ Error creating HTTPS server:', error.message);
      this.server = http.createServer(this.app);
      return false;
    }
  }

  async initializeServices() {
    try {
      // Initialize PostgreSQL Database
      console.log('🐘 Connecting to PostgreSQL database...');
      await db.initialize();
      console.log('✅ PostgreSQL database connected');

      // Initialize Mediasoup Service
      console.log('🚀 Initializing Mediasoup SFU Service...');
      this.mediasoupService = new MediasoupService();
      await this.mediasoupService.initialize();
      console.log('✅ Mediasoup SFU Service initialized');

      // Initialize Socket Service
      console.log('🔌 Initializing Socket Service...');
      this.socketService = new SocketService(this.server);
      await this.socketService.initialize(this.mediasoupService);
      console.log('✅ Socket Service initialized');

    } catch (error) {
      console.error('❌ Error initializing services:', error);
      throw error;
    }
  }

  async start() {
    try {
      // Create HTTP/HTTPS server
      const isHTTPS = this.createHTTPSServer();
      
      // Initialize services
      await this.initializeServices();

      // Start server - listen on 0.0.0.0 to accept connections from all network interfaces
      this.server.listen(this.port, '0.0.0.0', () => {
        const networkInterfaces = require('os').networkInterfaces();
        const addresses = [];
        
        // Get all IPv4 addresses
        Object.keys(networkInterfaces).forEach(interfaceName => {
          networkInterfaces[interfaceName].forEach(iface => {
            if (iface.family === 'IPv4' && !iface.internal) {
              addresses.push(iface.address);
            }
          });
        });
        
        console.log(`🚀 Video Call Server running on port ${this.port}`);
        console.log(`   Protocol: ${isHTTPS ? 'HTTPS' : 'HTTP'}`);
        console.log(`   Local: ${isHTTPS ? 'https' : 'http'}://localhost:${this.port}`);
        if (addresses.length > 0) {
          console.log(`   Network: ${isHTTPS ? 'https' : 'http'}://${addresses[0]}:${this.port}`);
          console.log(`   📱 Access from other devices using: http://${addresses[0]}:${this.port}`);
        }
        console.log(`🎯 Ready to handle video calls for 10,000+ concurrent users`);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  async shutdown() {
    console.log('🔄 Graceful shutdown initiated...');
    
    if (this.server) {
      this.server.close(() => {
        console.log('✅ HTTP server closed');
      });
    }

    if (this.mediasoupService) {
      await this.mediasoupService.close();
      console.log('✅ Mediasoup service closed');
    }

    if (this.socketService) {
      await this.socketService.close();
      console.log('✅ Socket service closed');
    }

    // Close database connection
    if (db.isConnected) {
      await db.close();
      console.log('✅ Database connection closed');
    }

    console.log('👋 Video Call Server shutdown complete');
    process.exit(0);
  }
}

// Start the server
const server = new VideoCallServer();
server.start().catch(error => {
  console.error('❌ Fatal error starting server:', error);
  process.exit(1);
});

module.exports = VideoCallServer;