// User service
import User from '../models/User.js';

const userService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const users = await User.find({}, '-password').lean();
      
      return users.map(user => ({
        id: user._id.toString(),
        name: user.lastName && user.lastName !== user.firstName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName,
        email: user.email,
        role: user.role,
        _id: undefined
      }));
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const user = await User.findById(id, '-password').lean();
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        id: user._id.toString(),
        name: user.lastName && user.lastName !== user.firstName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName,
        email: user.email,
        role: user.role,
        _id: undefined
      };
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      if (!id) {
        throw new Error('User ID required');
      }

      const result = await User.findByIdAndDelete(id);
      if (!result) {
        throw new Error('User not found');
      }
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
};

export default userService;
