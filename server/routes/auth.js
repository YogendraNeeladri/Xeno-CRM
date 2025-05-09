const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/auth');

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { userId: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set token in cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    } catch (error) {
      res.redirect(`${process.env.CLIENT_URL}/auth/error`);
    }
  }
);

// Get current user
router.get('/me',
  verifyToken,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .select('-__v');

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user',
        error: error.message
      });
    }
  }
);

// Logout
router.post('/logout',
  verifyToken,
  (req, res) => {
    res.clearCookie('token');
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
);

// Get all users (admin only)
router.get('/users',
  verifyToken,
  checkRole(['admin']),
  async (req, res) => {
    try {
      const users = await User.find()
        .select('-__v')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message
      });
    }
  }
);

// Update user role (admin only)
router.put('/users/:id/role',
  verifyToken,
  checkRole(['admin']),
  async (req, res) => {
    try {
      const { role } = req.body;

      if (!['admin', 'manager', 'user'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select('-__v');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user role',
        error: error.message
      });
    }
  }
);

// Update user permissions (admin only)
router.put('/users/:id/permissions',
  verifyToken,
  checkRole(['admin']),
  async (req, res) => {
    try {
      const { permissions } = req.body;

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { permissions },
        { new: true }
      ).select('-__v');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user permissions',
        error: error.message
      });
    }
  }
);

// Deactivate user (admin only)
router.put('/users/:id/deactivate',
  verifyToken,
  checkRole(['admin']),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      ).select('-__v');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deactivating user',
        error: error.message
      });
    }
  }
);

module.exports = router; 