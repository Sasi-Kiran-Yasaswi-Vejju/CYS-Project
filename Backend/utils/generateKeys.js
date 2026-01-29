const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'pkcs1',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs1',
    format: 'pem'
  }
});

const keysDir = path.join(__dirname, '../keys');
if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir);

fs.writeFileSync(path.join(keysDir, 'admin_private.pem'), privateKey);
fs.writeFileSync(path.join(keysDir, 'admin_public.pem'), publicKey);

console.log('✅ RSA keys generated successfully');
