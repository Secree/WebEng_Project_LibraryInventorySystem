// Authentication service
import { admin, db } from '../config/firebase.js';

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
      const usersRef = db.collection('users');
      const existingUser = await usersRef.where('email', '==', email).get();
      
      if (!existingUser.empty) {
        throw new Error('User already exists');
      }

      // Create new user
      const newUser = {
        name,
        email,
        password, // In production, hash this password!
        role: role === 'admin' ? 'admin' : 'user',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await usersRef.add(newUser);

      return {
        id: docRef.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      };
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
      const usersRef = db.collection('users');
      const snapshot = await usersRef
        .where('email', '==', email)
        .where('password', '==', password)
        .get();

      if (snapshot.empty) {
        throw new Error('Invalid email or password');
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();

      return {
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'user'
      };
    } catch (error) {
      throw error;
    }
  }
};

export default authService;
