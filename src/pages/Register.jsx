import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config/api';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Tooltip görünürlüğü
  const [showRules, setShowRules] = useState(false);

  // Şifre kriterleri
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    upperLower: false,
    number: false,
    special: false
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullname) newErrors.fullname = t('error_name_required');
    else if (formData.fullname.length < 2) newErrors.fullname = t('error_name_short');

    // ✅ GÜÇLENDİRİLMİŞ EMAIL KONTROLÜ
    // Standart dışı karakterleri, boşlukları ve hatalı formatları engeller.
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!formData.email) {
      newErrors.email = t('error_email_required');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi giriniz (Özel karakter veya boşluk içeremez)';
    }

    if (!formData.password) {
      newErrors.password = t('error_password_required');
    } else {
      if (!passwordCriteria.length) newErrors.password = 'Şifre en az 7 karakter olmalıdır';
      else if (!passwordCriteria.upperLower) newErrors.password = t('error_password_case');
      else if (!passwordCriteria.number) newErrors.password = 'Şifre en az bir rakam içermelidir';
      else if (!passwordCriteria.special) newErrors.password = 'Şifre en az bir sembol içermelidir';
    }

    if (!formData.confirmPassword) newErrors.confirmPassword = t('error_confirm_required');
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = t('error_password_mismatch');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: formData.fullname,
          email: formData.email, // Boşluksuz hali gider
          password: formData.password
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || t('register_failed'));
      alert(data.message || t('register_success'));
      navigate('/login');
    } catch (error) {
      alert(error.message || t('register_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // ✅ EMAIL İÇİN ÖZEL KORUMA: Boşlukları anında sil
    if (name === 'email') {
      value = value.replace(/\s/g, ''); // Boşluk tuşuna basılsa bile yazmaz
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'password') {
      setPasswordCriteria({
        length: value.length >= 7,
        upperLower: /(?=.*[a-z])(?=.*[A-Z])/.test(value),
        number: /(?=.*\d)/.test(value),
        special: /(?=.*[@$!%*?&.])/.test(value)
      });
    }
  };

  // Kriter Maddesi Bileşeni
  const RequirementItem = ({ met, text }) => (
    <div className={`flex items-center space-x-2 text-xs font-medium transition-all duration-200 ${met ? 'text-green-400' : 'text-red-400'}`}>
      {met ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 mb-4">
              <span className="text-white font-bold text-2xl">CW</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{t('create_account')}</h2>
            <p className="text-gray-400">{t('start_free')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Fullname */}
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-300 mb-2">
                {t('full_name')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 bg-slate-900/50 border ${
                    errors.fullname ? 'border-red-500' : 'border-slate-600'
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                  placeholder={t('placeholder_name')}
                />
              </div>
              {errors.fullname && <p className="mt-1 text-sm text-red-400">{errors.fullname}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                {t('email_address')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 bg-slate-900/50 border ${
                    errors.email ? 'border-red-500' : 'border-slate-600'
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                  placeholder="example@email.com"
                />
              </div>
              {/* Hata mesajı için extra açıklama */}
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="relative group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                {t('password')}
              </label>
              
              {/* Tooltip */}
              {showRules && (
                <div className="hidden md:block absolute left-full top-0 ml-4 w-60 p-4 bg-slate-900 border border-slate-600 rounded-xl shadow-2xl z-20">
                  <div className="absolute top-4 -left-1.5 w-3 h-3 bg-slate-900 border-l border-b border-slate-600 transform rotate-45"></div>
                  
                  <div className="space-y-2">
                    <RequirementItem met={passwordCriteria.length} text="En az 7 karakter" />
                    <RequirementItem met={passwordCriteria.upperLower} text="Büyük & Küçük harf" />
                    <RequirementItem met={passwordCriteria.number} text="En az 1 rakam" />
                    <RequirementItem met={passwordCriteria.special} text="Sembol (@$!%*?&.)" />
                  </div>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setShowRules(true)}
                  onBlur={() => setShowRules(false)}
                  className={`block w-full pl-10 pr-12 py-3 bg-slate-900/50 border ${
                    errors.password ? 'border-red-500' : 'border-slate-600'
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                  placeholder="••••••••"
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Mobile Tooltip */}
              {showRules && (
                <div className="md:hidden mt-2 p-3 bg-slate-900/50 border border-slate-600 rounded-lg">
                   <div className="grid grid-cols-2 gap-2">
                      <RequirementItem met={passwordCriteria.length} text="Min 7 karakter" />
                      <RequirementItem met={passwordCriteria.upperLower} text="Büyük/Küçük" />
                      <RequirementItem met={passwordCriteria.number} text="Rakam" />
                      <RequirementItem met={passwordCriteria.special} text="Sembol" />
                   </div>
                </div>
              )}

              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                {t('confirm_password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-12 py-3 bg-slate-900/50 border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input 
                  id="terms" 
                  name="terms" 
                  type="checkbox" 
                  required 
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900/50 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                />
              </div>
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                <Link to="/terms" className="text-cyan-400 hover:text-cyan-300">{t('terms_of_use')}</Link> {t('and')}
                <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300"> {t('privacy_policy')}</Link> {t('accept_terms')}
              </label>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('registering')}
                </span>
              ) : t('create_account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">{t('already_have_account')}{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-200">{t('login')}</Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-gray-400 hover:text-gray-300 transition-colors duration-200 inline-flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('back_home')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}