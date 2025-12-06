// src/components/DashboardSidebar/DashboardHome.jsx
import React, { useState, useEffect } from 'react';
import { Crown, Zap, CheckCircle, AlertCircle, Key, TrendingUp, Users, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../config/api'; // ✅ BU IMPORT'U EKLE

export default function DashboardHome({ userData }) {
  const navigate = useNavigate();
  const [userPlan, setUserPlan] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const {t} = useTranslation();

  useEffect(() => {
    fetchUserPlan();
    fetchDashboardStats();
  }, []);

  const fetchUserPlan = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      // ✅ DEĞİŞTİR: localhost yerine API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/user/plan`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Plan bilgisi alınamadı");

      const data = await response.json();
      setUserPlan(data.user_plan);
    } catch (error) {
      console.error("Plan bilgisi hatası:", error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/licenses`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

if (response.ok) {
  const data = await response.json();
  const allLicenses = data.licenses;
  const now = new Date();

  // Gerçekten aktif olanlar: DB'de aktif OLSUN + Süresi dolmamış OLSUN (veya süresiz olsun)
  const activeLicenses = allLicenses.filter(l => 
    l.is_active && (!l.expires_at || new Date(l.expires_at) > now)
  ).length;

  const totalLicenses = allLicenses.length;
  // ... diğer hesaplamalar
  
  setStats({
    total: totalLicenses,
    active: activeLicenses, // Artık süresi dolanları aktif saymayacak
    // ...
  });
}
    } catch (error) {
      console.error("İstatistik hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planName) => {
    switch(planName) {
      case 'Plus': return <Crown className="h-6 w-6 text-purple-400" />;
      case 'Pro': return <Zap className="h-6 w-6 text-cyan-400" />;
      default: return <CheckCircle className="h-6 w-6 text-green-400" />;
    }
  };

  const getPlanColor = (planName) => {
    switch(planName) {
      case 'Plus': return 'from-purple-500 to-pink-500';
      case 'Pro': return 'from-cyan-500 to-blue-500';
      default: return 'from-green-500 to-emerald-500';
    }
  };

  const handleUpgradePlan = () => {
    navigate('/fiyatlandirma');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Dashboard yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hoş Geldin Mesajı */}
      <div className="bg-slate-800 rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t("hosgeldiniz")}, {userData?.fullname || userData?.email}!
        </h1>
        <p className="text-gray-400">
          {t("lisans_yonetim_paneline_hosgeldiniz")}
        </p>
      </div>

      {/* Plan Bilgisi Kartı */}
      {userPlan && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${getPlanColor(userPlan.plan_name)}`}>
                {getPlanIcon(userPlan.plan_name)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{userPlan.plan_name} Plan</h3>
                <p className="text-gray-400">
                  {userPlan.price === 0 ? 'Ücretsiz' : `$${userPlan.price}/ay`}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {userPlan.active_licenses} / {userPlan.license_limit}
              </div>
              <p className="text-gray-400">{t("aktif_lisans")}</p>
            </div>
          </div>

          {/* Lisans Limit Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>{t("lisans_kullanimi")}</span>
              <span>{userPlan.active_licenses} / {userPlan.license_limit}</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  userPlan.active_licenses >= userPlan.license_limit 
                    ? 'bg-red-500' 
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                }`}
                style={{ 
                  width: `${Math.min((userPlan.active_licenses / userPlan.license_limit) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Limit Uyarısı */}
          {userPlan.active_licenses >= userPlan.license_limit && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{t("lisans_limit_doldu")}</span>
              </div>
            </div>
          )}

          {/* Plan Yükselt Butonu */}
          {userPlan.plan_name === 'Free' && (
            <button
              onClick={handleUpgradePlan}
              className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-200"
            >
              {t("planini_yukselt")}
            </button>
          )}
        </div>
      )}

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Toplam Lisans */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{t("toplam_lisans")}</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats?.total || 0}
              </p>
            </div>
            <div className="p-3 bg-cyan-500/20 rounded-xl">
              <Key className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Aktif Lisans */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{t("aktif_lisans")}</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats?.active || 0}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Activity className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        {/* HWID Kilitli */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{t("hwid_kilitli")}</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats?.hwidLocked || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <TrendingUp className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Pasif Lisans */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{t("pasif_lisans")}</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats?.inactive || 0}
              </p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-xl">
              <Users className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Hızlı İşlemler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yeni Lisans Oluştur */}
        <div 
          onClick={() => navigate('/dashboard/licenses')}
          className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-cyan-500/50 cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-cyan-500/20 rounded-xl">
              <Key className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{t("lisans_olustur")}</h3>
              <p className="text-gray-400">
                {t("yeni_lisans_olustur")}
              </p>
            </div>
          </div>
        </div>

        {/* Planını Yükselt */}
        <div 
          onClick={handleUpgradePlan}
          className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Crown className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{t("planini_yukselt_y")}</h3>
              <p className="text-gray-400">{t("daha_fazla_lisans_ozellik")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Özellikleri */}
      {userPlan?.features && userPlan.features.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">{t("plan_ozellikleriniz")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}