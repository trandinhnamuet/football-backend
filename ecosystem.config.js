module.exports = {
  apps: [
    {
      name: 'football-backend',
      script: './dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
      },
      // Load .env file as well
      cwd: './',
    },
  ],
};
