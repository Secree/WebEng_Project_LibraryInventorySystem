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
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.status(201).json({
        message: 'Registration successful',
        user
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
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.status(200).json({
        message: 'Login successful',
        user
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
      // req.user is set by auth.middleware.verifyToken (decoded JWT)
      res.status(200).json({ message: 'User fetched', user: req.user });
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
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

export default authController;
