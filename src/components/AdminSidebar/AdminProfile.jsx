// src/components/AdminSidebar/AdminProfile.jsx
import React from 'react';

export default function AdminProfile({ userData }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">� Admin Profili</h1>
      
      <div className="bg-slate-800 rounded-lg p-6 max-w-2xl">
        {userData && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {userData.fullname?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{userData.fullname}</h2>
                <p className="text-gray-400">{userData.email}</p>
                <span className="inline-block mt-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  � Admin
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-1">Kullanıcı ID</h3>
                <p className="text-white font-mono">{userData.id}</p>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-1">Rol</h3>
                <p className="text-white">Admin</p>
              </div>
            </div>
            
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 mt-6">
              <h3 className="text-cyan-300 font-semibold mb-2">Admin Yetkileri</h3>
              <ul className="text-cyan-200/80 text-sm space-y-1">
                <li>• Tüm kullanıcıları görüntüleme ve yönetme</li>
                <li>• Tüm lisansları görüntüleme</li>
                <li>• Kullanıcı rollerini değiştirme</li>
                <li>• Sistem istatistiklerini görüntüleme</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}