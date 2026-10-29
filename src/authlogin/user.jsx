import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { API_BASE } from '../config/api';

export default function UserProfile({ user, onUpdateUser, onLogout }) {
    const navigate = useNavigate();
    const token = localStorage.getItem('ptc_token');

    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Tutup drawer jika tombol ESC ditekan
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setDrawerOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Kunci scroll body saat drawer terbuka di Android / iPhone
    useEffect(() => {
        if (drawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [drawerOpen]);

    const closeDrawer = () => setDrawerOpen(false);

    const [editForm, setEditForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        birthPlace: user?.birthPlace || '',
        birthDate: user?.birthDate || '',
        address: user?.address || '',
    });

    useEffect(() => {
        if (!token) return;

        fetch(`${API_BASE}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.user) {
                    onUpdateUser(data.user);
                    setEditForm({
                        name: data.user.name || '',
                        phone: data.user.phone || '',
                        birthPlace: data.user.birthPlace || '',
                        birthDate: data.user.birthDate || '',
                        address: data.user.address || '',
                    });
                }
            })
            .catch((err) => console.error('Gagal sinkron data:', err));
    }, [token]);

    const coursesList = user?.courses || [];

    // Hitung total akumulasi pembayaran kursus
    const totalBiayaKursus = coursesList.reduce(
        (total, item) => total + (Number(item.pricePaid) || 0),
        0
    );

    const handleAbsenCourse = async (courseTitle, sisaAbsen) => {
        if (sisaAbsen <= 0) {
            alert(`Kuota absen untuk ${courseTitle} sudah habis!`);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/user/absen`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ courseTitle }),
            });
            const data = await res.json();

            if (data.courses) {
                onUpdateUser({ ...user, courses: data.courses });
            }
            alert(data.message);
        } catch (err) {
            alert('Gagal absen: ' + err.message);
        }
    };

    const handleCancelCourse = async (courseTitle) => {
        const isConfirm = window.confirm(
            `Apakah Anda yakin ingin membatalkan pendaftaran kelas "${courseTitle}"?`
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
                onUpdateUser({ ...user, courses: data.courses, saldo: data.saldo });
            }
            alert(data.message);
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editForm),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Gagal update data');

            onUpdateUser({ ...user, ...data.user });
            setIsEditing(false);
            alert('Data profil berhasil diperbarui!');
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="dashboard-container">
            {/* Backdrop Overlay untuk Mobile Navigation Drawer (Android & iPhone) */}
            <div
                className={`drawer-backdrop ${drawerOpen ? 'open' : ''}`}
                onClick={closeDrawer}
                aria-hidden="true"
            />

            {/* Navigation Drawer / Sidebar */}
            <aside className={`dashboard-sidebar ${drawerOpen ? 'drawer-open' : ''}`}>
                <div className="sidebar-brand">
                    <div className="brand-title-wrap">
                        <h2>PTC INDONESIA</h2>
                        <span className="sidebar-brand-sub">INDONESIA</span>
                    </div>
                    {/* Tombol Close untuk Android & iPhone Drawer */}
                    <button
                        type="button"
                        className="drawer-close-btn"
                        onClick={closeDrawer}
                        aria-label="Tutup menu navigasi"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Profil Ringkas Pengguna (Android & iPhone Drawer Header) */}
                <div className="sidebar-user-card">
                    <div className="sidebar-user-avatar">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                    <div className="sidebar-user-meta">
                        <span className="sidebar-user-name" title={user?.name}>{user?.name || 'Pengguna'}</span>
                        <span className="sidebar-user-role-badge">{user?.role || 'User'}</span>
                    </div>
                </div>

                <div className="sidebar-menu-wrapper">
                    <span className="sidebar-category-label">NAVIGASI UTAMA</span>
                    <ul className="sidebar-menu">
                        <li>
                            <Link to="/" onClick={closeDrawer}>
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className="side-svg-icon icon-home">
                                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                                </svg>
                                <span>Home</span>
                            </Link>
                        </li>
                        <li className="active-menu">
                            <Link to="/user" onClick={closeDrawer}>
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className="side-svg-icon icon-profile">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                                <span>Profil</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/kelas" onClick={closeDrawer}>
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className="side-svg-icon icon-kelas">
                                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                                </svg>
                                <span>Kelasku</span>
                            </Link>
                        </li>
                        {user?.role === 'Admin' && (
                            <>
                                <li className="sidebar-divider">
                                    <span className="sidebar-category-label">PANEL ADMIN</span>
                                </li>
                                <li>
                                    <Link to="/admin/kelas" onClick={closeDrawer}>
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className="side-svg-icon" style={{ color: '#f59e0b' }}>
                                            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                                        </svg>
                                        <span style={{ color: '#f59e0b', fontWeight: '700' }}>Kelola Kelas</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/admin/users" onClick={closeDrawer}>
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className="side-svg-icon" style={{ color: '#10b981' }}>
                                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                        </svg>
                                        <span style={{ color: '#10b981', fontWeight: '700' }}>Kelola User</span>
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>

                {/* Footer Drawer Tombol Keluar */}
                <div className="sidebar-drawer-footer">
                    <button
                        type="button"
                        className="drawer-logout-btn"
                        onClick={() => {
                            closeDrawer();
                            onLogout();
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                        </svg>
                        <span>Keluar Akun</span>
                    </button>
                </div>
            </aside>

            <div className="dashboard-main-area">
                <header className="dashboard-topbar">
                    <div className="topbar-left">
                        <button
                            type="button"
                            className="drawer-toggle-btn"
                            onClick={() => setDrawerOpen(true)}
                            aria-label="Buka menu navigasi"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="22" height="22">
                                <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
                                <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
                                <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
                            </svg>
                            <span className="drawer-toggle-label">Menu</span>
                        </button>
                        <span className="topbar-page-title">Profil Akun</span>
                    </div>

                    <div className="topbar-right">
                        <span className="topbar-username">{user?.name}</span>
                        <div className="topbar-avatar-badge">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" className="topbar-avatar-svg">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </div>
                        <button
                            type="button"
                            className="topbar-logout-btn"
                            onClick={onLogout}
                            title="Keluar"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className="topbar-logout-svg">
                                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                            </svg>
                        </button>
                    </div>
                </header>

                <main className="dashboard-content">
                    <div className="profile-grid">
                        <div className="profile-card profile-card-left">
                            <div className="card-top-actions">
                                <button type="button" className="btn-dash-back" onClick={() => navigate('/')}>
                                    ← Kembali
                                </button>
                                <button
                                    type="button"
                                    className="btn-dash-edit"
                                    onClick={() => setIsEditing(!isEditing)}
                                >
                                    {isEditing ? 'Batal' : 'Edit Profil'}
                                </button>
                            </div>

                            <div className="profile-avatar-box">
                                <div className="avatar-circle">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="avatar-svg-hero">
                                        <circle cx="12" cy="8" r="4" fill="#facc15" stroke="#ca8a04" />
                                        <path
                                            d="M6 20v-1a6 6 0 0 1 12 0v1"
                                            fill="#3b82f6"
                                            stroke="#1d4ed8"
                                        />
                                    </svg>
                                </div>
                                <h3 className="profile-display-name">{user?.name}</h3>
                            </div>

                            {/* Kotak Akumulasi Pembayaran Kursus (Format Rp) */}
                            <div className="saldo-badge-box">
                                <div className="saldo-header-row">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" className="saldo-svg">
                                        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                                    </svg>
                                    <span className="saldo-label">Total Pembayaran</span>
                                </div>
                                <span className="saldo-value">
                                    Rp. {totalBiayaKursus.toLocaleString('id-ID')}
                                </span>
                            </div>

                            <div className="user-contacts">
                                <p className="contact-item">{user?.email}</p>
                                <p className="contact-item">{user?.phone || '-'}</p>
                            </div>

                            <div className="user-status-group">
                                <div className="status-row">
                                    <span>Status Akun :</span>
                                    <span className="badge-active-green">Aktif</span>
                                </div>
                            </div>

                            <div className="my-class-box">
                                <div className="my-class-header">
                                    <h4>Kelasku</h4>
                                    <button
                                        type="button"
                                        className="link-btn-kelas"
                                        onClick={() => navigate('/kelas')}
                                    >
                                        Buka Halaman Kelas →
                                    </button>
                                </div>
                                <div className="class-cards-list">
                                    {coursesList.length === 0 ? (
                                        <div className="empty-courses-card">
                                            <p>Anda belum memiliki kursus aktif.</p>
                                            <button
                                                type="button"
                                                className="btn-pilih-kursus"
                                                onClick={() => navigate('/')}
                                            >
                                                + Pilih Kursus Sekarang
                                            </button>
                                        </div>
                                    ) : (
                                        coursesList.map((c, index) => (
                                            <div key={index} className="class-card-inner">
                                                <p className="class-title">{c.title}</p>
                                                <p className="absence-remaining">
                                                    Sisa Absen : <b>{c.sisaAbsen}</b>
                                                </p>
                                                <div className="class-card-actions">
                                                    <button
                                                        type="button"
                                                        className="btn-action-absen"
                                                        disabled={c.sisaAbsen <= 0}
                                                        style={{
                                                            backgroundColor: c.sisaAbsen <= 0 ? '#94a3b8' : '#06b6d4',
                                                            cursor: c.sisaAbsen <= 0 ? 'not-allowed' : 'pointer',
                                                        }}
                                                        onClick={() => handleAbsenCourse(c.title, c.sisaAbsen)}
                                                    >
                                                        {c.sisaAbsen <= 0 ? 'Sesi Habis' : 'Absen'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-cancel-small"
                                                        onClick={() => handleCancelCourse(c.title)}
                                                        title="Batalkan Kelas"
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="profile-card profile-card-right">
                            <div className="detail-header-tabs">
                                <h3>Detail User</h3>
                                <div className="tabs-pill">
                                    <button
                                        type="button"
                                        className={`tab-pill-btn ${activeTab === 'info' ? 'tab-pill-active' : ''}`}
                                        onClick={() => setActiveTab('info')}
                                    >
                                        Info
                                    </button>
                                </div>
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleSaveProfile} className="profile-edit-form">
                                    <div className="form-dash-group">
                                        <label>Nama Lengkap</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-dash-row">
                                        <div className="form-dash-group">
                                            <label>Tempat Lahir</label>
                                            <input
                                                type="text"
                                                value={editForm.birthPlace}
                                                onChange={(e) => setEditForm({ ...editForm, birthPlace: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-dash-group">
                                            <label>Tanggal Lahir</label>
                                            <input
                                                type="date"
                                                value={editForm.birthDate}
                                                onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-dash-group">
                                        <label>Nomor WhatsApp / HP</label>
                                        <input
                                            type="tel"
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-dash-group">
                                        <label>Alamat Lengkap</label>
                                        <textarea
                                            rows="2"
                                            value={editForm.address}
                                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                        />
                                    </div>

                                    <button type="submit" className="btn-dash-save">
                                        Simpan Perubahan
                                    </button>
                                </form>
                            ) : (
                                <div className="profile-info-list">
                                    <div className="info-item">
                                        <span className="info-label">Tempat Lahir :</span>
                                        <p className="info-value">{user?.birthPlace || '-'}</p>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Tanggal Lahir :</span>
                                        <p className="info-value">{user?.birthDate || '-'}</p>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Alamat :</span>
                                        <p className="info-value">{user?.address || '-'}</p>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Password :</span>
                                        <p className="info-value password-hash">
                                            [Terenkripsi Aman Menggunakan Bcrypt]
                                        </p>
                                    </div>
                                    <div className="user-role-badge-row">
                                        <span>Anda login sebagai :</span>
                                        <span className={user?.role === 'Admin' ? 'badge-role-admin' : 'badge-role-user'}>
                                            {user?.role || 'User'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}