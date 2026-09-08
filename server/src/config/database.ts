import mongoose from "mongoose";

const defaultMongoUri = "mongodb://127.0.0.1:27017/carnote";

export async function connectDatabase(uri = process.env.MONGODB_URI ?? defaultMongoUri) {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
}

export function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}
