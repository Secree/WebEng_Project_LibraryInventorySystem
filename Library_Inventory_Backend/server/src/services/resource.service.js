// Resource service
const { db } = require('../config/firebase');

const resourceService = {
  // Get all resources
  getAllResources: async () => {
    try {
      const snapshot = await db.collection('resources').get();
      const resources = [];
      snapshot.forEach(doc => {
        resources.push({ id: doc.id, ...doc.data() });
      });
      return resources;
    } catch (error) {
      throw new Error(`Failed to fetch resources: ${error.message}`);
    }
  },

  // Get resource by ID
  getResourceById: async (id) => {
    try {
      const doc = await db.collection('resources').doc(id).get();
      if (!doc.exists) {
        throw new Error('Resource not found');
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to fetch resource: ${error.message}`);
    }
  },

  // Create new resource
  createResource: async (resourceData) => {
    try {
      const docRef = await db.collection('resources').add({
        ...resourceData,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...resourceData };
    } catch (error) {
      throw new Error(`Failed to create resource: ${error.message}`);
    }
  },

  // Update resource
  updateResource: async (id, resourceData) => {
    try {
      await db.collection('resources').doc(id).update({
        ...resourceData,
        updatedAt: new Date().toISOString()
      });
      return { id, ...resourceData };
    } catch (error) {
      throw new Error(`Failed to update resource: ${error.message}`);
    }
  },

  // Delete resource
  deleteResource: async (id) => {
    try {
      await db.collection('resources').doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete resource: ${error.message}`);
    }
  }
};

module.exports = resourceService;
