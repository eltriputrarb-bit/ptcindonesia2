import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getJwtSecret } from '../config/jwt.js';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Akses ditolak! Token tidak ditemukan.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, getJwtSecret());
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Sesi login tidak sah atau kedaluwarsa!' });
    }
};

export const verifyAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || user.role !== 'Admin') {
            return res.status(403).json({ message: 'Akses ditolak! Fitur ini khusus untuk Admin.' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Gagal memverifikasi hak akses admin.' });
    }
};
