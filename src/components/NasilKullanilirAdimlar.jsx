import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, LogIn, Key, Code, CheckCircle, Rocket, X } from 'lucide-react';
import { API_BASE_URL } from '../config/api'; // ✅ BU IMPORT'U EKLE

const NasilKullanilirAdimlar = () => {
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const steps = [
    {
      step: '01',
      title: 'Kayıt Ol',
      description: 'Hesabınızı oluşturun ve sisteme giriş yapın',
      icon: UserPlus,
      details: [
        'E-posta adresinizle ücretsiz hesap oluşturun',
        'E-posta doğrulaması yapın',
        'Profil bilgilerinizi tamamlayın'
      ],
      color: 'from-cyan-400 to-cyan-600',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-400/30'
    },
    {
      step: '02',
      title: 'Giriş Yap',
      description: 'Dashboard\'a erişim sağlayın',
      icon: LogIn,
      details: [
        'E-posta ve şifrenizle giriş yapın',
        'İki faktörlü kimlik doğrulama (opsiyonel)',
        'Dashboard\'unuza yönlendirileceksiniz'
      ],
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-400/30'
    },
    {
      step: '03',
      title: 'Lisans Oluştur',
      description: 'Uygulamanız için lisans anahtarı oluşturun',
      icon: Key,
      details: [
        'Uygulama adını ve detaylarını girin',
        'Lisans tipini seçin (Free, Pro, Plus)',
        'Lisans anahtarınızı kopyalayın'
      ],
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-400/30'
    },
    {
      step: '04',
      title: 'API ile Bağla',
      description: 'Sisteminizi API aracılığıyla entegre edin',
      icon: Code,
      details: [
        'API anahtarınızı alın',
        'SDK veya REST API kullanın',
        'Lisans doğrulaması kodunu ekleyin'
      ],
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-400/30'
    },
    {
      step: '05',
      title: 'Test Et',
      description: 'Entegrasyonunuzu test edin',
      icon: CheckCircle,
      details: [
        'Test modunda lisans doğrulaması yapın',
        'Hata ayıklama yapın',
        'Logları kontrol edin'
      ],
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-400/30'
    },
    {
      step: '06',
      title: 'Yayınla',
      description: 'Uygulamanızı canlıya alın',
      icon: Rocket,
      details: [
        'Production moduna geçin',
        'Kullanıcı lisanslarını yönetin',
        'Raporları takip edin'
      ],
      color: 'from-pink-400 to-pink-600',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-400/30'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
      {/* Başlık */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl lg:text-6xl font-bold text-cyan-400 mb-4">
          Nasıl Kullanılır?
        </h1>
        <p className="text-gray-400 text-xl max-w-3xl mx-auto">
          AuthFlow lisans yönetim sistemini kullanmaya başlamak için adım adım rehber
        </p>
      </motion.div>

      {/* Desktop View - Zigzag Layout */}
      <div className="hidden lg:block">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          {steps.map((stepItem, index) => {
            const IconComponent = stepItem.icon;
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={stepItem.step}
                variants={itemVariants}
                className={`flex items-center gap-12 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {/* Content */}
                <div className={`flex-1 ${isEven ? 'text-right' : 'text-left'}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`backdrop-blur-xl bg-white/5 border ${stepItem.borderColor} rounded-2xl p-8 hover:bg-white/10 transition-all duration-300`}
                  >
                    <div className={`flex items-center gap-4 mb-4 ${isEven ? 'justify-end' : 'justify-start'}`}>
                      <div className={`w-12 h-12 rounded-xl ${stepItem.bgColor} border ${stepItem.borderColor} flex items-center justify-center`}>
                        <span className={`bg-gradient-to-r ${stepItem.color} bg-clip-text text-transparent font-bold text-lg`}>
                          {stepItem.step}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white">{stepItem.title}</h3>
                    </div>
                    <p className="text-gray-400 mb-6">{stepItem.description}</p>
                    <ul className={`space-y-2 ${isEven ? 'text-right' : 'text-left'}`}>
                      {stepItem.details.map((detail, idx) => (
                        <li key={idx} className={`flex items-center gap-2 text-gray-300 text-sm ${isEven ? 'justify-end' : 'justify-start'}`}>
                          {isEven && <span>{detail}</span>}
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${stepItem.color}`}></div>
                          {!isEven && <span>{detail}</span>}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                {/* Icon Circle */}
                <div className="flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${stepItem.color} flex items-center justify-center shadow-2xl`}
                  >
                    <IconComponent className="w-12 h-12 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Mobile View - Vertical Layout */}
      <div className="lg:hidden space-y-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {steps.map((stepItem) => {
            const IconComponent = stepItem.icon;

            return (
              <motion.div
                key={stepItem.step}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className={`backdrop-blur-xl bg-white/5 border ${stepItem.borderColor} rounded-2xl p-6 hover:bg-white/10 transition-all duration-300`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stepItem.color} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className={`w-10 h-10 rounded-lg ${stepItem.bgColor} border ${stepItem.borderColor} flex items-center justify-center mb-2`}>
                      <span className={`bg-gradient-to-r ${stepItem.color} bg-clip-text text-transparent font-bold`}>
                        {stepItem.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{stepItem.title}</h3>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">{stepItem.description}</p>
                <ul className="space-y-2">
                  {stepItem.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${stepItem.color} mt-1.5 flex-shrink-0`}></div>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* API Örnek Kod Bölümü */}
      <motion.div
        className="mt-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="backdrop-blur-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border border-cyan-400/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Code className="w-6 h-6 text-cyan-400" />
            Örnek API Kullanımı
          </h3>
          <div className="bg-slate-900/80 rounded-xl p-6 overflow-x-auto">
            <pre className="text-sm text-gray-300">
              <code>{`// Lisans doğrulama örneği
const verifyLicense = async (licenseKey) => {
  const response = await fetch('${API_BASE_URL}/api/verify-license', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({ licenseKey })
  });
  
  const data = await response.json();
  return data.valid;
};`}</code>
            </pre>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <button 
              onClick={() => setIsDocModalOpen(true)}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
            >
              Dokümantasyonu İncele
            </button>
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg font-semibold transition-colors">
              SDK İndir
            </button>
          </div>
        </div>
      </motion.div>

      {/* Dokümantasyon Modal */}
      {isDocModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-900 border border-cyan-400/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-slate-900 border-b border-cyan-400/30 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-cyan-400">AuthFlow Dokümantasyon</h2>
              <button 
                onClick={() => setIsDocModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Kurulum Bölümü */}
              <section>
                <h3 className="text-xl font-bold text-white mb-4">1. Kurulum</h3>
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-300 mb-2">NPM ile Kurulum</h4>
                  <pre className="bg-slate-900 p-4 rounded text-sm text-gray-300 overflow-x-auto">
                    <code>npm install authflow-sdk</code>
                  </pre>
                </div>
              </section>

              {/* Başlangıç Bölümü */}
              <section>
                <h3 className="text-xl font-bold text-white mb-4">2. Başlangıç</h3>
                <div className="space-y-4">
                  <div className="bg-slate-800 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-cyan-300 mb-2">SDK'yı Projenize Ekleyin</h4>
                    <pre className="bg-slate-900 p-4 rounded text-sm text-gray-300 overflow-x-auto">
                      <code>{`import AuthFlow from 'authflow-sdk';

const authflow = new AuthFlow({
  apiKey: 'YOUR_API_KEY',
  baseURL: '${API_BASE_URL}', // ✅ GÜNCELLENDİ
  environment: 'sandbox' // veya 'production'
});`}</code>
                    </pre>
                  </div>
                </div>
              </section>

              {/* Lisans Yönetimi */}
              <section>
                <h3 className="text-xl font-bold text-white mb-4">3. Lisans Yönetimi</h3>
                <div className="space-y-4">
                  <div className="bg-slate-800 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-cyan-300 mb-2">Lisans Oluşturma</h4>
                    <pre className="bg-slate-900 p-4 rounded text-sm text-gray-300 overflow-x-auto">
                      <code>{`// Yeni lisans oluştur
const license = await authflow.licenses.create({
  productId: 'prod_123',
  plan: 'premium',
  userId: 'user_456'
});`}</code>
                    </pre>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-cyan-300 mb-2">Lisans Doğrulama</h4>
                    <pre className="bg-slate-900 p-4 rounded text-sm text-gray-300 overflow-x-auto">
                      <code>{`// Lisansı doğrula
const isValid = await authflow.licenses.verify(licenseKey);

if (isValid) {
  // Uygulama erişimine izin ver
} else {
  // Erişimi engelle
}`}</code>
                    </pre>
                  </div>
                </div>
              </section>

              {/* API Referansı */}
              <section>
                <h3 className="text-xl font-bold text-white mb-4">4. API Referansı</h3>
                <div className="space-y-4">
                  <div className="bg-slate-800 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-cyan-300 mb-2">Kullanıcı İşlemleri</h4>
                    <ul className="text-gray-300 space-y-2">
                      <li><code className="bg-slate-700 px-2 py-1 rounded">authflow.users.create()</code> - Yeni kullanıcı oluştur</li>
                      <li><code className="bg-slate-700 px-2 py-1 rounded">authflow.users.get()</code> - Kullanıcı bilgilerini getir</li>
                      <li><code className="bg-slate-700 px-2 py-1 rounded">authflow.users.update()</code> - Kullanıcı bilgilerini güncelle</li>
                    </ul>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-cyan-300 mb-2">Lisans İşlemleri</h4>
                    <ul className="text-gray-300 space-y-2">
                      <li><code className="bg-slate-700 px-2 py-1 rounded">authflow.licenses.create()</code> - Lisans oluştur</li>
                      <li><code className="bg-slate-700 px-2 py-1 rounded">authflow.licenses.verify()</code> - Lisans doğrula</li>
                      <li><code className="bg-slate-700 px-2 py-1 rounded">authflow.licenses.revoke()</code> - Lisansı iptal et</li>
                      <li><code className="bg-slate-700 px-2 py-1 rounded">authflow.licenses.list()</code> - Lisansları listele</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Hata Yönetimi */}
              <section>
                <h3 className="text-xl font-bold text-white mb-4">5. Hata Yönetimi</h3>
                <div className="bg-slate-800 rounded-lg p-4">
                  <pre className="bg-slate-900 p-4 rounded text-sm text-gray-300 overflow-x-auto">
                    <code>{`try {
  const license = await authflow.licenses.verify(licenseKey);
} catch (error) {
  switch (error.code) {
    case 'INVALID_LICENSE':
      console.log('Geçersiz lisans anahtarı');
      break;
    case 'EXPIRED_LICENSE':
      console.log('Lisans süresi dolmuş');
      break;
    case 'RATE_LIMIT_EXCEEDED':
      console.log('API limiti aşıldı');
      break;
    default:
      console.log('Bilinmeyen hata:', error.message);
  }
}`}</code>
                  </pre>
                </div>
              </section>

              {/* Best Practices */}
              <section>
                <h3 className="text-xl font-bold text-white mb-4">6. En İyi Uygulamalar</h3>
                <ul className="text-gray-300 space-y-2 bg-slate-800 rounded-lg p-4">
                  <li>• API anahtarlarınızı asla client-side kodda saklamayın</li>
                  <li>• Tüm lisans doğrulama işlemlerini backend'te yapın</li>
                  <li>• Rate limiting için uygun cache mekanizmaları kullanın</li>
                  <li>• Production'a geçmeden önce sandbox ortamında test yapın</li>
                  <li>• Hata durumlarında kullanıcıya anlamlı mesajlar gösterin</li>
                </ul>
              </section>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NasilKullanilirAdimlar;