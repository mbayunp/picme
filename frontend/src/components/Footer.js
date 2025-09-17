import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import logo from '../assets/images/logo2.png';

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-column brand-column">
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
        
        <div className="footer-column navigation-column">
          <h3>Home</h3>
          <ul>
            <li><Link to="/portfolio">Portfolio</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="#">Review</Link></li>
            <li><Link to="#">Blog</Link></li>
          </ul>
        </div>
        
        <div className="footer-column policy-column">
          <ul>
            <li><Link to="#">Privacy Policy</Link></li>
            <li><Link to="#">Terms and Condition</Link></li>
            <li><Link to="#">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">Copyright 2025 - Picme Studio. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
