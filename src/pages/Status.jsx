import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { CheckCircle, XCircle, Server, Database, Activity } from 'lucide-react';

export default function Status() {
  const [status, setStatus] = useState({ api: 'checking', db: 'checking' });

  const checkHealth = async () => {
    try {
      // API'ye istek at (Timeout 3 saniye olsun ki hemen hata versin)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${API_BASE_URL}/api/status`, { signal: controller.signal });
      clearTimeout(timeoutId);

      const data = await response.json();
      
      setStatus({
        api: 'online', // Cevap geldiyse API kesin online'dır
        db: data.db_status // DB durumunu API'den gelen veriye göre ayarla
      });

    } catch (error) {
      // Eğer fetch hata verdiyse API komple kapalıdır (veya internet yok)
      setStatus({ api: 'offline', db: 'unknown' });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 5000); // 5 saniyede bir kontrol et
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">VeriFlow Sistem Durumu</h1>
        <p className="text-gray-400">Canlı servis izleme paneli</p>
      </div>

      <div className="w-full max-w-2xl grid gap-4">
        
        {/* API DURUM KARTI */}
        <div className={`p-6 rounded-xl border flex items-center justify-between transition-all ${
          status.api === 'online' 
            ? 'bg-green-500/10 border-green-500/30' 
            : status.api === 'checking' 
              ? 'bg-yellow-500/10 border-yellow-500/30'
              : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center gap-4">
            <Server className={`w-8 h-8 ${status.api === 'online' ? 'text-green-400' : status.api === 'checking' ? 'text-yellow-400' : 'text-red-400'}`} />
            <div>
              <h3 className="font-bold text-lg">Backend API Sunucusu</h3>
              <p className="text-sm opacity-70">
                {status.api === 'online' ? 'Çalışıyor' : status.api === 'checking' ? 'Kontrol ediliyor...' : 'BAĞLANTI YOK!'}
              </p>
            </div>
          </div>
          {status.api === 'online' && <CheckCircle className="text-green-400" />}
          {status.api === 'offline' && <XCircle className="text-red-400" />}
        </div>

        {/* VERİTABANI DURUM KARTI */}
        <div className={`p-6 rounded-xl border flex items-center justify-between transition-all ${
          status.db === 'online' 
            ? 'bg-green-500/10 border-green-500/30' 
            : status.db === 'checking'
              ? 'bg-yellow-500/10 border-yellow-500/30'
              : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center gap-4">
            <Database className={`w-8 h-8 ${status.db === 'online' ? 'text-green-400' : status.db === 'checking' ? 'text-yellow-400' : 'text-red-400'}`} />
            <div>
              <h3 className="font-bold text-lg">Veritabanı (MySQL)</h3>
              <p className="text-sm opacity-70">
                {status.db === 'online' ? 'Operasyonel' : status.db === 'unknown' ? 'Veri alınamıyor' : 'ARIZA!'}
              </p>
            </div>
          </div>
          {status.db === 'online' && <CheckCircle className="text-green-400" />}
          {(status.db === 'offline' || status.db === 'unknown') && <Activity className="text-red-400" />}
        </div>

      </div>

      <div className="mt-8 text-xs text-gray-500">
        Otomatik yenileniyor (5sn)...
      </div>
    </div>
  );
}