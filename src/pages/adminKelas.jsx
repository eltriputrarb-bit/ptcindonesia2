import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_BASE } from '../config/api';

export default function AdminKelas({ user }) {
    const navigate = useNavigate();
    const token = localStorage.getItem('ptc_token');

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        title: '',
        category: 'Kursus komputer',
        price: '',
        priceNumeric: '',
        image: '',
        quotaSesi: 12,
    });

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/courses`);
            const data = await res.json();
            if (data.courses) setCourses(data.courses);
        } catch (err) {
            alert('Gagal memuat katalog: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token || user?.role !== 'Admin') {
            alert('Halaman ini khusus untuk Akun Admin!');
            navigate('/user');
            return;
        }
        fetchCourses();
    }, [token, user]);

    const handleImageFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) {
            alert('Ukuran gambar maksimal 4 MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setForm((prev) => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handlePriceChange = (val) => {
        const numeric = val.replace(/\D/g, '');
        const formatted = numeric ? Number(numeric).toLocaleString('id-ID') : '';
        setForm((prev) => ({
            ...prev,
            price: formatted,
            priceNumeric: numeric,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingId ? `${API_BASE}/courses/${editingId}` : `${API_BASE}/courses`;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal menyimpan kursus');

            alert(data.message);
            resetForm();
            fetchCourses();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleEditClick = (c) => {
        setEditingId(c._id);
        setForm({
            title: c.title,
            category: c.category,
            price: c.price,
            priceNumeric: c.priceNumeric,
            image: c.image || '',
            quotaSesi: c.quotaSesi || 12,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = async (c) => {
        const isConfirm = window.confirm(`Hapus program "${c.title}" dari katalog?`);
        if (!isConfirm) return;

        try {
            const res = await fetch(`${API_BASE}/courses/${c._id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal menghapus');

            alert(data.message);
            fetchCourses();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({
            title: '',
            category: 'Kursus komputer',
            price: '',
            priceNumeric: '',
            image: '',
            quotaSesi: 12,
        });
    };

    return (
        <div className="admin-page-wrapper">
            <div className="admin-topbar">
                <h2>Panel Pengaturan Kelas</h2>
                <button type="button" className="btn-dash-back" onClick={() => navigate('/user')}>
                    ← Kembali ke Profil
                </button>
            </div>

            <div className="admin-content-grid">
                <div className="admin-form-card">
                    <h3>{editingId ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}</h3>
                    <form onSubmit={handleSubmit} className="admin-crud-form">
                        <div className="form-dash-group">
                            <label>Nama / Judul Kursus</label>
                            <input
                                type="text"
                                placeholder="Cth: Node.js Backend Specialist"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-dash-group">
                            <label>Kategori</label>
                            <input
                                type="text"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-dash-row">
                            <div className="form-dash-group">
                                <label>Harga (Rp)</label>
                                <input
                                    type="text"
                                    placeholder="Cth: 1.500.000"
                                    value={form.price}
                                    onChange={(e) => handlePriceChange(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-dash-group">
                                <label>Jumlah Sesi Absen</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.quotaSesi}
                                    onChange={(e) => setForm({ ...form, quotaSesi: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-dash-group">
                            <label>Upload Banner / Foto Kelas</label>
                            <input type="file" accept="image/*" onChange={handleImageFile} />
                            {form.image && (
                                <div className="image-preview-box">
                                    <img src={form.image} alt="Preview" />
                                </div>
                            )}
                        </div>

                        <div className="admin-form-actions">
                            <button type="submit" className="btn-primary-blue">
                                {editingId ? 'Perbarui Kelas' : 'Simpan Kursus Baru'}
                            </button>
                            {editingId && (
                                <button type="button" className="btn-dash-edit" onClick={resetForm}>
                                    Batal
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="admin-table-card">
                    <h3>Katalog Kursus Aktif ({courses.length})</h3>
                    {loading ? (
                        <p className="loading-text">Memuat katalog...</p>
                    ) : (
                        <div className="admin-table-responsive">
                            <table className="admin-data-table">
                                <thead>
                                    <tr>
                                        <th>Foto</th>
                                        <th>Nama Kursus</th>
                                        <th>Harga</th>
                                        <th>Sesi</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((c) => (
                                        <tr key={c._id}>
                                            <td>
                                                <div className="table-img-box">
                                                    {c.image ? (
                                                        <img src={c.image} alt={c.title} />
                                                    ) : (
                                                        <div className="table-img-placeholder">No Img</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <strong>{c.title}</strong>
                                                <div className="sub-category">{c.category}</div>
                                            </td>
                                            <td>Rp {c.price}</td>
                                            <td>{c.quotaSesi} Sesi</td>
                                            <td>
                                                <div className="table-action-btns">
                                                    <button
                                                        type="button"
                                                        className="btn-action-edit"
                                                        onClick={() => handleEditClick(c)}
                                                        title="Edit"
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-action-delete"
                                                        onClick={() => handleDeleteClick(c)}
                                                        title="Hapus"
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                                        </svg>
                                                    </button>
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
        </div>
    );
}