// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo2.png';

function Footer() {
  return (
    <footer className="bg-[#0d1a2c] text-white font-sans pt-12 pb-5 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center md:justify-between gap-8 md:gap-12 pb-10 border-b border-[#333]">
          
          {/* Kolom Merek & Newsletter (Kiri) */}
          <div className="w-full sm:w-auto text-center md:text-left flex-shrink-0">
            <Link to="/" className="inline-flex items-center text-white text-4xl font-bold mb-5">
              <img src={logo} alt="Logo Picme Studio" className="h-20 sm:h-24 mr-2"/>
            </Link>
            <p className="text-sm text-[#ccc] mb-2">Subscribe our newsletter:</p>
            <form className="flex items-center bg-white rounded-full overflow-hidden w-full max-w-[250px] mx-auto md:mx-0 mb-5">
              <input 
                type="email" 
                placeholder="ENTER YOUR EMAIL" 
                className="border-none p-3 flex-grow text-sm text-[#333] focus:outline-none"
              />
              <button 
                type="submit" 
                className="bg-[#ff9100] border-none text-white text-xl p-3 cursor-pointer rounded-full w-10 h-10 flex items-center justify-center mr-1 transition-colors duration-300 hover:bg-[#e68200]"
              >
                →
              </button>
            </form>
          </div>

          {/* Kolom Media Sosial (Tengah) */}
          <div className="w-full sm:w-auto mt-8 sm:mt-0 flex flex-col items-center justify-start md:mt-24 md:flex-grow-0">
            <div className="flex justify-center gap-4">
              <a href="https://www.instagram.com/picme.photostudio/" className="text-white text-2xl transition-colors duration-300 hover:text-[#ff9100]"><i className="fab fa-instagram"></i></a>
              <a href="https://www.tiktok.com/@picme.photostudio" className="text-white text-2xl transition-colors duration-300 hover:text-[#ff9100]"><i className="fab fa-tiktok"></i></a>
              <a href="https://wa.me/6285175095670" className="text-white text-2xl transition-colors duration-300 hover:text-[#ff9100]"><i className="fab fa-whatsapp"></i></a>
            </div>
          </div>
          
          {/* Kolom Navigasi dan Kebijakan (Kanan) */}
          <div className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-start gap-8 mt-8 sm:mt-0 flex-shrink-0">
            <div className="w-full sm:w-auto text-center sm:text-left">
              <h3 className="text-[#ff9100] text-lg font-semibold mb-3">Home</h3>
              <ul className="list-none p-0 space-y-2">
                <li><Link to="/portfolio" className="text-white text-base hover:text-[#ff9100] transition-colors duration-300">Portfolio</Link></li>
                <li><Link to="/services" className="text-white text-base hover:text-[#ff9100] transition-colors duration-300">Services</Link></li>
                <li><Link to="/newsletter" className="text-white text-base hover:text-[#ff9100] transition-colors duration-300">Newsletter</Link></li>
                <li><Link to="/contact" className="text-white text-base hover:text-[#ff9100] transition-colors duration-300">Contact</Link></li>
              </ul>
            </div>
            
            <div className="w-full sm:w-auto text-center sm:text-left mt-8 sm:mt-0 md:ml-12">
              <h3 className="text-lg font-semibold text-transparent">Policies</h3> 
              <ul className="list-none p-0 space-y-2">
                {/* ✅ PERBAIKAN: Mengganti tautan placeholder dengan rute yang benar */}
                <li><Link to="/privacy-policy" className="text-[#ccc] text-base hover:text-[#ff9100] transition-colors duration-300">Privacy Policy</Link></li>
                <li><Link to="/terms-and-conditions" className="text-[#ccc] text-base hover:text-[#ff9100] transition-colors duration-300">Terms and Condition</Link></li>
                <li><Link to="/cookie-policy" className="text-[#ccc] text-base hover:text-[#ff9100] transition-colors duration-300">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-xs text-[#666]">Copyright 2025 - Picme Studio. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;