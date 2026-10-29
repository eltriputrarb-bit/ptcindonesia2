import mongoose from 'mongoose';
import Course from '../models/Course.js';

// Ambil semua kursus (Public) dengan proteksi anti-duplikasi
export const getCourses = async (req, res) => {
    try {
        const initialCourses = [
            {
                title: 'Front End Web Development',
                category: 'Kursus komputer',
                rating: '5.00',
                price: '2.000.000',
                priceNumeric: 2000000,
                image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80',
                quotaSesi: 12,
            },
            {
                title: 'School Program',
                category: 'Kursus komputer',
                rating: '5.00',
                price: '1.500.000',
                priceNumeric: 1500000,
                image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=600&q=80',
                quotaSesi: 12,
            },
            {
                title: 'Microsoft Excel Master',
                category: 'Kursus komputer',
                rating: '5.00',
                price: '1.000.000',
                priceNumeric: 1000000,
                image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
                quotaSesi: 12,
            },
        ];

        // Cek judul agar tidak terduplikasi ke database
        for (const c of initialCourses) {
            const exists = await Course.findOne({ title: c.title });
            if (!exists) {
                await Course.create(c);
            }
        }

        const courses = await Course.find().sort({ createdAt: 1 });
        res.json({ courses });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal mengambil data katalog',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Tambah Kursus Baru (Admin)
export const createCourse = async (req, res) => {
    try {
        const { title, category, price, priceNumeric, image, quotaSesi } = req.body;

        if (!title || typeof title !== 'string' || !price) {
            return res.status(400).json({ message: 'Judul dan harga wajib diisi!' });
        }

        const numPrice = Number(priceNumeric);
        if (isNaN(numPrice) || numPrice <= 0) {
            return res.status(400).json({ message: 'Nominal harga kursus (angka) tidak valid!' });
        }

        const newCourse = await Course.create({
            title: title.trim(),
            category: category ? String(category).trim() : 'Kursus komputer',
            price: String(price).trim(),
            priceNumeric: numPrice,
            image: image ? String(image).trim() : '',
            quotaSesi: Number(quotaSesi) || 12,
        });

        res.status(201).json({ message: 'Kursus baru berhasil ditambahkan!', course: newCourse });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal membuat kursus',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Edit Kursus (Admin)
export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID kursus tidak valid!' });
        }

        const { title, category, price, priceNumeric, image, quotaSesi } = req.body;

        const updateData = {};
        if (typeof title === 'string') updateData.title = title.trim();
        if (typeof category === 'string') updateData.category = category.trim();
        if (typeof price === 'string') updateData.price = price.trim();
        if (priceNumeric !== undefined && !isNaN(Number(priceNumeric))) updateData.priceNumeric = Number(priceNumeric);
        if (typeof image === 'string') updateData.image = image.trim();
        if (quotaSesi !== undefined && !isNaN(Number(quotaSesi))) updateData.quotaSesi = Number(quotaSesi);

        const updated = await Course.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: 'Kursus tidak ditemukan' });

        res.json({ message: 'Data kursus berhasil diperbarui!', course: updated });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal memperbarui kursus',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Hapus Kursus (Admin)
export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID kursus tidak valid!' });
        }

        const deleted = await Course.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'Kursus tidak ditemukan' });

        res.json({ message: 'Kursus berhasil dihapus dari sistem!' });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal menghapus kursus',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
