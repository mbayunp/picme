import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo2.png';
import './Footer.css'; // Tetap gunakan CSS kustom Anda

function Footer() {
  return (
    <footer className="footer-container">
      {/* Menggunakan max-w-7xl dan mx-auto untuk memusatkan konten di tengah */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Menggunakan flex-wrap untuk responsivitas */}
        <div className="footer-content flex flex-wrap justify-center md:justify-between gap-8 md:gap-12">
          
          {/* Kolom Merek & Newsletter */}
          <div className="footer-column brand-column w-full sm:w-auto text-center md:text-left">
            <Link to="/" className="footer-logo">
              <img src={logo} alt="Logo Picme Studio" />
            </Link>
            <p className="newsletter-text">Subscribe our newsletter:</p>
            <form className="newsletter-form">
              <input type="email" placeholder="ENTER YOUR EMAIL" />
              <button type="submit" className="newsletter-btn">→</button>
            </form>
            <div className="social-icons">
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-tiktok"></i></a>
              <a href="#"><i className="fab fa-whatsapp"></i></a>
            </div>
          </div>
          
          {/* Kolom Navigasi dan Kebijakan */}
          <div className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-start gap-8 mt-8 sm:mt-0">
            <div className="footer-column navigation-column w-full sm:w-auto">
              <h3>Home</h3>
              <ul>
                <li><Link to="/portfolio">Portfolio</Link></li>
                <li><Link to="/services">Services</Link></li>
                <li><Link to="#">Review</Link></li>
                <li><Link to="#">Blog</Link></li>
              </ul>
            </div>
            
            <div className="footer-column policy-column w-full sm:w-auto">
              <ul>
                <li><Link to="#">Privacy Policy</Link></li>
                <li><Link to="#">Terms and Condition</Link></li>
                <li><Link to="#">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">Copyright 2025 - Picme Studio. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;