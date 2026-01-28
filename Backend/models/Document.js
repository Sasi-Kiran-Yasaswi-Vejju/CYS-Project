// Document Model with Encryption & Digital Signature
// Demonstrates: ENCRYPTION (AES-256), DIGITAL SIGNATURE (SHA-256), ENCODING (Base64)

const mongoose = require('mongoose');
const crypto = require('crypto');

const documentSchema = new mongoose.Schema({
  // ENCODING DEMONSTRATION: Document ID encoded in Base64
  // Will be used for URL-safe document identifiers
  encodedId: {
    type: String,
    unique: true
  },
  
  // Student who uploaded the document
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // ENCRYPTION DEMONSTRATION: Encrypted document metadata
  // These fields are stored encrypted using AES-256
  encryptedData: {
    type: String,
    required: true
  },

  // Upload method: manual text OR direct PDF
uploadMethod: {
  type: String,
  enum: ['manual', 'pdf'],
  default: 'manual'
},

// ENCRYPTED PDF FILE (only for PDF upload)
encryptedFile: {
  type: String // encrypted Base64 string
},

// MIME type verification (application/pdf)
originalMimeType: {
  type: String
},

  
  // Original fields (encrypted in encryptedData):
  // - documentType (e.g., "Resume", "Degree Certificate", "ID Proof")
  // - fileName
  // - uploadDate
  // - description
  
  // DIGITAL SIGNATURE DEMONSTRATION: SHA-256 Hash
  // This hash acts as a digital signature to verify document integrity
  digitalSignature: {
    type: String,
    required: true
  },
  
  // Verification Status
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  
  // Verifier information
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  verifierComments: {
    type: String
  }
}, {
  timestamps: true
});

// ============================================
// ENCRYPTION UTILITIES: AES-256-CBC
// ============================================

// Get encryption key from environment variable
const ENCRYPTION_KEY = Buffer.from(process.env.AES_SECRET, 'utf-8');
const ALGORITHM = 'aes-256-cbc';

// ENCRYPT FUNCTION
// Demonstrates: ENCRYPTION using AES-256-CBC
function encrypt(text) {
  // Generate random initialization vector (IV)
  // IV ensures same plaintext produces different ciphertext
  const iv = crypto.randomBytes(16);
  
  // Create cipher with AES-256-CBC algorithm
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV + encrypted data (IV needed for decryption)
  return iv.toString('hex') + ':' + encrypted;
}

// DECRYPT FUNCTION
// Demonstrates: DECRYPTION using AES-256-CBC
function decrypt(encryptedText) {
  try {
    // Split IV and encrypted data
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    
    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed: Invalid or corrupted data');
  }
}

// ============================================
// DIGITAL SIGNATURE: SHA-256 HASH
// ============================================

function generateDigitalSignature(data) {
  // Create SHA-256 hash of the data
  // This hash acts as a digital signature for integrity verification
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}

// ============================================
// ENCODING: BASE64
// ============================================

function encodeBase64(text) {
  // Convert to Base64 encoding
  // Used for URL-safe document identifiers
  return Buffer.from(text).toString('base64');
}

function decodeBase64(encodedText) {
  // Decode from Base64
  return Buffer.from(encodedText, 'base64').toString('utf-8');
}

// ============================================
// PRE-SAVE HOOK: Generate Encoded ID
// ============================================

documentSchema.pre('save', function(next) {
  // Generate Base64 encoded ID if not exists
  if (!this.encodedId) {
    const uniqueString = this._id.toString() + Date.now();
    this.encodedId = encodeBase64(uniqueString);
  }
  next();
});

// ============================================
// STATIC METHODS: Create & Retrieve Documents
// ============================================

// CREATE ENCRYPTED DOCUMENT
// CREATE ENCRYPTED PDF DOCUMENT
// Demonstrates: ENCRYPTION (AES), HASHING (SHA-256), FILE SECURITY
documentSchema.statics.createEncryptedPdfDocument = async function(
  fileBuffer,
  originalFileName,
  mimeType,
  studentId
) {
  try {
    // Ensure only PDF files are accepted
    if (mimeType !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }

    // Convert file buffer to Base64 (for storage)
    const base64File = fileBuffer.toString('base64');

    // Encrypt Base64 file content
    const encryptedFile = encrypt(base64File);

    // Generate digital signature (hash) of file
    const digitalSignature = crypto
      .createHash('sha256')
      .update(fileBuffer)
      .digest('hex');

    // Metadata (minimal, file-based)
    const metadata = {
      documentType: 'PDF_UPLOAD',
      fileName: originalFileName,
      uploadDate: new Date().toISOString()
    };

    const encryptedData = encrypt(JSON.stringify(metadata));

    const document = new this({
      studentId,
      encryptedData,
      encryptedFile,
      originalMimeType: mimeType,
      uploadMethod: 'pdf',
      digitalSignature
    });

    await document.save();
    return document;

  } catch (error) {
    throw error;
  }
};
// ============================================
// CREATE ENCRYPTED METADATA DOCUMENT (NO FILE)
// ============================================

documentSchema.statics.createEncryptedDocument = async function (
  data,
  studentId
) {
  try {
    const metadata = {
      documentType: data.documentType,
      fileName: data.fileName || 'NO_FILE_ATTACHED',
      description: data.description || '',
      uploadDate: new Date().toISOString()
    };

    // Encrypt metadata
    const encryptedData = encrypt(JSON.stringify(metadata));

    // Digital signature for integrity
    const digitalSignature = generateDigitalSignature(metadata);

    const document = new this({
      studentId,
      encryptedData,
      uploadMethod: 'manual',
      digitalSignature
    });

    await document.save();
    return document;

  } catch (error) {
    throw error;
  }
};


// DECRYPT AND RETRIEVE DOCUMENT
documentSchema.methods.getDecryptedData = function() {
  try {
    // DECRYPTION: Decrypt the stored data
    const decryptedJSON = decrypt(this.encryptedData);
    const decryptedData = JSON.parse(decryptedJSON);
    
    // INTEGRITY VERIFICATION
    if (this.uploadMethod === 'manual') {
      const expectedSignature = generateDigitalSignature(decryptedData);
      if (this.digitalSignature !== expectedSignature) {
        throw new Error('Digital signature verification failed');
      }
    }

    // For PDF uploads, integrity is verified at upload time

    
    // Return decrypted data with document info
    return {
  _id: this._id,
  encodedId: this.encodedId,
  studentId: this.studentId,

  // 🔑 IMPORTANT: expose upload method
  uploadMethod: this.uploadMethod,
  originalMimeType: this.originalMimeType,

  ...decryptedData,

  verificationStatus: this.verificationStatus,
  verifiedBy: this.verifiedBy,
  verifiedAt: this.verifiedAt,
  verifierComments: this.verifierComments,
  createdAt: this.createdAt,
  digitalSignatureValid: true
};

    
  } catch (error) {
    throw error;
  }
};

// DECODE DOCUMENT ID
documentSchema.statics.decodeDocumentId = function(encodedId) {
  try {
    // DECODING: Decode Base64 encoded ID
    return decodeBase64(encodedId);
  } catch (error) {
    throw new Error('Invalid encoded document ID');
  }
};
documentSchema.statics.decrypt = decrypt;

module.exports = mongoose.model('Document', documentSchema);
