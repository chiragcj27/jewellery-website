import mongoose from 'mongoose';


interface ConnectionOptions {
  bufferCommands?: boolean;
  maxPoolSize?: number;
}

let cachedConnection: typeof mongoose | null = null;

export async function connectToDatabase(MONGODB_URI?: string): Promise<typeof mongoose> {
  // If no URI provided, try to read from environment
  const uri = MONGODB_URI || process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const options: ConnectionOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    console.log('MONGODB_URI:', uri);

    const connection = await mongoose.connect(uri, options);
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
