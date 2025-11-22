import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from "axios";
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullname) newErrors.fullname = t('error_name_required');
    else if (formData.fullname.length < 2) newErrors.fullname = t('error_name_short');

    if (!formData.email) newErrors.email = t('error_email_required');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('error_email_invalid');

    if (!formData.password) newErrors.password = t('error_password_required');
    else if (formData.password.length < 6) newErrors.password = t('error_password_short');
    else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) newErrors.password = t('error_password_case');

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
      email: formData.email,
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, text: '', color: '' };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;

    if (strength <= 2) return { strength, text: t('weak'), color: 'bg-red-500' };
    if (strength <= 3) return { strength, text: t('medium'), color: 'bg-yellow-500' };
    return { strength, text: t('strong'), color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

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
                  } rounded-lg text-white`}
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
                  } rounded-lg text-white`}
                  placeholder="example@email.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                {t('password')}
              </label>
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
                  className={`block w-full pl-10 pr-12 py-3 bg-slate-900/50 border ${
                    errors.password ? 'border-red-500' : 'border-slate-600'
                  } rounded-lg text-white`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}

              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>{t('password_strength')}</span>
                    <span className={
                      passwordStrength.strength >= 3 ? 'text-green-400' :
                      passwordStrength.strength >= 2 ? 'text-yellow-400' :
                      'text-red-400'
                    }>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
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
                  } rounded-lg text-white`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 rounded border-slate-600 bg-slate-900/50 text-cyan-500"/>
              </div>
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                <Link to="/terms" className="text-cyan-400 hover:text-cyan-300">{t('terms_of_use')}</Link> {t('and')}
                <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300"> {t('privacy_policy')}</Link> {t('accept_terms')}
              </label>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold py-3 rounded-lg">
              {isLoading ? t('registering') : t('create_account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">{t('already_have_account')}{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">{t('login')}</Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-gray-400 hover:text-gray-300 inline-flex items-center">
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
