// src/components/AdminSidebar/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
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
                <th className="text-left p-3">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="p-3">{user.id}</td>
                  <td className="p-3">{user.fullname}</td>
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
                  <td className="p-3">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
                    >
                      <option value="user">Kullanıcı</option>
                      <option value="admin">Admin</option>
                    </select>
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