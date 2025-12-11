import React, { useState, useEffect } from 'react';
import { X, Megaphone, Info } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementDisplay() {
  const [announcements, setAnnouncements] = useState([]);
  const [closedIds, setClosedIds] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/announcements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const closeAnnouncement = (id) => {
    setClosedIds(prev => [...prev, id]);
    // İstersen burada localStorage'a kaydedip kalıcı olarak kapatabilirsin
    // localStorage.setItem('closed_announcements', JSON.stringify([...closedIds, id]));
  };

  // Görünür olan duyuruları filtrele (Kapatılanları hariç tut)
  const visibleAnnouncements = announcements.filter(a => !closedIds.includes(a.id));

  return (
    <>
      <AnimatePresence>
        {visibleAnnouncements.map(announcement => {
          
          // --- TİP 1: BANNER (EN ÜSTTE ÇUBUK) ---
          if (announcement.type === 'banner') {
            return (
              <motion.div
                key={announcement.id}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white relative z-50"
              >
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Megaphone className="w-5 h-5 animate-bounce" />
                    <span className="font-semibold">{announcement.title}:</span>
                    <span className="text-sm opacity-90">{announcement.message}</span>
                  </div>
                  <button onClick={() => closeAnnouncement(announcement.id)} className="hover:bg-white/20 p-1 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          }

          // --- TİP 2: POPUP (EKRAN ORTASI MODAL) ---
          if (announcement.type === 'popup') {
            return (
              <div key={announcement.id} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-slate-800 border border-slate-600 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
                >
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Info className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{announcement.title}</h3>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      {announcement.message}
                    </p>
                    <button 
                      onClick={() => closeAnnouncement(announcement.id)}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-xl font-semibold transition-all w-full"
                    >
                      Tamam, Anlaşıldı
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          }
          
          return null;
        })}
      </AnimatePresence>
    </>
  );
}