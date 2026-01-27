// 23CSE313 - Foundations of Cyber Security LAB Evaluation 1
// Secure Placement Drive Document Verification Portal - Backend Server
require('dotenv').config();

console.log("EMAIL USER:", process.env.EMAIL_USER);
console.log("EMAIL PASS EXISTS:", !!process.env.EMAIL_PASS);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
//const dotenv = require('dotenv');

// Load environment variables


const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// CORS - Allow cross-origin requests from frontend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// DATABASE CONNECTION
// ============================================

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// ============================================
// ROUTES
// ============================================

const authRoutes = require('./routers/authRoutes');
const documentRoutes = require('./routers/documentRoutes');
const userRoutes = require('./routers/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Secure Placement Verification Portal API',
    status: 'Running',
    securityFeatures: [
      'Authentication (JWT)',
      'Authorization (Role-based Access Control)',
      'Hashing (bcrypt with salt)',
      'Encryption (AES-256)',
      'Digital Signature (SHA-256)',
      'Encoding (Base64)',
      'Multi-Factor Authentication (Email OTP)'
    ]
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 Security features enabled`);
});
