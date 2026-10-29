/**
 * Centralized API Base URL Configuration
 *
 * Di Vercel Production:
 *   Menggunakan relative path '/api' (otomatis terhubung ke Serverless Function Vercel tanpa perlu hardcode URL).
 *   Atau menggunakan VITE_API_BASE_URL jika disetel di Vercel Environment Variables.
 *
 * Di Local Development:
 *   Menggunakan VITE_API_BASE_URL jika ada, atau fallback ke '/api' (jika lewat Vite proxy) atau 'http://localhost:5000/api'.
 */
const getApiBaseUrl = () => {
    // 1. Jika ada Environment Variable VITE_API_BASE_URL (misal backend terpisah)
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
    }

    // 2. Di Vercel Production (Frontend & API dalam 1 domain di Vercel)
    if (import.meta.env.PROD) {
        return '/api';
    }

    // 3. Di Local Development (default ke '/api' via Vite proxy atau localhost port 5000)
    return '/api';
};

export const API_BASE = getApiBaseUrl();

export default API_BASE;

