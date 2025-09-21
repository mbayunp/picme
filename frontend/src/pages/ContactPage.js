// src/pages/ContactPage.js
import React from "react";

function ContactPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Pesan Anda telah terkirim!");
  };

  return (
    <div className="bg-gray-50 px-6 py-10 min-h-screen pt-32">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Hubungi Kami</h1>
        <p className="text-gray-600">
          Kami siap membantu Anda. Silakan isi formulir di bawah ini atau hubungi
          kami melalui informasi yang tersedia.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Formulir Kontak */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Kirim Pesan</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Pesan</label>
              <textarea
                id="message"
                name="message"
                rows="4"
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              Kirim Pesan
            </button>
          </form>
        </div>

        {/* Informasi Kontak */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Informasi Kontak</h2>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-center space-x-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>info@pictme.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>+62 812 3456 7890</span>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Jl. Contoh No. 123, Jakarta, Indonesia</span>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Jam Kerja</h3>
            <ul className="text-gray-700 space-y-1">
              <li>Senin - Jumat: 09:00 - 18:00 WIB</li>
              <li>Sabtu: 09:00 - 14:00 WIB</li>
              <li>Minggu: Tutup</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;