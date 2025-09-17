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
import ProdukPage from "./pages/ProdukPage.js";
import NewsletterPage from "./pages/NewsletterPage.js";
import AdminDashboard from "./pages/AdminDashboard.js";
import AdminLoginPage from "./pages/AdminLoginPage.js";
import AdminRegisterPage from "./pages/AdminRegisterPage.js";

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
          <Route
            path="/produk"
            element={
              <>
                <Header />
                <ProdukPage />
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
