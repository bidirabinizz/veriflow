import React, { useState, useEffect } from 'react';
import { Megaphone, Trash2, Plus, Layout, Square } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'popup' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/announcements`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setAnnouncements(data.announcements);
    }
  };

  const createAnnouncement = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    
    const res = await fetch(`${API_BASE_URL}/admin/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newAnnouncement)
    });

    if (res.ok) {
      setNewAnnouncement({ title: '', message: '', type: 'popup' });
      fetchAnnouncements();
      alert("Duyuru yayınlandı!");
    }
    setLoading(false);
  };

  const deleteAnnouncement = async (id) => {
    if(!confirm("Bu duyuruyu kaldırmak istiyor musunuz?")) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE_URL}/admin/announcements/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchAnnouncements();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">📢 Duyuru Yönetimi</h1>

      {/* Oluşturma Formu */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Yeni Duyuru Yayınla</h2>
        <form onSubmit={createAnnouncement} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Başlık</label>
              <input 
                type="text" 
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white"
                placeholder="Örn: Bakım Çalışması"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Gösterim Tipi</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewAnnouncement({...newAnnouncement, type: 'popup'})}
                  className={`flex-1 p-2 rounded-lg border flex items-center justify-center gap-2 ${newAnnouncement.type === 'popup' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-600 text-gray-400'}`}
                >
                  <Square size={16}/> Popup
                </button>
                <button
                  type="button"
                  onClick={() => setNewAnnouncement({...newAnnouncement, type: 'banner'})}
                  className={`flex-1 p-2 rounded-lg border flex items-center justify-center gap-2 ${newAnnouncement.type === 'banner' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-600 text-gray-400'}`}
                >
                  <Layout size={16}/> Banner
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mesaj İçeriği</label>
            <textarea 
              value={newAnnouncement.message}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white h-24"
              placeholder="Duyuru detaylarını buraya yazın..."
              required
            />
          </div>
          <button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold w-full flex items-center justify-center gap-2">
            <Megaphone size={18}/> {loading ? 'Yayınlanıyor...' : 'Duyuruyu Yayınla'}
          </button>
        </form>
      </div>

      {/* Duyuru Listesi */}
      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <div className="p-4 border-b border-slate-700 font-semibold text-white">Aktif Duyurular</div>
        <div className="divide-y divide-slate-700">
          {announcements.map(ann => (
            <div key={ann.id} className="p-4 flex justify-between items-center hover:bg-slate-700/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded border ${ann.type === 'popup' ? 'border-cyan-500 text-cyan-400' : 'border-blue-500 text-blue-400'}`}>
                    {ann.type.toUpperCase()}
                  </span>
                  <h3 className="text-white font-medium">{ann.title}</h3>
                </div>
                <p className="text-sm text-gray-400">{ann.message}</p>
              </div>
              <button 
                onClick={() => deleteAnnouncement(ann.id)}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Yayından Kaldır"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {announcements.length === 0 && <div className="p-8 text-center text-gray-500">Aktif duyuru yok.</div>}
        </div>
      </div>
    </div>
  );
}