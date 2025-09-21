import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Header from "./components/Header.js";
import Footer from "./components/Footer.js";
import SmoothWormEffect from "./components/SmoothWormEffect.js";

// Pages
import HomePage from "./pages/HomePage.js";
import PortfolioPage from "./pages/PortfolioPage.js";
import ServicesPage from "./pages/ServicesPage.js";
// import ProdukPage from "./pages/ProdukPage.js"; // Hapus impor ini
import NewsletterPage from "./pages/NewsletterPage.js";
import AdminDashboard from "./pages/AdminDashboard.js";
import AdminLoginPage from "./pages/AdminLoginPage.js";
import AdminRegisterPage from "./pages/AdminRegisterPage.js";
import ContactPage from "./pages/ContactPage.js";

function App() {
  return (
    <Router>
      <SmoothWormEffect />
      <div className="min-h-screen flex flex-col font-sans bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <>
                <Header />
                <HomePage />
                <Footer />
              </>
            }
          />
          <Route
            path="/portfolio"
            element={
              <>
                <Header />
                <PortfolioPage />
                <Footer />
              </>
            }
          />
          <Route
            path="/services"
            element={
              <>
                <Header />
                <ServicesPage />
                <Footer />
              </>
            }
          />
          {/* Rute untuk halaman Kontak yang baru */}
          <Route
            path="/contact"
            element={
              <>
                <Header />
                <ContactPage />
                <Footer />
              </>
            }
          />
          <Route
            path="/newsletter"
            element={
              <>
                <Header />
                <NewsletterPage />
                <Footer />
              </>
            }
          />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/register" element={<AdminRegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;