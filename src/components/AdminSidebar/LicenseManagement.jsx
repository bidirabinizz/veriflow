// src/components/AdminSidebar/LicenseManagement.jsx
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';

export default function LicenseManagement() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

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
      alert('Lisanslar yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Lisanslar yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">� Lisans Yönetimi</h1>
      
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-3">Lisans Key</th>
                <th className="text-left p-3">Sahibi</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Oluşturulma</th>
                <th className="text-left p-3">Durum</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map(license => (
                <tr key={license.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="p-3 font-mono text-xs">{license.license_key}</td>
                  <td className="p-3">{license.user_name}</td>
                  <td className="p-3">{license.user_email}</td>
                  <td className="p-3">{new Date(license.created_at).toLocaleDateString('tr-TR')}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      license.is_active 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {license.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}