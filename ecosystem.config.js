module.exports = {
  apps: [
    {
      name: 'basavamart-api',
      script: './index.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 8080
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      
      // Error and output logs
      error_file: '/var/log/pm2/basavamart-error.log',
      out_file: '/var/log/pm2/basavamart-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      watch: false,
      ignore_watch: ['node_modules', 'uploads'],
      max_memory_restart: '500M',
      
      // Auto restart
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 3000
    }
  ],
  
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-vps-ip',
      key: '~/.ssh/id_rsa',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/Basavamart-userpanel.git',
      path: '/var/www/basavamart',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
