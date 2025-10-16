import { Link, useLocation } from "react-router-dom"; // ✅ Import useLocation
import axios from "axios";
import moment from "moment";
import InitialBanner from "../components/InitialBanner";
import { FaChevronLeft, FaChevronRight, FaQuoteLeft } from 'react-icons/fa';
import { useState, useEffect, useRef, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

// Komponen Liquid Blob
const LiquidBlobAnimation = () => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="liquid-blob-container">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
                <div className="blob blob-4"></div>
                <div className="blob blob-5"></div>
                <div className="blob blob-6"></div>
            </div>
        </div>
    );
};
// Komponen Testimonial Section
function TestimonialSection() {
    const testimonials = [
        { id: 1, name: "Agus Ahmad Juandi", role: "Customer", avatar: "/images/testi1.png", text: "Tempatnya bersih, cozy, kameranya oke banget cocok buat yang mau buat untuk teman dan keluarga. Oke banget pokonyaaa must tryy!!!." },
        { id: 2, name: "Muh Iqshan", role: "Customer", avatar: "/images/testi2.png", text: "Harga budget pelajar kualitas anti gagal dah, note disini fotonya pake time ya bukan per 1 photo, jadi kalian bisa foto sepuasnya dengan waktu yang di tentukan dan semua hasil foto dikirim overall Mntap" },
        { id: 3, name: "Melani 06", role: "Customer", avatar: "/images/testi3.png", text: "Foto Studio Palingg keren di Cianjur! Selain harga nya Murmer,Kaka” yg jaga nya Ramah lagi. ga nyesel dehh Best bgtt!🤩😍👍🏻✨" },
        { id: 4, name: "Nur syifa Fitria", role: "Customer", avatar: "/images/testi4.png", text: "Tempatnya bagus nyaman hasil fotonya pun bagus jernih udah 3 kali gapernah gagal tidak mengecewakan." },
        { id: 5, name: "Ratu Ratustftmh", role: "Customer", avatar: "/images/testi5.png", text: "Bagus banget,hasil foto jernih,kualitasnya bagus,tempat bersih,ramah dikantong pelajar hehehe udah beberapa kali foto disini❤️❤️." },
        { id: 6, name: "Muhammad Salman N", role: "Customer", avatar: "/images/testi6.png", text: "GOKILLL🔥, BUAT KALIAN YANG MAU DIPOTO STUDIO AYOO RAME RAME KUNJUNGI PICME PHOTO STUDIO😍🤩. JANGAN LUPA BUAT YANG PUNYA AYANG BUNGKUS AJA BAWA KE PICME DIJAMIN PASTI SENENG👉👈. HASILNYA CAKEP BANGETT JANGAN LUPA AJAK TEMEN TEMEN KALIAN SAMA KELUARGANYA😎😋" }
    ];

    const [index, setIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const intervalRef = useRef(null);

    const changeTestimonial = (newIndex) => {
        setIsFading(true);
        setTimeout(() => {
            setIndex(newIndex);
            setIsFading(false);
        }, 300);
    };

    const handleNext = () => {
        changeTestimonial((index + 1) % testimonials.length);
    };

    const handlePrev = () => {
        changeTestimonial((index - 1 + testimonials.length) % testimonials.length);
    };

    const startAutoPlay = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            handleNext();
        }, 5000);
    }, [handleNext]);

    const stopAutoPlay = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }, []);
    
    useEffect(() => {
        startAutoPlay();
        return () => stopAutoPlay();
    }, [index, startAutoPlay, stopAutoPlay]);

    const currentTestimonial = testimonials[index];

    return (
        <section  
            className="py-20 px-4 sm:px-12 bg-gray-50 text-center relative min-h-screen flex items-center"
            onMouseEnter={stopAutoPlay}
            onMouseLeave={startAutoPlay}
        >
            <div className="max-w-7xl mx-auto w-full">
                <div className="mb-10">
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6">
                        <span className="block">Customer <span className="text-gray-500 font-normal">Voices:</span></span>
                        <span className="block">Hear What <span className="text-gray-500 font-normal">They Say!</span></span>
                    </h2>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mb-8 relative z-10 px-10 sm:px-0">
                    <button onClick={handlePrev} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition absolute left-0 top-1/2 transform -translate-y-1/2">
                        <FaChevronLeft />
                    </button>
                    {testimonials.map((t, i) => (
                        <div key={t.id} onClick={() => changeTestimonial(i)} className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden cursor-pointer transition-all duration-300 ${i === index ? "border-4 border-blue-500 scale-110" : "border-2 border-gray-300 opacity-60 hover:opacity-100"}`}>
                            <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                        </div>
                    ))}
                    <button onClick={handleNext} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition absolute right-0 top-1/2 transform -translate-y-1/2">
                        <FaChevronRight />
                    </button>
                </div>
                <div className="max-w-3xl mx-auto relative">
                    <div className={`bg-white p-8 sm:p-12 rounded-xl shadow-lg transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                        <FaQuoteLeft className="text-blue-200 text-5xl absolute top-6 left-6" />
                        <div className="relative z-10">
                            <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto mb-6 min-h-[100px]">
                                {currentTestimonial.text}
                            </p>
                            <h3 className="text-xl font-semibold">{currentTestimonial.name}</h3>
                            <p className="text-gray-500">{currentTestimonial.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Komponen Utama Halaman
function HomePage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInitialBanner, setShowInitialBanner] = useState(false);
    const [bannerData, setBannerData] = useState([]);
    const location = useLocation(); // ✅ Panggil useLocation

    // ✅ Tambahkan useEffect untuk menangani scroll
    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/posts`);
                setPosts(response.data.slice(0, 4));
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
        
        const fetchBanners = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/announcements`); 
                const data = response.data || [];
                setBannerData(data);
                
                if (data.length > 0) {
                    const today = moment().format('YYYY-MM-DD');
                    const closedDate = localStorage.getItem('bannerClosedDate');
                    
                    if (closedDate !== today) {
                        setShowInitialBanner(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching banners:", error);
            }
        };
        fetchBanners();

    }, []);

    const handleCloseBanner = () => {
        setShowInitialBanner(false);
        // localStorage.setItem('bannerClosedDate', moment().format('YYYY-MM-DD'));
    };

    const getThumbnailUrl = (post) => {
        if (post.image_url) {
            return `${API_URL}/assets/images/${post.image_url}`;
        }
        if (Array.isArray(post.media_url) && post.media_url.length > 0) {
            const firstImage = post.media_url[0];
            return `${API_URL}/assets/images/${firstImage}`;
        }
        return 'https://placehold.co/800x600/D1D5DB/1F2937?text=No+Image';
    };

    const renderPostCard = (post) => (
        <div key={post.id} className="border rounded-lg overflow-hidden shadow-md transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
            <img
                src={getThumbnailUrl(post)}
                alt={post.title}
                className="w-full h-48 sm:h-64 object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600/D1D5DB/1F2937?text=Gambar+Gagal+Dimuat"; }}
            />
            <div className="p-4 sm:p-6">
                <p className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Photo Tips</span> • {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}</p>
                <Link to={`/blog/${post.id}`} className="text-blue-600 hover:underline">
                    View All →
                </Link>
            </div>
        </div>
    );

    const renderPosts = () => {
        if (loading) {
            return <div className="col-span-full text-center text-gray-500">Memuat postingan...</div>;
        }
        if (posts.length === 0) {
            return <div className="col-span-full text-center text-gray-500">Belum ada postingan yang tersedia.</div>;
        }
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map(renderPostCard)}
            </div>
        );
    };

    return (
        <div className="font-rethink-sans pt-16 md:pt-24">
            <section className="bg-[#0d1a2c] text-white min-h-screen flex items-center px-4 sm:px-12 relative overflow-hidden">
                <LiquidBlobAnimation />
                <div className="max-w-7xl mx-auto z-10 w-full relative">
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                        <span className="block">Taking Some Happiness</span>
                        <span className="block text-[#b3e6ff]">Smile Today</span>
                    </h1>
                    <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-3xl">
                        Welcome to a world of joy, passion, and boundless creativity. Together, let's create #ceritahariini and embark on an extraordinary journey where dreams come true.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="#discover-studio" className="px-6 py-3 border-2 border-white rounded-full font-semibold text-center hover:bg-white hover:text-[#0d1a2c] transition">
                            SEE MORE →
                        </Link>
                        <Link to="/services" className="px-6 py-3 bg-white text-[#0d1a2c] border-2 border-white rounded-full font-semibold text-center hover:bg-gray-100 transition">
                            BOOKING NOW →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ✅ Berikan ID untuk section ini agar bisa di-scroll */}
            <section id="discover-studio" className="bg-white py-20 px-4 sm:px-12 min-h-screen flex items-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-7xl mx-auto w-full">
                    <div className="flex flex-col justify-center">
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                            <span className="text-[#0d1a2c]">Discover</span> <br />
                            <span className="text-gray-900">Our</span>{" "}
                            <span className="font-normal">Studio</span>
                        </h2>
                        <p className="text-gray-700 mb-4 sm:text-justify">
                            Selamat datang di Picme Studio, ruang kreatif untuk menangkap setiap momen berharga dan menyalurkan ide-ide visual dengan cara yang unik. Kami percaya bahwa setiap orang punya cerita, dan melalui lensa kamera serta sentuhan desain, kami membantu mewujudkan cerita itu menjadi karya yang penuh makna.
                        </p>
                        <p className="text-gray-700 mb-8 sm:text-justify">
                            Studio kami dibuat agar seluruh orang merasa nyaman dan ramah, dengan konsep modern yang dipadukan dengan sentuhan kreatif, setiap sesi foto akan menjadi pengalaman yang sangat menyenangkan. Tidak hanya sekadar tempat berfoto, Picme Studio juga menjadi wadah untuk bereksperimen, berkreasi, dan mengekspresikan diri.
                        </p>
                        <div className="flex items-center space-x-4 mt-8">
                            <img src="/images/images1.jpg" alt="Happy customer" className="w-16 h-16 rounded-full object-cover"/>
                            <div>
                                <p className="text-gray-800 italic text-base sm:text-lg font-medium">“Cerita yang indah adalah cerita yang di ekspresikan”</p>
                                <p className="text-gray-500 text-sm mt-1">Akbar M H, Studio Owner</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center mt-8 md:mt-0">  
                        <div className="w-full aspect-square overflow-hidden rounded-lg shadow-lg">
                            <img 
                                src="/images/poster1.jpg" 
                                alt="Poster Studio" 
                                className="w-full h-full object-cover object-center" 
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-black text-white py-20 px-4 sm:px-12 relative overflow-hidden min-h-screen flex flex-col justify-center">
                <div className="max-w-7xl mx-auto z-10 relative w-full">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-16">
                        <div className="w-full flex items-center justify-start mb-8 md:mb-0">
                            <div className="w-24 h-16 md:w-48 md:h-24 overflow-hidden rounded-lg mr-4 md:mr-8 flex-shrink-0">
                                <img src="/images/team.jpg" className="w-full h-full object-cover" alt="Team"/>
                            </div>
                            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                                <span className="text-gray-400">Express Yourself </span>
                                <span className="block lg:inline-block">in </span>
                                <span className="block text-white">
                                    Every <span className="text-gray-400"> Frame</span>
                                </span>
                            </h2>
                        </div>
                        <div className="w-full md:w-auto flex justify-start md:justify-end">
                            <Link to="/portfolio" className="px-6 py-3 bg-white text-[#0d1a2c] border-2 border-white rounded-full font-semibold text-center hover:bg-gray-100 transition">
                                What We Do →
                            </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="group border border-gray-700 p-8 rounded-lg flex flex-col items-start text-left bg-[#1a1a1a] transition-all duration-300 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-2">
                            <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-blue-500 transition-colors duration-300">Self-Controlled<br /> Experience </h3>
                            <p className="text-gray-400 text-sm mt-2 flex-grow">You're the photographer! Use the remote to take photos at your leisure. No awkwardness, more freedom of expression.</p>
                            <div className="w-3 h-3 rounded-full bg-gray-500 mt-4 group-hover:bg-blue-500 transition-colors duration-300"></div>
                        </div>
                        <div className="group border border-gray-700 p-8 rounded-lg flex flex-col items-start text-left bg-[#1a1a1a] transition-all duration-300 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-2">
                            <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-blue-500 transition-colors duration-300">Selected Properties <br />& Backgrounds</h3>
                            <p className="text-gray-400 text-sm mt-2 flex-grow">Choose from a variety of backgrounds and props to create the perfect setting for your photos.</p>
                            <div className="w-3 h-3 rounded-full bg-gray-500 mt-4 group-hover:bg-blue-500 transition-colors duration-300"></div>
                        </div>
                        <div className="group border border-gray-700 p-8 rounded-lg flex flex-col items-start text-left bg-[#1a1a1a] transition-all duration-300 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-2">
                            <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-blue-500 transition-colors duration-300">Instant <br />  and Quality Results</h3>
                            <p className="text-gray-400 text-sm mt-2 flex-grow">Get your photos instantly with our state-of-the-art technology, ensuring high-quality results every time.</p>
                            <div className="w-3 h-3 rounded-full bg-gray-500 mt-4 group-hover:bg-blue-500 transition-colors duration-300"></div>
                        </div>
                        <div className="group border border-gray-700 p-8 rounded-lg flex flex-col items-start text-left bg-[#1a1a1a] transition-all duration-300 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-2">
                            <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-blue-500 transition-colors duration-300">Couple <br /> & Pre-wedding</h3>
                            <p className="text-gray-400 text-sm mt-2 flex-grow">Capture the love and connection between couples with our specialized pre-wedding photoshoots.</p>
                            <div className="w-3 h-3 rounded-full bg-gray-500 mt-4 group-hover:bg-blue-500 transition-colors duration-300"></div>
                        </div>
                    </div>
                </div>
            </section>

            <TestimonialSection />

            <section className="py-20 px-4 sm:px-12 bg-white flex flex-col justify-center">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                        <h2 className="text-3xl font-semibold">
                            Popular <span className="text-[#0d1a2c]">Publication:</span>
                        </h2>
                        <Link to="/newsletter" className="text-blue-600 hover:underline flex-shrink-0">
                            View All →
                        </Link>
                    </div>
                    {renderPosts()}
                </div>
            </section>
            
            {showInitialBanner && (
                <InitialBanner
                    bannerData={bannerData}
                    onClose={handleCloseBanner}
                />
            )}
        </div>
    );
}

export default HomePage;