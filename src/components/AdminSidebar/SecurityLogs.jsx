// src/components/AdminSidebar/SecurityLogs.jsx - GÜNCELLENMİŞ
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { RefreshCw, Shield, AlertTriangle, User, Search } from 'lucide-react';

export default function SecurityLogs({ isRealAdmin }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isRealAdmin) {
      fetchSecurityLogs();
    }
  }, [isRealAdmin]);

  const fetchSecurityLogs = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/security-logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Loglar yüklenemedi');
      
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Log yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme fonksiyonu
  const filteredLogs = logs.filter(log => 
    log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.ip_address?.includes(searchTerm)
  );

  const getActionIcon = (action) => {
    if (action.includes('ATTEMPT') || action.includes('TUZAK')) {
      return <AlertTriangle className="h-4 w-4 text-red-400" />;
    } else if (action.includes('LOGIN')) {
      return <User className="h-4 w-4 text-blue-400" />;
    } else {
      return <Shield className="h-4 w-4 text-green-400" />;
    }
  };

  const getActionColor = (action) => {
    if (action.includes('ATTEMPT') || action.includes('TUZAK')) {
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    } else if (action.includes('LOGIN')) {
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    } else if (action.includes('ROLE_CHANGE')) {
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    } else {
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    }
  };

  if (!isRealAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-yellow-400 mb-2">Yetkisiz Erişim</h2>
          <p className="text-gray-400">Güvenlik loglarını görüntülemek için admin yetkisine ihtiyacınız var.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-2" />
          <p className="text-gray-400">Güvenlik logları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Güvenlik Logları</h1>
            <p className="text-gray-400">Sistem güvenlik olayları ve erişim kayıtları</p>
          </div>
        </div>
        
        <button
          onClick={fetchSecurityLogs}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Yenile</span>
        </button>
      </div>

      {/* Arama */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Email, aksiyon, detay veya IP adresi ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{logs.length}</div>
          <div className="text-gray-400 text-sm">Toplam Log</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">
            {logs.filter(log => log.action.includes('ATTEMPT') || log.action.includes('TUZAK')).length}
          </div>
          <div className="text-gray-400 text-sm">Güvenlik İhlali</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">
            {logs.filter(log => log.action.includes('LOGIN')).length}
          </div>
          <div className="text-gray-400 text-sm">Giriş Kaydı</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">
            {logs.filter(log => log.action.includes('ROLE')).length}
          </div>
          <div className="text-gray-400 text-sm">Rol Değişikliği</div>
        </div>
      </div>

      {/* Log Tablosu */}
      <div className="bg-slate-800 rounded-lg p-6">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Henüz güvenlik logu bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-3 text-gray-400 font-medium">Tarih</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Kullanıcı</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Aksiyon</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Detaylar</th>
                  <th className="text-left p-3 text-gray-400 font-medium">IP Adresi</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                    <td className="p-3">
                      <div className="text-white font-mono text-xs">
                        {new Date(log.created_at).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(log.created_at).toLocaleTimeString('tr-TR')}
                      </div>
                    </td>
                    <td className="p-3">
                      {log.user_name ? (
                        <div>
                          <div className="font-medium text-white">{log.user_name}</div>
                          <div className="text-xs text-gray-400">{log.user_email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Sistem</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <span className={`px-2 py-1 rounded text-xs border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-white text-sm max-w-md">{log.details}</div>
                      {log.device_info && (
                        <div className="text-gray-400 text-xs mt-1">{log.device_info}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <code className="bg-slate-700 px-2 py-1 rounded text-xs text-gray-300">
                        {log.ip_address}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sayfa Bilgisi */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
          <div>
            Toplam {filteredLogs.length} log gösteriliyor
          </div>
          <div>
            {searchTerm && `"${searchTerm}" için ${filteredLogs.length} sonuç`}
          </div>
        </div>
      </div>
    </div>
  );
}