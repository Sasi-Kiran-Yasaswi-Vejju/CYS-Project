// User Routes
// Demonstrates: AUTHORIZATION (Role-based Access)

const express = require('express');
const User = require('../models/User');
const { authenticateToken, authorizeRole } = require('../models/authMiddleware');

const router = express.Router();

// ============================================
// GET USER PROFILE
// ============================================

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp');
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ============================================
// UPDATE USER PROFILE
// ============================================

router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, studentId, department } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (studentId && user.role === 'student') user.studentId = studentId;
    if (department && user.role === 'student') user.department = department;
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
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
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ============================================
// GET ALL USERS (Admin Only)
// ============================================
// Demonstrates: AUTHORIZATION - Only admins can view all users

router.get('/all', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password -otp').sort('-createdAt');
    
    res.json({
      message: 'All users retrieved',
      securityNote: 'Access granted - Admin role required',
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ============================================
// GET USERS BY ROLE
// ============================================

router.get('/by-role/:role', authenticateToken, authorizeRole('officer', 'admin'), async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!['student', 'officer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const users = await User.find({ role }).select('-password -otp').sort('-createdAt');
    
    res.json({
      message: `${role}s retrieved`,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ============================================
// GET STATISTICS (Officers & Admins)
// ============================================

router.get('/stats/overview', authenticateToken, authorizeRole('officer', 'admin'), async (req, res) => {
  try {
    const Document = require('../models/Document');
    
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalOfficers = await User.countDocuments({ role: 'officer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    const totalDocuments = await Document.countDocuments();
    const pendingDocuments = await Document.countDocuments({ verificationStatus: 'pending' });
    const verifiedDocuments = await Document.countDocuments({ verificationStatus: 'verified' });
    const rejectedDocuments = await Document.countDocuments({ verificationStatus: 'rejected' });
    
    res.json({
      message: 'Statistics retrieved',
      stats: {
        users: {
          total: totalUsers,
          students: totalStudents,
          officers: totalOfficers,
          admins: totalAdmins
        },
        documents: {
          total: totalDocuments,
          pending: pendingDocuments,
          verified: verifiedDocuments,
          rejected: rejectedDocuments
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
