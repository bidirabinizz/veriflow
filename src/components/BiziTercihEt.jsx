import React from "react";
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle, Terminal, Shield, Code2 } from 'lucide-react';

const BiziTercihEt = () => {
  const { t } = useTranslation();
  
  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Sol İçerik (Metinler) */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-2 text-cyan-400 font-medium"
          >
            <span className="p-1 bg-cyan-500/10 rounded-lg"><Terminal size={18}/></span>
            <span>Geliştirici Dostu Altyapı</span>
          </motion.div>

          <motion.h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight"
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          >
            Yazılımını <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Güvenceye Al</span>
          </motion.h1>

          <motion.p className="text-gray-400 text-xl leading-relaxed"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 1, delay: 0.4}}
          >
            {t('home_subtitle') || "Dakikalar içinde entegre edin, lisanslarınızı buluttan yönetin. Kırılmalara karşı %99.9 koruma."}
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <motion.button className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
              initial={{opacity: 0, y: 10}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.6}}
            >
              <Code2 size={20} />
              {t('daha_fazla_kesfet') || "Hemen Entegre Et"}
            </motion.button>
          </div>
        </div>

        {/* Sağ İçerik (Kod Terminali Görünümü) */}
        <div className="relative">
            {/* Arkaplan Glow Efekti */}
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[2rem] blur-2xl opacity-30 animate-pulse"></div>
            
            <motion.div 
              className="relative bg-[#0f172a] rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              {/* Terminal Başlığı */}
              <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="text-xs text-slate-500 font-mono">main.py — VeriFlow Integration</div>
              </div>

              {/* Kod Alanı */}
              <div className="p-6 font-mono text-sm md:text-base leading-relaxed overflow-x-auto">
                <div className="flex gap-4">
                  <div className="text-slate-600 select-none text-right">
                    1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7
                  </div>
                  <div className="text-slate-300">
                    <span className="text-purple-400">import</span> VeriFlow <span className="text-purple-400">from</span> <span className="text-green-400">'veriflow-sdk'</span>;
                    <br/><br/>
                    <span className="text-slate-500">// Lisans kontrolünü başlat</span><br/>
                    <span className="text-blue-400">async function</span> <span className="text-yellow-300">startApp</span>() {'{'}<br/>
                    &nbsp;&nbsp;<span className="text-purple-400">const</span> license = <span className="text-purple-400">await</span> VeriFlow.<span className="text-blue-400">verify</span>(<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-400">"VF-LICENSE-KEY-123"</span><br/>
                    &nbsp;&nbsp;);<br/>
                    &nbsp;&nbsp;<span className="text-purple-400">if</span> (license.isValid) launch();<br/>
                    {'}'}
                  </div>
                </div>
              </div>

              {/* Floating Başarı Rozeti */}
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.5, type: "spring" }}
                className="absolute bottom-6 right-6 bg-slate-800/90 backdrop-blur border border-green-500/30 p-4 rounded-xl shadow-xl flex items-center gap-3 z-10"
              >
                <div className="bg-green-500/20 p-2 rounded-full">
                  <CheckCircle className="text-green-400" size={20} />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Lisans Doğrulandı</div>
                  <div className="text-xs text-green-400">Süre: 0.12ms</div>
                </div>
              </motion.div>

            </motion.div>
        </div>

      </div>
    </div>
  );
};

export default BiziTercihEt;