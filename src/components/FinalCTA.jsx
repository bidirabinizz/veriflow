import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const FinalCTA = () => {
  const { t } = useTranslation();

  return (
    <div className="relative py-24 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/10 to-transparent pointer-events-none" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Hala Düşünüyor musun?
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
          Binlerce kullanıcı arasına katıl ve deneyimini bugün bir üst seviyeye taşı.
        </p>
        <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105">
          Hemen Başla
        </button>
      </motion.div>
    </div>
  );
};

export default FinalCTA;