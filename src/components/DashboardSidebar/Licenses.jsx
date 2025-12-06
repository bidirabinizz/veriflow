// src/components/DashboardSidebar/Licenses.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Key, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Eye, 
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  Clock // ✅ Clock ikonu eklendi
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function Licenses() {
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLicense, setNewLicense] = useState({
    license_key: '',
    expires_at: '',
    require_hwid: false
  });
  
  // Yeni state'ler
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterHwid, setFilterHwid] = useState('all');
  const [userPlan, setUserPlan] = useState(null);

  // ✅ PLAN BİLGİSİNİ GETİR
  const fetchUserPlan = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/user/plan`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserPlan(data.user_plan);
      }
    } catch (error) {
      console.error("Plan bilgisi hatası:", error);
    }
  };

  // Lisansları getir
  const fetchLicenses = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/licenses`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Lisanslar getirilemedi");

      const data = await response.json();
      setLicenses(data.licenses);
    } catch (error) {
      console.error("Lisans hatası:", error);
      alert("Lisanslar yüklenirken hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  // Yeni lisans oluştur
  const createLicense = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/licenses`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newLicense)
      });

      const data = await response.json();

      if (!response.ok) {
        // Limit hatası durumunda kullanıcıyı plan yükseltmeye yönlendir
        if (response.status === 400 && data.message.includes('limit')) {
          if (confirm(`${data.message}\n\nPlanınızı şimdi yükseltmek ister misiniz?`)) {
            navigate('/fiyatlandirma');
          }
          return;
        }
        throw new Error(data.message);
      }

      alert(data.message);
      setShowCreateForm(false);
      setNewLicense({ license_key: '', expires_at: '', require_hwid: false });
      fetchLicenses(); // Listeyi yenile
      fetchUserPlan(); // Plan bilgisini yenile
      
    } catch (error) {
      alert(error.message);
    }
  };

  // Lisans sil
  const deleteLicense = async (licenseId) => {
    if (!confirm("Bu lisansı silmek istediğinizden emin misiniz?")) return;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/licenses/${licenseId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      alert(data.message);
      fetchLicenses();
      fetchUserPlan();
    } catch (error) {
      alert(error.message);
    }
  };

  // Lisans key kopyala
  const copyLicenseKey = (key) => {
    navigator.clipboard.writeText(key);
    alert("Lisans key kopyalandı!");
  };

  // Lisans detayına git
  const viewLicenseDetails = (licenseId) => {
    navigate(`/dashboard/licenses/${licenseId}`);
  };

  // Rastgele lisans key oluştur
  const generateLicenseKey = () => {
    const key = `VERIFLOW-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setNewLicense(prev => ({ ...prev, license_key: key }));
  };

  // Manuel refresh
  const handleRefresh = () => {
    setLoading(true);
    fetchLicenses();
    fetchUserPlan();
  };

  // İstatistikleri hesapla
  const stats = {
    total: licenses.length,
    active: licenses.filter(l => l.is_active).length,
    inactive: licenses.filter(l => !l.is_active).length,
    withHwid: licenses.filter(l => l.require_hwid).length,
    expired: licenses.filter(l => l.expires_at && new Date(l.expires_at) < new Date()).length
  };

  // Filtrelenmiş lisanslar
  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.license_key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && license.is_active) ||
      (filterStatus === 'inactive' && !license.is_active);
    const matchesHwid = filterHwid === 'all' || 
      (filterHwid === 'with_hwid' && license.require_hwid) ||
      (filterHwid === 'without_hwid' && !license.require_hwid);
    
    return matchesSearch && matchesStatus && matchesHwid;
  });

  useEffect(() => {
    fetchLicenses();
    fetchUserPlan();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Lisanslar yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Bilgisi Banner */}
      {userPlan && (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                userPlan.plan_name === 'Plus' ? 'bg-purple-500/20' : 
                userPlan.plan_name === 'Pro' ? 'bg-cyan-500/20' : 'bg-green-500/20'
              }`}>
                <Key className={`h-5 w-5 ${
                  userPlan.plan_name === 'Plus' ? 'text-purple-400' : 
                  userPlan.plan_name === 'Pro' ? 'text-cyan-400' : 'text-green-400'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{userPlan.plan_name} Plan</h3>
                <p className="text-sm text-gray-400">
                  {userPlan.active_licenses} / {userPlan.license_limit} Lisans Kullanımı
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="flex-1 max-w-xs mx-4">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Lisans Kullanımı</span>
                <span>{userPlan.active_licenses} / {userPlan.license_limit}</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    userPlan.active_licenses >= userPlan.license_limit 
                      ? 'bg-red-500' 
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  }`}
                  style={{ 
                    width: `${Math.min((userPlan.active_licenses / userPlan.license_limit) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Limit Uyarısı */}
            {userPlan.active_licenses >= userPlan.license_limit && (
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Limit Doldu!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Başlık ve Butonlar */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Lisanslarım</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            title="Yenile"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={userPlan && userPlan.active_licenses >= userPlan.license_limit}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              userPlan && userPlan.active_licenses >= userPlan.license_limit
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-600 text-white'
            }`}
          >
            <Plus className="h-5 w-5" />
            <span>Yeni Lisans</span>
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-cyan-400">{stats.total}</div>
          <div className="text-sm text-gray-400">Toplam Lisans</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-400">{stats.active}</div>
          <div className="text-sm text-gray-400">Aktif</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-400">{stats.inactive}</div>
          <div className="text-sm text-gray-400">Pasif</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-400">{stats.withHwid}</div>
          <div className="text-sm text-gray-400">HWID Kilitli</div>
        </div>
      </div>

      {/* Arama ve Filtreleme */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Lisans key ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div className="flex space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
          <select
            value={filterHwid}
            onChange={(e) => setFilterHwid(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">Tüm HWID</option>
            <option value="with_hwid">HWID Gerekli</option>
            <option value="without_hwid">HWID Gerekmez</option>
          </select>
        </div>
      </div>

      {/* Yeni Lisans Formu */}
      {showCreateForm && (
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Yeni Lisans Oluştur</h3>
          <form onSubmit={createLicense} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lisans Key
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newLicense.license_key}
                    onChange={(e) => setNewLicense(prev => ({ ...prev, license_key: e.target.value }))}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Lisans key girin"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateLicenseKey}
                    className="bg-slate-600 hover:bg-slate-500 px-3 py-2 rounded-lg transition-colors"
                  >
                    Rastgele
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bitiş Tarihi
                </label>
                <input
                  type="datetime-local"
                  value={newLicense.expires_at}
                  onChange={(e) => setNewLicense(prev => ({ ...prev, expires_at: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={newLicense.require_hwid}
                onChange={(e) => setNewLicense(prev => ({ ...prev, require_hwid: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <label className="ml-2 text-sm text-gray-300">
                HWID Kilidi Gerektirsin
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Lisans Oluştur
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lisans Listesi */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        {filteredLicenses.length === 0 ? (
          <div className="p-8 text-center">
            <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {licenses.length === 0 
                ? "Henüz lisansınız bulunmuyor" 
                : "Arama kriterlerinize uygun lisans bulunamadı"
              }
            </p>
            {licenses.length === 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                İlk Lisansını Oluştur
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-4">Lisans Key</th>
                  <th className="text-left p-4">Durum</th>
                  <th className="text-left p-4">HWID</th>
                  <th className="text-left p-4">Oluşturulma</th>
                  <th className="text-left p-4">Bitiş</th>
                  <th className="text-left p-4">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicenses.map((license) => {
                  // ✅ TARİH KONTROLÜ
                  const isExpired = license.expires_at && new Date(license.expires_at) < new Date();

                  return (
                    <tr key={license.id} className="border-b border-slate-700 hover:bg-slate-750 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Key className="h-4 w-4 text-cyan-400" />
                          <code className="text-sm font-mono">{license.license_key}</code>
                          <button
                            onClick={() => copyLicenseKey(license.license_key)}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Kopyala"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        {isExpired ? (
                          // ✅ SÜRE DOLMUŞSA
                          <span className="flex items-center space-x-1 text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full w-fit">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs font-medium">Süresi Doldu</span>
                          </span>
                        ) : license.is_active ? (
                          // ✅ AKTİFSE
                          <span className="flex items-center space-x-1 text-green-400">
                            <CheckCircle className="h-4 w-4" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          // ❌ PASİFSE
                          <span className="flex items-center space-x-1 text-red-400">
                            <XCircle className="h-4 w-4" />
                            <span>Pasif</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {license.require_hwid ? (
                          <span className="text-yellow-400">Gerekli</span>
                        ) : (
                          <span className="text-gray-400">Gerekmez</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-300">
                        {new Date(license.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      {/* ✅ TARİH SÜTUNU RENKLENDİRMESİ */}
                      <td className={`p-4 text-sm ${isExpired ? 'text-orange-400 font-medium' : 'text-gray-300'}`}>
                        {license.expires_at ? new Date(license.expires_at).toLocaleDateString('tr-TR') : 'Süresiz'}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewLicenseDetails(license.id)}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            title="Detayları Gör"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteLicense(license.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}