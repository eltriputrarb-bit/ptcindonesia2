import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server API berjalan di http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Koneksi MongoDB gagal saat start:', err.message);
    });
