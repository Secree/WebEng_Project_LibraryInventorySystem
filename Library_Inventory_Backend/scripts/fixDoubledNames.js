// Fix users where firstName === lastName (caused by old registration bug)
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../server/src/models/User.js';

dotenv.config();

async function fixDoubledNames() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`✅ Connected: ${mongoose.connection.name}\n`);

  // Find all users where firstName === lastName (the doubled name bug)
  const users = await User.find({
    $expr: { $eq: ['$firstName', '$lastName'] }
  });

  if (users.length === 0) {
    console.log('✅ No doubled names found.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${users.length} user(s) with doubled names:\n`);

  for (const user of users) {
    console.log(`  Fixing: "${user.firstName} ${user.lastName}" → "${user.firstName}"`);
    await User.updateOne({ _id: user._id }, { $set: { lastName: '' } });
  }

  console.log(`\n✅ Fixed ${users.length} user(s).`);
  await mongoose.disconnect();
}

fixDoubledNames().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
