import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { products } from '../data/products.js';
import dotenv from 'dotenv';
import User from '../models/User.js';


// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: "komono" });
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const seededProducts = await Product.insertMany(products);
    console.log(`Seeded ${seededProducts.length} products`);

    const adminUser = {
      name: 'Eve C',
      email: 'ec.business.ia@gmail.com',
      password: '$2b$12$nDdW2B4QXZfg04vSbU2/hex2eUE4R6CWzTSNQvZ.kSahr8xvXEUtS', // hashed password for '123456'
      role: 'admin',
    };

    await User.create(adminUser);
    console.log('Admin user created');

    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase();
