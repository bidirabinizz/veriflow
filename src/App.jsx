import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from './pages/Login';
import Register from "./pages/Register";
import Fiyatlandirma from "./pages/Fiyatlandirma";
import Dashboard from "./pages/Dashboard";
import "./i18n/i18n"
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NasilKullanilir from "./pages/NasilKullanilir";
import SifremiUnuttum from "./pages/SifremiUnuttum";
import LicenseDetail from './components/LicenseDetail';
import AdminDashboard from './pages/AdminDashboard';


function AuthWrapper({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const publicPaths = ['/', '/login', '/register', '/fiyatlandirma', '/nasilkullanilir','/sifremiunuttum'];
    const isPublicPath = publicPaths.includes(location.pathname);
    
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    // Dashboard gibi protected route'lara token olmadan erişimi engelle
    if (!isPublicPath && !token) {
      navigate('/login');
    }
  }, [location, navigate]);

  return children;
}


function App() {
  return (
    <Router>
      <AuthWrapper>
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
        <Navbar />
        {/* Navbar yüksekliği kadar padding ekliyoruz */}
        <main className="pt-20 flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/fiyatlandirma" element={<Fiyatlandirma />} />
            <Route path="/nasilkullanilir" element={<NasilKullanilir /> } />
            <Route path="/sifremiunuttum" element={<SifremiUnuttum />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard/licenses/:id" element={<LicenseDetail />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />      
            <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
            
          </Routes>
        </main>
        <Footer />
      </div>
      </AuthWrapper>
    </Router>
  );
}

export default App;
