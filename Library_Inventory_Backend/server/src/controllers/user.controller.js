// User controller
import userService from '../services/user.service.js';

const userController = {
  // Get all users (Admin only)
  getAllUsers: async (req, res) => {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({
        count: users.length,
        users
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error fetching users' });
    }
  },

  // Delete user (Admin only)
  deleteUser: async (req, res) => {
    try {
      const { targetUserId } = req.body;
      await userService.deleteUser(targetUserId);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(400).json({ message: error.message });
    }
  }
};

export default userController;
