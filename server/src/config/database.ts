import mongoose from "mongoose";

const defaultMongoUri = "mongodb://127.0.0.1:27017/carnote";

export async function connectDatabase(uri = process.env.MONGODB_URI ?? defaultMongoUri) {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
}

// En serverless (Vercel) el módulo puede quedar "tibio" entre invocaciones:
// cachear la promesa evita reconectar en cada request y reintenta si la última conexión falló.
let connectionPromise: Promise<void> | null = null;

export function ensureDatabaseConnection() {
  if (!connectionPromise) {
    connectionPromise = connectDatabase().catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }
  return connectionPromise;
}

export function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}
