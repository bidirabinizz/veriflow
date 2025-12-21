import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Github } from 'lucide-react'; // İstersen Github ikonunu da ekleyebilirsin

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-950 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* 1. Marka ve Açıklama Alanı (Geniş) */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-white font-bold text-lg">CW</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">VeriFlow</span>
            </div>
            
            <p className="text-gray-400 leading-relaxed max-w-sm">
              Yazılımlarınız için uçtan uca şifreli, bulut tabanlı lisans yönetim sistemi. 
              Geliştiriciler için tasarlandı, güvenlikle güçlendirildi.
            </p>
            
            {/* Sosyal Medya - Daha kurumsal ikonlar */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-lg flex items-center justify-center transition-all duration-200 text-gray-400 hover:text-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-lg flex items-center justify-center transition-all duration-200 text-gray-400 hover:text-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* 2. Ürün Linkleri */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Ürün</h3>
            <div className="space-y-4">
              <Link to="/" className="block text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                Anasayfa
              </Link>
              <Link to="/fiyatlandirma" className="block text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                Fiyatlandırma
              </Link>
              {/* "Donanım" yerine geliştiriciler için "Dokümantasyon" */}
              <Link to="/docs" className="block text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                Dokümantasyon
              </Link>
              <Link to="/changelog" className="block text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                Sürüm Notları
              </Link>
            </div>
          </div>

          {/* 3. Yasal ve Destek */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Kurumsal</h3>
            <div className="space-y-4">
              <Link to="/support" className="block text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                Yardım Merkezi
              </Link>
              <Link to="/privacy" className="block text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                Gizlilik Politikası
              </Link>
              <Link to="/terms" className="block text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                Kullanım Şartları
              </Link>
              {/* Login/Register buraya sıkıştırmaya gerek yok, Navbar'da zaten var */}
            </div>
          </div>

        </div>

        {/* Alt Çizgi ve Telif */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm">
            © {currentYear} VeriFlow Inc. Tüm hakları saklıdır.
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs text-gray-400 font-medium">Sistemler Aktif</span>
          </div>
        </div>
      </div>
    </footer>
  );
}