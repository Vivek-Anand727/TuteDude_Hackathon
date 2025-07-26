const admin = require('../firebase');
const User = require('../models/User');

// Register new user (after Firebase registration is done on frontend)
exports.register = async (req, res) => {
  const { name, email, role, phone, location, firebaseUid } = req.body;

  if (!firebaseUid || !email || !name || !role || !location) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if user already exists in DB
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create new user in MongoDB
    const user = new User({
      name,
      email,
      role,
      phone,
      location,
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login: verify Firebase token & return user profile
exports.login = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'Token required' });
  }

  try {
    // Verify token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = decodedToken.email;

    // Find user in MongoDB
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register.' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
