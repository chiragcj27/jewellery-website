import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://chiragcj27work:qOdviooDoNT0El1q@cluster0.od4gxzg.mongodb.net/jewellery-website';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

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

    console.log('MONGODB_URI:', MONGODB_URI);

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
