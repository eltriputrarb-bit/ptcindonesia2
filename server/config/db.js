import mongoose from 'mongoose';

/**
 * Cache global untuk koneksi MongoDB di Serverless Environment (Vercel).
 * Mencegah kehabisan connection pool pada MongoDB Atlas saat scaling function.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        const errorMsg = 'Environment Variable MONGODB_URI tidak ditemukan! Pastikan MONGODB_URI sudah ditambahkan pada Settings > Environment Variables di Dashboard Vercel.';
        console.error(`[DATABASE ERROR] ${errorMsg}`);
        throw new Error(errorMsg);
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 6000,
        };

        cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
            console.log('MongoDB Atlas aman & berhasil terhubung via Serverless Pool.');
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('Koneksi MongoDB Atlas gagal:', e.message);
        throw e;
    }

    return cached.conn;
}

export default connectDB;

