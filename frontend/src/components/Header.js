import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";
import logo3 from "../assets/images/logo3.png";

function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const location = useLocation();

    const pageTitles = {
        "/": "HOMEPAGE",
        "/portfolio": "PORTFOLIO",
        "/services": "SERVICES",
        "/newsletter": "NEWSLETTER",
        "/contact": "CONTACT",
    };

    let pageName = "PAGE";
    if (pageTitles[location.pathname]) {
        pageName = pageTitles[location.pathname];
    } else if (location.pathname.startsWith('/blog/')) {
        pageName = "NEWSLETTER";
    }

    useEffect(() => {
        const onScroll = () => {
            const isScrolledDown = window.scrollY > 50;
            const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 100;
            
            setScrolled(isScrolledDown);
            setIsAtBottom(atBottom);
        };
        
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
            {!scrolled ? (
                <header className="fixed top-0 left-0 w-full bg-white shadow z-50 flex justify-between items-center px-4 md:px-10 py-3">
                    <Link to="/">
                        <img src={logo} alt="Pictme logo" className="h-16 md:h-20 w-auto" />
                    </Link>
                    <nav className="hidden md:flex gap-6 font-semibold text-gray-800">
                        <Link to="/" className="hover:text-blue-500 transition-colors">Homepage</Link>
                        <Link to="/portfolio" className="hover:text-blue-500 transition-colors">Portfolio</Link>
                        <Link to="/services" className="hover:text-blue-500 transition-colors">Services</Link>
                        <Link to="/newsletter" className="hover:text-blue-500 transition-colors">Newsletter</Link>
                        <Link to="/contact" className="hover:text-blue-500 transition-colors">Contact</Link>
                    </nav>
                </header>
            ) : (
                <div className="fixed top-4 left-4 md:top-6 md:left-12 z-50"> 
                    <Link to="/">
                        <img src={logo3} alt="Pictme logo scrolled" className="h-16 md:h-20 w-auto" />
                    </Link>
                </div>
            )}

            <button
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsOpen((s) => !s)}
            className={`fixed p-2 rounded-md z-[51] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-300
                ${scrolled
                    ? 'block top-4 right-4 md:top-6 md:right-6' 
                    : 'md:hidden top-[18px] right-4 md:top-[22px] md:right-10' 
                }
                ${(scrolled && isOpen)
                    ? 'bg-teal-500 text-white'
                    : 'text-teal-500'
                }
            `}
        >
            {isOpen ? (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ) : (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
        </button>


            <div
                className={`fixed inset-0 bg-black bg-opacity-25 z-[49] transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => setIsOpen(false)}
            ></div>

            <div
                className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="p-6 flex flex-col h-full">
                    <nav className="flex-1 flex flex-col gap-4 text-gray-800 font-semibold pt-16">
                        <Link to="/" onClick={() => setIsOpen(false)} className="block p-2 hover:bg-gray-100 rounded">Homepage</Link>
                        <Link to="/portfolio" onClick={() => setIsOpen(false)} className="block p-2 hover:bg-gray-100 rounded">Portfolio</Link>
                        <Link to="/services" onClick={() => setIsOpen(false)} className="block p-2 hover:bg-gray-100 rounded">Services</Link>
                        <Link to="/newsletter" onClick={() => setIsOpen(false)} className="block p-2 hover:bg-gray-100 rounded">Newsletter</Link>
                        <Link to="/contact" onClick={() => setIsOpen(false)} className="block p-2 hover:bg-gray-100 rounded">Contact</Link>
                    </nav>
                    <div className="mt-auto text-sm text-gray-500 pt-4 border-t border-gray-200">
                        © {new Date().getFullYear()} Pictme
                    </div>
                </div>
            </div>

            <div className="fixed left-11 md:left-11 bottom-6 z-40"> 
                <span className="block origin-bottom-left md:origin-left transform -rotate-90 md:-rotate-90 text-sm font-semibold text-gray-700 tracking-wider">
                    {pageName}
                </span>
            </div>

            <button
                onClick={scrollToTop}
                className={`fixed right-4 bottom-6 z-40 flex flex-col items-center gap-2 focus:outline-none transition-opacity duration-300 ${isAtBottom ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                aria-label="Back to top"
            >
                <span className="text-sm text-teal-500 font-medium">BACK TO TOP</span>
                <span className="w-10 h-10 flex items-center justify-center rounded-full border border-teal-500 text-teal-500">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 19V6M5 13l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
            </button>
        </>
    );
}

export default Header;