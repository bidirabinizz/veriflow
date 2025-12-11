// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar/DashboardSidebar';
import DashboardHome from '../components/DashboardSidebar/DashboardHome';
import Licenses from '../components/DashboardSidebar/Licenses';
import Profile from '../components/DashboardSidebar/Profile';
import Istatistikler from '../components/DashboardSidebar/Istatistikler'; 
import Support from './Support';
import SupportDetail from './SupportDetail';
import { API_BASE_URL } from '../config/api';
import AnnouncementDisplay from '../components/AnnouncementDisplay'; // ✅ 1. Duyuru Bileşeni Import Edildi

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const rememberMe = localStorage.getItem("rememberMe") === "true";
      const token = rememberMe 
        ? localStorage.getItem("token") 
        : sessionStorage.getItem("token");

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("rememberMe");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          window.dispatchEvent(new Event('authChange'));
        }
        
        throw new Error(errorData.message || "Token geçersiz!");
      }

      const data = await response.json();
      setUserData(data.user);
      
    } catch (error) {
      console.error("Dashboard error:", error);
      window.dispatchEvent(new Event('authChange'));
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white pt-20 flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    // ✅ 2. Layout Düzenlemesi: "h-screen" ve "overflow-hidden" ile sayfa sabitlendi.
    <div className="h-screen bg-slate-900 text-white overflow-hidden relative">
    
      {/* ✅ 3. Duyuru Bileşeni Eklendi */}
      <AnnouncementDisplay />

      {/* Main Layout */}
      <div className="flex h-full"> {/* h-full eklendi */}
        {/* Sidebar */}
        <DashboardSidebar />
        
        {/* Main Content */}
        {/* ✅ 4. İçerik Alanı: Scroll sadece burada çalışır ("overflow-y-auto") */}
        <div className="flex-1 p-6 overflow-y-auto h-full pb-20">
          <Routes>
            <Route path="/" element={<DashboardHome userData={userData} />} />
            <Route path="/licenses" element={<Licenses />} />
            <Route path="/profile" element={<Profile userData={userData} />} />
            <Route path="/istatistikler" element={<Istatistikler />} /> 
            <Route path="/support" element={<Support />} />
            <Route path="/support/:id" element={<SupportDetail />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}