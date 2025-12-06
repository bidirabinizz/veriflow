
import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar/AdminSidebar';
import AdminHome from '../components/AdminSidebar/AdminHome';
import UserManagement from '../components/AdminSidebar/UserManagement';
import LicenseManagement from '../components/AdminSidebar/LicenseManagement';
import AdminProfile from '../components/AdminSidebar/AdminProfile';
import SecurityLogs from '../components/AdminSidebar/SecurityLogs';
import { API_BASE_URL } from '../config/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRealAdmin, setIsRealAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  // ✅ TUZAK LOG FONKSİYONU
  const logTrap = async (token, reason) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tuzak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'ROLE_MANIPULATION_ATTEMPT',
          details: `Kullanıcı admin panele yetkisiz erişim denedi - ${reason}`
        })
      });
      
      const data = await response.json();
      console.log('� Tuzak loglandı:', data);
    } catch (error) {
      console.error('Tuzak log hatası:', error);
    }
  };

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');

      console.log('� Admin Check - Frontend Role:', storedUser?.role);

      if (!token || !storedUser) {
        navigate('/login');
        return;
      }

      if (storedUser.role !== 'admin') {
        navigate('/dashboard');
        return;
      }

      setUserData(storedUser);

      // ✅ BACKEND DOĞRULAMASI
      const response = await fetch(`${API_BASE_URL}/api/admin/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('� Backend Response Status:', response.status);

      const data = await response.json();
      console.log('� Backend Response Data:', data);

      if (data.isAdmin) {
        // ✅ GERÇEK ADMIN
        console.log('✅ GERÇEK ADMIN DOĞRULANDI');
        setIsRealAdmin(true);
        
       // Gerçek istatistikleri getir
        try {
          // 🔴 HATALI OLAN: fetch(`${API_BASE_URL}/api/admin/stats`, {
          // 🟢 DOĞRUSU (Aşağıdaki satır):
          const statsResponse = await fetch(`${API_BASE_URL}/admin/stats`, { 
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setAdminStats(statsData.stats);
            console.log('✅ Real stats loaded');
          } else {
            // Stats alınamazsa default değerler
            setAdminStats({
              total_users: 156,
              total_licenses: 423,
              active_licenses: 389,
              recent_users: 23
            });
          }
        } catch (statsError) {
          console.error('Stats error:', statsError);
          setAdminStats({
            total_users: 156,
            total_licenses: 423,
            active_licenses: 389,
            recent_users: 23
          });
        }
        
      } else {
        // ❌ TUZAK MODU - Backend'de admin değil!
        console.log('� TUZAK MODU - Backend admin değil');
        setIsRealAdmin(false);
        
        // ✅ OTOMATİK TUZAK LOGU
        await logTrap(token, `Backend doğrulama başarısız. Backend mesajı: ${data.message}`);
        
        // Tuzak verileri göster
        setAdminStats({
          total_users: Math.floor(Math.random() * 200) + 100,
          total_licenses: Math.floor(Math.random() * 500) + 300,
          active_licenses: Math.floor(Math.random() * 400) + 200,
          recent_users: Math.floor(Math.random() * 50) + 10
        });
      }

    } catch (error) {
      console.error("Admin access error:", error);
      
      // Hata durumunda tuzak moduna geç
      const token = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (storedUser && token) {
        console.log('� HATA - TUZAK MODUNA GEÇİLDİ');
        setIsRealAdmin(false);
        setUserData(storedUser);
        
        // Hata durumunda da tuzak logu
        await logTrap(token, `Backend bağlantı hatası: ${error.message}`);
        
        setAdminStats({
          total_users: Math.floor(Math.random() * 200) + 100,
          total_licenses: Math.floor(Math.random() * 500) + 300,
          active_licenses: Math.floor(Math.random() * 400) + 200,
          recent_users: Math.floor(Math.random() * 50) + 10
        });
      } else {
        navigate('/login');
      }
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
      
      <div className="flex-1 p-6">
        {/* ✅ SADECE SAHTE ADMIN'LER İÇİN TUZAK MESAJI */}
        {!isRealAdmin && userData && (
          <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-300">
              <span>�</span>
              <span className="font-semibold">Tuzak Sistemi Aktif!</span>
              <span className="text-sm">(Sadece bu bilgisayarda admin görünüyorsun)</span>
            </div>
            <div className="mt-2 text-yellow-200 text-sm">
              <p>⚠️ Bu bir güvenlik önlemidir. Gerçek admin yetkilerin yok.</p>
              <p>� Bu girişim güvenlik loglarına kaydedildi.</p>
            </div>
          </div>
        )}

        {/* ✅ GERÇEK ADMIN İÇİN HOŞGELDİN MESAJI */}
        {isRealAdmin && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-green-300">
              <span>✅</span>
              <span className="font-semibold">Yönetici Paneli</span>
              <span className="text-sm">(Yetkili erişim - Tüm işlevler aktif)</span>
            </div>
            <div className="mt-2 text-green-200 text-sm">
              <p>� Hoş geldin {userData?.email}</p>
              <p>�️ Gerçek admin yetkilerinle panele erişiyorsun.</p>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={
            <AdminHome 
              userData={userData} 
              adminStats={adminStats} 
              isRealAdmin={isRealAdmin} 
            />
          } />
          <Route path="/users" element={<UserManagement isRealAdmin={isRealAdmin} />} />
          <Route path="/licenses" element={<LicenseManagement isRealAdmin={isRealAdmin} />} />
          <Route path="/security-logs" element={<SecurityLogs isRealAdmin={isRealAdmin} />} />
          <Route path="/profile" element={<AdminProfile userData={userData} isRealAdmin={isRealAdmin} />} />
        </Routes>
      </div>
    </div>
  );
}