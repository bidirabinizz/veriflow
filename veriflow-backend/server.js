import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";
import { verifyToken } from "./middleware/auth.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import cron from 'node-cron';
import os from 'os';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// giriş yapan ipleri görmek için önemli
app.set('trust proxy', true);

// express app'inizin olduğu dosyada (en üstte cors import'tan sonra)
app.use(cors({
  origin: true, // Tüm origin'lere izin ver
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const getClientIP = (req) => {
  let ip = req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null);

  console.log('🔍 RAW IP:', ip);

  if (ip === '::1') {
    return '127.0.0.1';
  }
  
  if (ip && ip.includes('::ffff:')) {
    return ip.replace('::ffff:', '');
  }
  
  if (ip && ip.includes(':')) {
    return 'IPv6-' + ip.substring(0, 15);
  }
  
  if (ip && ip.includes(',')) {
    return ip.split(',')[0].trim();
  }
  
  return ip || 'unknown';
};

const logActivity = (userId, action, details, ipAddress) => {
  const sql = "INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)";
  db.query(sql, [userId, action, details, ipAddress], (err, result) => {
    if (err) console.error("❌ Log kaydı başarısız:", err);
    else console.log(`� Aktivite loglandı: ${action}`);
  });
};

const getDeviceInfo = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  let deviceInfo = 'Unknown Device';
  
  if (userAgent.includes('Mobile')) deviceInfo = 'Mobile';
  else if (userAgent.includes('Tablet')) deviceInfo = 'Tablet';
  else deviceInfo = 'Desktop';
  
  if (userAgent.includes('Chrome')) deviceInfo += ' Chrome';
  else if (userAgent.includes('Firefox')) deviceInfo += ' Firefox';
  else if (userAgent.includes('Safari')) deviceInfo += ' Safari';
  else if (userAgent.includes('Edge')) deviceInfo += ' Edge';
  
  return deviceInfo.substring(0, 150);
};

const logLoginAttempt = (userId, ipAddress, deviceInfo, status) => {
  const sql = `INSERT INTO login_logs (user_id, ip_address, device_info, login_status) VALUES (?, ?, ?, ?)`;
  
  db.query(sql, [userId, ipAddress, deviceInfo, status], (err, result) => {
    if (err) {
      console.error('❌ Login log kaydı hatası:', err);
    } else {
      console.log(`✅ Login log kaydedildi - User: ${userId}, IP: ${ipAddress}, Status: ${status}`);
    }
  });
};

// Uploads klasörünü oluştur
const uploadsDir = './uploads/avatars';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const user_id = req.user.id;
    const fileExt = path.extname(file.originalname);
    const timestamp = Date.now();
    const filename = `user_${user_id}_${timestamp}${fileExt}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları (JPEG, PNG, GIF) yükleyebilirsiniz!'));
    }
  }
});

// 📌 PLANLARI GETİR
app.get("/plans", (req, res) => {
  const sql = "SELECT * FROM plans ORDER BY price ASC";
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Planlar getirilemedi!", error: err });
    }
    
    res.json({
      message: "Planlar getirildi",
      plans: results
    });
  });
});

// 📌 KAYIT OL - OTOMATİK FREE PLAN ATAMA
app.post("/register", (req, res) => {
  const { fullname, email, password } = req.body;
  const clientIP = getClientIP(req);
  const deviceInfo = getDeviceInfo(req);
  
  if (!fullname || !email || !password) return res.status(400).json({ message: "Eksik bilgi!" });

  db.query("SELECT id FROM plans WHERE name = 'Free'", (err, planResults) => {
    if (err || planResults.length === 0) return res.status(500).json({ message: "Free plan bulunamadı!" });

    const freePlanId = planResults[0].id;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err) return res.status(500).json({ message: "DB hatası" });
      if (results.length > 0) return res.status(400).json({ message: "Bu email kayıtlı!" });

      const hash = bcrypt.hashSync(password, 10);
      const sql = "INSERT INTO users (fullname, email, password_hash, plan_id) VALUES (?, ?, ?, ?)";
      
      db.query(sql, [fullname, email, hash, freePlanId], (err, result) => {
        if (err) return res.status(500).json({ message: "Kayıt hatası" });
        
        const newUserId = result.insertId;
        logLoginAttempt(newUserId, clientIP, deviceInfo, 'success');
        
        // 🔔 BİLDİRİM
        sendNotification(newUserId, "Hoş Geldin! 🎉", "VeriFlow ailesine katıldığın için teşekkürler.", "success");
        
        res.json({ message: "Kayıt başarılı!", plan: "Free" });
      });
    });
  });
});

// ✅ GİRİŞ YAP (BAKIM MODU DESTEKLİ)
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  const clientIP = getClientIP(req);
  const deviceInfo = getDeviceInfo(req);
  
  console.log(`� LOGIN ATTEMPT - IP: ${clientIP}, Device: ${deviceInfo}`);
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email ve şifre gereklidir!" });
  }

  // 1. Önce Bakım Modu Ayarını Çek
  db.query("SELECT setting_value FROM settings WHERE setting_key = 'maintenance_mode'", (settingErr, settingResults) => {
    // Eğer veritabanı hatası olursa veya ayar yoksa bakım modu 'kapalı' varsayalım
    const maintenanceMode = settingResults && settingResults.length > 0 && settingResults[0].setting_value === 'true';

    // 2. Kullanıcıyı Bul
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err) {
        console.log("❌ DATABASE ERROR:", err);
        return res.status(500).json({ message: "Database hatası", error: err });
      }
      
      if (results.length === 0) {
        logLoginAttempt(null, clientIP, deviceInfo, 'failed');
        return res.status(400).json({ message: "Kullanıcı bulunamadı" });
      }

      const user = results[0];

      // � BAKIM MODU KONTROLÜ (KRİTİK NOKTA)
      // Eğer bakım modu açıksa VE kullanıcı admin DEĞİLSE => İçeri alma!
      if (maintenanceMode && user.role !== 'admin') {
        console.log(`⛔ Bakım modu aktif. Kullanıcı (${user.email}) girişi engellendi.`);
        return res.status(503).json({ message: "Sistem şu an bakımda! Lütfen daha sonra tekrar deneyin." });
      }

      // 3. Şifre Kontrolü
      const isMatch = bcrypt.compareSync(password, user.password_hash);

      if (!isMatch) {
        logLoginAttempt(user.id, clientIP, deviceInfo, 'failed');
        return res.status(401).json({ message: "Şifre hatalı" });
      }

      // 4. Token Oluşturma
      const token = jwt.sign({ 
        id: user.id, 
        email: user.email,
        role: user.role,
        fullname: user.fullname 
      }, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      logLoginAttempt(user.id, clientIP, deviceInfo, 'success');

      res.json({ 
        message: "Giriş başarılı", 
        token,
        user: {
          id: user.id,
          role: user.role,
          email: user.email,
          fullname: user.fullname
        }
      });
    });
  });
});

// 📌 KULLANICI PLAN BİLGİSİNİ GETİR
// 📌 KULLANICI PLAN BİLGİSİNİ GETİR - GÜNCELLENMİŞ
app.get("/user/plan", verifyToken, (req, res) => {
  const user_id = req.user.id;
  
  const sql = `
    SELECT 
      u.*, 
      p.name as plan_name, 
      p.license_limit, 
      p.price, 
      p.description as plan_description
    FROM users u 
    LEFT JOIN plans p ON u.plan_id = p.id 
    WHERE u.id = ?
  `;
  
  db.query(sql, [user_id], (err, results) => {
    if (err || results.length === 0) {
      console.error('❌ User plan query error:', err);
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
    }
    
    const userData = results[0];
    
    // Aktif lisans sayısını hesapla
    db.query("SELECT COUNT(*) as active_licenses FROM licenses WHERE user_id = ? AND is_active = true", [user_id], (err, licenseResults) => {
      if (err) {
        console.error('❌ License count error:', err);
        return res.status(500).json({ message: "Lisans sayısı hesaplanamadı!" });
      }
      
      const activeLicenses = licenseResults[0].active_licenses;
      const licenseLimit = userData.license_limit || 5;
      
      // Manuel olarak plan özelliklerini oluştur
      const planFeatures = {
        'Free': ['5 Aktif Lisans', 'Temel API Erişimi', 'Topluluk Desteği'],
        'Pro': ['50 Aktif Lisans', 'Gelişmiş API Erişimi', 'Öncelikli Destek', 'Haftalık Raporlar'],
        'Plus': ['Sınırsız Lisans', 'Tam API Erişimi', '7/24 Premium Destek', 'Gerçek Zamanlı Raporlar']
      };
      
      res.json({
        message: "Kullanıcı plan bilgileri",
        user_plan: {
          plan_name: userData.plan_name || 'Free',
          license_limit: licenseLimit,
          active_licenses: activeLicenses,
          remaining_licenses: licenseLimit - activeLicenses,
          price: userData.price || 0,
          description: userData.plan_description || 'Başlamak için ideal',
          features: planFeatures[userData.plan_name] || planFeatures['Free']
        }
      });
    });
  });
});

// ✅ YENİ LİSANS OLUŞTURMA (LOGLU VERSİYON)
app.post("/licenses", verifyToken, (req, res) => {
  const { license_key, expires_at, require_hwid = false } = req.body;
  const user_id = req.user.id;
  const clientIP = getClientIP(req); // IP adresini alıyoruz

  if (!license_key) {
    return res.status(400).json({ message: "Lisans key gereklidir!" });
  }

  // Önce kullanıcının planını ve lisans limitini kontrol et
  db.query(`
    SELECT p.license_limit, COUNT(l.id) as current_licenses 
    FROM users u 
    LEFT JOIN plans p ON u.plan_id = p.id 
    LEFT JOIN licenses l ON u.id = l.user_id AND l.is_active = true
    WHERE u.id = ?
    GROUP BY u.id, p.license_limit
  `, [user_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ message: "Plan bilgisi alınamadı!" });
    }

    const licenseLimit = results[0].license_limit || 5;
    const currentLicenses = results[0].current_licenses || 0;

    console.log(`� Lisans kontrolü: ${currentLicenses}/${licenseLimit}`);

    // Lisans limit kontrolü
    if (currentLicenses >= licenseLimit) {
      return res.status(400).json({ 
        message: `Lisans limiti doldu! ${licenseLimit} lisans oluşturabilirsiniz. Planınızı yükseltin.`,
        current_licenses: currentLicenses,
        license_limit: licenseLimit
      });
    }

    // Lisans oluştur
    const sql = `INSERT INTO licenses (user_id, license_key, require_hwid, expires_at) VALUES (?, ?, ?, ?)`;
    
    db.query(sql, [user_id, license_key, require_hwid, expires_at], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: "Bu lisans key zaten mevcut!" });
        }
        return res.status(500).json({ message: "Database hatası!", error: err });
      }
      
      // ✅ YENİ EKLENEN KISIM: AKTİVİTE LOGU KAYDI
      logActivity(
        user_id,
        "LISANS_OLUSTURULDU",
        `Kullanıcı yeni bir lisans oluşturdu. Key: ${license_key}`,
        clientIP
      );

      // (Eski log tablosunu da bozmamak için bırakıyoruz)
      db.query(
        "INSERT INTO license_activity (license_id, activity_type, activity_detail) VALUES (?, 'created', 'Yeni lisans oluşturuldu')",
        [result.insertId]
      );
      
      res.json({ 
        message: "Lisans başarıyla oluşturuldu!",
        license_id: result.insertId,
        current_licenses: currentLicenses + 1,
        license_limit: licenseLimit
      });
    });
  });
});

// 📌 PLAN YÜKSELTME
app.post("/upgrade-plan", verifyToken, (req, res) => {
  const { plan_id } = req.body;
  const user_id = req.user.id;

  db.query("SELECT name FROM plans WHERE id = ?", [plan_id], (err, plans) => {
    if (err || plans.length === 0) return res.status(404).json({ message: "Plan yok" });
    
    db.query("UPDATE users SET plan_id = ? WHERE id = ?", [plan_id, user_id], (err) => {
      if (err) return res.status(500).json({ message: "Hata" });
      
      // 🔔 BİLDİRİM
      sendNotification(user_id, "Plan Yükseltildi 🚀", `Tebrikler! Yeni planınız: ${plans[0].name}`, "success");
      res.json({ message: "Plan güncellendi!" });
    });
  });
}); 

// ✅ DİĞER ENDPOINT'LER AYNI KALIYOR

app.get("/dashboard", verifyToken, (req, res) => {
  db.query("SELECT id, email, fullname, avatar_path, created_at FROM users WHERE id = ?", [req.user.id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
    }
    
    const dbUser = results[0];
    
    if (dbUser.email !== req.user.email) {
      return res.status(403).json({ message: "Token bilgileri geçersiz!" });
    }
    
    res.json({ 
      message: `Hoş geldin ${req.user.email}`,
      user: req.user
    });
  });
});

app.get("/profile", verifyToken, (req, res) => {
  const user_id = req.user.id;
  
  db.query("SELECT id, fullname, email, avatar_path, created_at FROM users WHERE id = ?", [user_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database hatası!" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    
    const user = results[0];
    
    res.json({
      message: "Profil bilgileri",
      user: user
    });
  });
});

app.put("/profile", verifyToken, (req, res) => {
  const user_id = req.user.id;
  const { fullname, email } = req.body;
  
  if (!fullname || !email) {
    return res.status(400).json({ message: "Ad soyad ve email gereklidir!" });
  }
  
  db.query("SELECT id FROM users WHERE email = ? AND id != ?", [email, user_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database hatası!", error: err });
    }
    
    if (results.length > 0) {
      return res.status(400).json({ message: "Bu email adresi zaten kullanılıyor!" });
    }
    
    db.query("UPDATE users SET fullname = ?, email = ? WHERE id = ?", [fullname, email, user_id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Güncelleme hatası!", error: err });
      }
      
      res.json({ 
        message: "Profil başarıyla güncellendi!",
        user: { id: user_id, fullname, email }
      });
    });
  });
});

app.get("/licenses", verifyToken, (req, res) => {
  const user_id = req.user.id;
  
  const sql = `
    SELECT 
      l.id, l.license_key, l.hwid, l.require_hwid, 
      l.is_active, l.created_at, l.expires_at,
      COUNT(la.id) as activity_count
    FROM licenses l
    LEFT JOIN license_activity la ON l.id = la.license_id
    WHERE l.user_id = ?
    GROUP BY l.id
    ORDER BY l.created_at DESC
  `;
  
  db.query(sql, [user_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database hatası!", error: err });
    }
    
    res.json({
      message: "Lisanslar getirildi",
      licenses: results
    });
  });
});

// ✅ KULLANICI LİSANS SİLME (LOGLU)
app.delete("/licenses/:id", verifyToken, (req, res) => {
  const license_id = req.params.id;
  const user_id = req.user.id;
  const clientIP = getClientIP(req);
  
  // Önce silinecek lisansın key'ini alalım (Log için)
  db.query("SELECT license_key FROM licenses WHERE id = ? AND user_id = ?", [license_id, user_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Lisans bulunamadı!" });
    }
    
    const licenseKey = results[0].license_key;
    
    db.query("DELETE FROM licenses WHERE id = ?", [license_id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Silme hatası!", error: err });
      }
      
      // ✅ AKTİVİTE LOGU
      logActivity(
        user_id,
        "LISANS_SILINDI",
        `Kullanıcı ${licenseKey} anahtarlı lisansı sildi.`,
        clientIP
      );
      
      res.json({ message: "Lisans başarıyla silindi!" });
    });
  });
});

app.get("/licenses/:id", verifyToken, (req, res) => {
  const license_id = req.params.id;
  const user_id = req.user.id;
  
  const sql = `
    SELECT 
      l.*,
      u.email as user_email
    FROM licenses l
    LEFT JOIN users u ON l.user_id = u.id
    WHERE l.id = ? AND l.user_id = ?
  `;
  
  db.query(sql, [license_id, user_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Lisans bulunamadı!" });
    }
    
    res.json({
      message: "Lisans detayları getirildi",
      license: results[0]
    });
  });
});

/// ✅ KULLANICI LİSANS GÜNCELLEME (LOGLU)
app.put("/licenses/:id", verifyToken, (req, res) => {
  const license_id = req.params.id;
  const user_id = req.user.id;
  const { is_active, require_hwid, expires_at } = req.body;
  const clientIP = getClientIP(req);
  
  // Önce lisansın key'ini alalım ki loga yazabilelim
  db.query("SELECT license_key FROM licenses WHERE id = ? AND user_id = ?", [license_id, user_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Lisans bulunamadı!" });
    }
    
    const licenseKey = results[0].license_key;
    const sql = `UPDATE licenses SET is_active = ?, require_hwid = ?, expires_at = ? WHERE id = ?`;
    
    db.query(sql, [is_active, require_hwid, expires_at, license_id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Güncelleme hatası!", error: err });
      }
      
      // ✅ GENEL AKTİVİTE LOGU
      logActivity(
        user_id,
        "LISANS_GUNCELLENDI",
        `Kullanıcı ${licenseKey} lisansını güncelledi. (Aktif: ${is_active}, HWID Kilidi: ${require_hwid})`,
        clientIP
      );
      
      res.json({ message: "Lisans başarıyla güncellendi!" });
    });
  });
});

// ✅ KULLANICI HWID SIFIRLAMA (LOGLU)
app.post("/licenses/:id/reset-hwid", verifyToken, (req, res) => {
  const license_id = req.params.id;
  const user_id = req.user.id;
  const clientIP = getClientIP(req);
  
  db.query("SELECT id, license_key, hwid FROM licenses WHERE id = ? AND user_id = ?", [license_id, user_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Lisans bulunamadı!" });
    }
    
    const license = results[0];
    
    db.query("UPDATE licenses SET hwid = NULL WHERE id = ?", [license_id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "HWID sıfırlama hatası!", error: err });
      }

      // ✅ GENEL AKTİVİTE LOGU
      logActivity(
        user_id,
        "HWID_SIFIRLANDI",
        `Kullanıcı ${license.license_key} lisansının HWID adresini sıfırladı.`,
        clientIP
      );
      
      res.json({ 
        message: "HWID başarıyla sıfırlandı!",
        previous_hwid: license.hwid
      });
    });
  });
});

app.post("/profile/avatar", verifyToken, upload.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Dosya seçilmedi!" });
    }

    const user_id = req.user.id;
    const avatar_filename = req.file.filename;
    const avatar_path = `/uploads/avatars/${avatar_filename}`;

    db.query("SELECT avatar_path FROM users WHERE id = ?", [user_id], (err, results) => {
      if (err) {
        fs.unlinkSync(req.file.path);
        return res.status(500).json({ message: "Database hatası!", error: err });
      }

      if (results[0]?.avatar_path) {
        const oldPath = results[0].avatar_path.replace('/uploads/avatars/', '');
        const oldFilePath = path.join(uploadsDir, oldPath);
        
        if (fs.existsSync(oldFilePath) && oldPath !== avatar_filename) {
          fs.unlinkSync(oldFilePath);
        }
      }

      const updateSql = "UPDATE users SET avatar_path = ? WHERE id = ?";
      db.query(updateSql, [avatar_path, user_id], (err, result) => {
        if (err) {
          fs.unlinkSync(req.file.path);
          return res.status(500).json({ message: "Database güncelleme hatası!", error: err });
        }

        res.json({ 
          message: "Profil fotoğrafı başarıyla güncellendi!",
          avatar_url: avatar_path
        });
      });
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Avatar yükleme hatası!", error: error.message });
  }
});

app.get("/uploads/avatars/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', 'avatars', filename);
  
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ message: "Avatar bulunamadı!" });
  }
});

// ✅ API KEY SİSTEMİ ENDPOINT'LERİ

// ✅ API KEY SİSTEMİ ENDPOINT'LERİ

// 📌 API KEY LİSTELEME
app.get("/api/keys", verifyToken, (req, res) => {
  const user_id = req.user.id;
  
  const sql = `
    SELECT 
      id, name, api_key, is_active, last_used, created_at
    FROM api_keys 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `;
  
  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error('❌ API Keys fetch error:', err);
      return res.status(500).json({ message: "API Key'ler getirilemedi!" });
    }
    
    // API Key'leri maskele (güvenlik için)
    const maskedKeys = results.map(key => ({
      ...key,
      api_key: key.api_key.substring(0, 8) + '•'.repeat(key.api_key.length - 8)
    }));
    
    res.json({
      message: "API Key'ler getirildi",
      api_keys: maskedKeys
    });
  });
});


// 📌 YENİ API KEY OLUŞTURMA (TEK KEY MANTIĞI)
app.post("/api/keys", verifyToken, (req, res) => {
  const user_id = req.user.id;
  const { name } = req.body;
  
  // İsim zorunluluğunu kaldırabiliriz çünkü tek key olacak, ama kalsın varsayılan atarız.
  const keyName = name || "Main API Key";
  
  // ✅ Rastgele API Key oluştur
  const generateApiKey = () => {
    const prefix = 'cw_';
    const randomPart = crypto.randomBytes(24).toString('hex');
    return prefix + randomPart;
  };
  
  const api_key = generateApiKey();
  const key_value = bcrypt.hashSync(api_key, 10); // Key'i hash'le
  
  // 1. ADIM: Önce kullanıcının eski keylerini sil (Temizlik)
  db.query("DELETE FROM api_keys WHERE user_id = ?", [user_id], (deleteErr) => {
    if (deleteErr) {
      console.error('❌ Old API Keys cleanup error:', deleteErr);
      return res.status(500).json({ message: "Eski anahtarlar temizlenirken hata oluştu!" });
    }

    // 2. ADIM: Yeni key'i oluştur
    const sql = `
      INSERT INTO api_keys (user_id, name, api_key, key_value) 
      VALUES (?, ?, ?, ?)
    `;
    
    db.query(sql, [user_id, keyName, api_key, key_value], (err, result) => {
      if (err) {
        console.error('❌ API Key creation error:', err);
        return res.status(500).json({ message: "API Key oluşturulamadı!" });
      }
      
      res.json({
        message: "API Key başarıyla yenilendi! Eski anahtarınız artık geçersiz.",
        api_key: {
          id: result.insertId,
          name: keyName,
          api_key: api_key, // Sadece oluşturulduğunda göster
          created_at: new Date()
        }
      });
    });
  });
});

// 📌 API KEY SİLME
app.delete("/api/keys/:id", verifyToken, (req, res) => {
  const key_id = req.params.id;
  const user_id = req.user.id;
  
  db.query("SELECT id FROM api_keys WHERE id = ? AND user_id = ?", [key_id, user_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "API Key bulunamadı!" });
    }
    
    db.query("DELETE FROM api_keys WHERE id = ?", [key_id], (err, result) => {
      if (err) {
        console.error('❌ API Key deletion error:', err);
        return res.status(500).json({ message: "API Key silinemedi!" });
      }
      
      res.json({ message: "API Key başarıyla silindi!" });
    });
  });
});

// 📌 API KEY DURUMUNU DEĞİŞTİRME
app.put("/api/keys/:id/toggle", verifyToken, (req, res) => {
  const key_id = req.params.id;
  const user_id = req.user.id;
  
  db.query("SELECT id, is_active FROM api_keys WHERE id = ? AND user_id = ?", [key_id, user_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "API Key bulunamadı!" });
    }
    
    const currentStatus = results[0].is_active;
    const newStatus = !currentStatus;
    
    db.query("UPDATE api_keys SET is_active = ? WHERE id = ?", [newStatus, key_id], (err, result) => {
      if (err) {
        console.error('❌ API Key toggle error:', err);
        return res.status(500).json({ message: "API Key durumu değiştirilemedi!" });
      }
      
      res.json({ 
        message: `API Key ${newStatus ? 'aktif' : 'pasif'} edildi!`,
        is_active: newStatus
      });
    });
  });
});

// ✅ API KEY DOĞRULAMA MIDDLEWARE'İ
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['authorization']?.replace('Bearer ', '') || 
                 req.headers['x-api-key'] || 
                 req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({ 
      success: false,
      error: "API Key gereklidir!",
      usage: "Header: Authorization: Bearer YOUR_API_KEY veya ?api_key=YOUR_API_KEY"
    });
  }
  
  const sql = `
    SELECT ak.*, u.id as user_id, u.email, u.plan_id, p.name as plan_name 
    FROM api_keys ak
    LEFT JOIN users u ON ak.user_id = u.id
    LEFT JOIN plans p ON u.plan_id = p.id
    WHERE ak.api_key = ? AND ak.is_active = true
  `;
  
  db.query(sql, [apiKey], (err, results) => {
    if (err) {
      console.error('❌ API Key verification error:', err);
      return res.status(500).json({ 
        success: false,
        error: "Sunucu hatası!" 
      });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: "Geçersiz API Key!" 
      });
    }
    
    const apiKeyData = results[0];
    
    // Kullanım logu kaydet
    const logSql = `
      INSERT INTO api_usage_logs (api_key_id, endpoint, ip_address, user_agent) 
      VALUES (?, ?, ?, ?)
    `;
    
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    db.query(logSql, [apiKeyData.id, req.path, clientIP, userAgent], (logErr) => {
      if (logErr) {
        console.error('❌ API Usage log error:', logErr);
      }
    });
    
    // Last used güncelle
    db.query("UPDATE api_keys SET last_used = NOW() WHERE id = ?", [apiKeyData.id]);
    
    req.apiUser = {
      id: apiKeyData.user_id,
      email: apiKeyData.email,
      plan_id: apiKeyData.plan_id,
      plan_name: apiKeyData.plan_name,
      api_key_id: apiKeyData.id
    };
    
    next();
  });
};

// ✅ ÖRNEK API ENDPOINT'LERİ

// 📌 TEST ENDPOINT
app.get("/api/test", verifyApiKey, (req, res) => {
  res.json({
    success: true,
    message: "API çalışıyor!",
    user: {
      id: req.apiUser.id,
      email: req.apiUser.email,
      plan: req.apiUser.plan_name
    },
    timestamp: new Date().toISOString()
  });
});

// 📌 LİSANS DOĞRULAMA API'Sİ (TEMİZ VERSİYON)
app.post("/api/verify-license", verifyApiKey, (req, res) => {
  const { license_key, hwid } = req.body;
  
  if (!license_key) {
    return res.status(400).json({
      success: false,
      error: "Lisans key gereklidir!"
    });
  }
  
  const sql = `
    SELECT 
      l.*, 
      u.email as user_email,
      u.fullname as user_name,
      p.name as plan_name
    FROM licenses l
    LEFT JOIN users u ON l.user_id = u.id
    LEFT JOIN plans p ON u.plan_id = p.id
    WHERE l.license_key = ? AND l.is_active = true
  `;
  
  db.query(sql, [license_key], (err, results) => {
    if (err) {
      console.error('❌ License verification error:', err);
      return res.status(500).json({
        success: false,
        error: "Sunucu hatası!"
      });
    }
    
    if (results.length === 0) {
      return res.json({
        success: false,
        error: "Geçersiz veya pasif lisans key!"
      });
    }
    
    const license = results[0];

    // ✅ SÜRE KONTROLÜ VE OTOMATİK PASİFE ÇEKME
    // Eğer süresi dolmuşsa (expires_at bugünden küçükse)
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      
      // Veritabanında is_active = 0 yap
      db.query("UPDATE licenses SET is_active = 0 WHERE id = ?", [license.id], (updateErr) => {
        if (updateErr) {
          console.error("❌ Lisans pasife çekilirken hata:", updateErr);
        } else {
          console.log(`ℹ️ Lisans ID ${license.id} süresi dolduğu için pasife çekildi.`);
        }
      });

      return res.json({
        success: false,
        error: "Lisans süresi dolmuş!"
      });
    }
    
    // HWID kontrolü
    if (license.require_hwid) {
      if (!hwid) {
        return res.json({
          success: false,
          error: "HWID gereklidir!"
        });
      }
      
      if (license.hwid && license.hwid !== hwid) {
        db.query(
          "INSERT INTO hwid_logs (license_id, old_hwid, new_hwid, action) VALUES (?, ?, ?, 'attempt')",
          [license.id, license.hwid, hwid]
        );
        
        return res.json({
          success: false,
          error: "HWID uyuşmuyor!"
        });
      }
      
      // İlk HWID kaydı
      if (!license.hwid) {
        db.query("UPDATE licenses SET hwid = ? WHERE id = ?", [hwid, license.id]);
        
        db.query(
          "INSERT INTO license_activity (license_id, activity_type, activity_detail) VALUES (?, 'activated', ?)",
          [license.id, `HWID ile aktif edildi: ${hwid}`]
        );
      }
    }
    
    res.json({
      success: true,
      message: "Lisans geçerli!",
      license: {
        id: license.id,
        user: license.user_name,
        plan: license.plan_name,
        expires_at: license.expires_at,
        hwid_locked: license.require_hwid
      }
    });
  });
});

// � ADMIN ENDPOINT'LERİ

// ✅ TÜM KULLANICILARI GETİR (ADMIN ONLY)
app.get("/admin/users", verifyToken, (req, res) => {
  const user_id = req.user.id;
  
  // Önce kullanıcının admin olup olmadığını kontrol et
  db.query("SELECT role FROM users WHERE id = ?", [user_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
    }
    
    if (results[0].role !== 'admin') {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok!" });
    }
    
    // Tüm kullanıcıları getir
    const sql = `
      SELECT 
        u.id, u.fullname, u.email, u.role, u.plan_id, u.created_at,
        p.name as plan_name,
        COUNT(l.id) as license_count
      FROM users u
      LEFT JOIN plans p ON u.plan_id = p.id
      LEFT JOIN licenses l ON u.id = l.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;
    
    db.query(sql, (err, results) => {
      if (err) {
        console.error('❌ Admin users fetch error:', err);
        return res.status(500).json({ message: "Kullanıcılar getirilemedi!" });
      }
      
      res.json({
        message: "Tüm kullanıcılar getirildi",
        users: results
      });
    });
  });
});

// ✅ TÜM LİSANSLARI GETİR (ADMIN ONLY)
app.get("/admin/licenses", verifyToken, (req, res) => {
  const user_id = req.user.id;
  
  // Admin kontrolü
  db.query("SELECT role FROM users WHERE id = ?", [user_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
    }
    
    if (results[0].role !== 'admin') {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok!" });
    }
    
    // Tüm lisansları getir
    const sql = `
      SELECT 
        l.*,
        u.fullname as user_name,
        u.email as user_email,
        p.name as plan_name
      FROM licenses l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN plans p ON u.plan_id = p.id
      ORDER BY l.created_at DESC
    `;
    
    db.query(sql, (err, results) => {
      if (err) {
        console.error('❌ Admin licenses fetch error:', err);
        return res.status(500).json({ message: "Lisanslar getirilemedi!" });
      }
      
      res.json({
        message: "Tüm lisanslar getirildi",
        licenses: results
      });
    });
  });
});

// ✅ KULLANICI ROLÜNÜ DEĞİŞTİR (ADMIN ONLY) - GÜVENLİK EKLENDİ
app.put("/admin/users/:id/role", verifyToken, (req, res) => {
  const admin_id = req.user.id;
  const target_user_id = req.params.id;
  const { role } = req.body;
  
  if (!role || !['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: "Geçerli bir rol giriniz! (admin/user)" });
  }
  
  // Admin kontrolü
  db.query("SELECT role, email, fullname FROM users WHERE id = ?", [admin_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
    }
    
    if (results[0].role !== 'admin') {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok!" });
    }
    
    const admin_email = results[0].email;
    const admin_name = results[0].fullname;
    
    // ✅ KRİTİK: Kendi rolünü değiştirmeyi engelle + LOG
    if (parseInt(admin_id) === parseInt(target_user_id)) {
      console.log(`� HAYIRDIR! ${admin_name} (${admin_email}) kendi rolünü değiştirmeye çalıştı!`);
      
      // Özel log kaydı - SEN HAYIRDIR?
      const logSql = `INSERT INTO security_logs (user_id, action, details, ip_address) 
                     VALUES (?, 'SELF_ROLE_CHANGE_ATTEMPT', ?, ?)`;
      const clientIP = getClientIP(req);
      
      db.query(logSql, [
        admin_id, 
        `${admin_name} (${admin_email}) kendi rolünü ${role} yapmaya çalıştı - SEN HAYIRDIR? �`, 
        clientIP
      ], (logErr) => {
        if (logErr) {
          console.error('❌ Security log kaydı hatası:', logErr);
        } else {
          console.log('✅ SEN HAYIRDIR logu kaydedildi!');
        }
      });
      
      return res.status(400).json({ 
        message: "Kendi rolünüzü değiştiremezsiniz! Sen hayırdır? �" 
      });
    }
    
    // Hedef kullanıcıyı bul
    db.query("SELECT email, fullname FROM users WHERE id = ?", [target_user_id], (err, targetResults) => {
      if (err || targetResults.length === 0) {
        return res.status(404).json({ message: "Hedef kullanıcı bulunamadı!" });
      }
      
      const target_email = targetResults[0].email;
      const target_name = targetResults[0].fullname;
      
      // Kullanıcı rolünü güncelle
      db.query("UPDATE users SET role = ? WHERE id = ?", [role, target_user_id], (err, result) => {
        if (err) {
          console.error('❌ User role update error:', err);
          return res.status(500).json({ message: "Rol güncellenemedi!" });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
        }
        
        // ✅ Başarılı işlem logu
        console.log(`✅ ${admin_name} (${admin_email}), ${target_name} (${target_email}) kullanıcısının rolünü ${role} yaptı`);
        
        const logSql = `INSERT INTO security_logs (user_id, action, details, ip_address) 
                       VALUES (?, 'ROLE_CHANGE', ?, ?)`;
        const clientIP = getClientIP(req);
        
        db.query(logSql, [
          admin_id, 
          `${admin_name} (${admin_email}) -> ${target_name} (${target_email}) rolünü ${role} yaptı`, 
          clientIP
        ], (logErr) => {
          if (logErr) {
            console.error('❌ Role change log kaydı hatası:', logErr);
          } else {
            console.log('✅ Rol değişikliği logu kaydedildi!');
          }
        });
        
        res.json({ 
          message: `Kullanıcı rolü ${role} olarak güncellendi!`,
          user_id: target_user_id,
          new_role: role
        });
      });
    });
  });
});


app.post("/admin/tuzak", verifyToken, (req, res) => {
  const user_id = req.user.id;
  const { action, details } = req.body;
  const clientIP = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const deviceInfo = getDeviceInfo(req);
  
  console.log(`� TUZAK YAKALANDI! User ${user_id}: ${action} - ${details}`);
  console.log(`� IP: ${clientIP}, Device: ${deviceInfo}`);
  
  // Kullanıcının gerçek rolünü kontrol et
  db.query("SELECT email, role FROM users WHERE id = ?", [user_id], (err, userResults) => {
    if (err) {
      console.error('❌ User query error:', err);
    }
    
    const realRole = userResults.length > 0 ? userResults[0].role : 'unknown';
    const userEmail = userResults.length > 0 ? userResults[0].email : 'unknown';
    
    console.log(`� GERÇEK DURUM: ${userEmail} - DB Role: ${realRole}`);
    
    // Detaylı güvenlik log'una kaydet
    const logSql = `INSERT INTO security_logs (user_id, action, details, ip_address, user_agent, device_info) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
    
    const fullDetails = `${details} | Gerçek DB Rolü: ${realRole} | IP: ${clientIP} | Device: ${deviceInfo}`;
    
    db.query(logSql, [user_id, action, fullDetails, clientIP, userAgent, deviceInfo], (err, result) => {
      if (err) {
        console.error('❌ Tuzak log hatası:', err);
        return res.status(500).json({ message: "Log kaydedilemedi!" });
      }
      
      console.log(`✅ Tuzak log kaydedildi - Log ID: ${result.insertId}`);
      
      // ✅ KRİTİK UYARI - Console'da renkli mesaj
      console.log(`%c� DİKKAT! ROL MANİPÜLASYONU TESPİT EDİLDİ!`, 
        'color: red; font-size: 16px; font-weight: bold;');
      console.log(`%cKullanıcı: ${userEmail}`, 'color: yellow;');
      console.log(`%cIP: ${clientIP}`, 'color: yellow;');
      console.log(`%cGerçek Rol: ${realRole}`, 'color: yellow;');
      
      res.json({ 
        success: true,
        message: "Tuzak loglandı! �",
        log_id: result.insertId,
        user_email: userEmail,
        real_role: realRole
      });
    });
  });
});

// ✅ GÜVENLİK LOGLARINI GETİREN ENDPOINT
app.get("/admin/security-logs", verifyToken, (req, res) => {
  const user_id = req.user.id;
  
  console.log('� Security logs requested by user:', req.user.email);
  
  // Önce kullanıcının admin olup olmadığını kontrol et
  db.query("SELECT role FROM users WHERE id = ?", [user_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
    }
    
    if (results[0].role !== 'admin') {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok!" });
    }
    
    // Tüm güvenlik loglarını getir (kullanıcı bilgileriyle birlikte)
    const sql = `
      SELECT 
        sl.*,
        u.email as user_email,
        u.fullname as user_name
      FROM security_logs sl
      LEFT JOIN users u ON sl.user_id = u.id
      ORDER BY sl.created_at DESC
      LIMIT 100
    `;
    
    db.query(sql, (err, results) => {
      if (err) {
        console.error('❌ Security logs fetch error:', err);
        return res.status(500).json({ message: "Loglar getirilemedi!" });
      }
      
      console.log(`✅ ${results.length} security log returned`);
      
      res.json({
        message: "Güvenlik logları getirildi",
        logs: results
      });
    });
  });
});

// ✅ KULLANICI SİL (ADMIN ONLY)
app.delete("/admin/users/:id", verifyToken, (req, res) => {
  const admin_id = req.user.id;
  const target_user_id = req.params.id;
  const clientIP = getClientIP(req); // IP adresini alıyoruz

  // Admin kontrolü
  db.query("SELECT role, email, fullname FROM users WHERE id = ?", [admin_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Yönetici bulunamadı!" });
    }

    if (results[0].role !== 'admin') {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok!" });
    }

    const adminEmail = results[0].email; // Log için admin emailini alalım

    // Kendini silmeyi engel      nnnnnnnnnnnnnnnn n      v bv bbv cvle
    if (parseInt(admin_id) === parseInt(target_user_id)) {
      return res.status(400).json({ message: "Kendinizi silemezsiniz!" });
    }

    // Kullanıcıyı sil
    db.query("DELETE FROM users WHERE id = ?", [target_user_id], (err, result) => {
      if (err) {
        console.error('❌ User delete error:', err);
        return res.status(500).json({ message: "Kullanıcı silinemedi!" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
      }

      // ✅ BURAYI EKLE: Başarılı silme işleminden sonra log tutuyoruz
      logActivity(
        admin_id,
        "KULLANICI_SILINDI",
        `Admin (${adminEmail}) tarafından ID: ${target_user_id} olan kullanıcı silindi.`,
        clientIP
      );

      res.json({
        message: "Kullanıcı başarıyla silindi!",
        user_id: target_user_id
      });
    });
  });
});

// ✅ ADMIN İSTATİSTİKLERİ - TOKEN BASED
app.get("/admin/stats", verifyToken, (req, res) => {
  const user_role = req.user.role; // ✅ TOKEN'DAKI ROLE'Ü KULLAN
  
  console.log('� ADMIN STATS - User:', req.user.email, 'Token Role:', user_role);
  
  // ✅ TOKEN'DAKI ROLE'Ü KONTROL ET (Database YERİNE)
  if (user_role !== 'admin') {
    console.log('❌ User is not admin in token');
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok!" });
  }
  
  console.log('✅ User is admin in token, proceeding...');
  
  // İstatistikleri getir
  const statsQueries = {
    total_users: "SELECT COUNT(*) as count FROM users",
    total_licenses: "SELECT COUNT(*) as count FROM licenses",
    active_licenses: "SELECT COUNT(*) as count FROM licenses WHERE is_active = true",
    recent_users: "SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
  };
  
  Promise.all(
    Object.entries(statsQueries).map(([key, query]) => 
      new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
          if (err) reject(err);
          else resolve({ [key]: results[0].count });
        });
      })
    )
  )
  .then(results => {
    const stats = Object.assign({}, ...results);
    res.json({
      message: "Admin istatistikleri getirildi",
      stats: stats
    });
  })
  .catch(error => {
    console.error('❌ Admin stats error:', error);
    res.status(500).json({ message: "İstatistikler getirilemedi!" });
  });
});

// ✅ BU ENDPOINT'İ BACKEND DOSYANIN EN SONUNA EKLE
// (app.listen'den önce)

// ✅ ADMIN DOĞRULAMA ENDPOINT'İ - ÇALIŞTIĞINDAN EMİN OL
app.get("/api/admin/verify", verifyToken, (req, res) => {
  try {
    console.log('� ADMIN VERIFY ENDPOINT CALLED');
    console.log('� User from token:', req.user);
    
    if (!req.user) {
      console.log('❌ No user in token');
      return res.status(401).json({ 
        isAdmin: false,
        message: "Token geçersiz!" 
      });
    }

    // Sadece token'daki rolü kontrol et
    if (req.user.role !== 'admin') {
      console.log('❌ Token role is not admin:', req.user.role);
      return res.status(403).json({ 
        isAdmin: false,
        message: "Admin yetkisi gerekli!" 
      });
    }

    console.log('✅ ADMIN ACCESS GRANTED:', req.user.email);
    
    // Başarılı response
    res.json({ 
      isAdmin: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      message: "Admin doğrulandı",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Admin verify error:', error);
    res.status(500).json({ 
      isAdmin: false,
      message: "Sunucu hatası!",
      error: error.message 
    });
  }
});

// ✅ TEST ENDPOINT - Token debug için
app.get("/api/test-token", verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
    message: "Token çalışıyor!",
    timestamp: new Date().toISOString()
  });
});

// ✅ PUBLIC TEST ENDPOINT - Middleware olmadan
app.get("/api/debug-headers", (req, res) => {
  console.log('� DEBUG HEADERS:', req.headers);
  res.json({
    headers: req.headers,
    authorization: req.headers.authorization
  });
});

// ✅ YÖNETİCİ LİSANS SİLME (BİLDİRİMLİ & LOGLU VERSİYON)
app.delete("/admin/licenses/:id", verifyToken, (req, res) => {
  const admin_id = req.user.id;
  const license_id = req.params.id;
  const clientIP = getClientIP(req);

  // 1. Admin Yetki Kontrolü
  db.query("SELECT role, email, fullname FROM users WHERE id = ?", [admin_id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: "Yönetici bulunamadı!" });
    if (results[0].role !== 'admin') return res.status(403).json({ message: "Yetkisiz işlem!" });

    const adminInfo = `${results[0].fullname} (${results[0].email})`;

    // 2. Silinecek Lisansın Bilgisini Al (Hem key hem de sahibi lazım)
    db.query("SELECT license_key, user_id FROM licenses WHERE id = ?", [license_id], (err, licenseResults) => {
      if (err || licenseResults.length === 0) return res.status(404).json({ message: "Lisans bulunamadı!" });
      
      const { license_key, user_id } = licenseResults[0];

      // 3. Lisansı Sil
      db.query("DELETE FROM licenses WHERE id = ?", [license_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Silme hatası!" });

        // ✅ LOG KAYDI
        logActivity(
          admin_id,
          "LISANS_SILINDI",
          `Yönetici ${adminInfo}, ${license_key} anahtarlı lisansı sildi.`,
          clientIP
        );

        // ✅ BİLDİRİM GÖNDERME
        sendNotification(
          user_id, 
          "Lisansınız Silindi ⚠️", 
          `"${license_key}" anahtarlı lisansınız bir yönetici tarafından silindi.`, 
          "warning"
        );

        res.json({ message: "Lisans başarıyla silindi, loglandı ve kullanıcıya bildirildi!" });
      });
    });
  });
});

// ✅ KULLANICI İSTATİSTİKLERİ ENDPOINT'İ
app.get("/user/statistics", verifyToken, (req, res) => {
  const user_id = req.user.id;

  // 1. Son 30 Günlük API Kullanımı
  const apiUsageSql = `
    SELECT 
      DATE(aul.timestamp) as date, 
      COUNT(*) as count 
    FROM api_usage_logs aul
    JOIN api_keys ak ON aul.api_key_id = ak.id
    WHERE ak.user_id = ? AND aul.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(aul.timestamp)
    ORDER BY date ASC
  `;

  // 2. Son Lisans Aktiviteleri (Oluşturma, Silme vb.)
  const activitySql = `
    SELECT la.activity_type, la.activity_detail, la.created_at, l.license_key
    FROM license_activity la
    JOIN licenses l ON la.license_id = l.id
    WHERE l.user_id = ?
    ORDER BY la.created_at DESC
    LIMIT 10
  `;

  // 3. Genel Özet Sayılar
  const summarySql = `
    SELECT 
      (SELECT COUNT(*) FROM licenses WHERE user_id = ?) as total_licenses,
      (SELECT COUNT(*) FROM licenses WHERE user_id = ? AND is_active = 1) as active_licenses,
      (SELECT COUNT(*) FROM api_keys WHERE user_id = ?) as total_api_keys
  `;

  db.query(apiUsageSql, [user_id], (err, usageResults) => {
    if (err) {
      console.error("Stats API Usage Error:", err);
      // Hata olsa bile boş dizi dönelim ki sayfa patlamasın
      usageResults = []; 
    }

    db.query(activitySql, [user_id], (err, activityResults) => {
      if (err) {
        console.error("Stats Activity Error:", err);
        activityResults = [];
      }

      db.query(summarySql, [user_id, user_id, user_id], (err, summaryResults) => {
        if (err) {
          console.error("Stats Summary Error:", err);
          return res.status(500).json({ error: "İstatistikler alınamadı" });
        }

        res.json({
          api_usage: usageResults,
          recent_activities: activityResults,
          summary: summaryResults[0] || { total_licenses: 0, active_licenses: 0, total_api_keys: 0 }
        });
      });
    });
  });
});

app.get("/api/status", (req, res) => {
  // 1. Veritabanını Kontrol Et
  db.query("SELECT 1", (err, result) => {
    if (err) {
      // Veritabanı cevap vermiyor ama API çalışıyor
      return res.json({
        api_status: "online", // API ayakta
        db_status: "offline", // Veritabanı patlak
        message: "Veritabanı bağlantısı kurulamadı!"
      });
    }
    
    // Her şey yolunda
    res.json({
      api_status: "online",
      db_status: "online",
      message: "Tüm sistemler operasyonel."
    });
  });
});

// ✅ AKTİVİTE LOGLARINI GETİR (Admin Only)
app.get("/admin/activity-logs", verifyToken, (req, res) => {
  // Sadece admin görebilir
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Yetkisiz erişim!" });
  }

  const sql = `
    SELECT 
      al.*, 
      u.fullname as user_name, 
      u.email as user_email 
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
    LIMIT 100
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Loglar alınamadı" });
    res.json({ logs: results });
  });
});

// --- BAKIM MODU ENDPOINTLERİ ---

// 1. Bakım Durumunu Kontrol Et (Herkes için)
app.get("/api/maintenance", (req, res) => {
  db.query("SELECT setting_value FROM settings WHERE setting_key = 'maintenance_mode'", (err, results) => {
    if (err) return res.status(500).json({ error: "DB Hatası" });
    
    // Eğer kayıt yoksa veya 'false' ise bakım kapalıdır
    const isActive = results.length > 0 && results[0].setting_value === 'true';
    res.json({ active: isActive });
  });
});

// 2. Bakım Modunu Aç/Kapa (Sadece Admin)
app.post("/admin/maintenance", verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Yetkisiz!" });
  
  const { active } = req.body; // true veya false gelir
  const value = active ? 'true' : 'false';
  
  // Varsa güncelle, yoksa ekle (Upsert mantığı)
  const sql = "INSERT INTO settings (setting_key, setting_value) VALUES ('maintenance_mode', ?) ON DUPLICATE KEY UPDATE setting_value = ?";
  
  db.query(sql, [value, value], (err, result) => {
    if (err) return res.status(500).json({ message: "Hata oluştu" });
    
    logActivity(req.user.id, "BAKIM_MODU", `Bakım modu ${active ? 'AÇILDI' : 'KAPATILDI'}`, getClientIP(req));
    res.json({ message: `Bakım modu ${active ? 'aktif edildi' : 'kapatıldı'}` });
  });
});

// ==========================================
// 📨 DESTEK SİSTEMİ (Ticket)
// ==========================================

// Kullanıcının Biletlerini Getir
app.get("/tickets", verifyToken, (req, res) => {
  db.query("SELECT * FROM tickets WHERE user_id = ? ORDER BY updated_at DESC", [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Hata" });
    res.json({ tickets: results });
  });
});

// Yeni Bilet Oluştur
app.post("/tickets", verifyToken, (req, res) => {
  const { subject, priority, message } = req.body;
  const user_id = req.user.id;

  if (!subject || !message) return res.status(400).json({ message: "Konu ve mesaj gereklidir!" });

  db.query("INSERT INTO tickets (user_id, subject, priority) VALUES (?, ?, ?)", 
    [user_id, subject, priority || 'medium'], 
    (err, result) => {
      if (err) return res.status(500).json({ message: "Hata" });
      
      const ticketId = result.insertId;
      db.query("INSERT INTO ticket_messages (ticket_id, user_id, message) VALUES (?, ?, ?)", 
        [ticketId, user_id, message], 
        (msgErr) => {
          if (msgErr) return res.status(500).json({ message: "Mesaj kaydedilemedi" });
          
          logActivity(user_id, "TICKET_OLUSTURULDU", `Yeni destek talebi: ${subject}`, getClientIP(req));
          res.json({ message: "Destek talebi oluşturuldu!", ticketId });
        }
      );
    }
  );
});

// Bilet Detaylarını Getir
app.get("/tickets/:id", verifyToken, (req, res) => {
  const ticketId = req.params.id;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  let sqlCheck = "SELECT t.*, u.fullname, u.email FROM tickets t JOIN users u ON t.user_id = u.id WHERE t.id = ?";
  if (!isAdmin) sqlCheck += " AND t.user_id = ?";
  
  db.query(sqlCheck, isAdmin ? [ticketId] : [ticketId, userId], (err, ticketResult) => {
    if (err || ticketResult.length === 0) return res.status(404).json({ message: "Bilet bulunamadı" });

    db.query(`SELECT tm.*, u.fullname, u.role, u.avatar_path FROM ticket_messages tm JOIN users u ON tm.user_id = u.id WHERE tm.ticket_id = ? ORDER BY tm.created_at ASC`, 
      [ticketId], 
      (msgErr, messages) => {
        res.json({ ticket: ticketResult[0], messages });
      });
  });
});

// 4. Bilete Cevap Yaz (GÜNCELLENMİŞ - BİLDİRİM DÜZELTİLDİ)
app.post("/tickets/:id/reply", verifyToken, (req, res) => {
  const ticketId = req.params.id;
  const { message } = req.body;
  const senderId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!message) return res.status(400).json({ message: "Mesaj boş olamaz!" });

  // 1. Önce biletin sahibini bulalım
  db.query("SELECT user_id, subject FROM tickets WHERE id = ?", [ticketId], (findErr, ticketResults) => {
    if (findErr || ticketResults.length === 0) {
      return res.status(404).json({ message: "Bilet bulunamadı" });
    }

    const ticketOwnerId = ticketResults[0].user_id;
    const ticketSubject = ticketResults[0].subject;

    // 2. Mesajı veritabanına ekle
    db.query("INSERT INTO ticket_messages (ticket_id, user_id, message) VALUES (?, ?, ?)", 
      [ticketId, senderId, message], 
      (err) => {
        if (err) return res.status(500).json({ message: "Hata oluştu" });

        // 3. Durumu güncelle: Admin yazdıysa 'answered', User yazdıysa 'open'
        const newStatus = isAdmin ? 'answered' : 'open';
        db.query("UPDATE tickets SET status = ?, updated_at = NOW() WHERE id = ?", [newStatus, ticketId]);

        // ✅ 4. BİLDİRİM GÖNDERME MANTIĞI (DÜZELTİLDİ)
        // Eğer cevap veren kişi Admin ise VE cevap veren kişi bilet sahibi değilse -> Bilet sahibine bildirim gönder
        if (isAdmin && senderId !== ticketOwnerId) {
          sendNotification(
            ticketOwnerId, 
            "Destek Talebi Yanıtlandı 📩", 
            `"${ticketSubject}" konulu destek talebinize bir yetkili yanıt verdi.`, 
            "success"
          );
          console.log(`Bildirim tetiklendi: User ID ${ticketOwnerId}`); // Debug için log
        }

        res.json({ message: "Cevap gönderildi" });
      }
    );
  });
});

// 5. Bileti Kapat (Admin)
app.put("/admin/tickets/:id/close", verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Yetkisiz" });
  db.query("UPDATE tickets SET status = 'closed' WHERE id = ?", [req.params.id], () => {
    logActivity(req.user.id, "TICKET_KAPATILDI", `Bilet kapatıldı: ${req.params.id}`, getClientIP(req));
    res.json({ message: "Bilet kapatıldı" });
  });
});

// 6. Tüm Biletleri Getir (Admin)
app.get("/admin/tickets", verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Yetkisiz" });
  
  const sql = `
    SELECT t.*, u.fullname, u.email, 
    (SELECT message FROM ticket_messages WHERE ticket_id = t.id ORDER BY created_at DESC LIMIT 1) as last_message
    FROM tickets t 
    JOIN users u ON t.user_id = u.id 
    ORDER BY t.updated_at DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Hata" });
    res.json({ tickets: results });
  });
});

cron.schedule('* * * * *', () => {
  console.log('⏰ Lisans süresi kontrolü çalışıyor...');
  
  const sql = `
    UPDATE licenses 
    SET is_active = 0, 
        last_check = NOW() 
    WHERE expires_at < NOW() AND is_active = 1
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('❌ Cron Job Hatası:', err);
    } else if (result.affectedRows > 0) {
      console.log(`✅ ${result.affectedRows} adet süresi dolmuş lisans pasife çekildi.`);
      
      // İsteğe bağlı: Bu işlem için log tutabilirsin
      // db.query("INSERT INTO system_logs ...") 
    } else {
      console.log('👍 Süresi dolup açık kalan lisans bulunamadı.');
    }
  });
});

//sistem sağlığını kontrol etme
app.get("/api/admin/health", verifyToken, (req, res) => {
  // Sadece admin erişebilir
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Yetkisiz erişim!" });
  }

  const startTime = Date.now();
  
  // 1. Veritabanı Bağlantı Testi ve Gecikme (Latency) Ölçümü
  db.query("SELECT 1", (err, result) => {
    const dbLatency = Date.now() - startTime;
    const dbStatus = err ? 'offline' : 'online';

    // 2. Sistem Bellek Kullanımı
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = Math.round((usedMem / totalMem) * 100);

    // 3. Sunucu Uptime (Çalışma Süresi)
    const uptime = os.uptime(); // Saniye cinsinden
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);

    // 4. CPU Load (Ortalama Yük - 1 dk'lık)
    // Windows'ta loadavg bazen 0 dönebilir, Linux/Mac için daha anlamlıdır.
    const loadAvg = os.loadavg(); 
    const cpuLoad = loadAvg ? loadAvg[0].toFixed(2) : 0;

    res.json({
      success: true,
      system: {
        status: 'online', // API cevap veriyorsa onlinedır
        uptime: `${uptimeHours}sa ${uptimeMinutes}dk`,
        platform: os.platform() + ' ' + os.release(),
        cpu_load: cpuLoad
      },
      database: {
        status: dbStatus,
        latency: dbLatency + 'ms'
      },
      memory: {
        used: (usedMem / 1024 / 1024).toFixed(0) + ' MB',
        total: (totalMem / 1024 / 1024).toFixed(0) + ' MB',
        percentage: memUsage
      },
      timestamp: new Date().toISOString()
    });
  });
});

// ✅ BİLDİRİM SİSTEMİ ENDPOINT'LERİ

// 1. Bildirimleri Getir
app.get("/notifications", verifyToken, (req, res) => {
  const user_id = req.user.id;
  
  db.query(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20", 
    [user_id], 
    (err, results) => {
      if (err) return res.status(500).json({ message: "Veritabanı hatası" });
      
      // Okunmamış sayısını da hesapla
      db.query(
        "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE",
        [user_id],
        (countErr, countResults) => {
          res.json({
            notifications: results,
            unread_count: countResults[0].count
          });
        }
      );
    }
  );
});

// 2. Bildirimi Okundu İşaretle
app.put("/notifications/:id/read", verifyToken, (req, res) => {
  const notification_id = req.params.id;
  const user_id = req.user.id;
  
  db.query(
    "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?", 
    [notification_id, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Hata oluştu" });
      res.json({ success: true });
    }
  );
});

// 3. Tümünü Okundu İşaretle
app.put("/notifications/read-all", verifyToken, (req, res) => {
  const user_id = req.user.id;
  
  db.query(
    "UPDATE notifications SET is_read = TRUE WHERE user_id = ?", 
    [user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Hata oluştu" });
      res.json({ success: true, message: "Tümü okundu işaretlendi" });
    }
  );
});

// 4. Bildirimi Sil
app.delete("/notifications/:id", verifyToken, (req, res) => {
  const notification_id = req.params.id;
  const user_id = req.user.id;
  
  db.query(
    "DELETE FROM notifications WHERE id = ? AND user_id = ?", 
    [notification_id, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Hata oluştu" });
      res.json({ success: true, message: "Bildirim silindi" });
    }
  );
});

// ✅ YARDIMCI FONKSİYON: BİLDİRİM GÖNDER (Bunu kodun içinde herhangi bir yerde kullanabilirsin)
const sendNotification = (userId, title, message, type = 'info') => {
  const sql = "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)";
  db.query(sql, [userId, title, message, type], (err) => {
    if (err) console.error("Bildirim oluşturma hatası:", err);
    else console.log(`Bildirim gönderildi -> User: ${userId}`);
  });
};

// ==========================================
// 📢 DUYURU SİSTEMİ (ANNOUNCEMENTS)
// ==========================================

// 1. Duyuru Oluştur (Admin)
app.post("/admin/announcements", verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Yetkisiz" });
  const { title, message, type } = req.body; // type: 'popup' veya 'banner'
  
  if (!title || !message) return res.status(400).json({ message: "Başlık ve mesaj gerekli!" });

  db.query("INSERT INTO announcements (title, message, type) VALUES (?, ?, ?)", 
    [title, message, type || 'popup'], 
    (err, result) => {
      if (err) return res.status(500).json({ message: "Veritabanı hatası" });
      
      // İstersen log tutabilirsin
      logActivity(req.user.id, "DUYURU_OLUSTURULDU", `Başlık: ${title} (${type})`, getClientIP(req));
      res.json({ message: "Duyuru başarıyla yayınlandı!" });
    }
  );
});

// 2. Aktif Duyuruları Getir (Kullanıcılar İçin)
app.get("/announcements", verifyToken, (req, res) => {
  // Sadece aktif olanları getir
  db.query("SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ message: "Hata" });
    res.json({ announcements: results });
  });
});

// 3. Duyuruyu Kaldır/Pasif Yap (Admin)
app.delete("/admin/announcements/:id", verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Yetkisiz" });
  
  // Tamamen silmek yerine is_active=0 yaparak arşivde tutuyoruz (tercihen)
  // Tamamen silmek istersen DELETE sorgusu kullanabilirsin.
  db.query("UPDATE announcements SET is_active = 0 WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Hata" });
    res.json({ message: "Duyuru yayından kaldırıldı." });
  });
});

// app.listen satırını değiştirin
app.listen(5000, '0.0.0.0', () => {
  console.log("✅ Backend 5000 portunda TÜM AĞda çalışıyor");
  console.log("➜ Local: http://localhost:5000");
  console.log("➜ Network: http://192.168.1.105:5000");
});