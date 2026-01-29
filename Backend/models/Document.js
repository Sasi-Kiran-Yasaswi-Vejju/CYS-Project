// models/Document.js
// Hybrid Encryption Document Model
// AES-256 + RSA + SHA-256 + Base64

const mongoose = require('mongoose');
const crypto = require('crypto');
const cryptoService = require('../utils/cryptoService');

const documentSchema = new mongoose.Schema({
  encodedId: { type: String, unique: true },

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Encrypted metadata
  encryptedData: { type: String, required: true },
  ivMeta: { type: String, required: true },

  // Encrypted PDF (optional)
  encryptedFile: { type: String },
  ivFile: { type: String },

  // RSA wrapped AES key
  encryptedAESKey: { type: String, required: true },

  uploadMethod: {
    type: String,
    enum: ['manual', 'pdf'],
    default: 'manual'
  },

  originalMimeType: String,

  digitalSignature: {
    type: String,
    required: true
  },

  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },

  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  verifierComments: String
}, { timestamps: true });

/* ================= BASE64 ================= */

function encodeBase64(text) {
  return Buffer.from(text).toString('base64');
}

/* ================= HASH ================= */

function generateDigitalSignature(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/* ================= PRE-SAVE ================= */

documentSchema.pre('save', function (next) {
  if (!this.encodedId) {
    this.encodedId = encodeBase64(this._id.toString() + Date.now());
  }
  next();
});

/* ================= PDF UPLOAD ================= */

documentSchema.statics.createEncryptedPdfDocument = async function (
  fileBuffer,
  originalFileName,
  mimeType,
  studentId
) {
  if (mimeType !== 'application/pdf') {
    throw new Error('Only PDF files allowed');
  }

  const aesKey = cryptoService.generateAESKey();

  // Encrypt PDF
  const pdfBase64 = fileBuffer.toString('base64');
  const pdfEnc = cryptoService.encryptWithAES(pdfBase64, aesKey);

  // Encrypt metadata
  const metadata = {
    documentType: 'PDF_UPLOAD',
    fileName: originalFileName,
    uploadDate: new Date().toISOString()
  };

  const metaEnc = cryptoService.encryptWithAES(
    JSON.stringify(metadata),
    aesKey
  );

  const encryptedAESKey = cryptoService.encryptAESKeyWithRSA(aesKey);

  const digitalSignature = crypto
    .createHash('sha256')
    .update(fileBuffer)
    .digest('hex');

  const doc = new this({
    studentId,
    encryptedData: metaEnc.encryptedData,
    ivMeta: metaEnc.iv,
    encryptedFile: pdfEnc.encryptedData,
    ivFile: pdfEnc.iv,
    encryptedAESKey,
    uploadMethod: 'pdf',
    originalMimeType: mimeType,
    digitalSignature
  });

  await doc.save();
  return doc;
};

/* ================= TEXT ONLY ================= */

documentSchema.statics.createEncryptedDocument = async function (data, studentId) {
  const metadata = {
    documentType: data.documentType,
    fileName: data.fileName || 'NO_FILE_ATTACHED',
    description: data.description || '',
    uploadDate: new Date().toISOString()
  };

  const aesKey = cryptoService.generateAESKey();
  const metaEnc = cryptoService.encryptWithAES(
    JSON.stringify(metadata),
    aesKey
  );

  const encryptedAESKey = cryptoService.encryptAESKeyWithRSA(aesKey);
  const digitalSignature = generateDigitalSignature(metadata);

  const doc = new this({
    studentId,
    encryptedData: metaEnc.encryptedData,
    ivMeta: metaEnc.iv,
    encryptedAESKey,
    uploadMethod: 'manual',
    digitalSignature
  });

  await doc.save();
  return doc;
};

/* ================= DECRYPT ================= */

documentSchema.methods.getDecryptedData = function () {
  const aesKey =
    cryptoService.decryptAESKeyWithRSA(this.encryptedAESKey);

  const decryptedJSON = cryptoService.decryptWithAES(
    this.encryptedData,
    aesKey,
    this.ivMeta
  );

  const data = JSON.parse(decryptedJSON);

  if (this.uploadMethod === 'manual') {
    const sig = generateDigitalSignature(data);
    if (sig !== this.digitalSignature) {
      throw new Error('Signature mismatch');
    }
  }

  return {
    _id: this._id,
    encodedId: this.encodedId,

    // 🔥 FIX: normalize field name
    student: this.studentId,

    uploadMethod: this.uploadMethod,
    originalMimeType: this.originalMimeType,
    ...data,
    verificationStatus: this.verificationStatus,
    verifiedBy: this.verifiedBy,
    verifiedAt: this.verifiedAt,
    verifierComments: this.verifierComments,
    createdAt: this.createdAt,
    digitalSignatureValid: true
  };
};

module.exports = mongoose.model('Document', documentSchema);
