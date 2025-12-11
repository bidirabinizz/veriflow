// src/components/AdminSidebar/AdminHome.jsx
import React, { useState, useEffect } from 'react';
import { Users, Key, CreditCard, BarChart3, RefreshCw, Power, Activity, Server, Database, Cpu } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function AdminHome({ userData, adminStats }) {

  const [maintenance, setMaintenance] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  


  // --- BAKIM MODU İŞLEMLERİ ---
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/maintenance`)
      .then(res => res.json())
      .then(data => setMaintenance(data.active))
      .catch(err => console.error("Bakım modu durumu alınamadı:", err));
  }, []);

  const toggleMaintenance = async () => {
    const newState = !maintenance;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/admin/maintenance`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: newState })
      });
      
      if (res.ok) {
        setMaintenance(newState);
        alert(newState ? "Sistem BAKIMA ALINDI! Kullanıcılar giriş yapamaz." : "Sistem YAYINDA! Kullanıcılar giriş yapabilir.");
      } else {
        alert("Yetkiniz yok veya bir hata oluştu!");
      }
    } catch (err) {
      alert("Sunucu hatası!");
    }
  };

  // --- SİSTEM SAĞLIK (DEVOPS) İŞLEMLERİ ---
  const fetchSystemHealth = async () => {
    setHealthLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSystemHealth(data);
      }
    } catch (error) {
      console.error('Sistem sağlık verisi alınamadı:', error);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    // Her 30 saniyede bir sağlık durumunu güncelle
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- İSTATİSTİK KARTLARI VERİSİ ---
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
          <h1 className="text-3xl font-bold text-white mb-2">🚀 Admin Paneli</h1>
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

      {/* DEBUG Bilgisi (Veri Gelmezse) */}
      {!adminStats && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-300">
            ⚠️ İstatistikler yüklenemedi. Backend endpoint'leri kontrol ediliyor...
          </p>
        </div>
      )}

      {/* 1. İstatistik Kartları */}
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

      {/* 2. Sistem Sağlık Durumu (YENİ EKLENEN KISIM) */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="text-cyan-400" /> Sistem Sağlık Durumu
          {healthLoading && <span className="text-xs text-gray-500 ml-2 animate-pulse">(Güncelleniyor...)</span>}
        </h2>

        {systemHealth ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* API Sunucu Durumu */}
            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Server className="w-16 h-16 text-blue-400" />
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">API Sunucusu</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xl font-bold text-white">Aktif</span>
              </div>
              <div className="text-xs text-gray-500">
                Uptime: <span className="text-gray-300">{systemHealth.system.uptime}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1 truncate" title={systemHealth.system.platform}>
                OS: {systemHealth.system.platform}
              </div>
            </div>

            {/* Veritabanı Durumu */}
            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Database className="w-16 h-16 text-green-400" />
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Veritabanı</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-3 h-3 rounded-full ${systemHealth.database.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-xl font-bold text-white">
                  {systemHealth.database.status === 'online' ? 'Bağlı' : 'Kopuk'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Gecikme (Ping): <span className={`${parseInt(systemHealth.database.latency) > 100 ? 'text-red-400' : 'text-green-400'}`}>{systemHealth.database.latency}</span>
              </div>
            </div>

            {/* RAM Kullanımı */}
            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Cpu className="w-16 h-16 text-purple-400" />
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Bellek (RAM)</h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-bold text-white">{systemHealth.memory.percentage}%</span>
                <span className="text-xs text-gray-400 mb-1">Kullanılıyor</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                <div 
                  className={`h-1.5 rounded-full ${systemHealth.memory.percentage > 80 ? 'bg-red-500' : 'bg-purple-500'}`} 
                  style={{ width: `${systemHealth.memory.percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {systemHealth.memory.used} / {systemHealth.memory.total}
              </div>
            </div>

            {/* İşlemci Yükü */}
            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity className="w-16 h-16 text-orange-400" />
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Ortalama Yük (1dk)</h3>
              <div className="text-2xl font-bold text-white mb-1">
                {systemHealth.system.cpu_load}
              </div>
              <p className="text-xs text-gray-500">
                Sunucu işlem yoğunluğu.
              </p>
            </div>

          </div>
        ) : (
          <div className="p-4 bg-slate-800/50 rounded-lg text-center text-gray-400 border border-slate-700 border-dashed">
            Sistem verileri yükleniyor veya sunucuya erişilemiyor...
          </div>
        )}
      </div>

      {/* 3. Hızlı Erişim ve Bakım Modu */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">⚡ Hızlı Erişim & Yönetim</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <button 
            onClick={() => window.location.href = '/admin/dashboard/users'}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 p-4 rounded-lg transition-all duration-200 text-left border border-blue-500/20 hover:border-blue-500/40"
          >
            <Users className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Kullanıcıları Yönet</h3>
            <p className="text-sm text-blue-200/70">Kullanıcıları görüntüle</p>
          </button>
          
          <button 
            onClick={() => window.location.href = '/admin/dashboard/licenses'}
            className="bg-green-500/20 hover:bg-green-500/30 text-green-300 p-4 rounded-lg transition-all duration-200 text-left border border-green-500/20 hover:border-green-500/40"
          >
            <Key className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Lisansları Yönet</h3>
            <p className="text-sm text-green-200/70">Lisansları görüntüle</p>
          </button>
          
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 p-4 rounded-lg transition-all duration-200 text-left border border-purple-500/20 hover:border-purple-500/40"
          >
            <BarChart3 className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Kullanıcı Paneli</h3>
            <p className="text-sm text-purple-200/70">Normal panele dön</p>
          </button>

          {/* 🔴 BAKIM MODU KARTI */}
          <div className={`p-4 rounded-lg border flex flex-col justify-between transition-colors ${
            maintenance 
              ? 'bg-red-500/10 border-red-500/30' 
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <div>
              <h3 className={`font-semibold mb-1 ${maintenance ? 'text-red-400' : 'text-yellow-400'}`}>
                {maintenance ? '🔴 Bakım Modu AÇIK' : '🟢 Sistem Yayında'}
              </h3>
              <p className="text-gray-400 text-xs mb-3">
                {maintenance 
                  ? 'Kullanıcılar giriş yapamaz.' 
                  : 'Tüm sistemler aktif.'}
              </p>
            </div>
            <button 
              onClick={toggleMaintenance}
              className={`w-full py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                maintenance 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              <Power size={16} />
              {maintenance ? 'Bakımı Kapat' : 'Bakımı Başlat'}
            </button>
          </div>

        </div>
      </div>

    
      <details className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <summary className="cursor-pointer text-gray-400 font-mono text-sm">
          🐞 Debug: Raw adminStats Data
        </summary>
        <pre className="mt-2 text-xs text-gray-300 bg-slate-900 p-3 rounded overflow-auto">
          {JSON.stringify(adminStats, null, 2)}
        </pre>
      </details>
    </div>
  );
}