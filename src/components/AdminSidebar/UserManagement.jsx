// src/components/AdminSidebar/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // ✅ Mevcut kullanıcıyı al
    const getUserData = () => {
      const rememberMe = localStorage.getItem("rememberMe") === "true";
      const userData = rememberMe 
        ? localStorage.getItem("user") 
        : sessionStorage.getItem("user");
      
      return userData ? JSON.parse(userData) : null;
    };

    const user = getUserData();
    setCurrentUser(user);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Kullanıcılar yüklenemedi');
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
      alert('Kullanıcılar yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  // UserManagement.jsx - TUZAKLI VERSİYON
const handleRoleChange = async (userId, newRole) => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
    
    // ✅ TUZAK: Kendi kullanıcısını değiştirmeye çalışırsa
    if (currentUser && currentUser.id === userId) {
      // Backend'e gerçekten istek atma, sadece frontend'de değiştir
      console.log('� TUZAK: Kullanıcı kendi rolünü değiştirmeye çalıştı!');
      
      // SessionStorage'da admin yap (sadece görsel)
      const updatedUser = { ...currentUser, role: 'admin' };
      
      if (localStorage.getItem("rememberMe") === "true") {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      }
      
      setCurrentUser(updatedUser);
      
      // Kullanıcı listesini güncelle (sadece frontend'de)
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: 'admin' } : u
      ));
      
      // EĞLENCELİ MESAJ �
      alert('Rolünüz admin olarak güncellendi! (Sadece bu bilgisayarda �)');
      
      // Backend'e log at (isteğe bağlı)
      try {
        await fetch(`${API_BASE_URL}/admin/tuzak`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'SELF_ROLE_CHANGE_ATTEMPT',
            details: 'Kullanıcı kendi rolünü değiştirmeye çalıştı - SEN HAYIRDIR?'
          })
        });
      } catch (logError) {
        // Log atılamazsa önemsiz
      }
      
      return;
    }

    // Normal kullanıcılar için gerçek backend isteği
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: newRole })
    });

    if (!response.ok) throw new Error('Rol değiştirilemedi');
    
    setUsers(users.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));
    
    alert('Kullanıcı rolü güncellendi!');
  } catch (error) {
    console.error('Rol değiştirme hatası:', error);
    alert('Rol değiştirilemedi!');
  }
};

  if (loading) {
    return <div className="text-white">Kullanıcılar yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">� Kullanıcı Yönetimi</h1>
      
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Kullanıcı</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Rol</th>
                <th className="text-left p-3">Plan</th>
                <th className="text-left p-3">Lisans</th>
                <th className="text-left p-3">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const isCurrentUser = currentUser && user.id === currentUser.id;
                
                return (
                  <tr 
                    key={user.id} 
                    className={`border-b border-slate-700 hover:bg-slate-700/50 ${
                      isCurrentUser ? 'bg-yellow-500/10' : ''
                    }`}
                  >
                    <td className="p-3">{user.id}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <span>{user.fullname}</span>
                        {isCurrentUser && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                            Siz
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-300' 
                          : 'bg-slate-500/20 text-slate-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">{user.plan_name || 'Free'}</td>
                    <td className="p-3">{user.license_count || 0}</td>
                    <td className="p-3">
                      {isCurrentUser ? (
                        <div className="flex items-center space-x-2">
                          <select 
                            value={user.role}
                            disabled
                            className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm cursor-not-allowed text-gray-400"
                          >
                            <option value="user">Kullanıcı</option>
                            <option value="admin">Admin</option>
                          </select>
                          <span className="text-xs text-yellow-500">(Değiştirilemez)</span>
                        </div>
                      ) : (
                        <select 
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm hover:bg-slate-600 transition-colors"
                        >
                          <option value="user">Kullanıcı</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ✅ Bilgilendirme Notu */}
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-blue-400 text-lg">�</div>
            <div>
              <h3 className="text-blue-300 font-semibold">Bilgilendirme</h3>
              <p className="text-blue-200 text-sm mt-1">
                • <strong>Kendi rolünüzü değiştiremezsiniz</strong> - Güvenlik nedeniyle
                <br/>
                • Diğer kullanıcıların rollerini "Kullanıcı" ↔ "Admin" arasında değiştirebilirsiniz
                <br/>
                • Tüm rol değişiklikleri güvenlik loglarında kaydedilir
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}