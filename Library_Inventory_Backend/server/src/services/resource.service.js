// Resource service
import Resource from '../models/Resource.js';

const resourceService = {
  // Get all resources
  getAllResources: async () => {
    try {
      const resources = await Resource.find({});
      return resources.map(resource => resource.toJSON());
    } catch (error) {
      throw new Error(`Failed to fetch resources: ${error.message}`);
    }
  },

  // Get resource by ID
  getResourceById: async (id) => {
    try {
      const resource = await Resource.findById(id);
      if (!resource) {
        throw new Error('Resource not found');
      }
      return resource.toJSON();
    } catch (error) {
      throw new Error(`Failed to fetch resource: ${error.message}`);
    }
  },

  // Create new resource
  createResource: async (resourceData) => {
    try {
      const resource = new Resource(resourceData);
      await resource.save();
      return resource.toJSON();
    } catch (error) {
      throw new Error(`Failed to create resource: ${error.message}`);
    }
  },

  // Update resource
  updateResource: async (id, resourceData) => {
    try {
      const resource = await Resource.findByIdAndUpdate(
        id,
        resourceData,
        { new: true, runValidators: true }
      );
      
      if (!resource) {
        throw new Error('Resource not found');
      }
      
      return resource.toJSON();
    } catch (error) {
      throw new Error(`Failed to update resource: ${error.message}`);
    }
  },

  // Delete resource
  deleteResource: async (id) => {
    try {
      const result = await Resource.findByIdAndDelete(id);
      if (!result) {
        throw new Error('Resource not found');
      }
      return true;
    } catch (error) {
      throw new Error(`Failed to delete resource: ${error.message}`);
    }
  },

  // Bulk create resources
  bulkCreateResources: async (resourcesArray) => {
    try {
      const resources = await Resource.insertMany(resourcesArray);
      return resources.map(resource => resource.toJSON());
    } catch (error) {
      throw new Error(`Failed to bulk create resources: ${error.message}`);
    }
  }
};

export default resourceService;
