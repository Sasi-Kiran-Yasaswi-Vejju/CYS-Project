// Document Routes
// Demonstrates: ENCRYPTION (AES-256), DIGITAL SIGNATURE (SHA-256), ENCODING (Base64), AUTHORIZATION
const multer = require('multer');

const express = require('express');
const Document = require('../models/Document');
const User = require('../models/User');
const { sendVerificationStatusEmail } = require('../utils/emailService');
const { 
  authenticateToken, 
  authorizeStudentOnly, 
  authorizeVerifier,
  authorizeViewAll 
} = require('../models/authMiddleware');

const router = express.Router();
// Multer configuration (in-memory storage for security)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  }
});

// ============================================
// UPLOAD DOCUMENT (Students Only)
// ============================================
// Demonstrates: ENCRYPTION, DIGITAL SIGNATURE, ENCODING, AUTHORIZATION

router.post(
  '/upload',
  authenticateToken,
  authorizeStudentOnly,
  upload.single('file'),
  async (req, res) => {
    try {
      const { documentType, description } = req.body;

      // Rule: at least one input required
      if (!req.file && !description) {
        return res.status(400).json({
          error: 'Please upload a PDF or enter description'
        });
      }

      let document;

      // CASE 1: PDF uploaded
      if (req.file) {
        document = await Document.createEncryptedPdfDocument(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          req.user._id
        );
      }
      // CASE 2: No file → metadata only
      else {
        document = await Document.createEncryptedDocument(
          {
            documentType,
            fileName: null,
            description
          },
          req.user._id
        );
      }

      res.status(201).json({
        message: 'Document uploaded securely',
        document
      });

    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({
        error: 'Failed to upload document',
        details: error.message
      });
    }
  }
);

// ============================================
// UPLOAD PDF DOCUMENT (Students Only)
// ============================================
// Demonstrates: FILE UPLOAD, ENCRYPTION, HASHING, AUTHORIZATION

router.post(
  '/upload-pdf',
  authenticateToken,
  authorizeStudentOnly,
  upload.single('file'),
  async (req, res) => {
    try {
      // Ensure file is provided
      if (!req.file) {
        return res.status(400).json({ error: 'PDF file is required' });
      }

      // Create encrypted PDF document
      const document = await Document.createEncryptedPdfDocument(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user._id
      );

      res.status(201).json({
        message: 'PDF document uploaded securely',
        securityFeatures: {
          encryption: 'AES-256 applied to PDF file',
          digitalSignature: 'SHA-256 hash generated from file',
          storage: 'In-memory upload, encrypted before persistence'
        },
        document: {
          id: document._id,
          encodedId: document.encodedId,
          uploadMethod: document.uploadMethod,
          verificationStatus: document.verificationStatus,
          createdAt: document.createdAt
        }
      });

    } catch (error) {
      console.error('PDF upload error:', error);
      res.status(500).json({ error: 'Failed to upload PDF document' });
    }
  }
);

// ============================================
// GET MY DOCUMENTS (Student - Own Documents)
// ============================================
// Demonstrates: DECRYPTION, AUTHORIZATION

router.get('/my-documents', authenticateToken, async (req, res) => {
  try {
    // Students can only view their own documents
    // Officers/Admins should use /all-documents endpoint
    
    const documents = await Document.find({ studentId: req.user._id }).sort('-createdAt');
    
    // Decrypt each document
    const decryptedDocuments = documents.map(doc => {
      try {
        return doc.getDecryptedData();
      } catch (error) {
        console.error('Decryption error for document:', doc._id, error);
        return null;
      }
    }).filter(doc => doc !== null);
    
    res.json({
      message: 'Documents retrieved and decrypted',
      securityNote: 'AES-256 decryption applied, digital signature verified',
      count: decryptedDocuments.length,
      documents: decryptedDocuments
    });
    
  } catch (error) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// ============================================
// GET ALL DOCUMENTS (Officers & Admins Only)
// ============================================
// Demonstrates: AUTHORIZATION (Access Control Matrix)

router.get('/all-documents', authenticateToken, authorizeViewAll, async (req, res) => {
  try {
    // AUTHORIZATION: Only officers and admins can view all documents
    // Enforced by authorizeViewAll middleware
    
    const documents = await Document.find()
      .populate('studentId', 'name email studentId department')
      .populate('verifiedBy', 'name email role')
      .sort('-createdAt');
    
    // Decrypt each document
    const decryptedDocuments = documents.map(doc => {
      try {
        const decrypted = doc.getDecryptedData();
        return {
          ...decrypted,
          student: doc.studentId,
          verifier: doc.verifiedBy
        };
      } catch (error) {
        console.error('Decryption error:', error);
        return null;
      }
    }).filter(doc => doc !== null);
    
    res.json({
      message: 'All documents retrieved',
      securityNote: 'Access granted via Access Control Matrix - Officer/Admin role',
      count: decryptedDocuments.length,
      documents: decryptedDocuments
    });
    
  } catch (error) {
    console.error('Fetch all documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// ============================================
// GET SINGLE DOCUMENT BY ID
// ============================================
// Demonstrates: DECODING (Base64), DECRYPTION, AUTHORIZATION

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('studentId', 'name email studentId department')
      .populate('verifiedBy', 'name email role');
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // AUTHORIZATION: Check if user has permission to view
    const isOwner = document.studentId._id.toString() === req.user._id.toString();
    const canViewAll = req.user.role === 'officer' || req.user.role === 'admin';
    
    if (!isOwner && !canViewAll) {
      return res.status(403).json({ 
        error: 'Access denied. You do not have permission to view this document.',
        securityNote: 'Authorization failed - not owner and not officer/admin'
      });
    }
    
    // DECRYPTION & VERIFICATION
    const decryptedData = document.getDecryptedData();
    
    res.json({
      message: 'Document retrieved successfully',
      securityNote: 'Decrypted with AES-256, digital signature verified',
      document: {
        ...decryptedData,
        student: document.studentId,
        verifier: document.verifiedBy
      }
    });
    
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to retrieve document' });
  }
});

// ============================================
// VERIFY/REJECT DOCUMENT (Officers & Admins Only)
// ============================================
// Demonstrates: AUTHORIZATION (Access Control)

router.patch('/:id/verify', authenticateToken, authorizeVerifier, async (req, res) => {
  try {
    const { status, comments } = req.body; // status: 'verified' or 'rejected'
    
    // Validation
    if (!status || !['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "verified" or "rejected"' });
    }
    
    // Find document
    const document = await Document.findById(req.params.id)
      .populate('studentId', 'name email');
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check if already verified
    if (document.verificationStatus !== 'pending') {
      return res.status(400).json({ 
        error: `Document already ${document.verificationStatus}`,
        currentStatus: document.verificationStatus
      });
    }
    
    // Update verification status
    document.verificationStatus = status;
    document.verifiedBy = req.user._id;
    document.verifiedAt = new Date();
    document.verifierComments = comments || '';
    
    await document.save();
    
    // Get decrypted data for email
    const decryptedData = document.getDecryptedData();
    
    // Send email notification to student
    sendVerificationStatusEmail(
      document.studentId.email,
      document.studentId.name,
      decryptedData.documentType,
      status,
      comments
    ).catch(err => console.error('Email notification failed:', err));
    
    res.json({
      message: `Document ${status} successfully`,
      securityNote: 'Authorization verified - Officer/Admin role required',
      document: {
        id: document._id,
        verificationStatus: document.verificationStatus,
        verifiedBy: req.user.name,
        verifiedAt: document.verifiedAt,
        comments: document.verifierComments
      }
    });
    
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({ error: 'Failed to verify document' });
  }
});

// ============================================
// GET DOCUMENT BY ENCODED ID
// ============================================
// Demonstrates: DECODING (Base64)

router.get('/encoded/:encodedId', authenticateToken, async (req, res) => {
  try {
    // DECODING: Decode Base64 encoded ID
    const decodedString = Document.decodeDocumentId(req.params.encodedId);
    
    // Find document by encoded ID
    const document = await Document.findOne({ encodedId: req.params.encodedId })
      .populate('studentId', 'name email studentId department')
      .populate('verifiedBy', 'name email role');
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Authorization check
    const isOwner = document.studentId._id.toString() === req.user._id.toString();
    const canViewAll = req.user.role === 'officer' || req.user.role === 'admin';
    
    if (!isOwner && !canViewAll) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Decrypt document
    const decryptedData = document.getDecryptedData();
    
    res.json({
      message: 'Document retrieved via encoded ID',
      securityNote: 'Base64 decoding applied to document identifier',
      decodedString: decodedString.substring(0, 30) + '...', // Show partial for demo
      document: {
        ...decryptedData,
        student: document.studentId,
        verifier: document.verifiedBy
      }
    });
    
  } catch (error) {
    console.error('Get encoded document error:', error);
    res.status(500).json({ error: 'Failed to retrieve document' });
  }
});

// ============================================
// DELETE DOCUMENT (Student - Own Documents)
// ============================================

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Only owner or admin can delete
    const isOwner = document.studentId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await document.deleteOne();
    
    res.json({ message: 'Document deleted successfully' });
    
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// ============================================
// VIEW / DOWNLOAD PDF DOCUMENT
// Demonstrates: DECRYPTION, AUTHORIZATION
// ============================================

router.get('/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document || document.uploadMethod !== 'pdf') {
      return res.status(404).json({ error: 'PDF document not found' });
    }

    // Authorization
    const isOwner = document.studentId.toString() === req.user._id.toString();
    const canViewAll = req.user.role === 'admin' || req.user.role === 'officer';

    if (!isOwner && !canViewAll) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // 📊 AUDIT LOG (ADD HERE)
    console.log(
      `📄 PDF viewed by ${req.user.email} | role=${req.user.role} | docId=${document._id}`
    );
    // 🔓 Decrypt PDF
    const decryptedBase64 = Document.decrypt(document.encryptedFile);
    const pdfBuffer = Buffer.from(decryptedBase64, 'base64');

    // 📄 Send PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="document.pdf"',
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF fetch error:', error);
    res.status(500).json({ error: 'Failed to retrieve PDF' });
  }
});


module.exports = router;
