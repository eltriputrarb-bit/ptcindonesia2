import User from '../models/User.js';
import Course from '../models/Course.js';

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
        res.json({ user });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal mengambil data profil',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, phone, birthPlace, birthDate, address } = req.body;

        // Sanitasi field yang diizinkan (Role & Saldo TIDAK BISA dimanipulasi oleh user)
        const updateData = {};
        if (typeof name === 'string' && name.trim()) updateData.name = name.trim();
        if (typeof phone === 'string') updateData.phone = phone.trim();
        if (typeof birthPlace === 'string') updateData.birthPlace = birthPlace.trim();
        if (typeof birthDate === 'string') updateData.birthDate = birthDate.trim();
        if (typeof address === 'string') updateData.address = address.trim();

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true, select: '-password' }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        res.json({ message: 'Profil berhasil diperbarui!', user: updatedUser });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal memperbarui profil',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Pendaftaran Kursus & Sinkronisasi Total Pembayaran Saldo (Dengan Proteksi Anti-Tampering Harga)
export const enrollCourse = async (req, res) => {
    try {
        const { courseTitle, paymentMethod } = req.body;

        if (!courseTitle || typeof courseTitle !== 'string') {
            return res.status(400).json({ message: 'Judul kelas wajib dipilih!' });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        if (user.role === 'Admin') {
            return res.status(403).json({
                message: 'Akun Admin tidak diizinkan untuk mendaftar kelas!',
            });
        }

        // KEAMANAN: Verifikasi ke katalog database asli untuk mencegah manipulasi harga dari client
        const officialCourse = await Course.findOne({ title: courseTitle.trim() });
        if (!officialCourse) {
            return res.status(404).json({
                message: `Kelas "${courseTitle}" tidak ditemukan dalam katalog resmi PTC!`,
            });
        }

        if (!user.courses) user.courses = [];

        // Validasi Duplikasi Kelas
        const isAlreadyEnrolled = user.courses.some((c) => c.title === officialCourse.title);
        if (isAlreadyEnrolled) {
            return res.status(400).json({
                message: `Anda sudah terdaftar di kelas "${officialCourse.title}". Tidak dapat mendaftar kelas yang sama!`,
            });
        }

        // Gunakan harga dan kuota asli dari database, bukan dari input user
        const verifiedPrice = Number(officialCourse.priceNumeric) || 0;

        user.courses.push({
            title: officialCourse.title,
            sisaAbsen: officialCourse.quotaSesi || 12,
            image: officialCourse.image || '',
            pricePaid: verifiedPrice,
            paymentMethod: typeof paymentMethod === 'string' && paymentMethod.trim() ? paymentMethod.trim() : 'Bayar Tunai di Kantor PTC',
            paymentStatus: 'Lunas',
            enrolledAt: new Date(),
        });

        // Sinkronkan saldo akumulasi pembayaran kursus di database
        user.saldo = user.courses.reduce((sum, c) => sum + (Number(c.pricePaid) || 0), 0);

        await user.save();

        res.json({
            message: `Pendaftaran berhasil! Total transaksi Rp ${verifiedPrice.toLocaleString('id-ID')}`,
            courses: user.courses,
            saldo: user.saldo,
        });
    } catch (error) {
        console.error('Enroll Error:', error);
        res.status(500).json({
            message: 'Gagal memproses pendaftaran kelas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Batalkan Kursus & Kurangi Saldo di Database
export const cancelCourse = async (req, res) => {
    try {
        const { courseTitle } = req.body;

        if (!courseTitle || typeof courseTitle !== 'string') {
            return res.status(400).json({ message: 'Judul kelas tidak valid!' });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        const initialLength = user.courses.length;
        user.courses = user.courses.filter((c) => c.title !== courseTitle.trim());

        if (user.courses.length === initialLength) {
            return res.status(404).json({ message: 'Kelas tidak ditemukan pada akun Anda' });
        }

        // Hitung ulang saldo setelah pembatalan
        user.saldo = user.courses.reduce((sum, c) => sum + (Number(c.pricePaid) || 0), 0);

        await user.save();

        res.json({
            message: `Pendaftaran kelas "${courseTitle}" berhasil dibatalkan!`,
            courses: user.courses,
            saldo: user.saldo,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal membatalkan kelas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

export const doAbsen = async (req, res) => {
    try {
        const { courseTitle } = req.body;

        if (!courseTitle || typeof courseTitle !== 'string') {
            return res.status(400).json({ message: 'Judul kelas tidak valid!' });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        const course = user.courses?.find((c) => c.title === courseTitle.trim());
        if (!course) {
            return res.status(404).json({ message: 'Kelas tidak ditemukan pada akun Anda' });
        }

        if (course.sisaAbsen <= 0) {
            return res.json({
                success: false,
                message: `Sisa kuota sesi absen untuk ${courseTitle} sudah habis!`,
                courses: user.courses,
            });
        }

        course.sisaAbsen -= 1;
        await user.save();

        res.json({
            success: true,
            message: `Absen ${courseTitle} berhasil! Sisa sesi: ${course.sisaAbsen}`,
            courses: user.courses,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal absen',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

export const uploadCoursePhoto = async (req, res) => {
    try {
        const { courseTitle, imageBase64 } = req.body;

        if (!courseTitle || typeof courseTitle !== 'string') {
            return res.status(400).json({ message: 'Judul kelas tidak valid!' });
        }

        if (!imageBase64 || typeof imageBase64 !== 'string') {
            return res.status(400).json({ message: 'Foto kelas tidak valid!' });
        }

        // Batasi ukuran base64 foto maksimal ~5MB untuk keamanan database
        if (imageBase64.length > 7 * 1024 * 1024) {
            return res.status(400).json({ message: 'Ukuran foto terlalu besar! Maksimal 5MB.' });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        const course = user.courses?.find((c) => c.title === courseTitle.trim());
        if (!course) {
            return res.status(404).json({ message: 'Kelas tidak ditemukan' });
        }

        course.image = imageBase64;
        await user.save();

        res.json({
            message: `Foto kelas ${courseTitle} berhasil diperbarui di basis data!`,
            courses: user.courses,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal menyimpan foto kelas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
