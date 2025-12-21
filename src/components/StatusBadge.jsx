// src/components/StatusBadge.jsx
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';

export default function StatusBadge() {
  const [status, setStatus] = useState('online'); // online, warning, offline
  const navigate = useNavigate();

  const checkHealth = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 saniye süre tanı
      
      const response = await fetch(`${API_BASE_URL}/api/status`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("API Error");

      const data = await response.json();
      
      // API çalışıyor ama veritabanı gittiyse 'warning' (sarı) yap
      if (data.db_status === 'offline') {
        setStatus('warning');
      } else {
        setStatus('online');
      }

    } catch (error) {
      // API'ye hiç ulaşılamıyorsa 'offline' (kırmızı) yap
      setStatus('offline');
    }
  };

  useEffect(() => {
    checkHealth();
    // Navbar'ı yormamak için 30 saniyede bir kontrol etsin
    const interval = setInterval(checkHealth, 30000); 
    return () => clearInterval(interval);
  }, []);

  // Renkleri Belirle
  const getColor = () => {
    if (status === 'online') return 'bg-green-500';
    if (status === 'warning') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTitle = () => {
    if (status === 'online') return 'Sistemler Çalışıyor';
    if (status === 'warning') return 'Veritabanı Bağlantı Hatası';
    return 'Sunucu Erişilemiyor';
  };

  return (
    <button 
      onClick={() => navigate('/status')} 
      className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 border border-slate-700 transition-all duration-200 group"
      title={getTitle()}
    >
      <div className="relative flex h-3 w-3">
        {/* Yanıp sönen efekt (ping) sadece online değilse veya dikkat çeksin istersen */}
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getColor()}`}></span>
        <span className={`relative inline-flex rounded-full h-3 w-3 ${getColor()}`}></span>
      </div>
      <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors hidden sm:block">
        {status === 'online' ? 'Sistem Durumu' : 'Error'}
      </span>
    </button>
  );
}