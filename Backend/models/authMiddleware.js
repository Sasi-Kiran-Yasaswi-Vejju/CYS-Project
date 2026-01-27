// Authentication Middleware using JWT
// Demonstrates: AUTHENTICATION (JWT token verification), AUTHORIZATION (role-based access)

const jwt = require('jsonwebtoken');
const User = require('./User');

// ============================================
// AUTHENTICATE TOKEN MIDDLEWARE
// ============================================
// Verifies JWT token from request header
// Demonstrates AUTHENTICATION process

const authenticateToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    // Format: "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        securityNote: 'JWT token required for authentication'
      });
    }
    
    // Verify token using JWT_SECRET
    // Throws error if token is invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token. User not found.' 
      });
    }
    
    // Attach user to request object for use in route handlers
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token.',
        securityNote: 'Token signature verification failed'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired. Please login again.',
        securityNote: 'JWT tokens expire after 24 hours for security'
      });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

// ============================================
// AUTHORIZATION MIDDLEWARE: Role-Based Access
// ============================================
// Implements Access Control Matrix (ACM)

// Middleware to check if user has specific role
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    // User must be authenticated first
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }
    
    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access forbidden. Insufficient permissions.',
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        securityNote: 'Access Control Matrix (ACM) enforced'
      });
    }
    
    next();
  };
};

// ============================================
// ACCESS CONTROL MATRIX ENFORCEMENT
// ============================================

// Only students can upload documents
const authorizeStudentOnly = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      error: 'Only students can upload documents',
      securityNote: 'Access Control: Upload permission restricted to student role'
    });
  }
  next();
};

// Only officers and admins can verify documents
const authorizeVerifier = (req, res, next) => {
  if (req.user.role !== 'officer' && req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Only officers and admins can verify documents',
      securityNote: 'Access Control: Verify permission restricted to officer/admin roles'
    });
  }
  next();
};

// Only officers and admins can view all documents
const authorizeViewAll = (req, res, next) => {
  if (req.user.role !== 'officer' && req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Only officers and admins can view all documents',
      securityNote: 'Access Control: View all permission restricted to officer/admin roles'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizeStudentOnly,
  authorizeVerifier,
  authorizeViewAll
};
