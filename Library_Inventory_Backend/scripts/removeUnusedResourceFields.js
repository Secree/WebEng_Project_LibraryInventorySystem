import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resource from '../server/src/models/Resource.js';

dotenv.config();

async function removeUnusedResourceFields() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to MongoDB: ${mongoose.connection.name}`);

    const result = await Resource.updateMany(
      {},
      {
        $unset: {
          author: '',
          publisher: '',
          yearPublished: '',
        },
      }
    );

    const matchedCount =
      result?.matchedCount ??
      result?.n ??
      result?.acknowledgedCount ??
      0;

    const modifiedCount =
      result?.modifiedCount ??
      result?.nModified ??
      result?.modified ??
      0;

    console.log(`✅ Matched ${matchedCount} resources`);
    console.log(`✅ Modified ${modifiedCount} resources`);
  } catch (error) {
    console.error('❌ Failed to remove unused fields:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

removeUnusedResourceFields();
