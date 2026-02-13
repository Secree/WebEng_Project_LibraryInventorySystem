// User routes (Admin only)
import express from 'express';
import userController from '../controllers/user.controller.js';
import roleMiddleware from '../middleware/role.middleware.js';

const router = express.Router();

// Admin routes
router.post('/users', roleMiddleware.verifyAdmin, userController.getAllUsers);
router.post('/delete-user', roleMiddleware.verifyAdmin, userController.deleteUser);

export default router;
