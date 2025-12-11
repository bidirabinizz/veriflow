import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '', priority: 'medium' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error("Ticket hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newTicket)
      });

      if (res.ok) {
        setShowModal(false);
        setNewTicket({ subject: '', message: '', priority: 'medium' });
        fetchTickets();
        alert("Destek talebiniz başarıyla oluşturuldu!");
      } else {
        alert("Bir hata oluştu.");
      }
    } catch (error) {
      alert("Bağlantı hatası.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs border border-green-500/30 flex items-center gap-1"><CheckCircle size={12}/> Açık</span>;
      case 'answered':
        return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs border border-yellow-500/30 flex items-center gap-1"><MessageSquare size={12}/> Yanıtlandı</span>;
      case 'closed':
        return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs border border-red-500/30 flex items-center gap-1"><XCircle size={12}/> Kapalı</span>;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) return <div className="text-white text-center py-10">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      {/* Başlık ve Buton */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Destek Talepleri</h1>
          <p className="text-gray-400 text-sm mt-1">Sorunlarınızı bize bildirin, en kısa sürede çözelim.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20"
        >
          <Plus size={20} /> Yeni Talep
        </button>
      </div>

      {/* Ticket Listesi */}
      <div className="grid gap-4">
        {tickets.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <h3 className="text-xl font-medium text-white">Henüz destek talebiniz yok</h3>
            <p className="text-gray-400 mt-2">Yardıma mı ihtiyacınız var? Yeni bir talep oluşturun.</p>
          </div>
        ) : (
          tickets.map(ticket => (
            <div 
              key={ticket.id} 
              // Detay sayfası henüz yok, sonra ekleyeceğiz:
              onClick={() => navigate(`/dashboard/support/${ticket.id}`)} 
              className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-cyan-500/50 cursor-pointer transition-all hover:bg-slate-750 group"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg text-white group-hover:text-cyan-400 transition-colors">
                      {ticket.subject}
                    </h3>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {new Date(ticket.created_at).toLocaleDateString('tr-TR')}
                    </span>
                    <span>ID: #{ticket.id}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority === 'high' ? 'Yüksek' : ticket.priority === 'medium' ? 'Orta' : 'Düşük'} Öncelik
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Yeni Talep Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Yeni Destek Talebi</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={createTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Konu</label>
                <input 
                  type="text" 
                  placeholder="Örn: Lisansım çalışmıyor" 
                  className="w-full bg-slate-900 text-white p-3 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
                  value={newTicket.subject} 
                  onChange={e => setNewTicket({...newTicket, subject: e.target.value})} 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Öncelik</label>
                <select 
                  className="w-full bg-slate-900 text-white p-3 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
                  value={newTicket.priority} 
                  onChange={e => setNewTicket({...newTicket, priority: e.target.value})}
                >
                  <option value="low">Düşük (Öneri/Soru)</option>
                  <option value="medium">Orta (Hata/Sorun)</option>
                  <option value="high">Yüksek (Acil Durum)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Mesajınız</label>
                <textarea 
                  placeholder="Sorununuzu detaylı bir şekilde açıklayın..." 
                  rows="4" 
                  className="w-full bg-slate-900 text-white p-3 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none resize-none"
                  value={newTicket.message} 
                  onChange={e => setNewTicket({...newTicket, message: e.target.value})} 
                  required
                ></textarea>
              </div>

              <div className="flex gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl transition-colors font-medium"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-xl transition-all font-medium shadow-lg shadow-cyan-500/20"
                >
                  Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}