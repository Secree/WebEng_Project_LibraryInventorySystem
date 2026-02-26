// Authentication service
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const authService = {
  // Register new user
  register: async (userData) => {
    const { name, email, password, role } = userData;

    // Basic validation
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Split name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      // Create new user
      const newUser = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password, // In production, hash this password!
        role: role === 'admin' ? 'admin' : 'user'
      });

      await newUser.save();

      const returnedUser = {
        id: newUser._id.toString(),
        name: newUser.firstName + ' ' + newUser.lastName,
        email: newUser.email,
        role: newUser.role
      };

      const token = jwt.sign(
        { id: returnedUser.id, name: returnedUser.name, email: returnedUser.email, role: returnedUser.role },
        process.env.JWT_SECRET || 'defaultsecret',
        { expiresIn: '1h' }
      );

      return { ...returnedUser, token };
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    const { email, password } = credentials;

    // Basic validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      // Find user
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        password: password // In production, use bcrypt.compare()
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const returnedUser = {
        id: user._id.toString(),
        name: user.firstName + ' ' + user.lastName,
        email: user.email,
        role: user.role || 'user'
      };

      const token = jwt.sign(
        { id: returnedUser.id, name: returnedUser.name, email: returnedUser.email, role: returnedUser.role },
        process.env.JWT_SECRET || 'defaultsecret',
        { expiresIn: '1h' }
      );

      return { ...returnedUser, token };
    } catch (error) {
      throw error;
    }
  }
};

export default authService;
