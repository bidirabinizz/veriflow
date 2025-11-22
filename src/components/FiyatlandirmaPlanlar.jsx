import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FiyatlandirmaPlanlar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: '0',
      description: 'Başlamak için ideal',
      icon: Sparkles,
      color: 'from-gray-400 to-gray-600',
      borderColor: 'border-gray-400/30',
      bgColor: 'from-gray-400/20 to-gray-600/20',
      popular: false,
      features: [
        '5 Aktif Lisans',
        'Temel API Erişimi',
        'Topluluk Desteği',
        'Aylık Raporlar',
        '1 Uygulama Entegrasyonu'
      ]
    },
    {
      name: 'Pro',
      price: '49',
      description: 'Profesyoneller için',
      icon: Zap,
      color: 'from-cyan-400 to-cyan-600',
      borderColor: 'border-cyan-400/30',
      bgColor: 'from-cyan-400/20 to-cyan-600/20',
      popular: true,
      features: [
        '50 Aktif Lisans',
        'Gelişmiş API Erişimi',
        'Öncelikli Destek',
        'Haftalık Raporlar',
        '5 Uygulama Entegrasyonu',
        'Özel Dashboard',
        'Webhook Desteği'
      ]
    },
    {
      name: 'Plus',
      price: '149',
      description: 'Kurumsal çözümler',
      icon: Crown,
      color: 'from-purple-400 to-pink-600',
      borderColor: 'border-purple-400/30',
      bgColor: 'from-purple-400/20 to-pink-600/20',
      popular: false,
      features: [
        'Sınırsız Lisans',
        'Tam API Erişimi',
        '7/24 Premium Destek',
        'Gerçek Zamanlı Raporlar',
        'Sınırsız Uygulama Entegrasyonu',
        'Özel Dashboard & Analytics',
        'Webhook & Automation',
        'White Label Çözümler',
        'Özel SLA'
      ]
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: "easeOut"
      }
    })
  };

  const handlePlanSelect = (planName) => {
    console.log(`${planName} planı seçildi`);
    
    // Plan seçimine göre yönlendirme
    switch(planName) {
      case 'Free':
        // Ücretsiz plan için kayıt sayfasına yönlendir
        navigate('/login');
        break;
      case 'Pro':
        // Pro plan için ödeme sayfasına yönlendir
        navigate('/login');
        break;
      case 'Plus':
        // Plus plan için ödeme sayfasına yönlendir
        navigate('/login');
        break;
      default:
        // Varsayılan olarak kayıt sayfasına yönlendir
        navigate('/login');
    }
  };

  // Alternatif: Eğer login sayfasına yönlendirmek isterseniz
  const handleFreePlan = () => {
    navigate('/login?plan=free');
  };

  const handleProPlan = () => {
    navigate('/login?plan=pro');
  };

  const handlePlusPlan = () => {
    navigate('/login?plan=plus');
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      {/* Başlık */}
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          Size Uygun <span className="text-cyan-400">Planı Seçin</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          İhtiyaçlarınıza uygun lisans yönetim planını seçin ve hemen başlayın
        </p>
      </motion.div>

      {/* Planlar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {plans.map((plan, index) => {
          const IconComponent = plan.icon;
          return (
            <motion.div
              key={plan.name}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ 
                scale: 1.02, 
                y: -5,
                transition: { duration: 0.2 }
              }}
              className={`relative backdrop-blur-xl bg-gradient-to-br ${plan.bgColor} border ${plan.borderColor} rounded-3xl p-6 lg:p-8 hover:shadow-2xl transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 transform lg:scale-105' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    En Popüler
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
                  <IconComponent className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                </div>
              </div>

              {/* Plan Adı */}
              <h3 className="text-xl lg:text-2xl font-bold text-white text-center mb-2">
                {plan.name}
              </h3>

              {/* Açıklama */}
              <p className="text-gray-400 text-center mb-6 text-sm lg:text-base">
                {plan.description}
              </p>

              {/* Fiyat */}
              <div className="text-center mb-6 lg:mb-8">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl lg:text-5xl font-bold text-white">${plan.price}</span>
                  {plan.price !== '0' && (
                    <span className="text-gray-400 text-lg">/ay</span>
                  )}
                </div>
              </div>

              {/* Özellikler Listesi */}
              <ul className="space-y-3 lg:space-y-4 mb-6 lg:mb-8">
                {plan.features.map((feature, idx) => (
                  <motion.li 
                    key={idx} 
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (idx * 0.1) }}
                  >
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center mt-0.5`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300 text-sm lg:text-base leading-relaxed">
                      {feature}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA Buton */}
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: plan.popular ? '0 10px 30px -10px rgba(34, 211, 238, 0.5)' : '0 10px 30px -10px rgba(255, 255, 255, 0.1)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePlanSelect(plan.name)}
                className={`w-full py-3 lg:py-4 rounded-xl font-semibold transition-all duration-200 text-base lg:text-lg ${
                  plan.popular
                    ? 'bg-gradient-to-r from-cyan-400 to-cyan-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30'
                }`}
              >
                {plan.name === 'Free' ? 'Ücretsiz Başla' : 'Hemen Başla'}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Alt Bilgi */}
      <motion.div
        className="text-center mt-12 lg:mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <p className="text-gray-400 mb-6 text-base lg:text-lg">
          Tüm planlar 14 gün ücretsiz deneme ile gelir. Kredi kartı gerekmez.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-sm lg:text-base text-gray-500">
          <span className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 lg:w-5 lg:h-5 text-cyan-400" />
            İstediğiniz zaman iptal edin
          </span>
          <span className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 lg:w-5 lg:h-5 text-cyan-400" />
            Güvenli ödeme
          </span>
          <span className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 lg:w-5 lg:h-5 text-cyan-400" />
            7/24 Destek
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default FiyatlandirmaPlanlar;