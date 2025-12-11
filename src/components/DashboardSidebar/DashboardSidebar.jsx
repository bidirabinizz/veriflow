import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Key, User, Crown, LogOut, BarChart3, MessageCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // ✅ Kullanıcı bilgisini al
  const getUserData = () => {
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    const userData = rememberMe 
      ? localStorage.getItem("user") 
      : sessionStorage.getItem("user");
    
    return userData ? JSON.parse(userData) : null;
  };

  const checkAdminAccess = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));

      console.log('� Frontend Role:', storedUser?.role);
      
      if (!token || !storedUser) {
        navigate('/login');
        return;
      }

      // ✅ ARKAPLAN: Backend'den gerçek kontrol
      try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          // Backend'de admin değilse - TUZAK ORTAYA ÇIKTI!
          console.log('� TUZAK ORTAYA ÇIKTI! Backend bu kullanıcıyı admin olarak tanımıyor.');
          alert('Hey! Sen admin değilsin ki? � Nasıl buraya girdin?');
          navigate('/dashboard');
          return;
        }
        
      } catch (error) {
        console.log('� Backend erişim hatası - Muhtemelen admin değil');
        navigate('/dashboard');
        return;
      }
      
    } catch (error) {
      console.error("Admin access error:", error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const userData = getUserData();
  const isAdmin = userData?.role === 'admin';

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Ana Sayfa' },
    { path: '/dashboard/licenses', icon: Key, label: 'Lisanslarım' },
    { path: '/dashboard/support', icon: MessageCircle, label: 'Destek Talepleri' }, // ✅ YENİ EKLENDİ
    { path: '/dashboard/profile', icon: User, label: 'Profil' },
    // İstatistikler henüz hazır olmadığı için kapattım, istersen açabilirsin:
    // { path: '/dashboard/istatistikler', icon: BarChart3, label: 'İstatistikler' },
  ];

  const handleGoToAdmin = () => {
    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="w-64 bg-slate-800 min-h-screen pt-6 flex flex-col border-r border-slate-700">
      {/* Logo/Header */}
      <div className="px-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-white font-bold text-lg">CW</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">VeriFlow</h1>
            <p className="text-xs text-gray-400">Kullanıcı Paneli</p>
          </div>
        </div>
        
        {/* Kullanıcı Bilgisi */}
        {userData && (
          <div className="mt-4 bg-slate-700/50 rounded-lg p-3 border border-slate-700">
            <p className="text-white font-medium text-sm truncate">
              {userData.fullname || 'Kullanıcı'}
            </p>
            <p className="text-gray-400 text-xs truncate">
              {userData.email}
            </p>
            {isAdmin && (
              <span className="inline-flex items-center mt-2 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-500/30">
                <Crown className="w-3 h-3 mr-1" />
                Admin
              </span>
            )}
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1 px-3 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' 
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER - Admin Butonu ve Çıkış */}
      <div className="p-4 border-t border-slate-700 space-y-3 bg-slate-800/50">
        {/* ADMIN BUTONU - Sadece admin kullanıcılar için */}
        {isAdmin && (
          <button
            onClick={handleGoToAdmin}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-900/40 to-purple-800/40 text-purple-200 hover:from-purple-900/60 hover:to-purple-800/60 transition-all duration-200 border border-purple-500/30 group shadow-lg shadow-purple-900/20"
          >
            <Crown className="h-5 w-5 text-purple-400 group-hover:text-purple-300" />
            <span className="font-medium">Admin Menüye Geç</span>
          </button>
        )}

        {/* ÇIKIŞ BUTONU */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 bg-red-500/5 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 border border-red-500/10 hover:border-red-500/30"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
}