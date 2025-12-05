// middleware/auth.js - DEBUG VERSİYONU
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  console.log('� VERIFY TOKEN MIDDLEWARE CALLED');
  console.log('� URL:', req.url);
  console.log('� Headers:', Object.keys(req.headers));
  
  const authHeader = req.headers.authorization;
  console.log('� Auth Header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log('❌ No Bearer token in header');
    return res.status(401).json({ message: "Token gerekli! Format: Bearer <token>" });
  }

  const token = authHeader.split(" ")[1];
  console.log('� Token extracted:', token ? `${token.substring(0, 20)}...` : 'NULL');

  if (!token) {
    console.log('❌ No token after split');
    return res.status(401).json({ message: "Token bulunamadı!" });
  }

  // ✅ DEBUG: JWT_SECRET kontrolü
  console.log('� JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('� JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

  // ✅ KESİN SIGNATURE KONTROLÜ
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ TOKEN VERIFICATION FAILED:", err.message);
      console.log("❌ Error name:", err.name);
      
      if (err.name === "JsonWebTokenError") {
        return res.status(403).json({ message: "Geçersiz token signature!" });
      } else if (err.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Token süresi dolmuş!" });
      } else {
        return res.status(403).json({ message: "Token doğrulama hatası!" });
      }
    }
    
    console.log("✅ TOKEN VERIFIED - User:", decoded);
    req.user = decoded;
    next();
  });
};

export default verifyToken;