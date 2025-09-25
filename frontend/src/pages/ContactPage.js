// src/pages/ContactPage.js
import React from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { MdOutlineAccessTime } from 'react-icons/md';

function ContactPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Pesan Anda telah terkirim!");
  };

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-gray-200 px-6 py-10 min-h-screen pt-32">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="mb-4 text-5xl font-extrabold text-gray-900 leading-tight">Hubungi Kami</h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Kami siap membantu Anda. Jangan ragu untuk mengisi formulir di bawah ini atau
          hubungi kami langsung melalui informasi yang tersedia.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Formulir Kontak */}
        <div className="bg-white p-10 rounded-xl shadow-2xl transform transition-transform duration-300 border border-gray-200">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Kirim Pesan</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Masukkan nama lengkap Anda"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Alamat email aktif"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Pesan</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                placeholder="Tulis pesan Anda di sini..."
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Kirim Pesan
            </button>
          </form>
        </div>

        {/* Informasi Kontak */}
        <div className="bg-white p-10 rounded-xl shadow-2xl transform transition-transform duration-300 border border-gray-200">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Informasi Kontak</h2>
          <div className="space-y-6 text-gray-700">
            <div className="flex items-start space-x-4">
              <FaEnvelope className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <span className="block font-semibold">Email</span>
                <span className="text-sm text-gray-600">picmeandyou.official@gmail.com</span>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <FaPhone className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <span className="block font-semibold">Telepon</span>
                <span className="text-sm text-gray-600">085175095670</span>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <FaMapMarkerAlt className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <span className="block font-semibold">Alamat</span>
                <span className="text-sm text-gray-600">Cluster Pramuka Satu No.4 Blok C, Sukamulya, Kec. Karangtengah, Kabupaten Cianjur, Jawa Barat 43281</span>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <MdOutlineAccessTime className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <span className="block font-semibold">Jam Kerja</span>
                <span className="text-sm text-gray-600">Senin - Minggu 08.00 - 18.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;