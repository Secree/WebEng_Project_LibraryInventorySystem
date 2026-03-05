// Script to map images to resources
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resource from '../server/src/models/Resource.js';

dotenv.config();

async function mapImagesToResources() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all resources
    const resources = await Resource.find({}).sort({ _id: 1 });
    console.log(`📊 Found ${resources.length} resources`);

    // Map images to resources (we have 66 images for 75 resources)
    const updates = [];
    
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      
      // Map image numbers to resources
      // We have images 0-65, so we'll map them in order
      let imageNumber = null;
      
      if (i <= 65) {
        imageNumber = i;
      }
      
      const imageUrl = imageNumber !== null 
        ? `/resources/image_993852797_${imageNumber}.jpg`
        : '';

      console.log(`${i + 1}. ${resource.title} → ${imageUrl || 'No image'}`);
      
      // Update resource
      await Resource.findByIdAndUpdate(resource._id, {
        imageUrl: imageUrl,
        pictureUrl: imageUrl
      });
      
      updates.push({ title: resource.title, imageUrl });
    }

    console.log(`\n✅ Successfully updated ${updates.length} resources with images!`);
    console.log(`📷 ${updates.filter(u => u.imageUrl).length} resources have images`);
    console.log(`⚠️  ${updates.filter(u => !u.imageUrl).length} resources without images`);

    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

mapImagesToResources();
