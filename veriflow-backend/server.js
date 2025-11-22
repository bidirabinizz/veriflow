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
import crypto from 'crypto'; // ✅ Bunu ekle


dotenv.config();
const app = express();

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
// 📌 KAYIT OL - OTOMATİK FREE PLAN ATAMA (GÜNCELLENMİŞ)
app.post("/register", (req, res) => {
  const { fullname, email, password } = req.body;
  
  const clientIP = getClientIP(req);
  const deviceInfo = getDeviceInfo(req);
  
  console.log(`📝 REGISTER ATTEMPT - IP: ${clientIP}, Email: ${email}`);
  
  if (!fullname || !email || !password)
    return res.status(400).json({ message: "Eksik bilgi!" });

  // Önce Free plan'ın ID'sini bul
  db.query("SELECT id FROM plans WHERE name = 'Free'", (err, planResults) => {
    if (err) {
      console.error("❌ Plan query error:", err);
      return res.status(500).json({ message: "Sistem hatası!" });
    }
    
    if (planResults.length === 0) {
      console.error("❌ Free plan bulunamadı!");
      return res.status(500).json({ message: "Sistem hatası!" });
    }

    const freePlanId = planResults[0].id;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err) {
        console.error("❌ Register database error:", err);
        return res.status(500).json({ message: "Database hatası", error: err });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ message: "Bu email zaten kayıtlı!" });
      }

      const hash = bcrypt.hashSync(password, 10);
      
      // Free plan ile kullanıcı oluştur
      const sql = "INSERT INTO users (fullname, email, password_hash, plan_id) VALUES (?, ?, ?, ?)";
      
      db.query(sql, [fullname, email, hash, freePlanId], (err, result) => {
        if (err) {
          console.error("❌ Register insert error:", err);
          return res.status(500).json({ message: "Kayıt hatası", error: err });
        }
        
        // ✅ Başarılı kayıt logu
        const newUserId = result.insertId;
        logLoginAttempt(newUserId, clientIP, deviceInfo, 'success');
        
        console.log(`✅ Yeni kullanıcı Free plan ile oluşturuldu: ${email}, Plan ID: ${freePlanId}`);
        
        res.json({ 
          message: "Kayıt başarılı! Free plan aktif edildi.",
          plan: "Free"
        });
      });
    });
  });
});

// 📌 Giriş Yap
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  const clientIP = getClientIP(req);
  const deviceInfo = getDeviceInfo(req);
  
  console.log(`🔐 LOGIN ATTEMPT - IP: ${clientIP}, Device: ${deviceInfo}`);
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email ve şifre gereklidir!" });
  }
  
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
    const isMatch = bcrypt.compareSync(password, user.password_hash);

    if (!isMatch) {
      logLoginAttempt(user.id, clientIP, deviceInfo, 'failed');
      return res.status(401).json({ message: "Şifre hatalı" });
    }

    const token = jwt.sign({ 
      id: user.id, 
      email: user.email,
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
        email: user.email,
        fullname: user.fullname
      }
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

// 📌 YENİ LİSANS OLUŞTURMA - LİMİT KONTROLLÜ
app.post("/licenses", verifyToken, (req, res) => {
  const { license_key, expires_at, require_hwid = false } = req.body;
  const user_id = req.user.id;

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

    console.log(`📊 Lisans kontrolü: ${currentLicenses}/${licenseLimit}`);

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
      
      // Aktivite logu
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

  if (!plan_id) {
    return res.status(400).json({ message: "Plan ID gereklidir!" });
  }

  // Plan var mı kontrol et
  db.query("SELECT * FROM plans WHERE id = ?", [plan_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Plan bulunamadı!" });
    }

    const newPlan = results[0];

    // Kullanıcının planını güncelle
    db.query("UPDATE users SET plan_id = ? WHERE id = ?", [plan_id, user_id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Plan güncelleme hatası!", error: err });
      }

      console.log(`✅ Kullanıcı planı güncellendi: ${user_id} -> ${newPlan.name}`);
      
      res.json({ 
        message: `Plan başarıyla ${newPlan.name} olarak güncellendi!`,
        new_plan: newPlan.name,
        license_limit: newPlan.license_limit
      });
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

app.delete("/licenses/:id", verifyToken, (req, res) => {
  const license_id = req.params.id;
  const user_id = req.user.id;
  
  db.query("SELECT id FROM licenses WHERE id = ? AND user_id = ?", [license_id, user_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Lisans bulunamadı!" });
    }
    
    db.query("DELETE FROM licenses WHERE id = ?", [license_id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Silme hatası!", error: err });
      }
      
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

app.put("/licenses/:id", verifyToken, (req, res) => {
  const license_id = req.params.id;
  const user_id = req.user.id;
  const { is_active, require_hwid, expires_at } = req.body;
  
  db.query("SELECT id FROM licenses WHERE id = ? AND user_id = ?", [license_id, user_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Lisans bulunamadı!" });
    }
    
    const sql = `UPDATE licenses SET is_active = ?, require_hwid = ?, expires_at = ? WHERE id = ?`;
    
    db.query(sql, [is_active, require_hwid, expires_at, license_id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Güncelleme hatası!", error: err });
      }
      
      db.query(
        "INSERT INTO license_activity (license_id, activity_type, activity_detail) VALUES (?, 'updated', 'Lisans güncellendi')",
        [license_id]
      );
      
      res.json({ message: "Lisans başarıyla güncellendi!" });
    });
  });
});

app.post("/licenses/:id/reset-hwid", verifyToken, (req, res) => {
  const license_id = req.params.id;
  const user_id = req.user.id;
  
  db.query("SELECT id, license_key, hwid FROM licenses WHERE id = ? AND user_id = ?", [license_id, user_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Lisans bulunamadı!" });
    }
    
    const license = results[0];
    
    db.query("UPDATE licenses SET hwid = NULL WHERE id = ?", [license_id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "HWID sıfırlama hatası!", error: err });
      }
      
      db.query(
        "INSERT INTO license_activity (license_id, activity_type, activity_detail) VALUES (?, 'hwid_reset', ?)",
        [license_id, `HWID sıfırlandı. Eski HWID: ${license.hwid || 'Yok'}`]
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


// 📌 YENİ API KEY OLUŞTURMA
app.post("/api/keys", verifyToken, (req, res) => {
  const user_id = req.user.id;
  const { name } = req.body;
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: "API Key adı gereklidir!" });
  }
  
  // ✅ Rastgele API Key oluştur - crypto.randomBytes kullan
  const generateApiKey = () => {
    const prefix = 'cw_';
    const randomPart = crypto.randomBytes(24).toString('hex'); // ✅ crypto import edildi
    return prefix + randomPart;
  };
  
  const api_key = generateApiKey();
  const key_value = bcrypt.hashSync(api_key, 10); // Key'i hash'le
  
  const sql = `
    INSERT INTO api_keys (user_id, name, api_key, key_value) 
    VALUES (?, ?, ?, ?)
  `;
  
  db.query(sql, [user_id, name.trim(), api_key, key_value], (err, result) => {
    if (err) {
      console.error('❌ API Key creation error:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: "Bu API Key zaten mevcut, lütfen tekrar deneyin!" });
      }
      return res.status(500).json({ message: "API Key oluşturulamadı!" });
    }
    
    res.json({
      message: "API Key başarıyla oluşturuldu! Bu key'i güvenli bir yere kaydedin.",
      api_key: {
        id: result.insertId,
        name: name.trim(),
        api_key: api_key, // Sadece oluşturulduğunda göster
        created_at: new Date()
      }
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
        error: "Geçersiz lisans key!"
      });
    }
    
    const license = results[0];
    
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
    
    // Süre kontrolü
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return res.json({
        success: false,
        error: "Lisans süresi dolmuş!"
      });
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

// app.listen satırını değiştirin
app.listen(5000, '0.0.0.0', () => {
  console.log("✅ Backend 5000 portunda TÜM AĞda çalışıyor");
  console.log("➜ Local: http://localhost:5000");
  console.log("➜ Network: http://192.168.1.105:5000");
});