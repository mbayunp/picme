// src/pages/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <h1 className="text-9xl font-bold text-gray-800">404</h1>
      <p className="text-3xl md:text-4xl font-medium text-gray-600 mt-4">
        Halaman Tidak Ditemukan
      </p>
      <p className="text-lg text-gray-500 mt-2">
        Maaf, kami tidak dapat menemukan halaman yang Anda cari.
      </p>
      <Link
        to="/"
        className="mt-8 px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors duration-200"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}

export default NotFoundPage;