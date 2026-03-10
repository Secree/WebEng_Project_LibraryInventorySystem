// Resource service
import Resource from '../models/Resource.js';
import XLSX from 'xlsx';

const PLACEHOLDER_RESOURCE_IMAGE = '/resources/placeholder-resource.svg';

const SPREADSHEET_HEADERS = {
  title: ['titlenameofinstructionalmaterial', 'title', 'name', 'resourcetitle', 'materialtitle'],
  category: ['typeofmaterial', 'category', 'materialtype', 'type'],
  quantity: ['numberofcopiesquantity', 'numberofcopies', 'quantity', 'copies', 'noofcopies'],
  suggestedTopics: ['suggestedtopicsforusage', 'suggestedtopics', 'topics'],
  keywords: ['keywordsforsearch', 'keywords'],
  pictureUrl: ['pictureofmaterials', 'pictureurl', 'imageurl', 'image', 'picture'],
};

const normalizeHeaderKey = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');

const getFirstMatchingValue = (rowMap, aliases) => {
  for (const alias of aliases) {
    if (rowMap.has(alias)) {
      const value = rowMap.get(alias);
      if (value !== undefined && value !== null) {
        return String(value).trim();
      }
    }
  }

  return '';
};

const parseQuantity = (value) => {
  const parsed = Number.parseInt(String(value || '').replace(/[^\d-]/g, ''), 10);

  if (Number.isNaN(parsed)) {
    return 1;
  }

  return Math.max(parsed, 0);
};

const inferResourceType = (category = '', keywords = '', title = '') => {
  const text = `${category} ${keywords} ${title}`.toLowerCase();

  if (text.includes('journal')) {
    return 'journal';
  }

  if (text.includes('magazine')) {
    return 'magazine';
  }

  if (text.includes('digital') || text.includes('e-book') || text.includes('ebook')) {
    return 'digital';
  }

  if (text.includes('book')) {
    return 'book';
  }

  return 'other';
};

const mapSheetRowToResource = (row) => {
  const rowMap = new Map(
    Object.entries(row || {}).map(([key, value]) => [normalizeHeaderKey(key), value])
  );

  const title = getFirstMatchingValue(rowMap, SPREADSHEET_HEADERS.title);
  if (!title) {
    return null;
  }

  const category = getFirstMatchingValue(rowMap, SPREADSHEET_HEADERS.category) || 'Other';
  const quantity = parseQuantity(getFirstMatchingValue(rowMap, SPREADSHEET_HEADERS.quantity));
  const suggestedTopics = getFirstMatchingValue(rowMap, SPREADSHEET_HEADERS.suggestedTopics);
  const keywords = getFirstMatchingValue(rowMap, SPREADSHEET_HEADERS.keywords);
  const pictureFromSheet = getFirstMatchingValue(rowMap, SPREADSHEET_HEADERS.pictureUrl);
  const resolvedPictureUrl = pictureFromSheet || PLACEHOLDER_RESOURCE_IMAGE;

  return {
    title,
    category,
    type: inferResourceType(category, keywords, title),
    quantity,
    description: suggestedTopics || 'No description available',
    suggestedTopics,
    keywords,
    imageUrl: resolvedPictureUrl,
    pictureUrl: resolvedPictureUrl,
    status: quantity > 0 ? 'available' : 'unavailable',
  };
};

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
      const nextResourceData = { ...resourceData };

      if (typeof nextResourceData.quantity === 'number') {
        nextResourceData.status = nextResourceData.quantity > 0 ? 'available' : 'reserved';
      }

      const resource = await Resource.findByIdAndUpdate(
        id,
        nextResourceData,
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
  },

  // Import resources from uploaded spreadsheet (.xlsx/.xls/.csv)
  importResourcesFromSpreadsheet: async ({ buffer, fileName = '', replaceExisting = false }) => {
    try {
      let workbook;

      try {
        workbook = XLSX.read(buffer, { type: 'buffer' });
      } catch (error) {
        throw new Error('Invalid spreadsheet file. Please upload a valid .xlsx, .xls, or .csv file.');
      }

      const [sheetName] = workbook.SheetNames;
      if (!sheetName) {
        throw new Error('Spreadsheet does not contain any sheets.');
      }

      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

      if (rows.length === 0) {
        throw new Error('Spreadsheet is empty.');
      }

      const resourcesToInsert = rows
        .map(mapSheetRowToResource)
        .filter((resource) => Boolean(resource));

      if (resourcesToInsert.length === 0) {
        throw new Error('No valid rows found. Ensure the sheet contains a title column.');
      }

      const placeholderAppliedCount = resourcesToInsert.filter(
        (resource) => resource.pictureUrl === PLACEHOLDER_RESOURCE_IMAGE
      ).length;

      if (replaceExisting) {
        await Resource.deleteMany({});
      }

      const createdResources = await Resource.insertMany(resourcesToInsert);

      return {
        fileName,
        sheetName,
        totalRows: rows.length,
        importedCount: createdResources.length,
        skippedCount: rows.length - createdResources.length,
        placeholderAppliedCount,
        replaceExisting,
      };
    } catch (error) {
      throw new Error(`Failed to import spreadsheet: ${error.message}`);
    }
  }
};

export default resourceService;
