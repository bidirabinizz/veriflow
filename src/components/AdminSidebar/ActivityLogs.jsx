import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { History, Search, User } from 'lucide-react';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/activity-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme
  const filteredLogs = logs.filter(log => 
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <History className="text-cyan-400" /> Aktivite Geçmişi
      </h1>

      {/* Arama */}
      <div className="bg-slate-800 p-4 rounded-lg flex items-center gap-2 border border-slate-700">
        <Search className="text-gray-400" />
        <input 
          type="text" 
          placeholder="İşlem veya kullanıcı ara..." 
          className="bg-transparent text-white w-full outline-none"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tablo */}
      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-200 uppercase bg-slate-700/50">
            <tr>
              <th className="px-6 py-3">Tarih</th>
              <th className="px-6 py-3">Kullanıcı</th>
              <th className="px-6 py-3">İşlem</th>
              <th className="px-6 py-3">Detay</th>
              <th className="px-6 py-3">IP Adresi</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                <td className="px-6 py-4">{new Date(log.created_at).toLocaleString('tr-TR')}</td>
                <td className="px-6 py-4 flex items-center gap-2 text-white">
                  <User size={16} /> {log.user_name || 'Bilinmiyor'}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded text-xs font-mono">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">{log.details}</td>
                <td className="px-6 py-4 font-mono text-xs">{log.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-gray-500">Kayıt bulunamadı.</div>
        )}
      </div>
    </div>
  );
}