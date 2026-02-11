// User service
import { db } from '../config/firebase.js';

const userService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.get();
      
      const users = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        users.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          role: data.role
        });
      });

      return users;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const doc = await db.collection('users').doc(id).get();
      if (!doc.exists) {
        throw new Error('User not found');
      }
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role
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

      await db.collection('users').doc(id).delete();
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
};

export default userService;
