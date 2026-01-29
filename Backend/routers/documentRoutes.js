// routes/documentRoutes.js
// Demonstrates: AES-256, RSA key wrapping, SHA-256, Base64, Authorization

const express = require('express');
const multer = require('multer');
const cryptoService = require('../utils/cryptoService');
const Document = require('../models/Document');
const { sendVerificationStatusEmail } = require('../utils/emailService');
const {
  authenticateToken,
  authorizeStudentOnly,
  authorizeVerifier,
  authorizeViewAll
} = require('../models/authMiddleware');

const router = express.Router();

/* ============================================
   MULTER CONFIG (IN-MEMORY)
============================================ */

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

/* ============================================
   UPLOAD DOCUMENT (STUDENT)
============================================ */

router.post(
  '/upload',
  authenticateToken,
  authorizeStudentOnly,
  upload.single('file'),
  async (req, res) => {
    try {
      const { documentType, description } = req.body;

      if (!req.file && !description) {
        return res.status(400).json({
          error: 'Please upload a PDF or provide description'
        });
      }

      let document;

      if (req.file) {
        document = await Document.createEncryptedPdfDocument(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          req.user._id
        );
      } else {
        document = await Document.createEncryptedDocument(
          { documentType, description },
          req.user._id
        );
      }

      res.status(201).json({
        message: 'Document uploaded securely',
        document: {
          id: document._id,
          uploadMethod: document.uploadMethod,
          verificationStatus: document.verificationStatus
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        error: 'Failed to upload document',
        details: error.message
      });
    }
  }
);

/* ============================================
   GET MY DOCUMENTS (STUDENT)
============================================ */

router.get('/my-documents', authenticateToken, async (req, res) => {
  try {
    const documents = await Document.find({
      studentId: req.user._id
    }).sort('-createdAt');

    const decrypted = documents
      .map(doc => {
        try {
          return doc.getDecryptedData();
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    res.json({
      count: decrypted.length,
      documents: decrypted
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

/* ============================================
   GET ALL DOCUMENTS (ADMIN / OFFICER)
============================================ */

router.get(
  '/all-documents',
  authenticateToken,
  authorizeViewAll,
  async (req, res) => {
    try {
      const documents = await Document.find()
        .populate('studentId', 'name email studentId department')
        .populate('verifiedBy', 'name email role')
        .sort('-createdAt');

      const decrypted = documents
        .map(doc => {
          try {
            return {
              ...doc.getDecryptedData(),
              student: doc.studentId,
              verifier: doc.verifiedBy
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      res.json({
        count: decrypted.length,
        documents: decrypted
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  }
);

/* ============================================
   GET DOCUMENT BY ENCODED ID
============================================ */

router.get('/encoded/:encodedId', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOne({
      encodedId: req.params.encodedId
    })
      .populate('studentId', 'name email studentId department')
      .populate('verifiedBy', 'name email role');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const isOwner =
      document.studentId._id.toString() === req.user._id.toString();
    const canViewAll =
      req.user.role === 'admin' || req.user.role === 'officer';

    if (!isOwner && !canViewAll) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const decrypted = document.getDecryptedData();

    res.json({
      document: {
        ...decrypted,
        student: document.studentId,
        verifier: document.verifiedBy
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve document' });
  }
});

/* ============================================
   GET DOCUMENT BY ID
============================================ */

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('studentId', 'name email studentId department')
      .populate('verifiedBy', 'name email role');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const isOwner =
      document.studentId._id.toString() === req.user._id.toString();
    const canViewAll =
      req.user.role === 'admin' || req.user.role === 'officer';

    if (!isOwner && !canViewAll) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const decrypted = document.getDecryptedData();

    res.json({
      document: {
        ...decrypted,
        student: document.studentId,
        verifier: document.verifiedBy
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve document' });
  }
});

/* ============================================
   VERIFY / REJECT (ADMIN / OFFICER)
============================================ */

router.patch(
  '/:id/verify',
  authenticateToken,
  authorizeVerifier,
  async (req, res) => {
    try {
      const { status, comments } = req.body;

      if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const document = await Document.findById(req.params.id).populate(
        'studentId',
        'name email'
      );

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      document.verificationStatus = status;
      document.verifiedBy = req.user._id;
      document.verifiedAt = new Date();
      document.verifierComments = comments || '';

      await document.save();

      const decrypted = document.getDecryptedData();

      sendVerificationStatusEmail(
        document.studentId.email,
        document.studentId.name,
        decrypted.documentType,
        status,
        comments
      ).catch(() => {});

      res.json({
        message: `Document ${status} successfully`
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Verification failed' });
    }
  }
);

/* ============================================
   VIEW / DOWNLOAD PDF
============================================ */

router.get('/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document || document.uploadMethod !== 'pdf') {
      return res.status(404).json({ error: 'PDF not found' });
    }

    const isOwner =
      document.studentId.toString() === req.user._id.toString();
    const canViewAll =
      req.user.role === 'admin' || req.user.role === 'officer';

    if (!isOwner && !canViewAll) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const aesKey = cryptoService.decryptAESKeyWithRSA(
      document.encryptedAESKey
    );

    const decryptedBase64 = cryptoService.decryptWithAES(
      document.encryptedFile,
      aesKey,
      document.ivFile
    );

    const pdfBuffer = Buffer.from(decryptedBase64, 'base64');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="document.pdf"'
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve PDF' });
  }
});

/* ============================================
   DELETE DOCUMENT
============================================ */

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const isOwner =
      document.studentId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await document.deleteOne();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
