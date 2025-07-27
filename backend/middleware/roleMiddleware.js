const checkRole = (requiredRole) => {
  return (req, res, next) => {
    try {
      console.log('🛡️  Role middleware hit for:', req.method, req.path);
      console.log('👤 User role:', req.user?.role);
      console.log('🎯 Required role:', requiredRole);

      if (!req.user) {
        console.log('❌ No user found in request object');
        return res.status(401).json({ 
          success: false,
          error: 'Authentication required' 
        });
      }

      // Handle both string and array of roles
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      
      if (!allowedRoles.includes(req.user.role)) {
        console.log(`❌ Access denied. Required: ${allowedRoles.join(' or ')}, Got: ${req.user.role}`);
        return res.status(403).json({ 
          success: false,
          error: `Forbidden: Required role '${allowedRoles.join(' or ')}', but user has role '${req.user.role}'` 
        });
      }

      console.log('✅ Role check passed for user:', req.user.email);
      next();
    } catch (error) {
      console.error('💥 Role middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Role check server error'
      });
    }
  };
};

module.exports = checkRole;
