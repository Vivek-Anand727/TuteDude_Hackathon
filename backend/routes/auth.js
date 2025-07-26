// routes/auth.js
const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');

// Public routes
router.post('/register', auth.register);
router.post('/login', auth.login);

// Protected routes (require authentication)
router.get('/profile', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, location, businessName } = req.body;
    const userId = req.user._id;

    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update fields if provided
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (location) user.location = location.trim();
    if (businessName) user.businessName = businessName.trim();

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating profile',
      details: error.message
    });
  }
});

module.exports = router;