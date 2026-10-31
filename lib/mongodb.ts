import mongoose from 'mongoose';
import { getEnv } from './env';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & { mongoose?: MongooseCache };

function cache(): MongooseCache {
  if (!globalWithMongoose.mongoose) {
    globalWithMongoose.mongoose = { conn: null, promise: null };
  }
  return globalWithMongoose.mongoose;
}

export async function dbConnect() {
  const current = cache();
  if (current.conn) return current.conn;
  if (!current.promise) {
    const uri = getEnv().MONGODB_URI;
    current.promise = mongoose.connect(uri, { bufferCommands: false }).then((connected) => connected);
  }
  current.conn = await current.promise;
  return current.conn;
}

export default dbConnect;
