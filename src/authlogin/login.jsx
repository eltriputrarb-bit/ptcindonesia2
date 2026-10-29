import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { API_BASE } from '../config/api';

export default function AuthLogin({ onLogin }) {
    const [activeTab, setActiveTab] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [registerData, setRegisterData] = useState({
        fullName: '',
        birthPlace: '',
        birthDate: '',
        address: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        agree: false,
    });

    const navigate = useNavigate();
    const location = useLocation();
    const message = location.state?.message;
    const pendingCourse = location.state?.selectedCourse;

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Login gagal');

            onLogin(data.user, data.token);
            alert('Login berhasil!');

            if (pendingCourse) {
                navigate('/pemesanan', { state: { selectedCourse: pendingCourse } });
            } else {
                navigate('/user');
            }
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (registerData.password !== registerData.confirmPassword) {
            alert('Konfirmasi password tidak cocok!');
            return;
        }
        if (!registerData.agree) {
            alert('Anda wajib menyetujui syarat & ketentuan!');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: registerData.fullName,
                    email: registerData.email,
                    password: registerData.password,
                    phone: registerData.phone,
                    birthPlace: registerData.birthPlace,
                    birthDate: registerData.birthDate,
                    address: registerData.address,
                }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Registrasi gagal');

            onLogin(data.user, data.token);
            alert('Pendaftaran berhasil! Akun tersimpan di database.');

            if (pendingCourse) {
                navigate('/pemesanan', { state: { selectedCourse: pendingCourse } });
            } else {
                navigate('/user');
            }
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                {message && <div className="auth-alert">{message}</div>}

                <div className="auth-tab-bar">
                    <button
                        type="button"
                        className={`auth-tab-btn ${activeTab === 'register' ? 'tab-register-active' : ''}`}
                        onClick={() => setActiveTab('register')}
                    >
                        BUAT AKUN
                    </button>
                    <button
                        type="button"
                        className={`auth-tab-btn ${activeTab === 'login' ? 'tab-login-active' : ''}`}
                        onClick={() => setActiveTab('login')}
                    >
                        Login
                    </button>
                </div>

                <div className="auth-brand-header">
                    <div className="ptc-vector-logo">
                        <span className="ptc-orange">p</span>
                        <span className="ptc-orange ptc-plane-wrap">
                            t
                            <svg className="plane-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </span>
                        <span className="ptc-orange">c</span>
                    </div>
                    <span className="ptc-subtitle">indonesia</span>
                </div>

                {activeTab === 'login' && (
                    <form className="auth-form" onSubmit={handleLoginSubmit}>
                        <h2 className="auth-form-title">LOGIN!</h2>

                        <div className="form-group-rounded">
                            <input
                                type="email"
                                placeholder="Email terdaftar"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group-rounded password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Your Password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password"
                            >
                                {showPassword ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <button type="submit" className="btn-primary-red">
                            Login
                        </button>

                        <div className="divider-text">Belum punya akun ?</div>

                        <button
                            type="button"
                            className="btn-outline-blue"
                            onClick={() => setActiveTab('register')}
                        >
                            Buat Akun !
                        </button>
                    </form>
                )}

                {activeTab === 'register' && (
                    <form className="auth-form" onSubmit={handleRegisterSubmit}>
                        <h2 className="auth-form-title">Buat Akun !</h2>

                        <div className="form-group-rounded">
                            <input
                                type="text"
                                placeholder="Nama Lengkap"
                                value={registerData.fullName}
                                onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-row-two">
                            <div className="floating-input-box">
                                <span className="floating-label">— Tempat Lahir</span>
                                <input
                                    type="text"
                                    placeholder="Cth: Makassar"
                                    value={registerData.birthPlace}
                                    onChange={(e) => setRegisterData({ ...registerData, birthPlace: e.target.value })}
                                />
                            </div>
                            <div className="floating-input-box">
                                <span className="floating-label">— Tanggal Lahir</span>
                                <input
                                    type="date"
                                    value={registerData.birthDate}
                                    onChange={(e) => setRegisterData({ ...registerData, birthDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group-rounded">
                            <input
                                type="text"
                                placeholder="Alamat lengkap"
                                value={registerData.address}
                                onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group-rounded">
                            <input
                                type="tel"
                                placeholder="No.whatsapp/ Hp Min 10 karakter*"
                                minLength={10}
                                value={registerData.phone}
                                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group-rounded">
                            <input
                                type="email"
                                placeholder="Email aktif..."
                                value={registerData.email}
                                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group-rounded password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                minLength={8}
                                value={registerData.password}
                                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password"
                            >
                                {showPassword ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="field-note-red">Password minimal 8 karakter</p>

                        <div className="form-group-rounded password-wrapper">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Konfirmasi Password"
                                minLength={8}
                                value={registerData.confirmPassword}
                                onChange={(e) =>
                                    setRegisterData({ ...registerData, confirmPassword: e.target.value })
                                }
                                required
                            />
                            <button
                                type="button"
                                className="toggle-eye-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label="Toggle confirm password"
                            >
                                {showConfirmPassword ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <label className="checkbox-agreement">
                            <input
                                type="checkbox"
                                checked={registerData.agree}
                                onChange={(e) => setRegisterData({ ...registerData, agree: e.target.checked })}
                            />
                            <span>
                                Dengan mendaftar anda menyetujui syarat, <a href="#syarat">ketentuan</a> &{' '}
                                <a href="#privasi">kebijakan privasi</a> kami !
                            </span>
                        </label>

                        <button type="submit" className="btn-primary-blue">
                            Buat Akun
                        </button>

                        <div className="divider-text">Sudah punya akun ?</div>

                        <button
                            type="button"
                            className="btn-outline-red"
                            onClick={() => setActiveTab('login')}
                        >
                            Login !
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}