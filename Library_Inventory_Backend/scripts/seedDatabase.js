import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../server/src/models/User.js';
import Resource from '../server/src/models/Resource.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional)
    // await User.deleteMany({});
    // await Resource.deleteMany({});
    // console.log('🗑️  Cleared existing data');

    // Create sample admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@library.com',
      password: 'admin123', // In production, hash this!
      role: 'admin'
    });
    await adminUser.save();
    console.log('✅ Created admin user');

    // Create sample regular user
    const regularUser = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user'
    });
    await regularUser.save();
    console.log('✅ Created regular user');

    // Create sample resources
    const sampleResources = [
      {
        title: 'Introduction to Programming',
        author: 'John Smith',
        category: 'Computer Science',
        type: 'book',
        isbn: '978-0123456789',
        publisher: 'Tech Books Publishing',
        yearPublished: 2023,
        quantity: 5,
        availableQuantity: 5,
        location: 'Shelf A1',
        description: 'A comprehensive guide to programming fundamentals',
        status: 'available'
      },
      {
        title: 'Web Development Basics',
        author: 'Jane Doe',
        category: 'Web Development',
        type: 'book',
        isbn: '978-0987654321',
        publisher: 'Web Press',
        yearPublished: 2024,
        quantity: 3,
        availableQuantity: 3,
        location: 'Shelf B2',
        description: 'Learn HTML, CSS, and JavaScript',
        status: 'available'
      },
      {
        title: 'Database Design Principles',
        author: 'Robert Brown',
        category: 'Database',
        type: 'book',
        isbn: '978-1122334455',
        publisher: 'Data Books',
        yearPublished: 2023,
        quantity: 4,
        availableQuantity: 4,
        location: 'Shelf C3',
        description: 'Master database design and normalization',
        status: 'available'
      },
      {
        title: 'Modern JavaScript',
        author: 'Sarah Wilson',
        category: 'Programming',
        type: 'digital',
        quantity: 10,
        availableQuantity: 10,
        location: 'Digital Library',
        description: 'ES6+ features and best practices',
        status: 'available'
      },
      {
        title: 'React Complete Guide',
        author: 'Mike Johnson',
        category: 'Web Development',
        type: 'book',
        isbn: '978-2233445566',
        publisher: 'Frontend Press',
        yearPublished: 2024,
        quantity: 6,
        availableQuantity: 6,
        location: 'Shelf D4',
        description: 'Learn React from scratch',
        status: 'available'
      }
    ];

    await Resource.insertMany(sampleResources);
    console.log('✅ Created sample resources');

    console.log('\n🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${await User.countDocuments()}`);
    console.log(`   - Resources: ${await Resource.countDocuments()}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Admin: admin@library.com / admin123');
    console.log('   User: john@example.com / password123');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
