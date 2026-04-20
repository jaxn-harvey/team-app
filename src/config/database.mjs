import { MongoClient, ServerApiVersion } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'shoals_dining_guide';

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined in .env');
}

const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('[DB] Connected to MongoDB successfully');
    return client;
  } catch (error) {
    console.error('[DB] Connection failed:', error);
    throw error;
  }
}

export function getDB() {
  return client.db(DB_NAME);
}

export { connectDB };
