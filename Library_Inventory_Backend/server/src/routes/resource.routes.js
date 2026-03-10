// Resource routes
import express from 'express';
import multer from 'multer';
import resourceController from '../controllers/resource.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';

const router = express.Router();
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 10 * 1024 * 1024,
	},
});

// Resource routes
router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);
router.post('/', authMiddleware.verifyToken, resourceController.createResource);
router.post('/bulk', authMiddleware.verifyToken, resourceController.bulkCreateResources);
router.post(
	'/import',
	authMiddleware.verifyToken,
	roleMiddleware.requireRole('admin'),
	upload.single('file'),
	resourceController.importResourcesFromSpreadsheet
);
router.put('/:id', authMiddleware.verifyToken, resourceController.updateResource);
router.delete('/:id', authMiddleware.verifyToken, resourceController.deleteResource);

export default router;
