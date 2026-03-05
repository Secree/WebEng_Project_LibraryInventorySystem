// Verify images are mapped correctly
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resource from '../server/src/models/Resource.js';

dotenv.config();

async function verifyImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const resources = await Resource.find({}).sort({ _id: 1 }).limit(10);
    
    console.log('📷 First 10 resources with images:\n');
    
    resources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.title}`);
      console.log(`   Image: ${resource.imageUrl || 'No image'}`);
      console.log(`   Category: ${resource.category}`);
      console.log('');
    });
    
    const withImages = await Resource.countDocuments({ imageUrl: { $ne: '', $exists: true } });
    const total = await Resource.countDocuments();
    
    console.log(`\n✅ Total resources: ${total}`);
    console.log(`📷 Resources with images: ${withImages}`);
    console.log(`⚠️  Resources without images: ${total - withImages}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyImages();
