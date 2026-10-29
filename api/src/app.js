import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { register, login, logout } from './controllers/authController.js';
import {
    getProfile,
    updateProfile,
    enrollCourse,
    doAbsen,
    uploadCoursePhoto,
    cancelCourse,
} from './controllers/userController.js';
import {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
} from './controllers/courseController.js';
import {
    getAllUsers,
    updateUserByAdmin,
    deleteUserByAdmin,
} from './controllers/adminUserController.js';
import { verifyToken, verifyAdmin } from './middleware/auth.js';
import { authRateLimiter } from './middleware/rateLimiter.js';

const app = express();

// Konfigurasi CORS Fleksibel (Mendukung Vercel domain, local development, dan mobile clients)
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:5000',
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Izinkan request tanpa origin (seperti mobile app, curl, postman, serverless same-origin)
            if (!origin) return callback(null, true);
            // Izinkan semua domain Vercel preview (*.vercel.app) atau origin yang didaftarkan
            if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin) || process.env.CLIENT_URL === '*') {
                return callback(null, true);
            }
            return callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint (Berguna untuk memverifikasi deployment Vercel)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'PTC API',
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString(),
    });
});

// Middleware Cek & Sambungkan MongoDB Atlas (Khusus Serverless Vercel)
app.use(async (req, res, next) => {
    if (req.method === 'OPTIONS') return next();

    try {
        await connectDB();
        next();
    } catch (err) {
        return res.status(503).json({
            message: 'Koneksi ke database MongoDB Atlas gagal.',
            detail: err.message,
            hint: 'Pastikan MONGODB_URI sudah ditambahkan pada Environment Variables di Dashboard Vercel.',
        });
    }
});

// Auth Endpoints dengan Proteksi Brute-Force Rate Limiting (Maks 10 percobaan per menit)
app.post('/api/auth/register', authRateLimiter(10, 60000), register);
app.post('/api/auth/login', authRateLimiter(10, 60000), login);
app.post('/api/auth/logout', logout);

// Katalog Kursus Endpoints
app.get('/api/courses', getCourses);
app.post('/api/courses', verifyToken, verifyAdmin, createCourse);
app.put('/api/courses/:id', verifyToken, verifyAdmin, updateCourse);
app.delete('/api/courses/:id', verifyToken, verifyAdmin, deleteCourse);

// Manajemen User oleh Admin Endpoints
app.get('/api/admin/users', verifyToken, verifyAdmin, getAllUsers);
app.put('/api/admin/users/:id', verifyToken, verifyAdmin, updateUserByAdmin);
app.delete('/api/admin/users/:id', verifyToken, verifyAdmin, deleteUserByAdmin);

// User Personal Endpoints
app.get('/api/user/profile', verifyToken, getProfile);
app.put('/api/user/profile', verifyToken, updateProfile);
app.post('/api/user/enroll', verifyToken, enrollCourse);
app.post('/api/user/cancel-course', verifyToken, cancelCourse);
app.post('/api/user/absen', verifyToken, doAbsen);
app.put('/api/user/course-photo', verifyToken, uploadCoursePhoto);

// 404 Handler untuk API Route
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: `API route ${req.originalUrl} tidak ditemukan.` });
});

// Global Error Handler (Menyembunyikan detail stack trace pada Production)
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        message: 'Terjadi kesalahan pada server.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

export default app;
