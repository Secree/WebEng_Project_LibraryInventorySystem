// Resource controller
const resourceService = require('../services/resource.service');

const resourceController = {
  // Get all resources
  getAllResources: async (req, res) => {
    try {
      const resources = await resourceService.getAllResources();
      res.status(200).json(resources);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get resource by ID
  getResourceById: async (req, res) => {
    try {
      const resource = await resourceService.getResourceById(req.params.id);
      res.status(200).json(resource);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  // Create new resource
  createResource: async (req, res) => {
    try {
      const resource = await resourceService.createResource(req.body);
      res.status(201).json(resource);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update resource
  updateResource: async (req, res) => {
    try {
      const resource = await resourceService.updateResource(req.params.id, req.body);
      res.status(200).json(resource);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete resource
  deleteResource: async (req, res) => {
    try {
      await resourceService.deleteResource(req.params.id);
      res.status(200).json({ message: 'Resource deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = resourceController;
