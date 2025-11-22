import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-900/90 backdrop-blur-sm border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">CW</span>
              </div>
              <span className="text-2xl font-bold text-cyan-400">VeriFlow</span>
            </div>
            
            <p className="text-gray-300 leading-relaxed">
              Donanım destekli AimAssist teknolojisi ile Valorant'ta fark yarat. 
              Güvenilir, hızlı ve etkili çözümler.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://discord.gg/mEHMqFCyW2"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <MessageCircle size={20} className="text-white" />
              </a>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <ExternalLink size={20} className="text-white" />
              </a>
            </div>
          </div>

          {/* Pages Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Sayfalar</h3>
            <div className="space-y-3">
              <Link 
                to="/" 
                className="block text-gray-300 hover:text-cyan-400 transition-colors duration-200"
              >
                Anasayfa
              </Link>
              <Link 
                to="/pricing" 
                className="block text-gray-300 hover:text-cyan-400 transition-colors duration-200"
              >
                Fiyatlandırma
              </Link>
              <Link 
                to="/hardware" 
                className="block text-gray-300 hover:text-cyan-400 transition-colors duration-200"
              >
                Donanım
              </Link>
              <Link 
                to="/support" 
                className="block text-gray-300 hover:text-cyan-400 transition-colors duration-200"
              >
                Destek
              </Link>
            </div>
          </div>

          {/* Account Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Hesap</h3>
            <div className="space-y-3">
              <Link 
                to="/login" 
                className="block text-gray-300 hover:text-cyan-400 transition-colors duration-200"
              >
                Giriş Yap
              </Link>
              <Link 
                to="/register" 
                className="block text-gray-300 hover:text-cyan-400 transition-colors duration-200"
              >
                Kayıt Ol
              </Link>
              <Link 
                to="/dashboard" 
                className="block text-gray-300 hover:text-cyan-400 transition-colors duration-200"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © {currentYear} VeriFlow. Tüm hakları saklıdır.
            </div>
            
            <div className="flex gap-6 text-sm">
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
              >
                Gizlilik Politikası
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
              >
                Kullanım Şartları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
