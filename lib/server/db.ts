import mongoose from "mongoose"

let cached = (global as any)._mongoose
if (!cached) cached = (global as any)._mongoose = { conn: null, promise: null }

export async function dbConnect() {
  const uri = process.env.MONGO_URI
  if (!uri) return null

  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { dbName: "thehatch" }).then((m) => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}

export function mongoEnabled() {
  return !!process.env.MONGO_URI
}