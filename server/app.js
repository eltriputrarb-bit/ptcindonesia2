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
            if (!origin) return callback(null, true);
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

// Health Check Endpoint (Tidak butuh koneksi database, untuk diagnosa status server Vercel)
app.get(['/api/health', '/health'], (req, res) => {
    res.json({
        status: 'online',
        service: 'PTC API Serverless Function',
        environment: process.env.NODE_ENV || 'production',
        hasMongoUri: Boolean(process.env.MONGODB_URI),
        hasJwtSecret: Boolean(process.env.JWT_SECRET),
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
        console.error('Koneksi MongoDB Atlas gagal:', err.message);
        return res.status(503).json({
            message: 'Koneksi ke database MongoDB Atlas gagal.',
            detail: err.message,
            hint: !process.env.MONGODB_URI
                ? 'Variabel MONGODB_URI belum disetel di Vercel Dashboard -> Project Settings -> Environment Variables. Jangan lupa klik Redeploy setelah menambahkan variabel.'
                : 'Variabel MONGODB_URI sudah terpasang, namun MongoDB Atlas menolak koneksi. Buka MongoDB Atlas -> Network Access -> tambahkan 0.0.0.0/0 (Allow Access from Anywhere).',
        });
    }
});

// Router API
const apiRouter = express.Router();

// Auth Endpoints dengan Proteksi Brute-Force Rate Limiting (Maks 10 percobaan per menit)
apiRouter.post('/auth/register', authRateLimiter(10, 60000), register);
apiRouter.post('/auth/login', authRateLimiter(10, 60000), login);
apiRouter.post('/auth/logout', logout);

// Katalog Kursus Endpoints
apiRouter.get('/courses', getCourses);
apiRouter.post('/courses', verifyToken, verifyAdmin, createCourse);
apiRouter.put('/courses/:id', verifyToken, verifyAdmin, updateCourse);
apiRouter.delete('/courses/:id', verifyToken, verifyAdmin, deleteCourse);

// Manajemen User oleh Admin Endpoints
apiRouter.get('/admin/users', verifyToken, verifyAdmin, getAllUsers);
apiRouter.put('/admin/users/:id', verifyToken, verifyAdmin, updateUserByAdmin);
apiRouter.delete('/admin/users/:id', verifyToken, verifyAdmin, deleteUserByAdmin);

// User Personal Endpoints
apiRouter.get('/user/profile', verifyToken, getProfile);
apiRouter.put('/user/profile', verifyToken, updateProfile);
apiRouter.post('/user/enroll', verifyToken, enrollCourse);
apiRouter.post('/user/cancel-course', verifyToken, cancelCourse);
apiRouter.post('/user/absen', verifyToken, doAbsen);
apiRouter.put('/user/course-photo', verifyToken, uploadCoursePhoto);

// Mount router pada '/api' dan '/' agar kompatibel dengan Vercel Serverless Function
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        message: 'Terjadi kesalahan pada server.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

export default app;
