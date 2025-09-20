import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Mapping path ke nama halaman
  const pageTitles = {
    "/": "HOMEPAGE",
    "/portfolio": "PORTFOLIO",
    "/services": "SERVICES",
    "/newsletter": "NEWSLETTER",
    "/produk": "OTHER",
  };

  const pageName = pageTitles[location.pathname] || "PAGE";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* HEADER */}
      {!scrolled ? (
        // --- Header awal sebelum scroll ---
        <header className="fixed top-0 left-0 w-full bg-white shadow z-50 flex justify-between items-center px-10 py-4">
          <Link to="/">
            <img src={logo} alt="Pictme logo" className="h-16 w-auto" />
          </Link>
          <nav className="flex gap-6 font-semibold text-gray-800">
            <Link to="/" className="hover:text-blue-500 transition-colors">
              Homepage
            </Link>
            <Link
              to="/portfolio"
              className="hover:text-blue-500 transition-colors"
            >
              Portfolio
            </Link>
            <Link
              to="/services"
              className="hover:text-blue-500 transition-colors"
            >
              Services
            </Link>
            <Link
              to="/newsletter"
              className="hover:text-blue-500 transition-colors"
            >
              Newsletter
            </Link>
            <Link to="/produk" className="hover:text-blue-500 transition-colors">
              Other
            </Link>
          </nav>
        </header>
      ) : (
        // --- Header setelah scroll ---
        <>
          {/* Logo kiri atas */}
          <div className="fixed top-6 left-12 z-50">
            <Link to="/">
              <img src={logo} alt="Pictme logo" className="h-14 w-auto" />
            </Link>
          </div>

          {/* Hamburger kanan atas */}
          <button
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsOpen((s) => !s)}
            className="fixed top-6 right-6 z-50 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300"
          >
            {!isOpen ? (
              <svg
                className="w-8 h-8 text-teal-500"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-teal-500"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6 6l12 12M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          {/* Sidebar */}
          <div
            className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300
            ${isOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="p-6 flex flex-col h-full">
              <nav className="flex-1 flex flex-col gap-4 text-gray-800 font-semibold">
                <Link to="/" onClick={() => setIsOpen(false)}>
                  Homepage
                </Link>
                <Link to="/portfolio" onClick={() => setIsOpen(false)}>
                  Portfolio
                </Link>
                <Link to="/services" onClick={() => setIsOpen(false)}>
                  Services
                </Link>
                <Link to="/newsletter" onClick={() => setIsOpen(false)}>
                  Newsletter
                </Link>
                <Link to="/produk" onClick={() => setIsOpen(false)}>
                  Other
                </Link>
              </nav>
              <div className="mt-auto text-sm text-gray-500">
                © {new Date().getFullYear()} Pictme
              </div>
            </div>
          </div>
        </>
      )}

      {/* Nama halaman kiri bawah */}
      <div className="fixed left-12 bottom-24 z-40">
        <span className="block transform -rotate-90 origin-left text-sm font-semibold text-gray-700 tracking-wider px-4">
          {pageName}
        </span>
      </div>

      {/* Scroll to top kanan bawah */}
      <button
        onClick={scrollToTop}
        className="fixed right-4 bottom-6 z-50 flex flex-col items-center gap-2 focus:outline-none"
        aria-label="Back to top"
      >
        <span className="text-sm text-teal-500 font-medium">
          BACK TO TOP
        </span>
        <span className="w-10 h-10 flex items-center justify-center rounded-full border border-teal-500 text-teal-500">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 19V6M5 13l7-7 7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </>
  );
}

export default Header;