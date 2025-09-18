// middleware/roleCheck.js
// Role-based access control middleware

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

// Specific role middlewares
export const requireAdmin = requireRole('admin');
export const requireFarmer = requireRole('farmer');
export const requireBuyer = requireRole('buyer');

// Multiple role access
export const requireFarmerOrBuyer = requireRole('farmer', 'buyer');
export const requireAdminOrFarmer = requireRole('admin', 'farmer');

// Admin permission check
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required.' 
      });
    }

    // For admin discriminator, check permissions
    const adminUser = await req.user.constructor.findById(req.user._id);
    
    if (!adminUser.permissions || !adminUser.permissions.includes(permission)) {
      return res.status(403).json({ 
        success: false, 
        message: `Missing required permission: ${permission}` 
      });
    }

    next();
  };
};

// Resource ownership check
export const requireOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    // Admin can access all resources
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if resource belongs to user
    const resourceUserId = req.params.userId || req.body[resourceField] || req.query[resourceField];
    
    if (!resourceUserId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Resource owner information missing.' 
      });
    }

    if (resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only access your own resources.' 
      });
    }

    next();
  };
};
