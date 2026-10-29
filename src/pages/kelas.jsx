import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_BASE } from '../config/api';

const defaultImages = {
    'Front End Web Development':
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80',
    'School Program':
        'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=600&q=80',
    'Microsoft Excel Master':
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
};

export default function KelasPage({ user, onUpdateUser }) {
    const navigate = useNavigate();
    const token = localStorage.getItem('ptc_token');
    const [uploadingCourse, setUploadingCourse] = useState(null);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetch(`${API_BASE}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.user) onUpdateUser(data.user);
            })
            .catch((err) => console.error('Gagal mengambil data kelas:', err));
    }, [token]);

    const coursesList = user?.courses || [];

    const handlePhotoUpload = (courseTitle, event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran foto terlalu besar! Maksimal 5 MB.');
            return;
        }

        setUploadingCourse(courseTitle);

        const reader = new FileReader();
        reader.onload = async () => {
            const base64Image = reader.result;

            try {
                const res = await fetch(`${API_BASE}/user/course-photo`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        courseTitle,
                        imageBase64: base64Image,
                    }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Gagal menyimpan foto');

                if (data.courses) {
                    onUpdateUser({ ...user, courses: data.courses });
                }
                alert(`Foto kelas ${courseTitle} berhasil diperbarui!`);
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                setUploadingCourse(null);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleCancelCourse = async (courseTitle) => {
        const isConfirm = window.confirm(
            `Apakah Anda yakin ingin membatalkan pendaftaran kelas "${courseTitle}"? Data absen kelas ini akan dihapus.`
        );
        if (!isConfirm) return;

        try {
            const res = await fetch(`${API_BASE}/user/cancel-course`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ courseTitle }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal membatalkan kelas');

            if (data.courses) {
                onUpdateUser({ ...user, courses: data.courses });
            }
            alert(data.message);
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    return (
        <div className="kelas-page-wrapper">
            <div className="kelas-topbar-yellow"></div>

            <div className="kelas-content-container">
                <div className="kelas-header-row">
                    <h1 className="kelas-title">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" className="kelas-title-svg">
                            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                        </svg>
                        kelas
                    </h1>
                    <button
                        type="button"
                        className="btn-kelas-kembali"
                        onClick={() => navigate('/user')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Kembali
                    </button>
                </div>

                {coursesList.length === 0 ? (
                    <div className="kelas-empty-box">
                        <p>Anda belum terdaftar di kelas manapun.</p>
                        <button
                            type="button"
                            className="btn-primary-blue"
                            onClick={() => navigate('/')}
                            style={{ marginTop: '1rem', width: 'auto', padding: '0.6rem 1.5rem' }}
                        >
                            Lihat Katalog Kursus
                        </button>
                    </div>
                ) : (
                    <div className="kelas-grid">
                        {coursesList.map((c, index) => {
                            const displayImage = c.image || defaultImages[c.title];

                            return (
                                <div key={index} className="kelas-card">
                                    <div className="kelas-photo-box">
                                        {displayImage ? (
                                            <img src={displayImage} alt={c.title} className="kelas-photo-img" />
                                        ) : (
                                            <div className="kelas-photo-placeholder">
                                                <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                                                    <path d="M12 12c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0-8c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm8 14H4c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h3.17L9 4h6l1.83 2H20c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2zm-8-2c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z" />
                                                </svg>
                                                <p>Belum ada foto kelas</p>
                                            </div>
                                        )}

                                        <label
                                            htmlFor={`file-upload-${index}`}
                                            className="btn-upload-overlay"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                            </svg>
                                            <span>{uploadingCourse === c.title ? 'Menyimpan...' : 'Ganti Foto Kelas'}</span>
                                        </label>
                                        <input
                                            id={`file-upload-${index}`}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => handlePhotoUpload(c.title, e)}
                                            disabled={uploadingCourse === c.title}
                                        />
                                    </div>

                                    <div className="kelas-info-body">
                                        <h3 className="kelas-card-title">{c.title}</h3>
                                        <div className="kelas-meta-row">
                                            <span>Sisa Kuota Absen :</span>
                                            <strong className="session-count">{c.sisaAbsen} Sesi</strong>
                                        </div>
                                        <div className="kelas-badge-status">
                                            <span className="dot-green">●</span> Kursus Aktif
                                        </div>

                                        {/* Tombol Batalkan Kelas */}
                                        <button
                                            type="button"
                                            className="btn-cancel-course"
                                            onClick={() => handleCancelCourse(c.title)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                            </svg>
                                            Batalkan Kelas
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}