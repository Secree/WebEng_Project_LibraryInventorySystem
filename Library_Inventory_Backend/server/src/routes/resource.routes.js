// Resource routes
const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resource.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Resource routes
router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);
router.post('/', authMiddleware.verifyToken, resourceController.createResource);
router.put('/:id', authMiddleware.verifyToken, resourceController.updateResource);
router.delete('/:id', authMiddleware.verifyToken, resourceController.deleteResource);

module.exports = router;
