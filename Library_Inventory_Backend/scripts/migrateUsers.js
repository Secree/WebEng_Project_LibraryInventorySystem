import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function migrateUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Connection to test database
    const testConn = await mongoose.createConnection(
      process.env.MONGODB_URI.replace('library_inventory', 'test')
    ).asPromise();
    console.log('✅ Connected to test database');
    
    // Connection to library_inventory database
    const libConn = await mongoose.createConnection(
      process.env.MONGODB_URI
    ).asPromise();
    console.log('✅ Connected to library_inventory database');
    
    // Define user schema
    const userSchema = new mongoose.Schema({}, { strict: false });
    
    // Get models from both databases
    const TestUser = testConn.model('User', userSchema);
    const LibUser = libConn.model('User', userSchema);
    
    // Fetch all users from test database
    const testUsers = await TestUser.find({}).lean();
    console.log(`📊 Found ${testUsers.length} users in test database`);
    
    if (testUsers.length === 0) {
      console.log('⚠️  No users to migrate');
      await testConn.close();
      await libConn.close();
      return;
    }
    
    // Check if users already exist in library_inventory
    const existingUsers = await LibUser.find({}).lean();
    console.log(`📊 Found ${existingUsers.length} users in library_inventory database`);
    
    // Clear existing users in library_inventory to avoid duplicates
    if (existingUsers.length > 0) {
      await LibUser.deleteMany({});
      console.log('🗑️  Cleared existing users from library_inventory');
    }
    
    // Insert users into library_inventory
    console.log('🚀 Migrating users to library_inventory...');
    
    // Remove _id to let MongoDB generate new ones
    const usersToInsert = testUsers.map(user => {
      const { _id, ...rest } = user;
      return rest;
    });
    
    await LibUser.insertMany(usersToInsert);
    console.log(`✅ Successfully migrated ${usersToInsert.length} users`);
    
    // Close connections
    await testConn.close();
    await libConn.close();
    console.log('🔌 MongoDB connections closed');
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrateUsers();
