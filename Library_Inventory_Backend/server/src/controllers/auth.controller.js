// Authentication controller
import authService from '../services/auth.service.js';

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const user = await authService.register(req.body);
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
      const user = await authService.login(req.body);
      res.status(200).json({
        message: 'Login successful',
        user
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ message: error.message });
    }
  }
};

export default authController;
