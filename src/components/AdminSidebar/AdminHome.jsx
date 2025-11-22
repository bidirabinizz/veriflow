// src/components/AdminSidebar/AdminHome.jsx
import React from 'react';
import { Users, Key, CreditCard, BarChart3, RefreshCw } from 'lucide-react';

export default function AdminHome({ userData, adminStats }) {
  console.log('� AdminHome - adminStats:', adminStats); // DEBUG
  
  const statCards = [
    {
      icon: Users,
      label: 'Toplam Kullanıcı',
      value: adminStats?.total_users || 0,
      color: 'bg-blue-500/20 text-blue-300',
      key: 'total_users'
    },
    {
      icon: Key,
      label: 'Toplam Lisans',
      value: adminStats?.total_licenses || 0,
      color: 'bg-green-500/20 text-green-300',
      key: 'total_licenses'
    },
    {
      icon: CreditCard,
      label: 'Aktif Lisans',
      value: adminStats?.active_licenses || 0,
      color: 'bg-purple-500/20 text-purple-300',
      key: 'active_licenses'
    },
    {
      icon: BarChart3,
      label: 'Son 7 Gün',
      value: adminStats?.recent_users || 0,
      color: 'bg-orange-500/20 text-orange-300',
      key: 'recent_users'
    }
  ];

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">� Admin Paneli</h1>
          <p className="text-gray-400">Sistem istatistikleri ve yönetim araçları</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Yenile</span>
        </button>
      </div>

      {/* DEBUG Bilgisi */}
      {!adminStats && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-300">
            ⚠️ İstatistikler yüklenemedi. Backend endpoint'leri kontrol ediliyor...
          </p>
        </div>
      )}

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-xs text-gray-500 bg-slate-700 px-2 py-1 rounded">
                  {stat.key}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Hızlı Erişim Butonları */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">� Hızlı Erişim</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.href = '/admin/dashboard/users'}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 p-4 rounded-lg transition-all duration-200 text-left border border-blue-500/20 hover:border-blue-500/40"
          >
            <Users className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Kullanıcıları Yönet</h3>
            <p className="text-sm text-blue-200/70">Tüm kullanıcıları görüntüle ve yönet</p>
          </button>
          
          <button 
            onClick={() => window.location.href = '/admin/dashboard/licenses'}
            className="bg-green-500/20 hover:bg-green-500/30 text-green-300 p-4 rounded-lg transition-all duration-200 text-left border border-green-500/20 hover:border-green-500/40"
          >
            <Key className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Lisansları Yönet</h3>
            <p className="text-sm text-green-200/70">Tüm lisansları görüntüle</p>
          </button>
          
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 p-4 rounded-lg transition-all duration-200 text-left border border-purple-500/20 hover:border-purple-500/40"
          >
            <BarChart3 className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Kullanıcı Paneli</h3>
            <p className="text-sm text-purple-200/70">Normal panele dön</p>
          </button>
        </div>
      </div>

      {/* Raw Data Debug (Geliştirici için) */}
      <details className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <summary className="cursor-pointer text-gray-400 font-mono text-sm">
          � Debug: Raw adminStats Data
        </summary>
        <pre className="mt-2 text-xs text-gray-300 bg-slate-900 p-3 rounded overflow-auto">
          {JSON.stringify(adminStats, null, 2)}
        </pre>
      </details>
    </div>
  );
}