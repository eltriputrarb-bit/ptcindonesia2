import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getJwtSecret } from '../config/jwt.js';

// Regex validasi format email dasar
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req, res) => {
    try {
        const { name, email, password, phone, birthPlace, birthDate, address } = req.body;

        // Validasi tipe data dasar (mencegah NoSQL Injection)
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ message: 'Nama lengkap wajib diisi!' });
        }

        if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
            return res.status(400).json({ message: 'Format alamat email tidak valid!' });
        }

        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ message: 'Password minimal harus 6 karakter!' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Cek email ganda
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah terdaftar! Silakan login.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone ? String(phone).trim() : '',
            birthPlace: birthPlace ? String(birthPlace).trim() : '',
            birthDate: birthDate ? String(birthDate).trim() : '',
            address: address ? String(address).trim() : '',
            role: 'User', // Role selalu dikunci sebagai 'User' saat registrasi publik
            saldo: 0,
            courses: [],
        });

        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            getJwtSecret(),
            { expiresIn: '7d' }
        );

        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            message: 'Registrasi berhasil!',
            user: userResponse,
            token,
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({
            message: 'Registrasi gagal.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi tipe data (mencegah NoSQL Injection)
        if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Email dan password wajib diisi!' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ message: 'Email atau password salah!' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email atau password salah!' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            getJwtSecret(),
            { expiresIn: '7d' }
        );

        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            message: 'Login berhasil!',
            user: userResponse,
            token,
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            message: 'Login gagal.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

export const logout = (req, res) => {
    res.json({ message: 'Logout berhasil' });
};
