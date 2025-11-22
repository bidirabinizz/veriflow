import React from 'react';
import { motion } from 'framer-motion';

// Animasyon için varyantlar (kurallar)
// 1. Ana kapsayıcı için kurallar
const containerVariants = {
  start: {
    transition: {
      staggerChildren: 0.2, // Noktaların animasyonları arasındaki gecikme
    },
  },
  end: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// 2. Her bir nokta için kurallar
const dotVariants = {
  start: {
    y: '0%', // Başlangıç pozisyonu
  },
  end: {
    y: '100%', // Bitiş pozisyonu (aşağı inecek)
  },
};

// 3. Zıplama animasyonunun nasıl olacağı
const dotTransition = {
  duration: 0.5,
  repeat: Infinity,      // Sonsuz tekrar et
  repeatType: 'reverse', // Tersine dönerek tekrarla (aşağı-yukarı hareketi için)
  ease: 'easeInOut',
};

function YuklenmeEkrani() {
  return (
    // motion.div, Framer Motion'ın animasyon yeteneklerini div'e ekler.
    <motion.div
      // Stil: Tüm ekranı kapla, ortala, en üstte dursun.
      className="fixed top-0 left-0 w-full h-full bg-slate-900 flex justify-center items-center z-50"
      
      // Animasyon: Bileşen ekrandan kaldırılırken 1 saniyede yavaşça kaybolsun.
      exit={{ opacity: 0, transition: { duration: 1, ease: 'easeInOut' } }}
    >
      {/* Noktaları tutan kapsayıcı */}
      <motion.div
        className="flex space-x-4"
        variants={containerVariants} // Kapsayıcı kurallarını uygula
        initial="start"
        animate="end"
      >
        {/* Zıplayan noktalar */}
        <motion.span
          className="block w-6 h-6 bg-cyan-400 rounded-full"
          variants={dotVariants}       // Nokta kurallarını uygula
          transition={dotTransition}   // Zıplama animasyonunu uygula
        />
        <motion.span
          className="block w-6 h-6 bg-cyan-400 rounded-full"
          variants={dotVariants}
          transition={dotTransition}
        />
        <motion.span
          className="block w-6 h-6 bg-cyan-400 rounded-full"
          variants={dotVariants}
          transition={dotTransition}
        />
      </motion.div>
    </motion.div>
  );
}

export default YuklenmeEkrani;