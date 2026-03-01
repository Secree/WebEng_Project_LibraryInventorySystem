// Authentication controller
import authService from '../services/auth.service.js';

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const result = await authService.register(req.body);
      const { token, ...user } = result;
      
      // Set HttpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.status(201).json({
        message: 'Registration successful',
        user,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: error.message });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const result = await authService.login(req.body);
      const { token, ...user } = result;
      
      // Set HttpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.status(200).json({
        message: 'Login successful',
        user,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ message: error.message });
    }
  }
,
  // Get current authenticated user
  me: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      // Fetch fresh user data from DB to avoid stale JWT name
      const User = (await import('../models/User.js')).default;
      const freshUser = await User.findById(req.user.id, '-password').lean();
      if (!freshUser) return res.status(401).json({ message: 'User not found' });
      const name = freshUser.lastName && freshUser.lastName !== freshUser.firstName
        ? `${freshUser.firstName} ${freshUser.lastName}`
        : freshUser.firstName;
      res.status(200).json({
        message: 'User fetched',
        user: {
          id: freshUser._id.toString(),
          name,
          email: freshUser.email,
          role: freshUser.role
        }
      });
    } catch (error) {
      console.error('Me error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Logout user
  logout: async (req, res) => {
    try {
      // Clear the httpOnly cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      });
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

export default authController;
