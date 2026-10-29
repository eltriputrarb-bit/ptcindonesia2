/**
 * Rate Limiter sederhana untuk lingkungan Serverless / Node.js
 * Mencegah serangan brute-force, password guessing, dan DoS pada endpoint autentikasi.
 */
const attempts = new Map();

export const authRateLimiter = (maxAttempts = 10, windowMs = 60 * 1000) => {
    return (req, res, next) => {
        // Deteksi IP klien asli (mendukung Vercel proxy headers)
        const ip =
            (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim()) ||
            req.ip ||
            'unknown';

        const now = Date.now();
        const clientData = attempts.get(ip);

        // Bersihkan entri lama jika window waktu sudah lewat
        if (!clientData || now > clientData.resetTime) {
            attempts.set(ip, { count: 1, resetTime: now + windowMs });
            return next();
        }

        clientData.count += 1;

        if (clientData.count > maxAttempts) {
            const waitSeconds = Math.ceil((clientData.resetTime - now) / 1000);
            return res.status(429).json({
                message: `Terlalu banyak percobaan autentikasi! Demi keamanan, silakan coba lagi dalam ${waitSeconds} detik.`,
            });
        }

        next();
    };
};

export default authRateLimiter;

