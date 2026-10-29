import mongoose from 'mongoose';
import User from '../models/User.js';

// Ambil semua daftar user beserta kursus yang diambil
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ users });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal mengambil data user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Ubah data user oleh Admin
export const updateUserByAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID pengguna tidak valid!' });
        }

        const { name, email, phone, role, birthPlace, birthDate, address, saldo } = req.body;

        const updateData = {};
        if (typeof name === 'string') updateData.name = name.trim();
        if (typeof email === 'string') updateData.email = email.trim().toLowerCase();
        if (typeof phone === 'string') updateData.phone = phone.trim();
        if (role === 'Admin' || role === 'User') updateData.role = role;
        if (typeof birthPlace === 'string') updateData.birthPlace = birthPlace.trim();
        if (typeof birthDate === 'string') updateData.birthDate = birthDate.trim();
        if (typeof address === 'string') updateData.address = address.trim();
        if (saldo !== undefined && !isNaN(Number(saldo))) updateData.saldo = Number(saldo);

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, select: '-password' }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        res.json({ message: 'Data user berhasil diperbarui oleh Admin!', user: updatedUser });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal memperbarui user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Hapus user oleh Admin
export const deleteUserByAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID pengguna tidak valid!' });
        }

        // Cegah admin menghapus akunnya sendiri
        if (id === req.userId) {
            return res.status(400).json({ message: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang login!' });
        }

        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        res.json({ message: `User ${deletedUser.name} (${deletedUser.email}) berhasil dihapus!` });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal menghapus user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
