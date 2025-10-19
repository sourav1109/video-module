// PM2 Ecosystem Configuration for Enterprise Deployment (10k+ Users)
module.exports = {
  apps: [
    {
      name: 'sgt-lms-backend',
      script: './src/server.js',
      cwd: './backend',
      instances: 4, // Cluster mode: 4 instances (adjust based on CPU cores)
      exec_mode: 'cluster',
      max_memory_restart: '2G',
      
      // Environment variables
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        USE_REDIS: true,
        MEDIASOUP_WORKERS: 8,
        MAX_STUDENTS_PER_CLASS: 500,
        MAX_CONCURRENT_CLASSES: 100
      },
      
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
        USE_REDIS: false,
        MEDIASOUP_WORKERS: 4
      },
      
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      merge_logs: true,
      
      // Auto-restart configuration
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Performance monitoring
      instance_var: 'INSTANCE_ID',
      
      // Kill timeout
      kill_timeout: 5000,
      listen_timeout: 10000,
      
      // Node.js options
      node_args: '--max-old-space-size=4096 --gc-interval=100'
    },
    
    {
      name: 'sgt-lms-frontend',
      script: 'serve',
      cwd: './frontend',
      env: {
        PM2_SERVE_PATH: './build',
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      merge_logs: true,
      
      autorestart: true
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'deploy',
      host: ['app1.yourdomain.com', 'app2.yourdomain.com', 'app3.yourdomain.com', 'app4.yourdomain.com'],
      ref: 'origin/master',
      repo: 'git@github.com:kajarigit/video-call-module-.git',
      path: '/var/www/sgt-lms',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    },
    
    staging: {
      user: 'deploy',
      host: 'staging.yourdomain.com',
      ref: 'origin/develop',
      repo: 'git@github.com:kajarigit/video-call-module-.git',
      path: '/var/www/sgt-lms-staging',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env development',
      env: {
        NODE_ENV: 'development'
      }
    }
  }
};
