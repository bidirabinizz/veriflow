// src/pages/SupportDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function SupportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  
  // ✅ YENİ: Sohbet kutusunu yakalamak için ref
  const chatContainerRef = useRef(null);

  // ✅ GÜNCELLENDİ: Sadece sohbet kutusunu aşağı kaydırır
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    fetchTicketDetails();

    const interval = setInterval(() => {
      fetchTicketDetails(true); 
    }, 1000); // Canlı sohbet için polling

    return () => clearInterval(interval);
  }, [id]);

  // Mesajlar değiştiğinde scroll yap
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchTicketDetails = async (isBackground = false) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if(!token) return;

      const res = await fetch(`${API_BASE_URL}/tickets/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setTicket(data.ticket);
        
        // ✅ GÜNCELLENDİ: Sadece mesajlar değiştiyse state güncelle (Scroll'un düzgün çalışması için)
        setMessages(prevMessages => {
          if (JSON.stringify(prevMessages) !== JSON.stringify(data.messages)) {
            return data.messages;
          }
          return prevMessages;
        });

      } else {
        if (!isBackground) { 
           alert("Bilet bulunamadı!");
           navigate('/dashboard/support');
        }
      }
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      if (!isBackground) setLoading(false); 
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/tickets/${id}/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: reply })
      });

      if (res.ok) {
        setReply('');
        fetchTicketDetails(); // Mesajları yenile
      }
    } catch (error) {
      alert("Mesaj gönderilemedi");
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'open') return <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle size={12}/> Açık</span>;
    if (status === 'answered') return <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12}/> Yanıtlandı</span>;
    return <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"><XCircle size={12}/> Kapalı</span>;
  };

  if (loading) return <div className="text-white text-center py-10">Yükleniyor...</div>;
  if (!ticket) return null;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/support')}
            className="text-gray-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold text-white text-lg flex items-center gap-3">
              {ticket.subject}
              {getStatusBadge(ticket.status)}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">ID: #{ticket.id} • {new Date(ticket.created_at).toLocaleString('tr-TR')}</p>
          </div>
        </div>
      </div>

      {/* Mesaj Alanı */}
      {/* ✅ Ref buraya eklendi */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/30"
      >
        {messages.map((msg, index) => {
          const isAdmin = msg.role === 'admin';
          return (
            <div key={index} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
              <div className={`flex gap-3 max-w-[80%] ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isAdmin ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}>
                  {isAdmin ? <Shield size={14} /> : <User size={14} />}
                </div>

                {/* Balon */}
                <div className={`rounded-2xl p-4 shadow-md ${
                  isAdmin 
                    ? 'bg-slate-700 text-gray-200 rounded-tl-none' 
                    : 'bg-cyan-600 text-white rounded-tr-none'
                }`}>
                  <div className={`flex items-center gap-2 mb-1 text-xs opacity-70 ${isAdmin ? '' : 'justify-end'}`}>
                    <span className="font-bold">{msg.fullname}</span>
                    <span>• {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mesaj Gönderme */}
      {ticket.status !== 'closed' ? (
        <form onSubmit={sendReply} className="p-4 border-t border-slate-700 bg-slate-800">
          <div className="flex gap-3">
            <input 
              type="text" 
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Bir mesaj yazın..." 
              className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 placeholder-gray-500 transition-colors"
            />
            <button 
              type="submit" 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 border-t border-slate-700 bg-slate-800/50 text-center text-gray-400 text-sm font-medium">
          🔒 Bu destek talebi kapatılmıştır. Yeni bir mesaj gönderemezsiniz.
        </div>
      )}
    </div>
  );
}