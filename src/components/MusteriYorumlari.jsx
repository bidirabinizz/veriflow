import React from "react";
import { motion } from "framer-motion";
import { Star, Quote, Terminal, Cpu, Globe } from "lucide-react";

const MusteriYorumlari = () => {
  const reviews = [
    {
      name: "Emre T.",
      title: "Full Stack Developer",
      comment: "Kendi lisans sunucumu yazmakla uğraşmak yerine VeriFlow'u entegre ettim. Projeme odaklanmamı sağladı, güvenlik tarafı gerçekten çok sağlam.",
      icon: Terminal,
      initial: "E"
    },
    {
      name: "Selin A.",
      title: "SaaS Kurucusu",
      comment: "Müşterilerim için otomatik lisans oluşturma özelliği harika. WooCommerce entegrasyonu sayesinde satışlarım tamamen otonom hale geldi.",
      icon: Globe,
      initial: "S"
    },
    {
      name: "Burak K.",
      title: "C# Geliştiricisi",
      comment: "HWID kilitleme sistemi tam ihtiyacım olan şeydi. Yazılımımın izinsiz dağıtılmasını %100 engelledi. Panel arayüzü de çok modern.",
      icon: Cpu,
      initial: "B"
    }
  ];

  return (
    <div className="py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[128px] -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Geliştiriciler <span className="text-cyan-400">Bizi Neden Seçiyor?</span>
          </h2>
          <p className="text-gray-400">
            Yüzlerce bağımsız geliştirici ve yazılım şirketi lisanslamada bize güveniyor.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl hover:border-cyan-500/30 transition-all duration-300 group"
            >
              <Quote className="absolute top-6 right-6 text-slate-700 group-hover:text-cyan-500/20 transition-colors" size={40} />
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-cyan-500 text-cyan-500" />
                ))}
              </div>

              <p className="text-gray-300 mb-8 relative z-10 leading-relaxed min-h-[80px]">
                "{review.comment}"
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                  <review.icon size={24} />
                </div>
                <div>
                  <h4 className="text-white font-semibold">{review.name}</h4>
                  <p className="text-sm text-gray-500 group-hover:text-cyan-400 transition-colors">
                    {review.title}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MusteriYorumlari;