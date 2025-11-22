// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar/DashboardSidebar';
import DashboardHome from '../components/DashboardSidebar/DashboardHome';
import Licenses from '../components/DashboardSidebar/Licenses';
import Profile from '../components/DashboardSidebar/Profile';
import { API_BASE_URL } from '../config/api';

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

      // ✅ BU SATIRI DEĞİŞTİR: localhost yerine API_BASE_URL kullan
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white pt-20 flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
    
      {/* Main Layout */}
      <div className=" flex">
        {/* Sidebar */}
        <DashboardSidebar />
        
        {/* Main Content */}
        <div className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<DashboardHome userData={userData} />} />
            <Route path="/licenses" element={<Licenses />} />
            <Route path="/profile" element={<Profile userData={userData} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}