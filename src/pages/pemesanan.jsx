import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { API_BASE } from '../config/api';

export default function PemesananKursus({ user, onUpdateUser }) {
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem('ptc_token');

    const selectedCourse = location.state?.selectedCourse || {
        title: 'Front End Web Development',
        price: '2.000.000',
        priceNumeric: 2000000,
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80',
    };

    useEffect(() => {
        if (!token || !user) {
            navigate('/login', {
                replace: true,
                state: { message: 'Silakan login terlebih dahulu untuk mengakses formulir pemesanan!' },
            });
            return;
        }

        if (user.role === 'Admin') {
            alert('Akun Admin tidak diizinkan memesan kelas!');
            navigate('/admin/kelas', { replace: true });
            return;
        }

        const alreadyEnrolled = user.courses?.some((c) => c.title === selectedCourse.title);
        if (alreadyEnrolled) {
            alert(`Anda sudah terdaftar di kelas "${selectedCourse.title}".`);
            navigate('/kelas', { replace: true });
        }
    }, [token, user, selectedCourse.title, navigate]);

    const orderId = React.useMemo(() => 'PTC' + Date.now().toString().slice(-8), []);

    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        birthPlace: user?.birthPlace || '',
        birthDate: user?.birthDate || '',
        phone: user?.phone || '',
        email: user?.email || '',
    });

    const basePrice = Number(selectedCourse.priceNumeric) || 0;
    const discount = basePrice >= 500000 ? 100000 : 0;
    const total = Math.max(0, basePrice - discount);

    // State Modal Pembayaran Tunai
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleOpenPayment = (e) => {
        e.preventDefault();
        setShowPaymentModal(true);
    };

    const handleConfirmCashPayment = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch(`${API_BASE}/user/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    courseTitle: selectedCourse.title,
                    image: selectedCourse.image || '',
                    paymentMethod: 'Bayar Tunai di Kantor PTC',
                    totalPaid: total,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Pembayaran gagal diproses');

            if (onUpdateUser && data.courses) {
                onUpdateUser({ ...user, courses: data.courses });
            }

            alert(
                `Pendaftaran Berhasil!\nNo. Faktur: ${orderId}\nProgram: ${selectedCourse.title}\nMetode: Bayar Tunai di Kantor PTC\nTotal Tagihan: Rp ${total.toLocaleString('id-ID')}\n\nSilakan tunjukkan bukti pendaftaran ini ke kasir PTC.`
            );
            setShowPaymentModal(false);
            navigate('/kelas');
        } catch (err) {
            alert(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="order-page-wrapper">
            <div className="order-card-container">
                <h1 className="order-main-title">Formulir Pemesanan Kursus</h1>
                <p className="order-alert-desc">
                    Selalu waspada terhadap pihak yang tidak bertanggung jawab mengatasnamakan PTC Indonesia.
                </p>

                <form onSubmit={handleOpenPayment} className="order-form-grid">
                    {/* Kolom Kiri: Biodata Siswa */}
                    <div className="order-left-column">
                        <div className="column-header-banner">Data Pemesan</div>

                        <div className="two-cols-row">
                            <div className="order-field-group">
                                <label>ID_Pemesanan</label>
                                <input type="text" value={orderId} readOnly className="input-readonly" />
                            </div>
                            <div className="order-field-group">
                                <label>Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="two-cols-row">
                            <div className="order-field-group">
                                <label>Tempat Lahir</label>
                                <input
                                    type="text"
                                    value={formData.birthPlace}
                                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="order-field-group">
                                <label>Tanggal Lahir</label>
                                <input
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="order-field-group">
                            <label>Nomor Handphone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>

                        <div className="order-field-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-proceed-pay">
                            lanjutkan ke pembayaran tunai
                        </button>
                    </div>

                    {/* Kolom Kanan: Rincian Tagihan */}
                    <div className="order-right-column">
                        <div className="order-field-group">
                            <label>Program Kursus</label>
                            <input type="text" value={selectedCourse.title} readOnly className="input-readonly" />
                        </div>
                        <div className="order-field-group">
                            <label>Harga Kursus (Rp)</label>
                            <input
                                type="text"
                                value={basePrice.toLocaleString('id-ID')}
                                readOnly
                                className="input-readonly"
                            />
                        </div>
                        <div className="order-field-group">
                            <label>Diskon Promo (Rp)</label>
                            <input
                                type="text"
                                value={discount.toLocaleString('id-ID')}
                                readOnly
                                className="input-readonly"
                            />
                        </div>
                        <div className="order-field-group">
                            <label>TOTAL (Rp)</label>
                            <input
                                type="text"
                                value={total.toLocaleString('id-ID')}
                                readOnly
                                className="input-readonly total-highlight"
                            />
                        </div>
                    </div>
                </form>
            </div>

            {/* Modal Popup Konfirmasi Pembayaran Tunai */}
            {showPaymentModal && (
                <div className="modal-overlay" onClick={() => !isProcessing && setShowPaymentModal(false)}>
                    <div className="modal-content payment-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Konfirmasi Pembayaran Tunai</h3>
                            <button
                                type="button"
                                className="btn-close-modal"
                                disabled={isProcessing}
                                onClick={() => setShowPaymentModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="payment-invoice-box">
                                <p>Program: <strong>{selectedCourse.title}</strong></p>
                                <p>Total Tagihan: <span className="invoice-price">Rp {total.toLocaleString('id-ID')}</span></p>
                            </div>

                            <div className="cash-payment-card">
                                <div className="cash-icon-wrapper">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" style={{ color: '#16a34a' }}>
                                        <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                    </svg>
                                </div>
                                <div className="cash-detail-text">
                                    <strong>Bayar Tunai di Kasir PTC</strong>
                                    <p>Pembayaran langsung dilakukan secara tunai di kantor cabang PTC Indonesia Makassar saat jadwal kelas dimulai.</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn-confirm-pay"
                                disabled={isProcessing}
                                onClick={handleConfirmCashPayment}
                            >
                                {isProcessing
                                    ? 'Menyimpan Pendaftaran...'
                                    : `Konfirmasi Pendaftaran Tunai (Rp ${total.toLocaleString('id-ID')})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}