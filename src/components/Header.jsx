import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header({ user, onLogout }) {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuClick = (path) => {
        setDropdownOpen(false);
        navigate(path);
    };

    return (
        <header className="navbar">
            <div className="nav-container">
                <Link to="/" className="logo-text">
                    PTC
                </Link>

                <div className="header-actions">
                    {user ? (
                        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
                            <button
                                type="button"
                                className="profile-trigger-btn"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <span className="profile-greeting-text">
                                    Hai <b>{user.name}</b>
                                </span>
                                <svg
                                    className={`dropdown-chevron-svg ${dropdownOpen ? 'chevron-up' : ''}`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    width="14"
                                    height="14"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <div className="profile-avatar-circle">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className="avatar-svg-icon">
                                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                    </svg>
                                </div>
                            </button>

                            {dropdownOpen && (
                                <div className="profile-dropdown-menu">
                                    <button
                                        type="button"
                                        className="dropdown-item"
                                        onClick={() => handleMenuClick('/user')}
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" className="menu-svg-icon">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                        Profil
                                    </button>

                                    <button
                                        type="button"
                                        className="dropdown-item"
                                        onClick={() => handleMenuClick('/kelas')}
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" className="menu-svg-icon">
                                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                        </svg>
                                        Kelasku
                                    </button>

                                    <button
                                        type="button"
                                        className="dropdown-item dropdown-item-logout"
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            onLogout();
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" className="menu-svg-icon">
                                            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                                        </svg>
                                        Keluar
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="auth-btn"
                        >
                            Registrasi / Masuk
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}