// src/components/DashboardSidebar/Profile.jsx
import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Save, Edit, Camera, Loader2, Key, Copy, Trash2, Plus, Eye, EyeOff, ToggleLeft, ToggleRight, Code, AlertTriangle, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { FaPython, FaJs, FaPhp } from 'react-icons/fa';
import { SiCurl, SiC, SiCplusplus } from 'react-icons/si'; // ✅ C ve C++ ikonları eklendi

export default function Profile({ userData: initialUserData, onLogout }) {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullname: '',
    email: ''
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [dbUserData, setDbUserData] = useState(null);
  
  // ✅ API KEY STATES
  const [apiKeys, setApiKeys] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState({});
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  
  // ✅ API KULLANIM ÖRNEKLERİ İÇİN SEKMELER
  const [activeTab, setActiveTab] = useState('python');

  // ✅ TOKEN ALMA
  const getToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  // ✅ DATABASE'DEN PROFİL VERİLERİNİ ÇEK
  const fetchProfileFromDB = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Profil verileri alınamadı');
      }

      const data = await response.json();
      setDbUserData(data.user);
      
      setProfileData({
        fullname: data.user.fullname || '',
        email: data.user.email || ''
      });
      
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
    }
  };

  // ✅ API KEY'LERİ GETİR
  const fetchApiKeys = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/keys`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.api_keys || []);
      }
    } catch (error) {
      console.error('❌ API Keys fetch error:', error);
    }
  };

  // ✅ YENİ API KEY OLUŞTUR (TEK KEY MANTIĞI)
  const createApiKey = async (e) => {
    if (e) e.preventDefault();
    
    const keyName = "Main API Key";

    try {
      setCreatingKey(true);
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/api/keys`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: keyName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API Key oluşturulamadı!');
      }

      setNewKeyName('');
      setShowCreateForm(false);
      
      if (data.api_key) {
        setNewlyCreatedKey(data.api_key);
        setRevealedKeys(prev => ({
          ...prev,
          [data.api_key.id]: true
        }));
      }
      
      await fetchApiKeys();
      
    } catch (error) {
      console.error('❌ API Key creation error:', error);
      alert('Hata: ' + error.message);
    } finally {
      setCreatingKey(false);
    }
  };

  // ✅ API KEY SİL
  const deleteApiKey = async (keyId) => {
    if (!confirm('Bu API Key\'i silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/keys/${keyId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('API Key silinemedi!');
      }

      alert('✅ API Key başarıyla silindi!');
      await fetchApiKeys();
      
    } catch (error) {
      console.error('❌ API Key deletion error:', error);
      alert('Hata: ' + error.message);
    }
  };

  // ✅ API KEY DURUMUNU DEĞİŞTİR
  const toggleApiKeyStatus = async (keyId, currentStatus) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/keys/${keyId}/toggle`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('API Key durumu değiştirilemedi!');
      }

      const data = await response.json();
      
      setApiKeys(prev => prev.map(key => 
        key.id === keyId ? { ...key, is_active: data.is_active } : key
      ));
      
    } catch (error) {
      console.error('❌ API Key toggle error:', error);
      alert('Hata: ' + error.message);
    }
  };

  // ✅ API KEY KOPYALA
  const copyApiKey = async (keyValue, keyId) => {
    try {
      await navigator.clipboard.writeText(keyValue);
      setCopiedKeyId(keyId);
      
      setTimeout(() => {
        setCopiedKeyId(null);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Copy error:', error);
      alert('API Key kopyalanamadı!');
    }
  };

  // ✅ KEY GÖSTER/GİZLE
  const toggleKeyVisibility = (keyId) => {
    setRevealedKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  useEffect(() => {
    fetchProfileFromDB();
    fetchApiKeys();
  }, []);

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (dbUserData?.avatar_path) {
      return `${API_BASE_URL}${dbUserData.avatar_path}`;
    }
    return null;
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen sadece resim dosyası seçin!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Avatar yükleme hatası!');
      }
      
      alert("Profil fotoğrafı başarıyla güncellendi!");
      await fetchProfileFromDB();
      setAvatarPreview('');
      
    } catch (error) {
      console.error('❌ Avatar upload error:', error);
      alert("Hata: " + error.message);
      setAvatarPreview('');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      alert("Profil başarıyla güncellendi!");
      setEditMode(false);
      await fetchProfileFromDB();
      
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const displayUserData = dbUserData || initialUserData;

  const maskApiKey = (key) => {
    if (!key) return '';
    if (key.length <= 8) return '•'.repeat(key.length);
    return key.substring(0, 8) + '•'.repeat(key.length - 8);
  };

  // ✅ API KULLANIM ÖRNEKLERİ
  const apiUsageExamples = {
    python: `import requests
import subprocess
import sys

# ✅ Modern Windows HWID Alma (PowerShell)
def get_hwid():
    try:
        cmd = "powershell -Command \\"Get-CimInstance -Class Win32_ComputerSystemProduct | Select-Object -ExpandProperty UUID\\""
        uuid = subprocess.check_output(cmd, shell=True).decode().strip()
        return uuid
    except:
        return "HWID_NOT_FOUND"

# API Ayarları
API_URL = "${API_BASE_URL}/api/verify-license"
API_KEY = "API_KEY_BURAYA"
LICENSE_KEY = "LISANS_KEY_BURAYA"

hwid = get_hwid()
print(f"Cihaz HWID: {hwid}")

try:
    response = requests.post(API_URL, headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }, json={
        "license_key": LICENSE_KEY,
        "hwid": hwid
    })
    print(response.json())
except Exception as e:
    print(f"Hata: {e}")`,

    javascript: `// ⚠️ NOT: Tarayıcılar HWID okuyamaz. Bu kod Node.js içindir.
const axios = require('axios');
const { exec } = require('child_process');

// ✅ Modern Windows HWID Alma (PowerShell)
const getHwid = () => {
    return new Promise((resolve, reject) => {
        const cmd = 'powershell -Command "Get-CimInstance -Class Win32_ComputerSystemProduct | Select-Object -ExpandProperty UUID"';
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                resolve("HWID_NOT_FOUND");
                return;
            }
            resolve(stdout.trim());
        });
    });
};

const verify = async () => {
    const hwid = await getHwid();
    console.log("Cihaz HWID:", hwid);

    try {
        const response = await axios.post('${API_BASE_URL}/api/verify-license', {
            license_key: 'LISANS_KEY_BURAYA',
            hwid: hwid
        }, {
            headers: {
                'Authorization': 'Bearer API_KEY_BURAYA',
                'Content-Type': 'application/json'
            }
        });
        console.log(response.data);
    } catch (error) {
        console.error("Hata:", error.response ? error.response.data : error.message);
    }
};

verify();`,

    // ✅ C DİLİ ÖRNEĞİ (libcurl ile)
    c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <curl/curl.h>

/*
 * Derlemek için: gcc main.c -lcurl -o loader
 * Gereksinim: libcurl kütüphanesi
 */

// HWID almak için (Windows)
void get_hwid(char* buffer, size_t size) {
    FILE* pipe = _popen("powershell -Command \\"Get-CimInstance -Class Win32_ComputerSystemProduct | Select-Object -ExpandProperty UUID\\"", "r");
    if (!pipe) {
        strncpy(buffer, "HWID_NOT_FOUND", size);
        return;
    }
    fgets(buffer, size, pipe);
    // Yeni satır karakterini temizle
    buffer[strcspn(buffer, "\\n")] = 0;
    _pclose(pipe);
}

int main(void) {
    CURL *curl;
    CURLcode res;
    char hwid[128];

    // 1. HWID Al
    get_hwid(hwid, sizeof(hwid));
    printf("Cihaz HWID: %s\\n", hwid);

    // 2. cURL Başlat
    curl_global_init(CURL_GLOBAL_ALL);
    curl = curl_easy_init();
    
    if(curl) {
        struct curl_slist *headers = NULL;
        headers = curl_slist_append(headers, "Authorization: Bearer API_KEY_BURAYA");
        headers = curl_slist_append(headers, "Content-Type: application/json");

        char json_data[256];
        snprintf(json_data, sizeof(json_data), "{\\"license_key\\": \\"LISANS_KEY_BURAYA\\", \\"hwid\\": \\"%s\\"}", hwid);

        curl_easy_setopt(curl, CURLOPT_URL, "${API_BASE_URL}/api/verify-license");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_data);

        // İsteği Gönder
        res = curl_easy_perform(curl);

        if(res != CURLE_OK)
            fprintf(stderr, "Hata: %s\\n", curl_easy_strerror(res));

        curl_slist_free_all(headers);
        curl_easy_cleanup(curl);
    }
    curl_global_cleanup();
    return 0;
}`,

    // ✅ C++ ÖRNEĞİ (libcurl ile)
    cpp: `#include <iostream>
#include <string>
#include <curl/curl.h>
#include <cstdio>
#include <memory>
#include <array>

/*
 * Derlemek için: g++ main.cpp -lcurl -o loader
 * Gereksinim: libcurl kütüphanesi
 */

// HWID almak için (Windows)
std::string get_hwid() {
    std::array<char, 128> buffer;
    std::string result;
    // PowerShell komutu ile UUID çekme
    std::unique_ptr<FILE, decltype(&_pclose)> pipe(_popen("powershell -Command \\"Get-CimInstance -Class Win32_ComputerSystemProduct | Select-Object -ExpandProperty UUID\\"", "r"), _pclose);
    if (!pipe) return "HWID_NOT_FOUND";
    while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr) {
        result += buffer.data();
    }
    // Sondaki yeni satır karakterini sil
    if (!result.empty() && result.back() == '\\n') result.pop_back();
    return result;
}

int main() {
    // 1. HWID Al
    std::string hwid = get_hwid();
    std::cout << "Cihaz HWID: " << hwid << std::endl;

    CURL *curl;
    CURLcode res;

    curl_global_init(CURL_GLOBAL_ALL);
    curl = curl_easy_init();
    
    if(curl) {
        struct curl_slist *headers = NULL;
        headers = curl_slist_append(headers, "Authorization: Bearer API_KEY_BURAYA");
        headers = curl_slist_append(headers, "Content-Type: application/json");

        std::string json_data = "{\\"license_key\\": \\"LISANS_KEY_BURAYA\\", \\"hwid\\": \\"" + hwid + "\\"}";

        curl_easy_setopt(curl, CURLOPT_URL, "${API_BASE_URL}/api/verify-license");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_data.c_str());

        // İsteği Gönder
        res = curl_easy_perform(curl);

        if(res != CURLE_OK)
            std::cerr << "curl_easy_perform() hatasi: " << curl_easy_strerror(res) << std::endl;

        curl_slist_free_all(headers);
        curl_easy_cleanup(curl);
    }
    curl_global_cleanup();
    return 0;
}`,

    php: `<?php
// ✅ Modern Windows HWID Alma (PowerShell)
function get_hwid() {
    $cmd = 'powershell -Command "Get-CimInstance -Class Win32_ComputerSystemProduct | Select-Object -ExpandProperty UUID"';
    $hwid = shell_exec($cmd);
    return trim($hwid) ?: "HWID_NOT_FOUND";
}

$apiKey = 'API_KEY_BURAYA';
$url = '${API_BASE_URL}/api/verify-license';
$hwid = get_hwid();

echo "Cihaz HWID: " . $hwid . "\\n";

$data = [
    'license_key' => 'LISANS_KEY_BURAYA',
    'hwid' => $hwid
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);
curl_close($ch);

print_r(json_decode($response, true));
?>`,

    curl: `# Windows PowerShell Kullanıcıları İçin Tek Satırlık Komut
# Önce HWID'yi alır, sonra API isteği atar

$hwid = (Get-CimInstance -Class Win32_ComputerSystemProduct).UUID; 
curl -X POST "${API_BASE_URL}/api/verify-license" \\
  -H "Authorization: Bearer API_KEY_BURAYA" \\
  -H "Content-Type: application/json" \\
  -d "{\\"license_key\\": \\"LISANS_KEY_BURAYA\\", \\"hwid\\": \\"$hwid\\"}"`
  };
  
  // İKONLAR
  const PythonIcon = () => (
    <div className="relative h-4 w-4">
      <div className="absolute top-0 left-0 right-0 h-2 bg-[#3776AB] rounded-t-sm" style={{ background: 'linear-gradient(135deg, #3776AB 0%, #2C5F8F 100%)', clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#FFD43B] rounded-b-sm" style={{ background: 'linear-gradient(135deg, #FFD43B 0%, #F0C42B 100%)', clipPath: 'polygon(0 30%, 100% 0, 100% 100%, 0 100%)' }} />
      <FaPython className="absolute inset-0 h-3 w-3 m-auto text-white" />
    </div>
  );
  const JsIcon = () => (<div className="h-4 w-4 bg-[#F7DF1E] rounded-sm flex items-center justify-center"><FaJs className="h-3 w-3 text-black" /></div>);
  const CurlIcon = () => (<div className="h-4 w-4 bg-[#073551] rounded-sm flex items-center justify-center"><SiCurl className="h-3 w-3 text-white" /></div>);
  const PhpIcon = () => (<div className="h-4 w-4 bg-[#777BB4] rounded-sm flex items-center justify-center"><FaPhp className="h-3 w-3 text-white" /></div>);
  const CIcon = () => (<div className="h-4 w-4 bg-[#555555] rounded-sm flex items-center justify-center"><SiC className="h-3 w-3 text-white" /></div>);
  const CppIcon = () => (<div className="h-4 w-4 bg-[#00599C] rounded-sm flex items-center justify-center"><SiCplusplus className="h-3 w-3 text-white" /></div>);

  const tabs = [
    { id: 'python', name: 'Python', icon: <PythonIcon /> },
    { id: 'javascript', name: 'JavaScript', icon: <JsIcon /> },
    { id: 'c', name: 'C', icon: <CIcon /> },
    { id: 'cpp', name: 'C++', icon: <CppIcon /> },
    { id: 'curl', name: 'cURL', icon: <CurlIcon /> },
    { id: 'php', name: 'PHP', icon: <PhpIcon /> }
  ];

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Profil</h2>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Edit className="h-5 w-5" />
            <span>Düzenle</span>
          </button>
        )}
      </div>

      {/* Profil Bilgileri */}
      <div className="bg-slate-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Profil Bilgileri</span>
        </h3>

        {/* AVATAR BÖLÜMÜ */}
        <div className="flex items-center space-x-6 mb-6 p-4 bg-slate-700 rounded-lg">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden border-2 border-slate-500">
              {getAvatarUrl() ? (
                <img 
                  src={getAvatarUrl()} 
                  alt="Profil" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <User className="h-10 w-10 text-gray-400" />
              )}
            </div>
            <label 
              htmlFor="avatar-upload" 
              className={`absolute bottom-0 right-0 rounded-full p-2 cursor-pointer transition-colors ${loading ? 'bg-gray-500' : 'bg-cyan-500 hover:bg-cyan-600'}`}
            >
              {loading ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <Camera className="h-4 w-4 text-white" />}
              <input
                id="avatar-upload" type="file" accept="image/jpeg,image/png,image/gif"
                onChange={handleAvatarUpload} disabled={loading} className="hidden"
              />
            </label>
          </div>
          <div>
            <p className="text-sm text-gray-300">{loading ? 'Yükleniyor...' : 'Profil fotoğrafı yükleyin'}</p>
            <p className="text-xs text-gray-400">JPEG, PNG, GIF (max 5MB)</p>
          </div>
        </div>

        {editMode ? (
          <form onSubmit={updateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ad Soyad</label>
                <input
                  type="text" value={profileData.fullname}
                  onChange={(e) => setProfileData(prev => ({ ...prev, fullname: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                  <Mail className="h-4 w-4" /><span>E-posta</span>
                </label>
                <input
                  type="email" value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="submit" disabled={loading} className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 transition-colors">
                <Save className="h-5 w-5" /><span>{loading ? 'Kaydediliyor...' : 'Kaydet'}</span>
              </button>
              <button type="button" onClick={() => setEditMode(false)} className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors">İptal</button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Ad Soyad</label><p className="text-white text-lg">{displayUserData?.fullname || 'Belirtilmemiş'}</p></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label><p className="text-white text-lg">{displayUserData?.email}</p></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2"><Calendar className="h-4 w-4" /><span>Kayıt Tarihi</span></label><p className="text-white text-lg">{dbUserData?.created_at ? new Date(dbUserData.created_at).toLocaleDateString('tr-TR') : 'Bilinmiyor'}</p></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Kullanıcı ID</label><p className="text-white text-lg">{displayUserData?.id}</p></div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ API KEY BÖLÜMÜ - YENİLENMİŞ (TEK KEY KARTI) */}
      <div className="bg-slate-800 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>API Anahtarı Yönetimi</span>
          </h3>
        </div>

        {/* YENİ OLUŞTURULAN KEY UYARISI */}
        {newlyCreatedKey && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-green-400 text-lg mb-1">✅ Yeni Anahtarınız Oluşturuldu!</h4>
                <p className="text-gray-300 text-sm mb-3">
                  Bu anahtarı şimdi kopyalayın. Güvenlik nedeniyle bir daha açık halini göremeyeceksiniz!
                </p>
                <div className="flex items-center space-x-2 bg-black/30 p-3 rounded border border-green-500/30">
                  <code className="flex-1 font-mono text-green-300 break-all select-all">
                    {newlyCreatedKey.api_key}
                  </code>
                  <button
                    onClick={() => {
                      copyApiKey(newlyCreatedKey.api_key, 'new');
                      alert("Kopyalandı!");
                    }}
                    className="p-2 hover:bg-white/10 rounded text-green-400"
                    title="Kopyala"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <button onClick={() => setNewlyCreatedKey(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
          </div>
        )}

        {/* MEVCUT KEY KARTI */}
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 transition-all hover:border-slate-500">
          {apiKeys.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h4 className="text-white font-medium text-lg flex items-center gap-2">
                    Mevcut API Anahtarı
                    <span className={`text-xs px-2 py-0.5 rounded-full ${apiKeys[0].is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {apiKeys[0].is_active ? "Aktif" : "Pasif"}
                    </span>
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Oluşturulma: {new Date(apiKeys[0].created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <button
                  onClick={() => toggleApiKeyStatus(apiKeys[0].id, apiKeys[0].is_active)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                    apiKeys[0].is_active 
                    ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' 
                    : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                  }`}
                >
                  {apiKeys[0].is_active ? "Devre Dışı Bırak" : "Aktifleştir"}
                </button>
              </div>

              <div className="flex items-center space-x-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                <Key className="h-5 w-5 text-gray-500" />
                <code className="flex-1 font-mono text-gray-300 tracking-wide">
                  {maskApiKey(apiKeys[0].api_key)}
                </code>
                <button
                  onClick={() => deleteApiKey(apiKeys[0].id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  title="Anahtarı Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="pt-4 border-t border-slate-600/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <p className="text-sm text-yellow-500/80 flex items-start md:items-center gap-2">
                     <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 md:mt-0" />
                     <span>Yeni bir anahtar oluşturursanız, eskisi <b>silinecektir</b>.</span>
                  </p>
                  
                  {showCreateForm ? (
                     <div className="flex gap-2">
                       <button
                          onClick={createApiKey}
                          disabled={creatingKey}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                       >
                          {creatingKey ? <Loader2 className="animate-spin h-4 w-4"/> : <RefreshCw className="h-4 w-4"/>}
                          Onayla ve Yenile
                       </button>
                       <button 
                          onClick={() => setShowCreateForm(false)}
                          className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm"
                       >
                          İptal
                       </button>
                     </div>
                  ) : (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Anahtarı Yenile (Regenerate)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-600">
                <Key className="h-8 w-8 text-cyan-500" />
              </div>
              <h4 className="text-white font-medium mb-2">Henüz API Anahtarınız Yok</h4>
              <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                API hizmetlerini kullanmak ve lisans kontrollerini entegre etmek için bir anahtar oluşturun.
              </p>
              <button
                onClick={createApiKey}
                disabled={creatingKey}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2.5 rounded-lg flex items-center space-x-2 mx-auto font-medium transition-all hover:scale-105"
              >
                {creatingKey ? <Loader2 className="animate-spin h-5 w-5"/> : <Plus className="h-5 w-5" />}
                <span>Anahtar Oluştur</span>
              </button>
            </div>
          )}
        </div>

        {/* ✅ API KULLANIM ÖRNEKLERİ */}
        <div className="mt-8">
            <h4 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
            <Code className="h-5 w-5 text-cyan-400" />
            <span>Entegrasyon Kodları</span>
            </h4>
            
            <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
            {/* SEKMELER */}
            <div className="flex border-b border-slate-700 bg-slate-800/50 overflow-x-auto">
                {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 transition-colors border-r border-slate-700/50 min-w-[120px] justify-center ${
                    activeTab === tab.id
                        ? 'bg-slate-800 text-cyan-400 border-b-2 border-b-cyan-400'
                        : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                >
                    {tab.icon}
                    <span className="font-medium">{tab.name}</span>
                </button>
                ))}
            </div>

            {/* KOD ALANI */}
            <div className="relative group">
                <pre className="p-5 text-sm font-mono text-gray-300 overflow-x-auto custom-scrollbar leading-relaxed">
                <code>{apiUsageExamples[activeTab]}</code>
                </pre>
                <button
                onClick={() => {
                    navigator.clipboard.writeText(apiUsageExamples[activeTab]);
                    alert("Kod kopyalandı!");
                }}
                className="absolute top-3 right-3 bg-slate-700/80 hover:bg-slate-600 text-white px-3 py-1.5 rounded text-xs flex items-center space-x-1.5 transition-all opacity-0 group-hover:opacity-100 shadow-lg backdrop-blur-sm border border-slate-600"
                >
                <Copy className="h-3.5 w-3.5" />
                <span>Kopyala</span>
                </button>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
}