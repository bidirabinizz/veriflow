// src/components/AdminSidebar/AdminSupport.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, CheckCircle, XCircle, Clock, Send, User, Shield } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  
  // ✅ YENİ: Sohbet kutusunu yakalamak için ref
  const chatContainerRef = useRef(null);

  // Tüm biletleri çek
  useEffect(() => {
    fetchTickets();
  }, []);

  // 🔥 CANLI SOHBET İÇİN OTOMATİK YENİLEME
  useEffect(() => {
    let interval;

    if (selectedTicket) {
      interval = setInterval(() => {
        refreshMessages(selectedTicket.id);
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedTicket]);

  // Mesajları en aşağı kaydır (Sadece mesaj listesi gerçekten değiştiğinde çalışır)
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ GÜNCELLENDİ: Sadece sohbet kutusunu aşağı kaydırır
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/admin/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshMessages = async (ticketId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        
        setMessages(prevMessages => {
          if (JSON.stringify(prevMessages) !== JSON.stringify(data.messages)) {
            return data.messages;
          }
          return prevMessages;
        });
      }
    } catch (err) {
      console.error("Auto-refresh error", err);
    }
  };

  const openTicket = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/tickets/${ticket.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: reply })
      });

      if (res.ok) {
        setReply('');
        const response = await fetch(`${API_BASE_URL}/tickets/${selectedTicket.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(response.ok) {
            const data = await response.json();
            setMessages(data.messages);
        }
        fetchTickets(); 
      }
    } catch (err) {
      alert("Mesaj gönderilemedi");
    }
  };

  const closeTicket = async () => {
    if(!confirm("Bu talebi kapatmak istediğinize emin misiniz?")) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/admin/tickets/${selectedTicket.id}/close`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedTicket = { ...selectedTicket, status: 'closed' };
        setSelectedTicket(updatedTicket);
        setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      }
    } catch (err) {
      alert("İşlem başarısız");
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'open') return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs border border-green-500/30 flex items-center gap-1"><CheckCircle size={12}/> Açık</span>;
    if (status === 'answered') return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs border border-yellow-500/30 flex items-center gap-1"><Clock size={12}/> Cevaplandı</span>;
    return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs border border-red-500/30 flex items-center gap-1"><XCircle size={12}/> Kapalı</span>;
  };

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6">
      {/* SOL: Bilet Listesi */}
      <div className="w-1/3 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <h2 className="font-bold text-white flex items-center gap-2">
            <MessageSquare size={20} className="text-cyan-400"/> Gelen Talepler
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {tickets.map(ticket => (
            <div 
              key={ticket.id} 
              onClick={() => openTicket(ticket)}
              className={`p-4 rounded-lg cursor-pointer transition-all border ${
                selectedTicket?.id === ticket.id 
                  ? 'bg-cyan-500/10 border-cyan-500/50' 
                  : 'bg-slate-700/30 border-transparent hover:bg-slate-700'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-white truncate w-2/3">{ticket.subject}</span>
                {getStatusBadge(ticket.status)}
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                <span className="flex items-center gap-1"><User size={12}/> {ticket.fullname}</span>
                <span>{new Date(ticket.updated_at).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
             <div className="text-center p-4 text-gray-500 text-sm">Henüz talep yok.</div>
          )}
        </div>
      </div>

      {/* SAĞ: Mesajlaşma Alanı */}
      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
        {selectedTicket ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center shadow-sm z-10">
              <div>
                <h2 className="font-bold text-lg text-white flex items-center gap-2">
                  {selectedTicket.subject}
                </h2>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <User size={12}/> {selectedTicket.fullname} ({selectedTicket.email})
                </p>
              </div>
              {selectedTicket.status !== 'closed' && (
                <button 
                  onClick={closeTicket}
                  className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors border border-red-500/20"
                >
                  Talebi Kapat
                </button>
              )}
            </div>

            {/* Mesajlar */}
            {/* ✅ DÜZELTME: ref buraya eklendi, overflow-y-auto burada olduğu için */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/30"
            >
              {messages.map((msg, index) => {
                const isAdmin = msg.role === 'admin';
                return (
                  <div key={index} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isAdmin ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {isAdmin ? <Shield size={14} /> : <User size={14} />}
                      </div>

                      <div className={`rounded-2xl p-4 shadow-md ${
                        isAdmin 
                          ? 'bg-cyan-600 text-white rounded-tr-none' 
                          : 'bg-slate-700 text-gray-200 rounded-tl-none'
                      }`}>
                        <div className={`flex items-center gap-2 mb-1 text-xs opacity-70 ${isAdmin ? '' : 'justify-end'}`}>
                          <span className="font-bold">{msg.fullname}</span>
                          <span>• {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            {selectedTicket.status !== 'closed' ? (
              <form onSubmit={sendReply} className="p-4 border-t border-slate-700 bg-slate-800">
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Cevabınızı yazın..." 
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 placeholder-gray-500 transition-colors"
                  />
                  <button 
                    type="submit" 
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-cyan-500/20"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 border-t border-slate-700 bg-slate-800/50 text-center text-gray-400 text-sm font-medium">
                🔒 Bu destek talebi kapatılmıştır.
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p>Görüntülemek için soldan bir talep seçin.</p>
          </div>
        )}
      </div>
    </div>
  );
}