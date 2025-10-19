const path = require('path');
const fs = require('fs');

// Simulate being in src/server.js
const keyPath = path.join(__dirname, '../ssl/key.pem');
const certPath = path.join(__dirname, '../ssl/cert.pem');

console.log('Current directory:', __dirname);
console.log('Key path:', keyPath);
console.log('Cert path:', certPath);
console.log('Key exists:', fs.existsSync(keyPath));
console.log('Cert exists:', fs.existsSync(certPath));

// List actual ssl directory contents
const sslDir = path.join(__dirname, '../ssl');
console.log('\nSSL directory:', sslDir);
console.log('SSL directory exists:', fs.existsSync(sslDir));
if (fs.existsSync(sslDir)) {
  console.log('Contents:', fs.readdirSync(sslDir));
}
