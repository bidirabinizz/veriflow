// src/pages/AdminDashboard.jsx - DÜZELTİLMİŞ
import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar/AdminSidebar';
import AdminHome from '../components/AdminSidebar/AdminHome';
import UserManagement from '../components/AdminSidebar/UserManagement';
import LicenseManagement from '../components/AdminSidebar/LicenseManagement';
import AdminProfile from '../components/AdminSidebar/AdminProfile';
import { API_BASE_URL } from '../config/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [adminStats, setAdminStats] = useState(null); // ✅ BU EKSİKTİ!
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  // ✅ ADMIN STATS ÇEKME FONKSİYONU EKLE
  const fetchAdminStats = async (token) => {
    try {
      console.log('� Fetching admin stats...');
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Stats fetch failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Admin stats received:', data);
      return data.stats;
    } catch (error) {
      console.error('❌ Admin stats error:', error);
      return null;
    }
  };

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));

      if (!token || !storedUser) {
        navigate('/login');
        return;
      }

      // ✅ Admin kontrolü
      if (storedUser.role !== 'admin') {
        alert('Bu sayfaya erişim yetkiniz yok!');
        navigate('/dashboard');
        return;
      }

      setUserData(storedUser);
      
      // ✅ ADMIN STATS'ı ÇEK VE STATE'E KAYDET
      const stats = await fetchAdminStats(token);
      setAdminStats(stats);
      
    } catch (error) {
      console.error("Admin access error:", error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-xl">Admin paneline yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <AdminSidebar userData={userData} />
      
      <div className="flex-1 "> {/* ✅ Sidebar margin eklendi */}
        <div className="p-6">
          <Routes>
            {/* ✅ ADMINSTATS PROP'UNU EKLE! */}
            <Route path="/" element={<AdminHome userData={userData} adminStats={adminStats} />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/licenses" element={<LicenseManagement />} />
            <Route path="/profile" element={<AdminProfile userData={userData} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}