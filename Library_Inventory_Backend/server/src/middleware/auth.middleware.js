// Authentication middleware - verify token
import jwt from 'jsonwebtoken';

const authMiddleware = {
  // Verify JWT token from cookie
  verifyToken: (req, res, next) => {
    try {
      // Get token from cookie
      const token = req.cookies.token;
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
      
      // Attach user info to request
      req.user = decoded;
      
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }
};

export default authMiddleware;
