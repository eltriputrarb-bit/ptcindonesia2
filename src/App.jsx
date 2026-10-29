import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/home';
import AuthLogin from './authlogin/login';
import PemesananKursus from './pages/pemesanan';
import UserProfile from './authlogin/user';
import KelasPage from './pages/kelas';
import AdminKelas from './pages/adminKelas';
import AdminUsers from './pages/adminUsers';
import './index.css';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ptc_user');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      return JSON.parse(saved);
    } catch (e) {
      localStorage.removeItem('ptc_user');
      return null;
    }
  });

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('ptc_user', JSON.stringify(userData));
    localStorage.setItem('ptc_token', token);
  };

  const handleUpdateUser = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem('ptc_user', JSON.stringify(updatedData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ptc_user');
    localStorage.removeItem('ptc_token');
    alert('Kamu udah keluar dari akun.');
  };

  return (
    <Router>
      <div className="app-wrapper">
        <Header user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<AuthLogin onLogin={handleLogin} />} />
          <Route
            path="/pemesanan"
            element={
              user ? (
                <PemesananKursus user={user} onUpdateUser={handleUpdateUser} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/user"
            element={
              user ? (
                <UserProfile
                  user={user}
                  onUpdateUser={handleUpdateUser}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/kelas"
            element={
              user ? (
                <KelasPage user={user} onUpdateUser={handleUpdateUser} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin/kelas"
            element={
              user ? (
                <AdminKelas user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          {/* Rute Manajemen User oleh Admin */}
          <Route
            path="/admin/users"
            element={
              user ? (
                <AdminUsers user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}