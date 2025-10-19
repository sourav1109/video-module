# 🚀 Enterprise Scalability Guide - 10,000+ Concurrent Users

## Overview
This video call module is designed to handle **10,000+ concurrent users** across multiple live classes simultaneously, similar to CodeTantra's LMS infrastructure.

---

## 📊 Current Architecture Capabilities

### Single Server Limits
- **Maximum Concurrent Connections**: 1,000-2,000 users
- **Maximum Students per Class**: 300-500
- **Concurrent Classes**: 3-5 classes
- **Bandwidth Requirements**: 100-500 Mbps

### Enterprise Cluster (10k+ Users)
- **Total Concurrent Connections**: 10,000+
- **Maximum Students per Class**: 500+
- **Concurrent Classes**: 100+
- **Bandwidth Requirements**: 2-10 Gbps

---

## 🏗️ Production Architecture for 10,000+ Users

### Infrastructure Components

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET (Students)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              LOAD BALANCER (nginx/HAProxy)                   │
│  - SSL Termination                                           │
│  - Sticky Sessions (WebSocket)                               │
│  - Health Checks                                             │
└──────────┬───────────┬───────────┬───────────┬──────────────┘
           │           │           │           │
    ┌──────▼──┐  ┌────▼───┐  ┌───▼────┐  ┌──▼──────┐
    │ App     │  │ App    │  │ App    │  │ App     │
    │ Server  │  │ Server │  │ Server │  │ Server  │
    │ 1       │  │ 2      │  │ 3      │  │ 4-8...  │
    │ (2k)    │  │ (2k)   │  │ (2k)   │  │ (2k)    │
    └────┬────┘  └────┬───┘  └───┬────┘  └──┬──────┘
         │            │          │           │
         └────────────┴──────────┴───────────┘
                      │
         ┌────────────▼─────────────┐
         │   REDIS CLUSTER          │
         │   (Socket.IO Adapter)    │
         │   - Session Store        │
         │   - Pub/Sub Messages     │
         └────────────┬─────────────┘
                      │
         ┌────────────▼─────────────┐
         │   MONGODB CLUSTER        │
         │   (Replica Set)          │
         │   - Class Data           │
         │   - User Data            │
         │   - Recordings           │
         └──────────────────────────┘
```

---

## 💻 Hardware Requirements

### Application Server (Each)
```yaml
CPU: 8-16 cores (Intel Xeon or AMD EPYC)
RAM: 16-32 GB DDR4
Storage: 500 GB SSD (NVMe preferred)
Network: 10 Gbps NIC
Handles: 1,000-2,000 concurrent connections
```

### Redis Cluster
```yaml
Nodes: 3-6 (master + replicas)
CPU: 4-8 cores per node
RAM: 8-16 GB per node
Network: 10 Gbps
```

### MongoDB Cluster
```yaml
Nodes: 3-5 (replica set)
CPU: 8-16 cores per node
RAM: 32-64 GB per node
Storage: 1-5 TB SSD per node
Network: 10 Gbps
```

### Load Balancer
```yaml
CPU: 4-8 cores
RAM: 8-16 GB
Network: 10-40 Gbps
```

---

## 🔧 Configuration Updates

### 1. Enable Redis Clustering
```bash
# In backend/.env
USE_REDIS=true
REDIS_URL=redis://redis-cluster:6379
```

### 2. Update Mediasoup Workers
```bash
# In backend/.env
MEDIASOUP_WORKERS=8  # Match CPU cores
```

### 3. Enable Production Mode
```bash
# In backend/.env
NODE_ENV=production
USE_HTTPS=true
```

### 4. Configure Load Balancer (nginx)
```nginx
upstream backend_servers {
    # Sticky sessions for WebSocket
    ip_hash;
    
    server app1.yourdomain.com:5000 max_fails=3 fail_timeout=30s;
    server app2.yourdomain.com:5000 max_fails=3 fail_timeout=30s;
    server app3.yourdomain.com:5000 max_fails=3 fail_timeout=30s;
    server app4.yourdomain.com:5000 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl http2;
    server_name lms.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/private/privkey.pem;
    
    # WebSocket upgrade
    location / {
        proxy_pass http://backend_servers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Timeouts for long-lived connections
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

---

## 📈 Scaling Strategies

### Horizontal Scaling (Recommended)
1. **Add Application Servers**
   - Deploy 4-8 app server instances
   - Each handles 1,000-2,000 users
   - Auto-scale based on CPU/memory

2. **Redis Cluster**
   - 3-node cluster with replication
   - Handles Socket.IO pub/sub across servers
   - Stores session data

3. **MongoDB Replica Set**
   - 3-5 node replica set
   - Automatic failover
   - Read scaling with secondary nodes

### Vertical Scaling (Limited)
- Upgrade CPU cores: 8 → 16 → 32
- Increase RAM: 16GB → 32GB → 64GB
- Faster storage: SSD → NVMe
- **Limitation**: Max ~2,000 users per server

---

## 🌐 Network & Bandwidth

### Bandwidth Calculation
```
Per Student (average):
- Video (360p): 500 Kbps
- Audio: 50 Kbps
- Data (chat, whiteboard): 10 Kbps
Total per student: ~560 Kbps

For 500 students in one class:
- Incoming (teacher): 560 Kbps × 500 = 280 Mbps
- Outgoing (to students): 560 Kbps × 500 = 280 Mbps
Total bandwidth per class: ~560 Mbps

For 10 concurrent classes (5,000 students):
Total bandwidth: 5.6 Gbps
```

### Port Configuration
```bash
# Mediasoup RTC Ports
MEDIASOUP_MIN_PORT=10000
MEDIASOUP_MAX_PORT=11000
# 1,000 UDP ports = supports 300-500+ students

# For 10k users across 8 servers:
# Server 1: 10000-10124 (125 ports)
# Server 2: 10125-10249 (125 ports)
# Server 3: 10250-10374 (125 ports)
# ... etc
```

---

## 🎯 Performance Optimization

### 1. Enable Simulcast (Video Quality Adaptation)
```javascript
// In MediasoupService.js - already configured
ENABLE_SIMULCAST=true
```
- Teacher streams 3 quality levels (360p, 720p, 1080p)
- Students receive appropriate quality based on bandwidth
- Reduces server bandwidth by 60-70%

### 2. Adaptive Bitrate Control
```bash
ENABLE_ADAPTIVE_BITRATE=true
```
- Automatically adjusts video quality based on network
- Prevents buffering and lag

### 3. Connection Pooling
```bash
DB_POOL_SIZE=50
REDIS_POOL_SIZE=50
```

### 4. Node.js Optimization
```bash
NODE_OPTIONS=--max-old-space-size=4096 --gc-interval=100
```

---

## 📊 Monitoring & Alerts

### Key Metrics to Monitor

1. **Server Metrics**
   - CPU Usage: < 80%
   - Memory Usage: < 85%
   - Network I/O: < 80% capacity
   - Disk I/O: < 70%

2. **Application Metrics**
   - Active Connections: Track per server
   - Active Classes: Max 20-30 per server
   - WebRTC Peers: Track producer/consumer count
   - Socket.IO Events/sec: Track message rate

3. **Database Metrics**
   - MongoDB Connections: < 1000
   - Redis Memory Usage: < 80%
   - Query Response Time: < 100ms

4. **WebRTC Metrics**
   - Packet Loss: < 2%
   - Jitter: < 30ms
   - Round Trip Time (RTT): < 200ms

### Monitoring Stack (Recommended)

```yaml
Prometheus: Metrics collection
Grafana: Visualization dashboards
Node Exporter: Server metrics
PM2: Process management + monitoring
ELK Stack: Log aggregation
```

---

## 💰 Cost Estimation (AWS/Azure/GCP)

### Monthly Costs for 10,000 Concurrent Users

| Component | Specs | Monthly Cost |
|-----------|-------|--------------|
| 8× App Servers | c5.2xlarge (8 cores, 16GB) | $1,200 |
| Load Balancer | Application Load Balancer | $50 |
| Redis Cluster | 3× cache.m5.large | $200 |
| MongoDB Cluster | 3× m5.2xlarge | $400 |
| Storage | 5TB SSD | $500 |
| Bandwidth | 10TB/month | $900 |
| **Total** | | **~$3,250/month** |

### Alternative: Single Powerful Server (Testing)
| Component | Specs | Monthly Cost |
|-----------|-------|--------------|
| 1× Server | 32 cores, 64GB RAM | $400 |
| Storage | 1TB SSD | $100 |
| Bandwidth | 2TB/month | $180 |
| **Total** | | **~$680/month** |
| **Max Users** | | **~2,000 concurrent** |

---

## 🚀 Deployment Steps

### Step 1: Setup Load Balancer
```bash
# Install nginx
sudo apt update
sudo apt install nginx

# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/lms
sudo ln -s /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 2: Deploy App Servers (Each Server)
```bash
# Clone repository
git clone https://github.com/kajarigit/video-call-module-.git
cd video-call-module-

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Configure environment
cp .env.example .env
nano .env  # Update with production values

# Build frontend
npm run build

# Start with PM2 (production process manager)
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 3: Setup Redis Cluster
```bash
# Install Redis
sudo apt install redis-server

# Configure cluster mode
sudo nano /etc/redis/redis.conf
# Set: cluster-enabled yes

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis
```

### Step 4: Setup MongoDB Replica Set
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
sudo apt install mongodb-org

# Initialize replica set
mongosh
> rs.initiate({
    _id: "rs0",
    members: [
      { _id: 0, host: "mongo1:27017" },
      { _id: 1, host: "mongo2:27017" },
      { _id: 2, host: "mongo3:27017" }
    ]
  })
```

### Step 5: SSL Certificates (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d lms.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 🧪 Load Testing

### Using Artillery
```bash
# Install Artillery
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'wss://lms.yourdomain.com'
  phases:
    - duration: 300
      arrivalRate: 50
      name: "Ramp up to 1000 users"
    - duration: 600
      arrivalRate: 100
      name: "Sustain 10000 users"
scenarios:
  - engine: socketio
    flow:
      - emit:
          channel: "join-class"
          data:
            classId: "test-class-123"
      - think: 300
EOF

# Run test
artillery run load-test.yml
```

### Expected Results (10k Users)
```
✓ CPU Usage: 70-80% (per server)
✓ Memory Usage: 60-70% (per server)
✓ Response Time: < 100ms (average)
✓ WebSocket Connections: 10,000+ active
✓ Packet Loss: < 2%
✓ Video Quality: Stable 360p-720p
```

---

## 🛡️ Security Hardening

### 1. Rate Limiting
```javascript
// Already configured in server.js
RATE_LIMIT_MAX_REQUESTS=1000 per 15min
```

### 2. DDoS Protection
```bash
# Use Cloudflare or AWS Shield
# Enable connection limits
MAX_CONNECTIONS_PER_IP=50
```

### 3. Authentication
```javascript
// JWT-based authentication
// Token expiry: 24 hours
// Refresh token: 7 days
```

### 4. HTTPS Only
```bash
USE_HTTPS=true
# Redirect all HTTP to HTTPS
```

---

## 📚 Troubleshooting

### Issue: Server Running Out of Ports
**Solution**: Increase port range
```bash
MEDIASOUP_MAX_PORT=20000  # Double the ports
```

### Issue: High CPU Usage
**Solution**: Add more app servers or enable simulcast
```bash
MEDIASOUP_WORKERS=16  # More workers
ENABLE_SIMULCAST=true
```

### Issue: Connection Drops
**Solution**: Check Redis and enable sticky sessions
```nginx
upstream backend_servers {
    ip_hash;  # Sticky sessions
    ...
}
```

### Issue: Slow Database Queries
**Solution**: Add MongoDB indexes
```javascript
db.liveClasses.createIndex({ classId: 1, status: 1 })
db.participants.createIndex({ classId: 1, userId: 1 })
```

---

## ✅ Production Checklist

- [ ] Enable Redis clustering (`USE_REDIS=true`)
- [ ] Configure load balancer with sticky sessions
- [ ] Set up SSL certificates (HTTPS mandatory)
- [ ] Deploy 4-8 app servers
- [ ] Configure MongoDB replica set
- [ ] Enable monitoring (Prometheus + Grafana)
- [ ] Set up automated backups
- [ ] Configure auto-scaling rules
- [ ] Perform load testing (10k+ users)
- [ ] Set up alerting (email/SMS/Slack)
- [ ] Configure CDN for static assets
- [ ] Enable firewall rules
- [ ] Document runbooks for incidents
- [ ] Train operations team

---

## 📞 Support & Resources

- **Documentation**: [Full API Docs](./API_DOCUMENTATION.md)
- **Code Index**: [CODE_INDEX.json](./CODE_INDEX.json)
- **Critical Issues**: [CRITICAL_ISSUES_AND_FIXES.md](./CRITICAL_ISSUES_AND_FIXES.md)

---

**Built for Enterprise Scale** | Designed to handle 10,000+ concurrent users | CodeTantra-inspired architecture
