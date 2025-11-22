// src/components/DashboardSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Key, User } from 'lucide-react';

export default function DashboardSidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Ana Sayfa' },
    { path: '/dashboard/licenses', icon: Key, label: 'Lisanslarım' },
    { path: '/dashboard/profile', icon: User, label: 'Profil' },
  ];

  return (
    <div className="w-64 bg-slate-800 min-h-screen pt-6">
      <nav className="space-y-2 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-cyan-600 text-white' 
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}