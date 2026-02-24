// Resource routes
import express from 'express';
import resourceController from '../controllers/resource.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Resource routes
router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);
router.post('/', authMiddleware.verifyToken, resourceController.createResource);
router.post('/bulk', authMiddleware.verifyToken, resourceController.bulkCreateResources);
router.put('/:id', authMiddleware.verifyToken, resourceController.updateResource);
router.delete('/:id', authMiddleware.verifyToken, resourceController.deleteResource);

export default router;
