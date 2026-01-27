// Authentication Routes
// Demonstrates: AUTHENTICATION (Register, Login, MFA), HASHING (bcrypt)

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');
const { authenticateToken } = require('../models/authMiddleware');

const router = express.Router();

// ============================================
// REGISTER ROUTE
// ============================================
// Demonstrates: HASHING (bcrypt with salt)

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, studentId, department } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Create new user
    // Password will be automatically hashed by pre-save hook in User model
    const user = new User({
      name,
      email: email.toLowerCase(),
      password, // Will be hashed with bcrypt + salt
      role: role || 'student',
      studentId: role === 'student' ? studentId : undefined,
      department: role === 'student' ? department : undefined
    });
    
    await user.save();
    
    // Send welcome email (async, don't wait)
    sendWelcomeEmail(user.email, user.name, user.role).catch(err => 
      console.error('Welcome email failed:', err)
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      securityNote: 'Password hashed with bcrypt + salt (10 rounds)',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// ============================================
// LOGIN ROUTE (Step 1: Credentials)
// ============================================
// Demonstrates: AUTHENTICATION, PASSWORD VERIFICATION

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        securityNote: 'Generic error message prevents username enumeration attack'
      });
    }
    
    // Verify password using bcrypt
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        securityNote: 'Password verification using bcrypt.compare()'
      });
    }
    
    // MULTI-FACTOR AUTHENTICATION: Generate OTP
const otp = user.generateOTP();
await user.save();

// ===============================
// OTP DELIVERY (DEV SAFE BYPASS)
// ===============================
try {
  await sendOTPEmail(user.email, user.name, otp);


  res.json({
    message: 'Login credentials verified. OTP generated.',
    securityNote: 'Multi-Factor Authentication (MFA) - OTP required',
    requiresOTP: true,
    userId: user._id,
    expiresIn: `${process.env.OTP_EXPIRY || 5} minutes`
  });

}catch (error) {
  console.error('OTP email error:', error);
  res.status(500).json({ error: 'Failed to send OTP' });
}


    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// ============================================
// VERIFY OTP ROUTE (Step 2: MFA)
// ============================================
// Demonstrates: MULTI-FACTOR AUTHENTICATION, JWT TOKEN GENERATION

router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    
    // Validation
    if (!userId || !otp) {
      return res.status(400).json({ error: 'Please provide userId and OTP' });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify OTP
    const isOTPValid = user.verifyOTP(otp);
    if (!isOTPValid) {
      return res.status(401).json({ 
        error: 'Invalid or expired OTP',
        securityNote: 'OTP expires after 5 minutes for security'
      });
    }
    
    // Clear OTP after successful verification
    user.otp = undefined;
    user.isVerified = true;
    await user.save();
    
    // GENERATE JWT TOKEN
    // Token contains userId and expires in 24 hours
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      securityNote: 'JWT token generated with 24-hour expiry',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department
      }
    });
    
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'OTP verification failed', details: error.message });
  }
});

// ============================================
// GET CURRENT USER (Protected Route)
// ============================================

router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        studentId: req.user.studentId,
        department: req.user.department
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// ============================================
// RESEND OTP
// ============================================

router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();
    
    // Send OTP via email
    await sendOTPEmail(user.email, user.name, otp);
    
    res.json({
      message: 'New OTP sent to your email',
      expiresIn: `${process.env.OTP_EXPIRY || 5} minutes`
    });
    
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

module.exports = router;
