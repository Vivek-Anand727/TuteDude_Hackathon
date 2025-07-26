const express = require('express');
const router = express.Router();

// Register a new user
router.post('/register', (req, res) => {
  // controller: authController.register
});

// Login
router.post('/login', (req, res) => {
  // controller: authController.login
});

module.exports = router;
