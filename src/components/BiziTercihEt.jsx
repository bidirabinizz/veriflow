import React from "react";
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const BiziTercihEt = () => {
    const { t, i18n } = useTranslation();
  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
      <div className="grid lg:grid-cols-2 gap-12">
        
        {/* Sol İçerik */}
        <div className="space-y-8 mt-20">
          <motion.h1 className="text-5xl lg:text-6xl font-bold text-cyan-400 leading-tight"
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
          >
            {t('home_title')}
          </motion.h1>

      <motion.p className="text-stone-50 text-xl mt-3"
      initial={{opacity: 0, y: -10}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 1.2, ease: "easeIn", delay: 0.5}}
      >
            {t('home_subtitle')}
          </motion.p>

        

          {/* CTA Buton */}
          <div className="flex flex-col sm:flex-row gap-4  mt-6">
            <motion.button className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
            initial={{opacity: 0, y: -10}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 1.5, ease: "easeInOut", delay: 0.5}}
            >
              {t('daha_fazla_kesfet')}
            </motion.button>
          </div>



        </div>

        <div className="relative">
            <motion.div className="bg-gradient-to-br from-cyan-400/20 to-blue-600/20 backdrop-blur-sm rounded-3xl p-8 border border-cyan-400/30"
            initial={{opacity: 0, y:-10}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 1.2, ease: "easeInOut", delay: 0.5}}
            >
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&h=800&fit=crop&crop=center"
                alt="Hero Visual"
                className="w-full h-1/3 object-cover rounded-2xl"
              />
            </motion.div>
        </div>



      </div>
    </div>
  );
};

export default BiziTercihEt;
