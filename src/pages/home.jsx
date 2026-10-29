import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_BASE } from '../config/api';

export default function Home({ user }) {
    const navigate = useNavigate();

    const bannerImages = [
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    ];
    const [currentSlide, setCurrentSlide] = useState(0);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE}/courses`)
            .then((res) => res.json())
            .then((data) => {
                if (data.courses) setCourses(data.courses);
            })
            .catch((err) => console.error('Gagal mengambil kursus:', err));
    }, []);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === bannerImages.length - 1 ? 0 : prev + 1));
    };

    const reviews = [
        {
            id: 1,
            name: 'Muhammad Fadhil Muyassar',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            comment:
                'Rekomendasi buat teman-teman yang ingin kursus komputer, langsung saja daftar di PTC. Pelayanannya sangat baik, tutornya juga dalam menyampaikan materi mudah dimengerti.',
        },
        {
            id: 2,
            name: 'Chennel DIRA',
            avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
            comment:
                'Saya bisa lebih mahir menggunakan coreldraw serta trainernya sangat the best dan ramah dalam mengajarkan materi.',
        },
        {
            id: 3,
            name: 'Putri Rezky Ramadhani',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
            comment:
                'Sangat merekomendasikan ke teman-teman yang ingin belajar komputer dan melatih skill lainnya. Tentornya ramah dan materinya mudah di pahami.',
        },
    ];

    const isEnrolled = (courseTitle) => {
        return user?.courses?.some((c) => c.title === courseTitle);
    };

    const isAdmin = user?.role === 'Admin';

    const handleBookingCourse = (course) => {
        if (!user) {
            navigate('/login', {
                state: {
                    message: `Silakan login/buat akun terlebih dahulu untuk memesan kursus ${course.title}!`,
                    selectedCourse: course,
                },
            });
            return;
        }

        if (isAdmin) {
            alert('Akun Admin tidak diizinkan membeli kelas! Kelola kursus lewat menu Kelola Kelas.');
            return;
        }

        if (isEnrolled(course.title)) {
            alert(`Anda sudah terdaftar di kelas ${course.title}!`);
            return;
        }

        navigate('/pemesanan', { state: { selectedCourse: course } });
    };

    return (
        <main>
            <section className="hero-slider">
                <button className="nav-arrow left-arrow" onClick={prevSlide} aria-label="Sebelumnya">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                        <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <div className="slide-content">
                    <img src={bannerImages[currentSlide]} alt="Banner" className="slide-image" />
                </div>
                <button className="nav-arrow right-arrow" onClick={nextSlide} aria-label="Selanjutnya">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </section>

            <section className="catalog-section">
                <h2 className="section-title">Program Kursus Kami</h2>
                <div className="catalog-grid">
                    {courses.map((course) => {
                        const alreadyHasClass = isEnrolled(course.title);
                        const isDisabled = isAdmin || alreadyHasClass;

                        return (
                            <div
                                key={course._id}
                                className={`field-card ${isDisabled ? 'card-disabled' : 'clickable-card'}`}
                                onClick={() => !isDisabled && handleBookingCourse(course)}
                            >
                                <div className="card-image-box">
                                    <img
                                        src={
                                            course.image ||
                                            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'
                                        }
                                        alt={course.title}
                                    />
                                </div>
                                <div className="card-info">
                                    <h3 className="field-name">{course.title}</h3>
                                    <p className="field-category">{course.category}</p>
                                    <div className="field-rating">
                                        <svg viewBox="0 0 24 24" fill="#f59e0b" width="16" height="16">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                        <span>{course.rating || '5.00'}</span>
                                    </div>
                                    <div className="field-badge">
                                        <span className="dot">•</span>
                                        <span className="badge-text">Komputer / PC</span>
                                    </div>
                                    <p className="field-price">Rp {course.price}</p>
                                    <button
                                        type="button"
                                        className="btn-card-action"
                                        disabled={isDisabled}
                                        style={{
                                            backgroundColor: isDisabled ? '#94a3b8' : '#111827',
                                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleBookingCourse(course);
                                        }}
                                    >
                                        {isAdmin
                                            ? 'Mode Admin (Khusus Siswa)'
                                            : alreadyHasClass
                                                ? 'Sudah Terdaftar'
                                                : 'Daftar Kursus Sekarang'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="reviews-section">
                <h2 className="reviews-title">KATA MEREKA YANG TELAH MENJADI BAGIAN DARI KAMI</h2>
                <div className="reviews-grid">
                    {reviews.map((rev) => (
                        <div key={rev.id} className="review-card">
                            <div className="avatar-wrapper">
                                <img src={rev.avatar} alt={rev.name} className="avatar-img" />
                            </div>
                            <h4 className="reviewer-name">{rev.name}</h4>
                            <div className="stars-row-svg">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} viewBox="0 0 24 24" fill="#facc15" width="16" height="16">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="reviewer-text">{rev.comment}</p>
                            <span className="google-badge">Reviewed On Google</span>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}