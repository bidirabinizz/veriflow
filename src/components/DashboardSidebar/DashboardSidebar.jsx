// src/components/DashboardSidebar/DashboardSidebar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Key, User, Crown, LogOut } from 'lucide-react';

export default function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Kullanıcı bilgisini al
  const getUserData = () => {
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    const userData = rememberMe 
      ? localStorage.getItem("user") 
      : sessionStorage.getItem("user");
    
    return userData ? JSON.parse(userData) : null;
  };

  const userData = getUserData();
  const isAdmin = userData?.role === 'admin';

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Ana Sayfa' },
    { path: '/dashboard/licenses', icon: Key, label: 'Lisanslarım' },
    { path: '/dashboard/profile', icon: User, label: 'Profil' },
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
    <div className="w-64 bg-slate-800 min-h-screen pt-6 flex flex-col">
      {/* Logo/Header */}
      <div className="px-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">CW</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">VeriFlow</h1>
            <p className="text-xs text-gray-400">Kullanıcı Paneli</p>
          </div>
        </div>
        
        {/* Kullanıcı Bilgisi */}
        {userData && (
          <div className="mt-4 bg-slate-700/50 rounded-lg p-3">
            <p className="text-white font-medium text-sm truncate">
              {userData.fullname || 'Kullanıcı'}
            </p>
            <p className="text-gray-400 text-xs truncate">
              {userData.email}
            </p>
            {isAdmin && (
              <span className="inline-block mt-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                � Admin
              </span>
            )}
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2 px-4 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-cyan-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ✅ FOOTER - Admin Butonu ve Çıkış */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        {/* ADMIN BUTONU - Sadece admin kullanıcılar için */}
        {isAdmin && (
          <button
            onClick={handleGoToAdmin}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 hover:text-purple-200 transition-all duration-200 border border-purple-500/30 group"
          >
            <Crown className="h-5 w-5" />
            <span className="font-medium">Admin Menüye Geç</span>
          </button>
        )}

        {/* ÇIKIŞ BUTONU */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 bg-gray-700 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
}