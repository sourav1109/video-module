const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔐 Setting up SSL certificates for HTTPS...\n');

const sslDir = path.join(__dirname, 'ssl');
const certPath = path.join(sslDir, 'cert.pem');
const keyPath = path.join(sslDir, 'key.pem');

// Create SSL directory if it doesn't exist
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
  console.log('✅ Created ssl directory');
}

// Check if certificates already exist
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  console.log('✅ SSL certificates already exist!');
  console.log(`   Certificate: ${certPath}`);
  console.log(`   Key: ${keyPath}\n`);
  process.exit(0);
}

// Generate self-signed certificate using OpenSSL
console.log('📝 Generating self-signed SSL certificate...');

try {
  // Try to use openssl if available
  const opensslCmd = `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/CN=localhost/O=SGT-LMS/C=IN" -addext "subjectAltName=DNS:localhost,DNS:127.0.0.1,IP:127.0.0.1,IP:10.164.114.166"`;
  
  execSync(opensslCmd, { stdio: 'inherit' });
  
  console.log('\n✅ SSL certificates generated successfully!');
  console.log(`   Certificate: ${certPath}`);
  console.log(`   Key: ${keyPath}`);
  console.log('\n🎉 You can now run the server with HTTPS!');
  
} catch (error) {
  console.error('\n❌ OpenSSL not found. Installing using Node.js fallback...\n');
  
  // Fallback: Use Node.js built-in crypto to generate certificate
  const forge = require('node-forge');
  const pki = forge.pki;
  
  console.log('📝 Generating certificate using node-forge...');
  
  // Generate a keypair
  const keys = pki.rsa.generateKeyPair(2048);
  
  // Create a certificate
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  
  const attrs = [{
    name: 'commonName',
    value: 'localhost'
  }, {
    name: 'countryName',
    value: 'IN'
  }, {
    name: 'organizationName',
    value: 'SGT-LMS'
  }];
  
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  
  cert.setExtensions([{
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }, {
    name: 'subjectAltName',
    altNames: [{
      type: 2, // DNS
      value: 'localhost'
    }, {
      type: 2,
      value: '127.0.0.1'
    }, {
      type: 7, // IP
      ip: '127.0.0.1'
    }, {
      type: 7,
      ip: '10.164.114.166'
    }]
  }]);
  
  // Self-sign certificate
  cert.sign(keys.privateKey);
  
  // Convert to PEM format
  const pemCert = pki.certificateToPem(cert);
  const pemKey = pki.privateKeyToPem(keys.privateKey);
  
  // Save to files
  fs.writeFileSync(certPath, pemCert);
  fs.writeFileSync(keyPath, pemKey);
  
  console.log('\n✅ SSL certificates generated successfully!');
  console.log(`   Certificate: ${certPath}`);
  console.log(`   Key: ${keyPath}`);
  console.log('\n🎉 You can now run the server with HTTPS!');
}

console.log('\n📋 Next steps:');
console.log('1. The certificates are self-signed, so browsers will show a warning');
console.log('2. Click "Advanced" and "Proceed to localhost (unsafe)" to accept');
console.log('3. This is normal for development and safe for local testing');
console.log('4. Both devices can now access camera with HTTPS!\n');
