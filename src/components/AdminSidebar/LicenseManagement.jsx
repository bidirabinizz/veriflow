// src/components/AdminSidebar/LicenseManagement.jsx
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { Search, Filter } from 'lucide-react'; // ✅ İkonlar eklendi

export default function LicenseManagement() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ YENİ STATE'LER: Filtreleme için
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'passive'

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/licenses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Lisanslar yüklenemedi');
      
      const data = await response.json();
      setLicenses(data.licenses || []);
    } catch (error) {
      console.error('Lisanslar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteLicense = async (id) => {
    if (!window.confirm('Bu lisansı silmek istediğine emin misin? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/admin/licenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Silme işlemi başarısız oldu');
      }

      setLicenses(licenses.filter(license => license.id !== id));
      alert('Lisans başarıyla silindi.');

    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Lisans silinirken bir hata oluştu: ' + error.message);
    }
  };

  // ✅ FİLTRELEME MANTIĞI BURADA
  const filteredLicenses = licenses.filter(license => {
    // 1. Arama Metni Kontrolü (Case insensitive)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      license.license_key.toLowerCase().includes(searchLower) ||
      license.user_name.toLowerCase().includes(searchLower) ||
      license.user_email.toLowerCase().includes(searchLower);

    // 2. Durum Filtresi Kontrolü
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? license.is_active :
      !license.is_active; // passive

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="text-white">Lisanslar yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">🔑 Lisans Yönetimi</h1>
        <span className="text-slate-400 text-sm">Toplam: {filteredLicenses.length} kayıt</span>
      </div>
      
      {/* ✅ YENİ FİLTRELEME ALANI */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Arama Inputu */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input 
            type="text" 
            placeholder="Lisans, İsim veya Email ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-500"
          />
        </div>

        {/* Durum Select */}
        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-800 text-white pl-10 pr-8 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif Olanlar</option>
            <option value="passive">Pasif Olanlar</option>
          </select>
          {/* Custom Arrow Icon for Select */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 shadow-xl border border-slate-700/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-3 text-slate-400 font-medium">Lisans Key</th>
                <th className="text-left p-3 text-slate-400 font-medium">Sahibi</th>
                <th className="text-left p-3 text-slate-400 font-medium">Email</th>
                <th className="text-left p-3 text-slate-400 font-medium">Oluşturulma</th>
                <th className="text-left p-3 text-slate-400 font-medium">Durum</th>
                <th className="text-right p-3 text-slate-400 font-medium">İşlemler</th>
              </tr>
            </thead>
            {/* ✅ LİSTELEME İÇİN filteredLicenses KULLANILDI */}
            <tbody className="text-slate-200">
              {filteredLicenses.length > 0 ? (
                filteredLicenses.map(license => (
                  <tr key={license.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors group">
                    <td className="p-3 font-mono text-xs text-cyan-400">{license.license_key}</td>
                    <td className="p-3 font-medium">{license.user_name}</td>
                    <td className="p-3 text-slate-400">{license.user_email}</td>
                    <td className="p-3 text-slate-400">{new Date(license.created_at).toLocaleDateString('tr-TR')}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        license.is_active 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {license.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => deleteLicense(license.id)}
                        className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded transition-all duration-200 text-xs font-medium border border-red-500/20 hover:border-red-500"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                /* ✅ HİÇ SONUÇ YOKSA GÖSTERİLECEK KISIM */
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Search className="h-8 w-8 opacity-50" />
                      <p>Aradığınız kriterlere uygun lisans bulunamadı.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Eğer tüm liste boşsa (filtreleme değil, hiç veri yoksa) */}
          {licenses.length === 0 && !loading && (
            <div className="text-center py-4 text-slate-500 text-sm mt-4">
              Sistemde henüz hiç lisans kaydı yok.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}