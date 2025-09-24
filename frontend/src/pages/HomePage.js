import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// Komponen baru untuk animasi Liquid Blob
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

// Testimonial Section Component
function TestimonialSection() {
    const testimonials = [
        {
            id: 1,
            name: "Emma Trueman",
            role: "Envato Market",
            avatar: "https://randomuser.me/api/portraits/women/1.jpg",
            text: "I had the pleasure of working with this creative agency, and I must say, they truly impressed me. They consistently think outside the box, resulting in impressive and impactful work. I highly recommend this agency for their consistent delivery of exceptional creative solutions.",
        },
        {
            id: 2,
            name: "John Doe",
            role: "CEO Company",
            avatar: "https://randomuser.me/api/portraits/men/2.jpg",
            text: "Layanan ini sangat membantu pekerjaan saya, cepat dan responsif. Sangat puas dengan hasilnya!",
        },
        {
            id: 3,
            name: "Jane Smith",
            role: "Lead Designer",
            avatar: "https://randomuser.me/api/portraits/women/3.jpg",
            text: "Prosesnya mudah dipahami, timnya juga sangat ramah dan profesional. Highly recommended!",
        },
        {
            id: 4,
            name: "Michael Brown",
            role: "Marketing Manager",
            avatar: "https://randomuser.me/api/portraits/men/4.jpg",
            text: "Saya merasa lebih produktif setelah menggunakan layanan ini. Hasilnya sesuai harapan.",
        },
        {
            id: 5,
            name: "Olivia Davis",
            role: "Project Coordinator",
            avatar: "https://randomuser.me/api/portraits/women/5.jpg",
            text: "Sangat praktis dan efisien. Membantu saya menghemat banyak waktu dalam pekerjaan sehari-hari.",
        },
        {
            id: 6,
            name: "David Wilson",
            role: "Software Developer",
            avatar: "https://randomuser.me/api/portraits/men/6.jpg",
            text: "Fantastis! Tim mereka sangat responsif dan memberikan solusi yang inovatif. Sangat direkomendasikan untuk proyek apa pun.",
        }
    ];

    const [index, setIndex] = useState(0);
    const currentTestimonial = testimonials.length > 0 ? testimonials[index] : null;

    const nextTestimonial = () => {
        setIndex((oldIndex) => (oldIndex + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setIndex((oldIndex) => (oldIndex - 1 + testimonials.length) % testimonials.length);
    };

    if (!currentTestimonial) {
        return null;
    }

    const { name, role, text } = currentTestimonial;

    return (
        <section className="py-20 px-12 bg-gray-50 text-center relative min-h-screen flex items-center">
            <div className="max-w-7xl mx-auto w-full">
                <div className="mb-10">
                    <h2 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                        <span className="block">Customer <span className="text-gray-500 font-normal">Voices:</span></span>
                        <span className="block">Hear What <span className="text-gray-500 font-normal">They Say!</span></span>
                    </h2>
                </div>
                <div className="flex justify-center items-center gap-6 mb-8 relative z-10">
                    <button
                        onClick={prevTestimonial}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition absolute left-0 top-1/2 transform -translate-y-1/2"
                    >
                        ←
                    </button>
                    {testimonials.map((t, i) => (
                        <div
                            key={t.id}
                            onClick={() => setIndex(i)}
                            className={`w-16 h-16 rounded-full overflow-hidden cursor-pointer transition-all duration-300
                                ${i === index ? "border-4 border-blue-500 scale-110" : "border-2 border-gray-300 opacity-70 hover:opacity-100"}
                                ${i % 2 === 0 ? "translate-y-0" : "translate-y-4 md:translate-y-6"}`}
                        >
                            <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                        </div>
                    ))}
                    <button
                        onClick={nextTestimonial}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition absolute right-0 top-1/2 transform -translate-y-1/2"
                    >
                        →
                    </button>
                </div>
                <div className="max-w-3xl mx-auto p-8 relative">
                    <div className="text-5xl text-blue-500 mb-4 font-bold absolute left-1/2 -translate-x-1/2 top-4">”</div>
                    <div className="pt-12">
                        <h3 className="text-xl font-semibold">{name}</h3>
                        <p className="text-gray-500 mb-8">{role}</p>
                        <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">{text}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function HomePage() {
    const [showPicMeLogo, setShowPicMeLogo] = useState(false);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleWhatWeDoClick = () => {
        setShowPicMeLogo(!showPicMeLogo);
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/posts");
                // Ambil 4 postingan terbaru
                setPosts(response.data.slice(0, 4));
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const renderPosts = () => {
        if (loading) {
            return <div className="col-span-2 text-center text-gray-500">Memuat postingan...</div>;
        }

        if (posts.length === 0) {
            return <div className="col-span-2 text-center text-gray-500">Belum ada postingan yang tersedia.</div>;
        }

        const topRowPosts = posts.slice(0, 2);
        const bottomRowPosts = posts.slice(2, 4);

        const renderPostCard = (post) => (
            <div key={post.id} className="border rounded-lg overflow-hidden shadow-md transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
                {post.image_url && (
                    <img
                        src={`http://localhost:8080/assets/images/${post.image_url}`}
                        alt={post.title}
                        className="w-full h-64 object-cover"
                    />
                )}
                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-2">
                        <span className="font-medium">Photo Tips</span> • {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <h3 className="text-xl font-semibold mb-2">
                        {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}
                    </p>
                    <Link to={`/blog/${post.id}`} className="text-blue-600 hover:underline">
                        View All →
                    </Link>
                </div>
            </div>
        );

        return (
            <>
                <div className="grid md:grid-cols-2 gap-8">
                    {topRowPosts.map(renderPostCard)}
                </div>
                {bottomRowPosts.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-8 mt-12 md:mt-24">
                        {bottomRowPosts.map(renderPostCard)}
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="font-rethink-sans">
            {/* Hero Section dengan Animasi Liquid Blob */}
            <section className="bg-[#0d1a2c] text-white min-h-screen flex items-center px-12 relative overflow-hidden">
                <LiquidBlobAnimation />
                <div className="max-w-7xl mx-auto z-10 w-full relative">
                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        <span className="block">Taking Some Happiness</span>
                        <span className="block text-[#b3e6ff]">Smile Today</span>
                    </h1>
                    <p className="text-gray-300 mb-8">
                      Welcome to a world of joy, passion, and boundless creativity. Together, let's create #ceritahariini  and embark on an extraordinary journey where dreams come true.
                    </p>
                    <div className="flex gap-4">
                        <Link
                            to="/more"
                            className="px-6 py-3 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-[#0d1a2c] transition"
                        >
                            SEE MORE →
                        </Link>
                        <Link
                            to="/services"
                            className="px-6 py-3 bg-white text-[#0d1a2c] border-2 border-white rounded-full font-semibold hover:bg-gray-100 transition"
                        >
                            BOOKING NOW →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Discover Studio */}
            <section className="bg-white py-20 px-12 min-h-screen flex items-center">
                <div className="grid grid-cols-1 md:grid-cols-2 max-w-7xl mx-auto w-full">
                    <div className="flex flex-col justify-center">
                        <h2 className="text-5xl font-bold leading-tight mb-6">
                            <span className="text-[#0d1a2c]">Discover</span> <br />
                            <span className="text-gray-900">Our</span>{" "}
                            <span className="font-normal">Studio</span>
                        </h2>
                        <p className="text-gray-700 mb-4 text-justify">
                            Selamat datang di Picme Studio, ruang kreatif untuk menangkap setiap momen berharga dan menyalurkan ide-ide visual dengan cara yang unik. Kami percaya bahwa setiap orang punya cerita, dan melalui lensa kamera serta sentuhan desain, kami membantu mewujudkan cerita itu menjadi karya yang penuh makna.

                        </p>
                        <p className="text-gray-700 mb-8 text-justify">
                            Studio kami dibuat agar seluruh orang merasa nyaman dan ramah, dengan konsep modern yang dipadukan dengan sentuhan kreatif,  setiap sesi foto akan menjadi pengalaman yang sangat  menyenangkan. Tidak hanya sekadar tempat berfoto, Picme Studio  juga menjadi wadah untuk bereksperimen, berkreasi, dan mengekspresikan diri.
                        </p>

                        {/* Bagian Baru: Foto Kecil dan Kutipan */}
                        <div className="flex items-center space-x-4 mt-8">
                            <img
                                src="/images/images1.jpg"
                                alt="Happy customer"
                                className="w-16 h-16 rounded-full object-cover"
                            />
                            <div>
                                <p className="text-gray-800 italic text-lg font-medium">
                                    “Cerita yang indah adalah cerita yang di ekspresikan”
                                </p>
                                <p className="text-gray-500 text-sm mt-1">
                                    Akbar M H, Studio Owner
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center mt-8 md:mt-0">
                        <img
                            src="/images/poster1.jpg"
                            alt="Poster Studio"
                            className="w-96 h-96 object-cover mx-auto"
                        />
                    </div>
                </div>
            </section>

            {/* Unique Ideas */}
            <section className="bg-black text-white py-20 px-12 relative overflow-hidden min-h-screen flex flex-col justify-center">
                <div className="max-w-7xl mx-auto z-10 relative w-full">
                    <div className="absolute top-0 right-0 text-right text-gray-400 text-sm max-w-xs mb-16">
                        Professionals focused on helping your brand grow and move forward.
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-16">
                        <div className="md:w-full flex items-center justify-center md:justify-start">
                            <div className="w-24 h-16 md:w-48 md:h-24 overflow-hidden rounded-lg mr-4 md:mr-8 flex-shrink-0">
                                <img
                                    src="/images/team.jpg"
                                    alt="Team collaboration"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h2 className="text-5xl lg:text-7xl font-bold leading-tight">
                                <span className="text-gray-400">Unique</span>
                                <span className="block lg:inline-block"> Ideas</span>
                                <span className="block text-white">
                                    For Your <span className="text-gray-400">Business.</span>
                                </span>
                            </h2>
                        </div>
                        <div className="md:w-1/2 flex justify-center md:justify-end mt-8 md:mt-0">
                            <button
                                onClick={handleWhatWeDoClick}
                                className="px-8 py-4 bg-blue-500 text-black rounded-full font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                WHAT WE DO <span className="ml-2">→</span>
                            </button>
                        </div>
                    </div>
                    {showPicMeLogo && (
                        <div className="flex justify-center mt-8">
                            <img
                                src="/images/logo2.png"
                                alt="PicMe Studio Logo"
                                className="w-48 transition-all duration-300 transform scale-100 opacity-100"
                            />
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16 px-4">
                        <div className="border border-gray-700 p-8 rounded-lg flex flex-col items-start text-left bg-gray-900 bg-opacity-30">
                            <h3 className="text-xl font-semibold mb-2">
                                Branding and <br /> Identity Design
                            </h3>
                            <div className="flex-grow"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-500 mt-4"></div>
                        </div>
                        <div className="border border-gray-700 p-8 rounded-lg flex flex-col items-start text-left bg-gray-900 bg-opacity-30">
                            <h3 className="text-xl font-semibold mb-2">
                                Website Design <br /> and Development
                            </h3>
                            <div className="flex-grow"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-500 mt-4"></div>
                        </div>
                        <div className="border border-gray-700 p-8 rounded-lg flex flex-col items-start text-left bg-gray-900 bg-opacity-30">
                            <h3 className="text-xl font-semibold mb-2">
                                Advertising and <br /> Marketing Campaigns
                            </h3>
                            <div className="flex-grow"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-500 mt-4"></div>
                        </div>
                        <div className="border border-gray-700 p-8 rounded-lg flex flex-col items-start text-left bg-gray-900 bg-opacity-30">
                            <h3 className="text-xl font-semibold mb-2">
                                Creative Consulting <br /> and Development
                            </h3>
                            <div className="flex-grow"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-500 mt-4"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Customer Voices */}
            <TestimonialSection />

            {/* Popular Publication */}
            <section className="py-20 px-12 bg-white flex flex-col justify-center">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-semibold">
                            Popular <span className="text-[#0d1a2c]">Publication:</span>
                        </h2>
                        <Link to="/newsletter" className="text-blue-600 hover:underline">
                            View All →
                        </Link>
                    </div>
                    {renderPosts()}
                </div>
            </section>
        </div>
    );
}

export default HomePage;