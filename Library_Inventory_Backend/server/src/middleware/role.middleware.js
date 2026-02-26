// Role-based access control middleware
import User from '../models/User.js';

const roleMiddleware = {
  // Check if user is admin
  verifyAdmin: async (req, res, next) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: 'User ID required' });
      }

      const user = await User.findById(userId).lean();
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }

      req.user = { id: user._id.toString(), ...user };
      next();
    } catch (error) {
      console.error('Admin verification error:', error);
      res.status(500).json({ message: 'Server error verifying admin' });
    }
  },

  // Check if user has required role
  requireRole: (...allowedRoles) => {
    return (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: 'Unauthorized - No user found' });
        }

        const userRole = req.user.role;

        if (!allowedRoles.includes(userRole)) {
          return res.status(403).json({ 
            error: 'Forbidden - Insufficient permissions',
            required: allowedRoles,
            current: userRole
          });
        }

        next();
      } catch (error) {
        return res.status(500).json({ error: 'Authorization failed' });
      }
    };
  }
};

export default roleMiddleware;
