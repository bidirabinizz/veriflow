import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token gerekli! Format: Bearer <token>" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token bulunamadı!" });
  }

  // ✅ KESİN SIGNATURE KONTROLÜ
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ TOKEN VERIFICATION FAILED:", err.message);
      
      if (err.name === "JsonWebTokenError") {
        return res.status(403).json({ message: "Geçersiz token signature!" });
      } else if (err.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Token süresi dolmuş!" });
      } else {
        return res.status(403).json({ message: "Token doğrulama hatası!" });
      }
    }
    
    req.user = decoded;
    console.log("✅ TOKEN VERIFIED - User:", decoded.email);
    next();
  });
};

export default verifyToken;