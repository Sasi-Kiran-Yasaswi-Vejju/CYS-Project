// utils/cryptoService.js
// Demonstrates: HYBRID ENCRYPTION (AES + RSA), Secure Key Management

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ===============================
// CONFIG
// ===============================

const AES_ALGORITHM = 'aes-256-cbc';
const AES_KEY_LENGTH = 32; // 256-bit AES
const IV_LENGTH = 16;

// ===============================
// LOAD RSA KEYS (SYSTEM OWNED)
// ===============================

const ADMIN_PUBLIC_KEY = fs.readFileSync(
  path.resolve(process.env.ADMIN_PUBLIC_KEY_PATH),
  'utf8'
);

const ADMIN_PRIVATE_KEY = fs.readFileSync(
  path.resolve(process.env.ADMIN_PRIVATE_KEY_PATH),
  'utf8'
);

// ===============================
// AES KEY GENERATION (PER DOCUMENT)
// ===============================

function generateAESKey() {
  return crypto.randomBytes(AES_KEY_LENGTH);
}

// ===============================
// AES ENCRYPTION
// ===============================

function encryptWithAES(data, aesKey) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(AES_ALGORITHM, aesKey, iv);

  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return {
    encryptedData: encrypted,
    iv: iv.toString('base64')
  };
}

// ===============================
// AES DECRYPTION
// ===============================

function decryptWithAES(encryptedData, aesKey, iv) {
  const decipher = crypto.createDecipheriv(
    AES_ALGORITHM,
    aesKey,
    Buffer.from(iv, 'base64')
  );

  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// ===============================
// RSA ENCRYPT (WRAP AES KEY)
// ===============================

function encryptAESKeyWithRSA(aesKey) {
  return crypto.publicEncrypt(
    {
      key: ADMIN_PUBLIC_KEY,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    aesKey
  ).toString('base64');
}

// ===============================
// RSA DECRYPT (UNWRAP AES KEY)
// ===============================

function decryptAESKeyWithRSA(encryptedAESKey) {
  return crypto.privateDecrypt(
    {
      key: ADMIN_PRIVATE_KEY,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.from(encryptedAESKey, 'base64')
  );
}

// ===============================
// EXPORTS
// ===============================

module.exports = {
  generateAESKey,
  encryptWithAES,
  decryptWithAES,
  encryptAESKeyWithRSA,
  decryptAESKeyWithRSA
};
