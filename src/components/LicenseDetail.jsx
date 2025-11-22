// src/components/LicenseDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Save, X, Key, Cpu, Calendar, Activity, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config/api'; // ✅ BU IMPORT'U EKLE

export default function LicenseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    is_active: false,
    require_hwid: false,
    expires_at: ''
  });

  useEffect(() => {
    fetchLicenseDetail();
  }, [id]);

  const fetchLicenseDetail = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      // ✅ DEĞİŞTİR: localhost yerine API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/licenses/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Lisans detayı getirilemedi");

      const data = await response.json();
      setLicense(data.license);
      setFormData({
        is_active: data.license.is_active,
        require_hwid: data.license.require_hwid,
        expires_at: data.license.expires_at ? data.license.expires_at.split('T')[0] : ''
      });
    } catch (error) {
      console.error("Lisans detay hatası:", error);
      alert("Lisans detayı yüklenirken hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const updateLicense = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      // ✅ DEĞİŞTİR: localhost yerine API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/licenses/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      alert("Lisans başarıyla güncellendi!");
      setEditMode(false);
      fetchLicenseDetail();
    } catch (error) {
      alert(error.message);
    }
  };

  const resetHWID = async () => {
    if (!confirm("HWID'i sıfırlamak istediğinizden emin misiniz?")) return;
    
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      // ✅ DEĞİŞTİR: localhost yerine API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/licenses/${id}/reset-hwid`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      alert("HWID başarıyla sıfırlandı!");
      fetchLicenseDetail();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Lisans detayı yükleniyor...</div>
      </div>
    );
  }

  if (!license) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 text-lg">Lisans bulunamadı!</p>
        <button 
          onClick={() => navigate('/dashboard/licenses')} 
          className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Lisanslara Dön
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen bg-gradient-to-br from-slate-900 to-slate-900 relative p-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/dashboard/licenses')} 
            className="text-gray-400 hover:text-black transition-colors bg-slate"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-3xl font-bold text-white">Lisans Detayı</h2>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={fetchLicenseDetail}
            className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Yenile</span>
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            {editMode ? <X className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
            <span>{editMode ? 'İptal' : 'Düzenle'}</span>
          </button>
        </div>
      </div>

      {/* Lisans Bilgileri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sol: Temel Bilgiler */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Lisans Bilgileri</span>
          </h3>

          {editMode ? (
            <form onSubmit={updateLicense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lisans Key
                </label>
                <input
                  type="text"
                  value={license.license_key}
                  disabled
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-gray-400"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Aktif
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.require_hwid}
                    onChange={(e) => setFormData(prev => ({ ...prev, require_hwid: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    HWID Kilidi
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Save className="h-5 w-5" />
                <span>Kaydet</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Lisans Key
                </label>
                <code className="text-cyan-400 font-mono text-lg">{license.license_key}</code>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Durum</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    license.is_active 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {license.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">HWID Kilidi</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    license.require_hwid 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {license.require_hwid ? 'Açık' : 'Kapalı'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Oluşturulma</label>
                <p className="text-white">
                  {new Date(license.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Bitiş Tarihi</label>
                <p className="text-white">
                  {license.expires_at 
                    ? new Date(license.expires_at).toLocaleDateString('tr-TR')
                    : 'Süresiz'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sağ: HWID & İşlemler */}
        <div className="space-y-6">
          {/* HWID Bilgisi */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Cpu className="h-5 w-5" />
              <span>HWID Bilgisi</span>
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Kayıtlı HWID</label>
                {license.hwid ? (
                  <code className="text-green-400 font-mono text-sm break-all bg-slate-900 px-2 py-1 rounded">
                    {license.hwid}
                  </code>
                ) : (
                  <p className="text-gray-400">Henüz HWID kaydedilmemiş</p>
                )}
              </div>

              {license.hwid && (
                <button
                  onClick={resetHWID}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  HWID'i Sıfırla
                </button>
              )}
            </div>
          </div>

          {/* Son Aktivite */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Son Aktivite</span>
            </h3>
            
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">
                Lisans oluşturuldu: {new Date(license.created_at).toLocaleString('tr-TR')}
              </p>
              {license.expires_at && (
                <p className="text-gray-400 text-sm">
                  Bitiş tarihi: {new Date(license.expires_at).toLocaleString('tr-TR')}
                </p>
              )}
              {/* Buraya license_activity tablosundan veri çekebilirsin */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}