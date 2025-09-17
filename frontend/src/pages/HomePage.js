// HomePage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo2 from "../assets/images/logo2.png"; // Pastikan ini mengarah ke logo PicMe Anda

function HomePage() {
  const [showPicMeLogo, setShowPicMeLogo] = useState(false); // State untuk mengontrol kemunculan logo PicMe

  const handleWhatWeDoClick = () => {
    // Fungsi ini bisa disesuaikan, misalnya untuk navigasi atau menampilkan/menyembunyikan sesuatu
    setShowPicMeLogo(!showPicMeLogo);
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="bg-[#0d1a2c] text-white min-h-screen flex items-center px-12">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold leading-tight mb-6">
            <span className="block">Taking Some Happiness</span>
            <span className="block text-[#b3e6ff]">Smile Today</span>
          </h1>
          <p className="text-gray-300 mb-8">
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
            nonummy nibh euismod tincidunt ut laoreet dolore magna
          </p>
          <div className="flex gap-4">
            <Link
              to="/more"
              className="px-6 py-3 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-[#0d1a2c] transition"
            >
              SEE MORE →
            </Link>
            <Link
              to="/booking"
              className="px-6 py-3 bg-white text-[#0d1a2c] border-2 border-white rounded-full font-semibold hover:bg-gray-100 transition"
            >
              BOOKING NOW →
            </Link>
          </div>
        </div>
      </section>

      {/* Discover Studio */}
      <section className="bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
          {/* Kiri: Teks */}
          <div className="flex flex-col justify-center px-12 py-20">
            <h2 className="text-5xl font-bold leading-tight mb-6">
              <span className="text-[#0d1a2c]">Discover</span> <br />
              <span className="text-gray-900">Our</span>{" "}
              <span className="font-normal">Studio</span>
            </h2>
            <p className="text-gray-700 mb-4">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
              nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
              volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
              ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo
              consequat.
            </p>
            <p className="text-gray-700">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
              nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
              volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
              ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo
              consequat.
            </p>
          </div>

          {/* Kanan: Poster */}
          <div className="bg-yellow-400 flex items-center justify-center">
            <img
              src="./assets/images/manhole-poster.jpg"
              alt="Poster Studio"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Unique Ideas */}
      <section className="bg-black text-white py-20 px-12 relative overflow-hidden min-h-screen flex items-center">
        {/* Decorative elements in the background */}
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-10 right-20 w-32 h-32 opacity-10">
            <img src="https://via.placeholder.com/150/808080/FFFFFF?text=Dots" alt="Abstract dots" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-20 left-10 w-48 h-48 opacity-10">
            <img src="https://via.placeholder.com/200/808080/FFFFFF?text=Shape" alt="Abstract shape" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto z-10 relative w-full">
          {/* Top Info Text */}
          <div className="absolute top-0 right-0 text-right text-gray-400 text-sm max-w-xs mb-16">
            Professionals focused on helping your brand grow and move forward.
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-16 mt-20 md:mt-0">
            <div className="md:w-full flex items-center justify-center md:justify-start">
              {/* Gambar di kiri "Unique Ideas" */}
              <div className="w-24 h-16 md:w-48 md:h-24 overflow-hidden rounded-lg mr-4 md:mr-8 flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1559628233-9759a9bd9b49?q=80&w=600&auto=format&fit=crop"
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
                className="px-8 py-4 bg-orange-500 text-black rounded-full font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
              >
                WHAT WE DO <span className="ml-2">→</span>
              </button>
            </div>
          </div>

          {/* Logo PicMe (disembunyikan secara default, muncul saat diklik) */}
          {showPicMeLogo && (
            <div className="flex justify-center mt-8">
              <img
                src={logo2}
                alt="PicMe Studio Logo"
                className="w-48 transition-all duration-300 transform scale-100 opacity-100"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16">
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
      <section className="py-20 px-12 bg-white">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-semibold">
            Popular <span className="text-[#0d1a2c]">Publication:</span>
          </h2>
          <a href="#" className="text-blue-600 hover:underline">
            View All →
          </a>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border rounded-lg overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1586977001280-50f8c1aaecb7?q=80&w=1200&auto=format&fit=crop"
              alt="Photo session"
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Photo Tips</span> • August 22 2025
              </p>
              <h3 className="text-xl font-semibold mb-2">
                How to Get Best Pose on Photo Session
              </h3>
              <p className="text-gray-600 mb-4">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed
                diam nonummy nibh euismod tincidunt ut laoreet dolore.
              </p>
              <a href="#" className="text-blue-600 hover:underline">
                View All →
              </a>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1559628233-9759a9bd9b49?q=80&w=1200&auto=format&fit=crop"
              alt="Photo ideas with soulmate"
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Photo Tips</span> • August 23 2025
              </p>
              <h3 className="text-xl font-semibold mb-2">
                5 Photo Ideas to Try with Your Soulmate
              </h3>
              <p className="text-gray-600 mb-4">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed
                diam nonummy nibh euismod tincidunt ut laoreet dolore.
              </p>
              <a href="#" className="text-blue-600 hover:underline">
                View All →
              </a>
            </div>
          </div>
        </div>

        {/* Card 3 dan 4 */}
        <div className="grid md:grid-cols-2 gap-8 mt-12 md:mt-24">
          <div className="order-last md:order-first border rounded-lg overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1596752009228-5604104d49a6?q=80&w=1200&auto=format&fit=crop"
              alt="Another photo session"
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Photography</span> • Sep 10 2025
              </p>
              <h3 className="text-xl font-semibold mb-2">
                Mastering Light: Techniques for Better Portraits
              </h3>
              <p className="text-gray-600 mb-4">
                Tips dan trik untuk menggunakan pencahayaan alami dan buatan
                agar hasil potret Anda lebih menakjubkan.
              </p>
              <a href="#" className="text-blue-600 hover:underline">
                View All →
              </a>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1579781845610-18e38f657a55?q=80&w=1200&auto=format&fit=fit=crop"
              alt="Creative photo ideas"
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Creative</span> • Sep 15 2025
              </p>
              <h3 className="text-xl font-semibold mb-2">
                Creative Photo Ideas for Your Social Media
              </h3>
              <p className="text-gray-600 mb-4">
                Cari inspirasi baru untuk konten media sosial Anda dengan
                ide-ide foto yang unik dan menarik.
              </p>
              <a href="#" className="text-blue-600 hover:underline">
                View All →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

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
  const { name, role, text, avatar } = testimonials[index];

  const nextTestimonial = () => {
    setIndex((oldIndex) => {
      let newIndex = oldIndex + 1;
      if (newIndex > testimonials.length - 1) {
        newIndex = 0;
      }
      return newIndex;
    });
  };

  const prevTestimonial = () => {
    setIndex((oldIndex) => {
      let newIndex = oldIndex - 1;
      if (newIndex < 0) {
        newIndex = testimonials.length - 1;
      }
      return newIndex;
    });
  };

  return (
    <section className="py-20 px-12 bg-gray-50 text-center">
      <div className="mb-10">
        <h2 className="text-5xl font-bold leading-tight mb-6">
          <span className="block">Customer <span className="text-gray-500 font-normal">Voices:</span></span>
          <span className="block">Hear What <span className="text-gray-500 font-normal">They Say!</span></span>
        </h2>
      </div>

      {/* Avatars row with wave effect */}
      <div className="flex justify-center items-center gap-6 mb-8 relative">
        {testimonials.map((t, i) => (
          <div
            key={t.id}
            onClick={() => setIndex(i)}
            className={`w-16 h-16 rounded-full overflow-hidden cursor-pointer transition-all duration-300
                        ${i === index ? "border-4 border-orange-500 scale-110" : "border-2 border-gray-300 opacity-70 hover:opacity-100"}
                        ${
                            i % 2 === 0
                              ? "translate-y-0"
                              : "translate-y-4 md:translate-y-6"
                        }
                        `}
          >
            <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Testimonial Content */}
      <div className="max-w-3xl mx-auto p-8 relative">
        <div className="text-5xl text-orange-500 mb-4 font-bold absolute left-1/2 -translate-x-1/2 top-4">”</div>
        <div className="pt-12">
          <h3 className="text-xl font-semibold">{name}</h3>
          <p className="text-gray-500 mb-8">{role}</p>
          <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">{text}</p>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="flex justify-center gap-12 mt-8">
        <button
          onClick={prevTestimonial}
          className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
        >
          ←
        </button>
        <button
          onClick={nextTestimonial}
          className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
        >
          →
        </button>
      </div>
    </section>
  );
}

export default HomePage;