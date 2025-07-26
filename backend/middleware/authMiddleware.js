// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for Bearer token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Find user in MongoDB
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('JWT Auth Error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
