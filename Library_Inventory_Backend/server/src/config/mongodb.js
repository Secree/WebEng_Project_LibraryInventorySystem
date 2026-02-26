import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'library_inventory', // Explicitly set database name
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);
    
    // Verify we're NOT using the test database
    if (conn.connection.name === 'test') {
      console.error('❌ ERROR: Connected to "test" database instead of "library_inventory"!');
      console.error('❌ Check your MONGODB_URI environment variable.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
