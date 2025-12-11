import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { Download, Activity, Server, Shield, FileText, Key, Database } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_BASE_URL } from '../../config/api';

export default function Istatistikler() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/user/statistics`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Stats error:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("VeriFlow - Sistem Raporu", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 30);

    // Özet Tablosu
    if (data?.summary) {
      autoTable(doc, {
        startY: 40,
        head: [['Toplam Uretilen Lisans', 'Suan Aktif Lisans', 'Toplam API Key', 'API Istek Sayisi']],
        body: [[
          data.summary.total_licenses, 
          data.summary.active_licenses, 
          data.summary.total_api_keys,
          data?.api_usage?.reduce((acc, curr) => acc + curr.count, 0) || 0
        ]],
        theme: 'grid',
        headStyles: { fillColor: [6, 182, 212] }
      });
    }

    // Son Aktiviteler
    if (data?.recent_activities && data.recent_activities.length > 0) {
      const activityData = data.recent_activities.map(act => [
        new Date(act.created_at).toLocaleString('tr-TR'),
        act.license_key,
        act.activity_type,
        act.activity_detail
      ]);

      doc.text("Son Lisans Hareketleri", 14, doc.lastAutoTable.finalY + 15);
      
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Tarih', 'Lisans Key', 'Islem', 'Detay']],
        body: activityData,
        theme: 'striped'
      });
    }

    doc.save("veriflow_detayli_rapor.pdf");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-white">Veriler analiz ediliyor...</div>
      </div>
    );
  }

  const chartData = data?.api_usage?.map(item => ({
    name: new Date(item.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    kullanim: item.count
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">📊 Detaylı İstatistikler</h1>
          <p className="text-gray-400 text-sm">Lisans ve API kullanım verileriniz</p>
        </div>
        <button 
          onClick={downloadPDF}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors w-full sm:w-auto justify-center shadow-lg shadow-cyan-500/20"
        >
          <Download className="h-5 w-5" />
          <span>Detaylı Rapor İndir (PDF)</span>
        </button>
      </div>

      {/* ✅ 4'lü Kart Yapısı (Toplam Lisans Eklendi) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Toplam Üretilen Lisans */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs uppercase font-semibold">Toplam Lisans</p>
              <p className="text-2xl font-bold text-white mt-1">{data?.summary?.total_licenses || 0}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg"><Database className="text-blue-400 h-6 w-6" /></div>
          </div>
        </div>

        {/* Aktif Lisans */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-green-500/50 transition-all hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs uppercase font-semibold">Aktif Lisans</p>
              <p className="text-2xl font-bold text-white mt-1">{data?.summary?.active_licenses || 0}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg"><Shield className="text-green-400 h-6 w-6" /></div>
          </div>
        </div>

        {/* API Key Sayısı */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-all hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs uppercase font-semibold">API Anahtarları</p>
              <p className="text-2xl font-bold text-white mt-1">{data?.summary?.total_api_keys || 0}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg"><Key className="text-purple-400 h-6 w-6" /></div>
          </div>
        </div>

        {/* API Kullanımı */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs uppercase font-semibold">Son 30 Gün İstek</p>
              <p className="text-2xl font-bold text-white mt-1">
                {data?.api_usage?.reduce((acc, curr) => acc + curr.count, 0) || 0}
              </p>
            </div>
            <div className="p-3 bg-cyan-500/20 rounded-lg"><Activity className="text-cyan-400 h-6 w-6" /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            API Trafik Grafiği
          </h3>
          <div className="h-80 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="name" stroke="#9CA3AF" tick={{fontSize: 12}} />
                  <YAxis stroke="#9CA3AF" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                    cursor={{ fill: '#374151', opacity: 0.4 }}
                  />
                  <Bar dataKey="kullanim" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Activity className="h-12 w-12 mb-2 opacity-20" />
                <p>Henüz veri grafiği oluşmadı</p>
              </div>
            )}
          </div>
        </div>

        {/* Son İşlemler */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-400" />
            Son İşlemler
          </h3>
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
            {data?.recent_activities?.length > 0 ? (
              data.recent_activities.map((act, index) => (
                <div key={index} className="p-3 bg-slate-700/30 rounded-lg border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-gray-200">{act.activity_detail}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-cyan-400 font-mono bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-900/50">
                      {act.license_key}
                    </div>
                    <span className="text-[10px] text-gray-500">
                      {new Date(act.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Henüz işlem kaydı yok.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}