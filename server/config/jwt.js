/**
 * Centralized JWT Secret Resolver
 * Memastikan token signing dan verification selalu sinkron menggunakan JWT_SECRET dari Environment Variable Vercel.
 */
export const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
        console.warn('[PERINGATAN KEAMANAN] JWT_SECRET belum disetel di Environment Variables Vercel! Menggunakan secret cadangan.');
    }
    return secret || 'kunci_rahasia_ptc_super_aman_2026_jwt_token_auth';
};

export default getJwtSecret;

