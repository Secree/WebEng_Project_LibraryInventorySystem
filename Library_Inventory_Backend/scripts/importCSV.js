// CSV Import Script for Library Inventory
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resource from '../server/src/models/Resource.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to CSV file
const csvFilePath = path.join(__dirname, './data/Inventory of Instructional Materials - Sheet1.csv');

// Function to parse CSV
function parseCSV(csvText) {
  // Use csv-parse library to handle complex CSV with multiline fields
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true
  });

  const resources = [];

  for (const record of records) {
    const title = record['Title/Name of Instructional Material']?.trim();
    if (!title) continue; // Skip if no title

    const typeOfMaterial = record['Type of Material']?.trim() || 'Other';
    const quantity = parseInt(record['Number of Copies/ Quantity']?.trim()) || 1;
    const suggestedTopics = record['Suggested Topics for Usage']?.trim() || '';
    const keywords = record['Keywords for Search']?.trim() || '';
    const pictureUrl = record['Picture of Materials']?.trim() || '';
    
    // Map type to Resource model enum
    let resourceType = 'other';
    const typeLower = typeOfMaterial.toLowerCase();
    if (typeLower.includes('book')) resourceType = 'book';
    else if (typeLower.includes('journal')) resourceType = 'journal';
    else if (typeLower.includes('magazine')) resourceType = 'magazine';
    else if (typeLower.includes('digital')) resourceType = 'digital';

    const resource = {
      title: title,
      author: '', // Not provided in CSV
      category: typeOfMaterial, // Use type of material as category
      type: resourceType,
      quantity: quantity,
      availableQuantity: quantity, // Initially all are available
      description: suggestedTopics || 'No description available',
      suggestedTopics: suggestedTopics,
      keywords: keywords,
      pictureUrl: pictureUrl,
      imageUrl: pictureUrl, // Same as pictureUrl for compatibility
      status: 'available'
    };

    resources.push(resource);
  }

  return resources;
}

// Function to bulk insert into MongoDB
async function bulkInsert(resources, batchSize = 1000) {
  console.log(`Starting bulk insert of ${resources.length} resources...`);
  
  let totalInserted = 0;
  
  // Insert in batches for better performance
  for (let i = 0; i < resources.length; i += batchSize) {
    const chunk = resources.slice(i, i + batchSize);
    
    try {
      await Resource.insertMany(chunk, { ordered: false });
      totalInserted += chunk.length;
      console.log(`Inserted ${totalInserted}/${resources.length} resources...`);
    } catch (error) {
      console.error(`Error inserting batch starting at index ${i}:`, error.message);
      throw error;
    }
  }
  
  console.log(`✅ Successfully inserted ${totalInserted} resources!`);
  return totalInserted;
}

// Main execution
async function main() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'library_inventory'
    });
    console.log(`✅ Connected to MongoDB: ${mongoose.connection.name}`);
    
    // Verify we're NOT using the test database
    if (mongoose.connection.name === 'test') {
      console.error('❌ ERROR: Connected to "test" database instead of "library_inventory"!');
      await mongoose.connection.close();
      process.exit(1);
    }
    
    console.log('📖 Reading CSV file...');
    const csvText = fs.readFileSync(csvFilePath, 'utf-8');
    
    console.log('🔄 Parsing CSV data...');
    const resources = parseCSV(csvText);
    
    console.log(`📊 Found ${resources.length} resources to import`);
    
    if (resources.length === 0) {
      console.log('⚠️  No resources found in CSV file');
      await mongoose.connection.close();
      return;
    }
    
    // Show first resource as sample
    console.log('\n📝 Sample resource:');
    console.log(JSON.stringify(resources[0], null, 2));
    
    console.log('\n🚀 Starting import to MongoDB...');
    await bulkInsert(resources);
    
    console.log('\n✅ Import completed successfully!');
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during import:', error.message);
    console.error(error);
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // Ignore close errors
    }
    process.exit(1);
  }
}

// Run the script
main();

