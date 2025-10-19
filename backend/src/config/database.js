const { Pool } = require('pg');

class DatabaseService {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  /**
   * Initialize PostgreSQL connection pool
   */
  async initialize() {
    try {
      console.log('🐘 Initializing PostgreSQL connection...');

      // Support both DATABASE_URL (for cloud providers) and individual config
      const poolConfig = process.env.DATABASE_URL 
        ? {
            // Use connection string (Neon, Supabase, Railway, etc.)
            connectionString: process.env.DATABASE_URL,
            ssl: {
              rejectUnauthorized: false // Required for most cloud providers
            },
            // Connection pool settings (optimized for 10k+ users)
            max: parseInt(process.env.DB_POOL_SIZE) || 100,
            min: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000, // Longer timeout for cloud
            statement_timeout: 30000,
            query_timeout: 30000,
          }
        : {
            // Use individual config (local Docker/PostgreSQL)
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME || 'sgt_lms',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            
            // Connection pool settings (optimized for 10k+ users)
            max: parseInt(process.env.DB_POOL_SIZE) || 100,
            min: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
            statement_timeout: 30000,
            query_timeout: 30000,
            
            // SSL settings for production
            ssl: process.env.DB_SSL === 'true' ? {
              rejectUnauthorized: false
            } : false
          };

      console.log('🔧 Database configuration:', {
        type: process.env.DATABASE_URL ? 'Cloud (CONNECTION_STRING)' : 'Local/Docker',
        host: process.env.DATABASE_URL ? 'from connection string' : (process.env.DB_HOST || 'localhost'),
        ssl: poolConfig.ssl ? 'enabled' : 'disabled'
      });

      // Create connection pool
      this.pool = new Pool(poolConfig);

      // Test connection
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();

      this.isConnected = true;
      console.log('✅ PostgreSQL connected successfully');
      console.log(`📊 Server time: ${result.rows[0].now}`);
      console.log(`📦 Pool size: ${this.pool.totalCount} (max: ${this.pool.options.max})`);

      // Set up error handler
      this.pool.on('error', (err) => {
        console.error('❌ Unexpected database error:', err);
      });

      // Monitor pool
      this.monitorPool();

      return this.pool;

    } catch (error) {
      console.error('❌ PostgreSQL connection error:', error);
      throw error;
    }
  }

  /**
   * Monitor connection pool health
   */
  monitorPool() {
    setInterval(() => {
      if (this.pool) {
        const status = {
          total: this.pool.totalCount,
          idle: this.pool.idleCount,
          waiting: this.pool.waitingCount
        };
        
        console.log('📊 Pool Status:', status);
        
        // Alert if pool is exhausted
        if (status.waiting > 10) {
          console.warn('⚠️ Database pool has many waiting clients:', status.waiting);
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Execute a query
   */
  async query(text, params) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        console.warn(`⚠️ Slow query (${duration}ms):`, text);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Query error:', error);
      console.error('Query:', text);
      console.error('Params:', params);
      throw error;
    }
  }

  /**
   * Get a client from the pool (for transactions)
   */
  async getClient() {
    return await this.pool.connect();
  }

  /**
   * Execute a transaction
   */
  async transaction(callback) {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Close all connections
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      console.log('🔌 PostgreSQL connection closed');
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    if (!this.pool) return null;
    
    return {
      totalConnections: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      waitingRequests: this.pool.waitingCount,
      maxConnections: this.pool.options.max
    };
  }
}

// Create singleton instance
const db = new DatabaseService();

module.exports = db;
