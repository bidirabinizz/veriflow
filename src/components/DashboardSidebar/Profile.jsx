// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Save, Edit, Camera, Loader2, Key, Copy, Trash2, Plus, Eye, EyeOff, ToggleLeft, ToggleRight, Code, Terminal } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { FaPython, FaJs, FaPhp } from 'react-icons/fa';
import { SiCurl } from 'react-icons/si';

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
      console.log('✅ Database profile data:', data.user);
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
      } else {
        console.error('❌ API Keys fetch failed:', response.status);
      }
    } catch (error) {
      console.error('❌ API Keys fetch error:', error);
    }
  };

  // ✅ YENİ API KEY OLUŞTUR
  const createApiKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      alert('Lütfen bir API Key adı girin!');
      return;
    }

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
          name: newKeyName.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API Key oluşturulamadı!');
      }

      alert('✅ API Key başarıyla oluşturuldu! Key\'i güvenli bir yere kaydedin.');
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
    if (!confirm('Bu API Key\'i silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
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
      if (!revealedKeys[keyId]) {
        setRevealedKeys(prev => ({ ...prev, [keyId]: true }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
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

  // ✅ COMPONENT MOUNT OLUNCA VERİLERİ ÇEK
  useEffect(() => {
    fetchProfileFromDB();
    fetchApiKeys();
  }, []);

  // ✅ AVATAR URL OLUŞTURMA
  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    
    if (dbUserData?.avatar_path) {
      return `${API_BASE_URL}${dbUserData.avatar_path}`;
    }
    
    return null;
  };

  // ✅ AVATAR UPLOAD HANDLER
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen sadece resim dosyası seçin!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'dan küçük olmalı!');
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
      
      if (!token) {
        alert("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (response.status === 401) {
        alert("Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
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

  // ✅ PROFİL GÜNCELLEME
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

  // Kullanacağımız user data
  const displayUserData = dbUserData || initialUserData;

  // ✅ API KEY FORMATINI MASKELE
  const maskApiKey = (key) => {
    if (!key) return '';
    if (key.length <= 8) return '•'.repeat(key.length);
    return key.substring(0, 8) + '•'.repeat(key.length - 8);
  };

  // ✅ GERÇEK API KEY DEĞERİNİ AL
  const getActualApiKey = (apiKey) => {
    if (newlyCreatedKey && newlyCreatedKey.id === apiKey.id) {
      return newlyCreatedKey.api_key;
    }
    return apiKey.api_key;
  };

  // ✅ API KULLANIM ÖRNEKLERİ
  const apiUsageExamples = {
    python: `import requests

headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

data = {
    "license_key": "TEST_LICENSE_123",
    "hwid": "TEST_HWID_456"
}

response = requests.post(
    "${API_BASE_URL}/api/verify-license",
    headers=headers,
    json=data
)

print(response.json())`,

    javascript: `const verifyLicense = async () => {
    const response = await fetch('${API_BASE_URL}/api/verify-license', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer YOUR_API_KEY',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            license_key: 'TEST_LICENSE_123',
            hwid: 'TEST_HWID_456'
        })
    });
    
    const result = await response.json();
    console.log(result);
};

verifyLicense();`,

    curl: `curl -X POST \\\\
  "${API_BASE_URL}/api/verify-license" \\\\
  -H "Authorization: Bearer YOUR_API_KEY" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{
    "license_key": "TEST_LICENSE_123",
    "hwid": "TEST_HWID_456"
  }'`,

    php: `<?php
$apiKey = 'YOUR_API_KEY';
$url = '${API_BASE_URL}/api/verify-license';

$data = [
    'license_key' => 'TEST_LICENSE_123',
    'hwid' => 'TEST_HWID_456'
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
$result = json_decode($response, true);

curl_close($ch);
print_r($result);
?>`
  };

  // ✅ GERÇEK PYTHON LOGOSU (İki Renkli)
  const PythonIcon = () => (
    <div className="relative h-4 w-4">
      {/* Mavi üst yarı - Python mavisi */}
      <div 
        className="absolute top-0 left-0 right-0 h-2 bg-[#3776AB] rounded-t-sm"
        style={{ 
          background: 'linear-gradient(135deg, #3776AB 0%, #2C5F8F 100%)',
          clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)'
        }}
      />
      {/* Sarı alt yarı - Python sarısı */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-2 bg-[#FFD43B] rounded-b-sm"
        style={{ 
          background: 'linear-gradient(135deg, #FFD43B 0%, #F0C42B 100%)',
          clipPath: 'polygon(0 30%, 100% 0, 100% 100%, 0 100%)'
        }}
      />
      {/* Ortadaki beyaz ikon */}
      <FaPython className="absolute inset-0 h-3 w-3 m-auto text-white" />
    </div>
  );

  // ✅ DİĞER İKONLAR
  const JsIcon = () => (
    <div className="h-4 w-4 bg-[#F7DF1E] rounded-sm flex items-center justify-center">
      <FaJs className="h-3 w-3 text-black" />
    </div>
  );

  const CurlIcon = () => (
    <div className="h-4 w-4 bg-[#073551] rounded-sm flex items-center justify-center">
      <SiCurl className="h-3 w-3 text-white" />
    </div>
  );

  const PhpIcon = () => (
    <div className="h-4 w-4 bg-[#777BB4] rounded-sm flex items-center justify-center">
      <FaPhp className="h-3 w-3 text-white" />
    </div>
  );

  // ✅ SEKMELER
  const tabs = [
    { id: 'python', name: 'Python', icon: <PythonIcon /> },
    { id: 'javascript', name: 'JavaScript', icon: <JsIcon /> },
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
                  onError={(e) => {
                    console.error('❌ Avatar load failed');
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <User className="h-10 w-10 text-gray-400" />
              )}
            </div>
            <label 
              htmlFor="avatar-upload" 
              className={`absolute bottom-0 right-0 rounded-full p-2 cursor-pointer transition-colors ${
                loading ? 'bg-gray-500' : 'bg-cyan-500 hover:bg-cyan-600'
              }`}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              ) : (
                <Camera className="h-4 w-4 text-white" />
              )}
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleAvatarUpload}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <p className="text-sm text-gray-300">
              {loading ? 'Yükleniyor...' : 'Profil fotoğrafı yükleyin'}
            </p>
            <p className="text-xs text-gray-400">JPEG, PNG, GIF (max 5MB)</p>
          </div>
        </div>

        {editMode ? (
          <form onSubmit={updateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={profileData.fullname}
                  onChange={(e) => setProfileData(prev => ({ ...prev, fullname: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Adınız ve soyadınız"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>E-posta</span>
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="E-posta adresiniz"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 transition-colors"
              >
                <Save className="h-5 w-5" />
                <span>{loading ? 'Kaydediliyor...' : 'Kaydet'}</span>
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ad Soyad
                </label>
                <p className="text-white text-lg">{displayUserData?.fullname || 'Belirtilmemiş'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-posta
                </label>
                <p className="text-white text-lg">{displayUserData?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Kayıt Tarihi</span>
                </label>
                <p className="text-white text-lg">
                  {dbUserData?.created_at ? new Date(dbUserData.created_at).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kullanıcı ID
                </label>
                <p className="text-white text-lg">{displayUserData?.id}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ API KEY BÖLÜMÜ - GÜNCELLENMİŞ */}
      <div className="bg-slate-800 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>API Key'lerim</span>
          </h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Yeni API Key</span>
          </button>
        </div>

        {/* YENİ API KEY FORM */}
        {showCreateForm && (
          <div className="mb-6 p-4 bg-slate-700 rounded-lg">
            <h4 className="text-lg font-medium mb-3">Yeni API Key Oluştur</h4>
            <form onSubmit={createApiKey} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key Adı
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Örn: Production Key, Development Key"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={creatingKey}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
                >
                  {creatingKey ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                  <span>{creatingKey ? 'Oluşturuluyor...' : 'Oluştur'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* YENİ OLUŞTURULAN KEY UYARISI */}
        {newlyCreatedKey && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-400">✅ Yeni API Key Oluşturuldu!</h4>
                <p className="text-sm text-green-300 mt-1">
                  Bu key'i güvenli bir yere kaydedin. Bir daha gösterilmeyecek!
                </p>
              </div>
              <button
                onClick={() => setNewlyCreatedKey(null)}
                className="text-green-400 hover:text-green-300"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* API KEY LİSTESİ */}
        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400">Henüz hiç API Key oluşturmadınız.</p>
              <p className="text-sm text-gray-500 mt-1">Yukarıdaki butona tıklayarak ilk API Key'inizi oluşturun.</p>
            </div>
          ) : (
            apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-white">{apiKey.name}</h4>
                      <button
                        onClick={() => toggleApiKeyStatus(apiKey.id, apiKey.is_active)}
                        className={`p-1 rounded ${
                          apiKey.is_active 
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                        title={apiKey.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                      >
                        {apiKey.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-400">
                      Oluşturulma: {new Date(apiKey.created_at).toLocaleDateString('tr-TR')}
                      {apiKey.last_used && ` • Son Kullanım: ${new Date(apiKey.last_used).toLocaleDateString('tr-TR')}`}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteApiKey(apiKey.id)}
                    className="text-red-400 hover:text-red-300 p-1 ml-2"
                    title="API Key'i Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 mb-2">
                  <code className="flex-1 bg-slate-800 px-3 py-2 rounded text-sm font-mono break-all">
                    {revealedKeys[apiKey.id] ? getActualApiKey(apiKey) : maskApiKey(getActualApiKey(apiKey))}
                  </code>
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    className="p-2 text-gray-400 hover:text-white flex-shrink-0"
                    title={revealedKeys[apiKey.id] ? 'Gizle' : 'Göster'}
                  >
                    {revealedKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => copyApiKey(getActualApiKey(apiKey), apiKey.id)}
                    className="p-2 text-gray-400 hover:text-white flex-shrink-0"
                    title="Kopyala"
                  >
                    {copiedKeyId === apiKey.id ? (
                      <span className="text-green-400 text-sm">✓</span>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className={`px-2 py-1 rounded ${
                    apiKey.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {apiKey.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                  <span>
                    ID: {apiKey.id}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ✅ API KULLANIM ÖRNEKLERİ - SEKMELİ YAPI */}
        <div className="mt-6 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
          <h4 className="text-lg font-medium text-cyan-400 mb-4 flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>API Kullanım Örnekleri</span>
          </h4>
          
          {/* SEKMELER */}
          <div className="mb-4">
            <div className="flex space-x-1 border-b border-cyan-500/20 ">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-cyan-500 text-white'
                      : 'text-cyan-500 hover:text-cyan-200 hover:bg-cyan-500/20 bg-gray-700'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* KOD ÖRNEKLERİ */}
          <div className="bg-slate-900 rounded-lg overflow-hidden">
            <div className="relative">
              <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                <code>{apiUsageExamples[activeTab]}</code>
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(apiUsageExamples[activeTab])}
                className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-gray-300 px-3 py-1 rounded text-xs flex items-center space-x-1 transition-colors"
              >
                <Copy className="h-3 w-3" />
                <span>Kopyala</span>
              </button>
            </div>
          </div>

         
        </div>
      </div>
    </div>
  );
}