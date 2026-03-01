// Script to remove duplicate resources from MongoDB
// Duplicates are identified by matching title + category
// Keeps the document with the highest quantity; others are deleted.

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resource from '../server/src/models/Resource.js';

dotenv.config();

async function removeDuplicates() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`✅ Connected to MongoDB: ${mongoose.connection.name}`);

  // Group all resources by title + category
  const duplicates = await Resource.aggregate([
    {
      $group: {
        _id: {
          title: { $toLower: { $trim: { input: '$title' } } },
          category: { $toLower: { $trim: { input: '$category' } } }
        },
        docs: { $push: { id: '$_id', quantity: '$quantity', createdAt: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $match: { count: { $gt: 1 } } } // Only groups with more than 1 document
  ]);

  if (duplicates.length === 0) {
    console.log('✅ No duplicate resources found.');
    await mongoose.disconnect();
    return;
  }

  console.log(`\n⚠️  Found ${duplicates.length} groups with duplicates. Removing extras...\n`);

  let totalDeleted = 0;

  for (const group of duplicates) {
    // Sort by quantity descending, then by createdAt ascending (keep oldest with highest qty)
    const sorted = group.docs.sort((a, b) => {
      if (b.quantity !== a.quantity) return b.quantity - a.quantity;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    // Keep the first (best) one, delete the rest
    const [keep, ...toDelete] = sorted;
    const idsToDelete = toDelete.map(d => d.id);

    console.log(`  📌 "${group._id.title}" (${group._id.category})`);
    console.log(`     Keeping _id: ${keep.id} (qty: ${keep.quantity})`);
    console.log(`     Deleting ${idsToDelete.length} duplicate(s)...`);

    await Resource.deleteMany({ _id: { $in: idsToDelete } });
    totalDeleted += idsToDelete.length;
  }

  console.log(`\n✅ Done! Removed ${totalDeleted} duplicate resource(s).`);
  await mongoose.disconnect();
}

removeDuplicates().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
