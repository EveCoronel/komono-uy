import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const connection = {
  isConnected: 0,
};

async function connectDB() {
  if (connection.isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    console.log('Connecting to MongoDB...');
    
    const db = await mongoose.connect(MONGODB_URI, {
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      dbName: "komono"
    });

    connection.isConnected = db.connections[0].readyState;
    console.log('MongoDB connected successfully. Connection state:', connection.isConnected);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Connection event handlers
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  connection.isConnected = 0;
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

export default connectDB;
