# Enable HTTPS for Network Access
# This allows camera/microphone access from network IP addresses

# Generate self-signed SSL certificate (valid for 365 days)
# Run this in PowerShell as Administrator

$certPath = "C:\Users\hp\Desktop\vcfinal\video-call-module-\frontend\ssl"
New-Item -ItemType Directory -Force -Path $certPath

# Create certificate
$cert = New-SelfSignedCertificate `
    -Subject "CN=10.164.114.166" `
    -DnsName "10.164.114.166", "localhost", "127.0.0.1" `
    -KeyAlgorithm RSA `
    -KeyLength 2048 `
    -NotAfter (Get-Date).AddDays(365) `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -FriendlyName "Video Call Dev Certificate" `
    -HashAlgorithm SHA256 `
    -KeyUsage DigitalSignature, KeyEncipherment, DataEncipherment `
    -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1")

# Export to PEM format (for React dev server)
$certThumbprint = $cert.Thumbprint
$certPwd = ConvertTo-SecureString -String "dev-password" -Force -AsPlainText

# Export certificate
Export-PfxCertificate -Cert "Cert:\CurrentUser\My\$certThumbprint" `
    -FilePath "$certPath\localhost.pfx" `
    -Password $certPwd

# Note: You'll need to convert PFX to PEM manually or use openssl
# For Windows, download openssl from: https://slproweb.com/products/Win32OpenSSL.html

Write-Host "Certificate created! Thumbprint: $certThumbprint"
Write-Host "Certificate exported to: $certPath\localhost.pfx"
Write-Host ""
Write-Host "To use with React dev server, you need to:"
Write-Host "1. Install OpenSSL for Windows"
Write-Host "2. Convert PFX to PEM files using OpenSSL"
Write-Host "3. Update HTTPS=true in .env"
