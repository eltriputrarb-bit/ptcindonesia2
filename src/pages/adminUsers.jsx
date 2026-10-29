import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_BASE } from '../config/api';

export default function AdminUsers({ user }) {
    const navigate = useNavigate();
    const token = localStorage.getItem('ptc_token');

    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUserId, setEditingUserId] = useState(null);
    const [selectedUserCourses, setSelectedUserCourses] = useState(null);

    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'User',
        birthPlace: '',
        birthDate: '',
        address: '',
        saldo: '',
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal memuat data user');
            setUsersList(data.users || []);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token || user?.role !== 'Admin') {
            alert('Akses khusus Admin!');
            navigate('/user');
            return;
        }
        fetchUsers();
    }, [token, user]);

    const handleStartEdit = (targetUser) => {
        setEditingUserId(targetUser._id);
        setEditForm({
            name: targetUser.name || '',
            email: targetUser.email || '',
            phone: targetUser.phone || '',
            role: targetUser.role || 'User',
            birthPlace: targetUser.birthPlace || '',
            birthDate: targetUser.birthDate || '',
            address: targetUser.address || '',
            saldo: targetUser.saldo || '0',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingUserId(null);
        setEditForm({
            name: '',
            email: '',
            phone: '',
            role: 'User',
            birthPlace: '',
            birthDate: '',
            address: '',
            saldo: '',
        });
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/admin/users/${editingUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editForm),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal memperbarui user');

            alert(data.message);
            handleCancelEdit();
            fetchUsers();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleDeleteUser = async (targetUser) => {
        const isConfirm = window.confirm(
            `Apakah Anda yakin ingin menghapus akun user "${targetUser.name}" (${targetUser.email})? Tindakan ini permanen.`
        );
        if (!isConfirm) return;

        try {
            const res = await fetch(`${API_BASE}/admin/users/${targetUser._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal menghapus user');

            alert(data.message);
            fetchUsers();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    return (
        <div className="admin-page-wrapper">
            <div className="admin-topbar">
                <h2>Panel Manajemen Pengguna (User)</h2>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" className="btn-dash-edit" onClick={() => navigate('/admin/kelas')}>
                        Kelola Katalog Kelas
                    </button>
                    <button type="button" className="btn-dash-back" onClick={() => navigate('/user')}>
                        ← Profil
                    </button>
                </div>
            </div>

            <div className="admin-content-grid">
                {/* Form Edit User */}
                <div className="admin-form-card">
                    <h3>{editingUserId ? 'Edit Data Pengguna' : 'Pilih User Untuk Diedit'}</h3>
                    {editingUserId ? (
                        <form onSubmit={handleSaveEdit} className="admin-crud-form">
                            <div className="form-dash-group">
                                <label>Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-dash-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-dash-row">
                                <div className="form-dash-group">
                                    <label>Role</label>
                                    <select
                                        className="admin-select"
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    >
                                        <option value="User">User</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <div className="form-dash-group">
                                    <label>Nomor HP</label>
                                    <input
                                        type="tel"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    />
                                </div>
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
                                <label>Alamat</label>
                                <textarea
                                    rows="2"
                                    value={editForm.address}
                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                />
                            </div>

                            <div className="form-dash-group">
                                <label>Saldo (Rp)</label>
                                <input
                                    type="text"
                                    value={editForm.saldo}
                                    onChange={(e) => setEditForm({ ...editForm, saldo: e.target.value })}
                                />
                            </div>

                            <div className="admin-form-actions">
                                <button type="submit" className="btn-primary-blue">
                                    Simpan Perubahan
                                </button>
                                <button type="button" className="btn-dash-edit" onClick={handleCancelEdit}>
                                    Batal
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="admin-instruction-text">
                            Klik ikon edit pada tabel di samping untuk mengubah data pengguna, mengganti role (User/Admin), atau memperbarui saldo.
                        </p>
                    )}
                </div>

                {/* Tabel Daftar Pengguna */}
                <div className="admin-table-card">
                    <h3>Daftar Pengguna Terdaftar ({usersList.length})</h3>
                    {loading ? (
                        <p className="loading-text">Memuat pengguna...</p>
                    ) : (
                        <div className="admin-table-responsive">
                            <table className="admin-data-table">
                                <thead>
                                    <tr>
                                        <th>Nama & Email</th>
                                        <th>Role</th>
                                        <th>No. HP</th>
                                        <th>Program Kelas</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersList.map((u) => (
                                        <tr key={u._id}>
                                            <td>
                                                <strong>{u.name}</strong>
                                                <div className="sub-category">{u.email}</div>
                                            </td>
                                            <td>
                                                <span className={u.role === 'Admin' ? 'badge-role-admin' : 'badge-role-user'}>
                                                    {u.role || 'User'}
                                                </span>
                                            </td>
                                            <td>{u.phone || '-'}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn-view-courses"
                                                    onClick={() => setSelectedUserCourses(u)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                                        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                                                    </svg>
                                                    <span>{u.courses?.length || 0} Kelas</span>
                                                </button>
                                            </td>
                                            <td>
                                                <div className="table-action-btns">
                                                    <button
                                                        type="button"
                                                        className="btn-action-edit"
                                                        onClick={() => handleStartEdit(u)}
                                                        title="Edit User"
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                                        </svg>
                                                    </button>
                                                    {u._id !== user?.id && (
                                                        <button
                                                            type="button"
                                                            className="btn-action-delete"
                                                            onClick={() => handleDeleteUser(u)}
                                                            title="Hapus User"
                                                        >
                                                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Popup: Detail Program Kelas Yang Diambil User */}
            {selectedUserCourses && (
                <div className="modal-overlay" onClick={() => setSelectedUserCourses(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Program Kelas: {selectedUserCourses.name}</h3>
                            <button
                                type="button"
                                className="btn-close-modal"
                                onClick={() => setSelectedUserCourses(null)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            {!selectedUserCourses.courses || selectedUserCourses.courses.length === 0 ? (
                                <p className="empty-courses-notice">Pengguna ini belum mengambil kelas apapun.</p>
                            ) : (
                                <div className="user-courses-modal-list">
                                    {selectedUserCourses.courses.map((c, i) => (
                                        <div key={i} className="user-course-modal-item">
                                            {c.image && (
                                                <div className="course-thumb-box">
                                                    <img src={c.image} alt={c.title} />
                                                </div>
                                            )}
                                            <div className="course-modal-info">
                                                <h4>{c.title}</h4>
                                                <p>
                                                    Sisa Absensi : <strong>{c.sisaAbsen} Sesi</strong>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}