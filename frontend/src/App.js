// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Header from "./components/Header.js";
import Footer from "./components/Footer.js";
import SmoothWormEffect from "./components/SmoothWormEffect.js";
import ScrollToTop from "./components/ScrollToTop.js";

// Pages
import HomePage from "./pages/HomePage.js";
import PortfolioPage from "./pages/PortfolioPage.js";
import ServicesPage from "./pages/ServicesPage.js";
import NewsletterPage from "./pages/NewsletterPage.js";
import PostDetailPage from "./pages/PostDetailPage.js";
import AdminDashboard from "./pages/AdminDashboard.js";
import AdminLoginPage from "./pages/AdminLoginPage.js";
import AdminRegisterPage from "./pages/AdminRegisterPage.js";
import ContactPage from "./pages/ContactPage.js";
import NotFoundPage from "./pages/NotFoundPage.js"; // Import komponen baru

function App() {
  return (
    <Router>
      <ScrollToTop />
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
          <Route
            path="/blog/:id"
            element={
              <>
                <Header />
                <PostDetailPage />
                <Footer />
              </>
            }
          />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/register" element={<AdminRegisterPage />} />

          {/* Rute 404 (Not Found) - harus diletakkan di paling akhir */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;