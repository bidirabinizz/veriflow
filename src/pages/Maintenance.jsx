import React from 'react';
import { Hammer, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Maintenance() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-4">
      <div className="bg-yellow-500/10 p-6 rounded-full mb-6 border border-yellow-500/20 animate-pulse">
        <Hammer className="w-16 h-16 text-yellow-500" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-4">Sistem Bakımda</h1>
      <p className="text-gray-400 max-w-md text-lg mb-8">
        VeriFlow sistemlerimizde planlı bir güncelleme yapıyoruz. 
        Lütfen daha sonra tekrar deneyin.
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-500/5 px-4 py-2 rounded-lg justify-center">
          <AlertTriangle size={16} />
          <span>Yöneticiler giriş yapabilir.</span>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2 mx-auto text-sm"
        >
          <ArrowLeft size={16} />
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
}