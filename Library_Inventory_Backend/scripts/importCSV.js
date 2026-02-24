// CSV Import Script for Library Inventory
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { db } from '../server/src/config/firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to CSV file
const csvFilePath = path.join(__dirname, '../../Library_Inventory/src/Inventory of Instructional Materials - Sheet1.csv');

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

    const resource = {
      title: title,
      type: record['Type of Material']?.trim() || 'Unknown',
      quantity: parseInt(record['Number of Copies/ Quantity']?.trim()) || 0,
      suggestedTopics: record['Suggested Topics for Usage']?.trim() || '',
      keywords: record['Keywords for Search']?.trim() || '',
      pictureUrl: record['Picture of Materials']?.trim() || '',
      status: 'available',
      createdAt: new Date().toISOString()
    };

    resources.push(resource);
  }

  return resources;
}

// Function to bulk insert into Firebase
async function bulkInsert(resources, batchSize = 500) {
  console.log(`Starting bulk insert of ${resources.length} resources...`);
  
  let totalInserted = 0;
  
  // Firestore has a limit of 500 operations per batch
  for (let i = 0; i < resources.length; i += batchSize) {
    const batch = db.batch();
    const chunk = resources.slice(i, i + batchSize);
    
    chunk.forEach(resource => {
      const docRef = db.collection('resources').doc();
      batch.set(docRef, resource);
    });
    
    try {
      await batch.commit();
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
    console.log('📖 Reading CSV file...');
    const csvText = fs.readFileSync(csvFilePath, 'utf-8');
    
    console.log('🔄 Parsing CSV data...');
    const resources = parseCSV(csvText);
    
    console.log(`📊 Found ${resources.length} resources to import`);
    
    if (resources.length === 0) {
      console.log('⚠️  No resources found in CSV file');
      return;
    }
    
    // Show first resource as sample
    console.log('\n📝 Sample resource:');
    console.log(JSON.stringify(resources[0], null, 2));
    
    console.log('\n🚀 Starting import to Firebase...');
    await bulkInsert(resources);
    
    console.log('\n✅ Import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during import:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main();
