// middleware/authMiddleware.js
const admin = require('../firebase');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or malformed' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Find user in MongoDB
    const user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
