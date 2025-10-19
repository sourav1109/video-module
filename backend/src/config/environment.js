// Production environment configuration for Render
if (process.env.NODE_ENV === 'production') {
  // Don't load SSL certificates in production (Render handles HTTPS)
  process.env.SSL_KEY_PATH = '';
  process.env.SSL_CERT_PATH = '';
}

module.exports = {
  isProduction: process.env.NODE_ENV === 'production',
  port: process.env.PORT || 5000,
  cors: {
    origin: process.env.CORS_ORIGIN || true
  }
};
