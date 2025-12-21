import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Code, ShieldCheck, Zap, Layers } from "lucide-react";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      icon: Code,
      question: "Yazılımıma entegre etmesi ne kadar sürer?",
      answer: "VeriFlow, geliştirici dostu yapısıyla öne çıkar. C#, C++, Python ve PHP için hazır kütüphanelerimiz ve detaylı API dokümantasyonumuz sayesinde entegrasyon ortalama 10-15 dakika sürer."
    },
    {
      icon: ShieldCheck,
      question: "Crack veya Bypass koruması sağlıyor musunuz?",
      answer: "Evet. Gelişmiş HWID (Donanım Kimliği) kilitleme, sunucu taraflı doğrulama ve şifreli veri iletişimi sayesinde yazılımınızın izinsiz kopyalanmasını ve çoklu kullanımı engelliyoruz."
    },
    {
      icon: Layers,
      question: "Hangi platformları ve dilleri destekliyorsunuz?",
      answer: "RESTful API mimarimiz sayesinde internete bağlanabilen her dil ve platformu destekliyoruz. Windows, Linux, macOS veya web tabanlı uygulamalarınızda güvenle kullanabilirsiniz."
    },
    {
      icon: Zap,
      question: "Otomatik teslimat ve bayi sistemi var mı?",
      answer: "Kesinlikle. Webhook desteği ile e-ticaret sitenizden (Shopify, WooCommerce vb.) otomatik lisans oluşturabilir, bayilerinize özel paneller tanımlayarak satış ağınızı yönetebilirsiniz."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Geliştiricilerin <span className="text-cyan-400">Merak Ettikleri</span>
        </h2>
        <p className="text-gray-400">
          Projelerinizi güvence altına alırken aklınıza takılabilecek sorular.
        </p>
      </div>

      <div className="grid gap-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-slate-800 rounded-2xl bg-slate-900/50 overflow-hidden hover:border-cyan-500/30 transition-all duration-300"
          >
            <button
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-slate-800 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors duration-300`}>
                  <faq.icon size={20} />
                </div>
                <span className="text-lg font-medium text-white group-hover:text-cyan-400 transition-colors">{faq.question}</span>
              </div>
              <span className="text-gray-500 group-hover:text-cyan-400 transition-colors">
                {activeIndex === index ? <Minus size={20} /> : <Plus size={20} />}
              </span>
            </button>

            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-6 pb-6 pl-20 text-gray-400 leading-relaxed border-t border-slate-800/50 pt-4">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;