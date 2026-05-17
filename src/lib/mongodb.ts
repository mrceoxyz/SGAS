import mongoose from "mongoose";

const MONGODB_URI = 'mongodb+srv://mrceoxyz001_db_user:eQWXmuvhUlDSh3FT@schoolattendance.n2d2k6g.mongodb.net/?appName=schoolAttendance';

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise; 

  return cached.conn;
}