const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware hit for:', req.method, req.path);
    
    const authHeader = req.headers.authorization;
    console.log('📋 Auth header present:', !!authHeader);

    // Check for Bearer token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Authorization header missing or malformed');
      return res.status(401).json({ 
        success: false,
        error: 'Authorization header missing or malformed' 
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('🎫 Token extracted:', token ? `${token.substring(0, 20)}...` : 'null');

    if (!token) {
      console.log('❌ No token found after Bearer');
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('✅ Token decoded successfully for user:', decoded.userId);

      // Find user in MongoDB
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        console.log('❌ User not found in database:', decoded.userId);
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      console.log('👤 User authenticated:', {
        id: user._id,
        email: user.email,
        role: user.role
      });

      // Attach user to request
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError.message);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid or expired token' 
      });
    }
  } catch (err) {
    console.error('💥 Auth middleware error:', err);
    return res.status(500).json({ 
      success: false,
      error: 'Authentication server error' 
    });
  }
};

module.exports = authenticate;
