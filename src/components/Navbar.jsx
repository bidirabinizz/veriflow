import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactCountryFlag from "react-country-flag";
import { Crown, Zap, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api'; // ✅ BU IMPORT'U EKLE

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [openLang, setOpenLang] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [userPlan, setUserPlan] = useState(null);

  // ✅ SCROLL DAVRANIŞI
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY === 0) {
        setIsVisible(true);
      } 
      else if (currentScrollY > lastScrollY && currentScrollY > 70) {
        setIsVisible(false);
      } 
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [lastScrollY]);

  // ✅ PLAN BİLGİSİNİ GETİR
  const fetchUserPlan = async (token) => {
    try {
      // ✅ DEĞİŞTİR: localhost yerine API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/user/plan`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserPlan(data.user_plan);
      }
    } catch (error) {
      console.error("❌ NAVBAR - Plan fetch error:", error);
    }
  };

  // ✅ AUTH KONTROLÜ
  useEffect(() => {
    checkAuthStatus();
    
    window.addEventListener('storage', checkAuthStatus);
    window.addEventListener('authChange', checkAuthStatus);
    window.addEventListener('focus', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authChange', checkAuthStatus);
      window.removeEventListener('focus', checkAuthStatus);
    };
  }, [location]);

  // ✅ PROFİL FOTOĞRAFI URL'İ OLUŞTURMA
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    // ✅ DEĞİŞTİR: localhost yerine API_BASE_URL
    return `${API_BASE_URL}${avatarPath}`;
  };

  // ✅ DATABASE'DEN AVATAR BİLGİSİNİ ÇEK
  const fetchUserAvatar = async (token) => {
    try {
      // ✅ DEĞİŞTİR: localhost yerine API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("�️ NAVBAR - Avatar data:", data.user?.avatar_path);
        
        if (data.user?.avatar_path) {
          setAvatarUrl(getAvatarUrl(data.user.avatar_path));
        } else {
          setAvatarUrl(null);
        }
        return data.user;
      }
      return null;
    } catch (error) {
      console.error("❌ NAVBAR - Avatar fetch error:", error);
      return null;
    }
  };

  // ✅ PLAN ICON'INI BELİRLE
  const getPlanIcon = (planName) => {
    switch(planName) {
      case 'Plus':
        return <Crown className="h-4 w-4 text-purple-400" />;
      case 'Pro':
        return <Zap className="h-4 w-4 text-cyan-400" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-400" />;
    }
  };

  // ✅ PLAN RENGİNİ BELİRLE
  const getPlanColor = (planName) => {
    switch(planName) {
      case 'Plus': return 'text-purple-400 bg-purple-500/20';
      case 'Pro': return 'text-cyan-400 bg-cyan-500/20';
      default: return 'text-green-400 bg-green-500/20';
    }
  };

  // ✅ GÜNCELLENMİŞ AUTH KONTROLÜ
  const checkAuthStatus = async () => {
    try {
      const rememberMe = localStorage.getItem("rememberMe") === "true";
      const token = rememberMe 
        ? localStorage.getItem("token") 
        : sessionStorage.getItem("token");
      const userData = rememberMe 
        ? localStorage.getItem("user") 
        : sessionStorage.getItem("user");
      
      console.log("� NAVBAR - Token check:", !!token);
      
      if (token && userData) {
        try {
          // ✅ DEĞİŞTİR: localhost yerine API_BASE_URL
          const response = await fetch(`${API_BASE_URL}/dashboard`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const parsedUser = JSON.parse(userData);
            setIsLoggedIn(true);
            setUser(parsedUser);
            
            // ✅ AVATAR VE PLAN BİLGİSİNİ ÇEK
            const dbUser = await fetchUserAvatar(token);
            await fetchUserPlan(token);
            
            if (dbUser?.avatar_path) {
              setAvatarUrl(getAvatarUrl(dbUser.avatar_path));
            } else {
              setAvatarUrl(null);
            }
            
          } else {
            console.log("� NAVBAR - Token geçersiz, temizleniyor...");
            clearAuthData();
          }
        } catch (error) {
          console.log("� NAVBAR - Token check error, logging out...");
          clearAuthData();
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setAvatarUrl(null);
        setUserPlan(null);
      }
    } catch (error) {
      console.error("❌ NAVBAR ERROR:", error);
      clearAuthData();
    }
  };

  // ✅ AUTH DATA TEMİZLEME
  const clearAuthData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setAvatarUrl(null);
    setUserPlan(null);
  };

  const handleLogout = () => {
    clearAuthData();
    setOpenUserMenu(false);
    navigate('/');
  };

  const linkClass = (path) =>
    `px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
      location.pathname === path
        ? "bg-cyan-600 text-white"
        : "text-gray-300 hover:text-cyan-400"
    }`;

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setOpenLang(false);
  };

  const { t } = useTranslation();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">CW</span>
          </div>
        </Link>

        {/* Navigasyon Linkleri */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className={linkClass("/")}> {t('navbar_anasayfa')} </Link>
          <Link to="/fiyatlandirma" className={linkClass("/fiyatlandirma")}> {t('navbar_fiyatlandirma')} </Link>
          <Link to="/nasilkullanilir" className={linkClass("/nasilkullanilir")}> {t('navbar_nasilkullanilir')} </Link>
          
          {isLoggedIn && (
            <>
              <Link to="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
            </>
          )}
        </div>

        {/* Sağ Taraf - Login/Register veya Kullanıcı Menüsü */}
        <div className="flex items-center space-x-4 relative">
          {isLoggedIn ? (
            // ✅ GİRİŞ YAPILMIŞSA - Kullanıcı Menüsü (AVATARLI + PLAN BİLGİLİ)
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 hidden md:block">
                Hoş geldin, {user?.fullname || user?.email || 'Kullanıcı'}
              </span>
              
              {/* Kullanıcı Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenUserMenu(!openUserMenu)}
                  className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors duration-200"
                >
                  {/* ✅ AVATAR GÖRSELLİĞİ */}
                  <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center overflow-hidden border border-slate-400">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Profil" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('�️ Navbar avatar load failed');
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {(user?.fullname || user?.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:block">▾</span>
                </button>
                
                {openUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg z-50 border border-slate-700">
                    {/* ✅ DROPDOWN HEADER - AVATAR + PLAN BİLGİSİ */}
                    <div className="px-4 py-3 border-b border-slate-700">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center overflow-hidden border border-slate-400">
                          {avatarUrl ? (
                            <img 
                              src={avatarUrl} 
                              alt="Profil" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {(user?.fullname || user?.email || 'U').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">
                            {user?.fullname || 'Kullanıcı'}
                          </p>
                          <p className="text-sm text-gray-400 truncate">
                            {user?.email || ''}
                          </p>
                        </div>
                      </div>
                      
                      {/* ✅ PLAN BİLGİSİ */}
                      {userPlan && (
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1 rounded ${getPlanColor(userPlan.plan_name)}`}>
                              {getPlanIcon(userPlan.plan_name)}
                            </div>
                            <span className="text-xs font-medium text-gray-300">
                              {userPlan.plan_name} Plan
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {userPlan.active_licenses}/{userPlan.license_limit} Lisans
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* ✅ MENÜ LİNKLERİ */}
                    <Link 
                      to="/dashboard" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setOpenUserMenu(false)}
                    >
                      <span>�</span>
                      <span>Dashboard</span>
                    </Link>
                    
                    <Link 
                      to="/dashboard/profile" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setOpenUserMenu(false)}
                    >
                      <span>�</span>
                      <span>Profilim</span>
                    </Link>

                    <Link 
                      to="/dashboard/licenses" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setOpenUserMenu(false)}
                    >
                      <span>�</span>
                      <span>Lisanslarım</span>
                    </Link>

                    {/* ✅ PLAN YÜKSELTME LİNKİ (Free plan'taysa) */}
                    {userPlan && userPlan.plan_name === 'Free' && (
                      <Link 
                        to="/fiyatlandirma" 
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-cyan-400 hover:bg-gray-700 hover:text-cyan-300 border-t border-slate-700"
                        onClick={() => setOpenUserMenu(false)}
                      >
                        <span>�</span>
                        <span>Planını Yükselt</span>
                      </Link>
                    )}
                    
                    <div className="border-t border-slate-700">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
                      >
                        <span>�</span>
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // ❌ GİRİŞ YAPILMAMIŞSA - Login/Register Butonları
            <>
              <Link 
                to="/login"
                className={`px-3 py-2 rounded-md font-medium text-gray-300 hover:text-cyan-400 transition-colors duration-200 ${
                  location.pathname === "/login" ? "bg-cyan-600 text-white" : ""
                }`}
              >
                {t('giris_yap')}
              </Link>
              <Link 
                to="/register"
                className={`bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 ${
                  location.pathname === "/register" ? "bg-cyan-600" : ""
                }`}
              >
                {t('kayit_ol')}
              </Link>
            </>
          )}

          {/* DİL DEĞİŞTİRME YERİ */}
          <div className="relative">
            <button
              onClick={() => setOpenLang(!openLang)}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-200 border border-transparent hover:border-cyan-500/30"
            >
              {/* Mevcut dilin bayrağını göstermek için */}
              {i18n.language === 'tr' ? (
                <ReactCountryFlag 
                  countryCode="TR" 
                  svg
                  style={{
                    width: '1.5em',
                    height: '1.5em',
                    filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.3))'
                  }}
                  title="Türkiye"
                />
              ) : (
                <ReactCountryFlag 
                  countryCode="US" 
                  svg
                  style={{
                    width: '1.5em',
                    height: '1.5em',
                    filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.3))'
                  }}
                  title="United States"
                />
              )}
              <span className="font-medium">{i18n.language.toUpperCase()}</span>
            </button>
            
            {openLang && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-50 border border-slate-700 overflow-hidden">
                {/* Türkçe dil Seçeneği */}
                <button 
                  onClick={() => changeLanguage('tr')}
                  className={`flex items-center space-x-3 w-full text-left px-4 py-3 transition-all duration-200 ${
                    i18n.language === 'tr' 
                      ? 'bg-cyan-600/20 text-cyan-400 border-r-2 border-cyan-400' 
                      : 'text-gray-300 bg-gray-700 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="relative">
                    <ReactCountryFlag 
                      countryCode="TR" 
                      svg
                      style={{
                        width: '1.5em',
                        height: '1.5em',
                        filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.3))'
                      }}
                      title="Türkiye"
                    />
                    {i18n.language === 'tr' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-gray-800"></div>
                    )}
                  </div>
                  <div>
                    <div className={`font-medium ${i18n.language === 'tr' ? 'text-cyan-400' : 'text-gray-300'}`}>
                      Türkçe
                    </div>
                    <div className={`text-xs ${i18n.language === 'tr' ? 'text-cyan-300' : 'text-gray-400'}`}>
                      TR
                    </div>
                  </div>
                </button>
                
                {/* English dil Seçeneği */}
                <button 
                  onClick={() => changeLanguage('en')}
                  className={`flex items-center space-x-3 w-full text-left px-4 py-3 transition-all duration-200 ${
                    i18n.language === 'en' 
                      ? 'bg-cyan-600/20 text-cyan-400 border-r-2 border-cyan-400' 
                      : 'text-gray-300 bg-gray-700 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="relative">
                    <ReactCountryFlag 
                      countryCode="US" 
                      svg
                      style={{
                        width: '1.5em',
                        height: '1.5em',
                        filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.3))'
                      }}
                      title="United States"
                    />
                    {i18n.language === 'en' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-gray-800"></div>
                    )}
                  </div>
                  <div>
                    <div className={`font-medium ${i18n.language === 'en' ? 'text-cyan-400' : 'text-gray-300'}`}>
                      English
                    </div>
                    <div className={`text-xs ${i18n.language === 'en' ? 'text-cyan-300' : 'text-gray-400'}`}>
                      EN
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}