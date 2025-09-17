// HomePage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo2 from "../assets/images/logo2.png"; 

function HomePage() {
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
<section className="bg-[#0d1a2c] text-white py-20 px-12">
  <div className="max-w-5xl mx-auto">
    <div className="flex flex-col md:flex-row justify-between items-center gap-12 mt-4">
      <div>
        <img 
  src={logo2} 
  alt="PicMe Studio Logo" 
  className="w-48 mb-4"
/>

        <button className="px-6 py-3 bg-white text-[#0d1a2c] rounded-full font-semibold hover:bg-gray-100 transition">
          WHAT WE DO →
        </button>
      </div>
      <div className="w-full md:w-1/2 h-48 bg-gray-700 flex items-center justify-center rounded-lg">
        <span className="text-gray-400">[Image Placeholder]</span>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
      <div>
        <h3 className="text-xl font-semibold">
          Branding and <br /> Identity Design
        </h3>
      </div>
      <div>
        <h3 className="text-xl font-semibold">
          Website Design <br /> and Development
        </h3>
      </div>
      <div>
        <h3 className="text-xl font-semibold">
          Advertising and <br /> Marketing Campaigns
        </h3>
      </div>
      <div>
        <h3 className="text-xl font-semibold">
          Creative Consulting <br /> and Development
        </h3>
      </div>
    </div>
  </div>
</section>

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
      </section>

      {/* Why Us */}
      <section className="bg-gray-100 py-20 px-12 text-center">
        <h2 className="text-3xl font-semibold mb-8">Kenapa Pilih Kami?</h2>
        <div className="flex justify-center gap-12">
          <div className="flex flex-col items-center">
            <span className="text-2xl">✔</span>
            <h4 className="mt-2 font-medium">Harga Terjangkau</h4>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl">👍</span>
            <h4 className="mt-2 font-medium">Mudah</h4>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl">📸</span>
            <h4 className="mt-2 font-medium">Bebas Gaya</h4>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 px-12 bg-white text-center">
        <h2 className="text-3xl font-semibold mb-10">Paket & Harga</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg shadow-md">
            <h4 className="text-xl font-semibold">Paket Basic</h4>
          </div>
          <div className="p-6 border rounded-lg shadow-md">
            <h4 className="text-xl font-semibold">Paket Couple</h4>
          </div>
          <div className="p-6 border rounded-lg shadow-md">
            <h4 className="text-xl font-semibold mb-2">Booking Sekarang</h4>
            <p className="text-gray-600 mb-4">
              Pesan sekarang dan nikmati pengalaman terbaik!
            </p>
            <Link to="/booking">
              <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Booking
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Voices */}
      <TestimonialSection />
    </div>
  );
}

// Testimonial Section Component
function TestimonialSection() {
  const testimonials = [
    {
      id: 1,
      name: "Ahmad Yusuf",
      role: "UI/UX Designer",
      avatar: "/images/avatar1.png",
      text: "Layanan ini sangat membantu pekerjaan saya, cepat dan responsif. Sangat puas dengan hasilnya!",
    },
    {
      id: 2,
      name: "Siti Rahma",
      role: "Software Engineer",
      avatar: "/images/avatar2.png",
      text: "Prosesnya mudah dipahami, timnya juga sangat ramah dan profesional. Highly recommended!",
    },
    {
      id: 3,
      name: "Budi Santoso",
      role: "Product Manager",
      avatar: "/images/avatar3.png",
      text: "Saya merasa lebih produktif setelah menggunakan layanan ini. Hasilnya sesuai harapan.",
    },
    {
      id: 4,
      name: "Dewi Lestari",
      role: "Content Creator",
      avatar: "/images/avatar4.png",
      text: "Sangat praktis dan efisien. Membantu saya menghemat banyak waktu dalam pekerjaan sehari-hari.",
    },
  ];

  const [index, setIndex] = useState(0);
  const { name, role, text } = testimonials[index];

  return (
    <section className="py-20 px-12 bg-gray-50 text-center">
      <div className="mb-10">
        <h2 className="text-3xl font-bold">
          <span className="text-blue-600">Customer</span> Voices:
          <br />
          Hear What <span className="text-blue-600">They Say!</span>
        </h2>
      </div>

      {/* Avatars row */}
      <div className="flex justify-center gap-4 mb-8">
        {testimonials.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setIndex(i)}
            className={`w-4 h-4 rounded-full ${
              i === index ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Testimonial Content */}
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-5xl text-gray-300">“</div>
        <p className="text-lg italic text-gray-700">{text}</p>
        <div className="text-5xl text-gray-300">”</div>
        <h3 className="text-xl font-semibold mt-4">{name}</h3>
        <p className="text-gray-500">{role}</p>
      </div>
    </section>
  );
}

export default HomePage;