import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resource from '../server/src/models/Resource.js';

dotenv.config();

async function clearResources() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'library_inventory'
    });
    console.log(`✅ Connected to MongoDB: ${mongoose.connection.name}`);
    
    console.log('🗑️  Deleting all resources...');
    const result = await Resource.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} resources`);
    
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // Ignore
    }
    process.exit(1);
  }
}

clearResources();
