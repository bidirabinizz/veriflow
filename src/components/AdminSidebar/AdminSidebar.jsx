// src/components/AdminSidebar/AdminSidebar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Key, 
  Settings, 
  LogOut,
  Crown,
  Shield,
  History,
  MessageSquare,
  Megaphone // ✅ İkon eklendi
} from 'lucide-react';

export default function AdminSidebar({ userData }) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Admin Paneli' },
    { path: '/admin/dashboard/users', icon: Users, label: 'Kullanıcı Yönetimi' },
    { path: '/admin/dashboard/licenses', icon: Key, label: 'Lisans Yönetimi' },
    { path: '/admin/dashboard/support', icon: MessageSquare, label: 'Destek Talepleri' },
    { path: '/admin/dashboard/announcements', icon: Megaphone, label: 'Duyurular' }, // ✅ YENİ EKLENDİ
    { path: '/admin/dashboard/activity-logs', icon: History, label: 'Aktivite Geçmişi' },
    { path: '/admin/dashboard/security-logs', icon: Shield, label: 'Güvenlik Logları' },
    { path: '/admin/dashboard/profile', icon: Settings, label: 'Profil' },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate('/');
    window.location.reload();
  };

  const goToUserDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="w-64 bg-slate-800 min-h-screen relative p-4 border-r border-slate-700">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">VeriFlow Admin</h1>
            <p className="text-sm text-gray-400">Yönetim Paneli</p>
          </div>
        </div>
        
        {userData && (
          <div className="bg-slate-700/50 rounded-lg p-3 mt-4">
            <p className="text-white font-medium text-sm">{userData.fullname}</p>
            <p className="text-gray-400 text-xs">{userData.email}</p>
            <span className="inline-block mt-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
              👑 Admin
            </span>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 mb-1 ${
                isActive
                  ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-500'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <button
          onClick={goToUserDashboard}
          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-400 bg-gray-700 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium">Kullanıcı Paneli</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg bg-gray-700 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
}