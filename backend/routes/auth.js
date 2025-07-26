const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register user after Firebase Auth success
router.post('/register', authController.register);

// Login with Firebase ID Token
router.post('/login', authController.login);

module.exports = router;
