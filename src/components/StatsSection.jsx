import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Users, Globe } from "lucide-react";

const StatsSection = () => {
  const stats = [
    { icon: Users, label: "Aktif Kullanıcı", value: "10K+" },
    { icon: ShieldCheck, label: "Güvenlik Skoru", value: "%99.9" },
    { icon: Globe, label: "Ülke Desteği", value: "20+" },
    { icon: Zap, label: "Ort. Tepki Süresi", value: "12ms" },
  ];

  return (
    <div className="py-10 border-y border-white/5 bg-white/5 backdrop-blur-sm relative z-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center text-center space-y-2"
          >
            <div className="p-3 bg-cyan-500/10 rounded-full text-cyan-400 mb-2">
              <stat.icon size={24} />
            </div>
            <h4 className="text-3xl font-bold text-white">{stat.value}</h4>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;