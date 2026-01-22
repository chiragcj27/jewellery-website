import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jewellery-website';

interface ConnectionOptions {
  bufferCommands?: boolean;
  maxPoolSize?: number;
}

let cachedConnection: typeof mongoose | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const options: ConnectionOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    const connection = await mongoose.connect(MONGODB_URI, options);
    cachedConnection = connection;
    
    console.log('✅ Connected to MongoDB');
    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
    console.log('✅ Disconnected from MongoDB');
  }
}

export default connectToDatabase;
