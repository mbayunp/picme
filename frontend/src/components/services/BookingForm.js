// src/components/services/BookingForm.js

import React from "react";

const BookingForm = ({ formData, handleChange, handleSubmit, selectedTime }) => {
  return (
    <form onSubmit={handleSubmit} className="w-full h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-2">Tambahkan detail informasi anda</h2>
      <p className="text-gray-500 text-sm mb-4">untuk mengkonfirmasi pesanan</p>

      <div className="mb-4">
        <label htmlFor="nama" className="block text-gray-700 font-medium mb-1">
          Nama Lengkap
        </label>
        <input
          type="text"
          id="nama"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="nomor_whatsapp" className="block text-gray-700 font-medium mb-1">
          Nomor Telepon
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
            +62
          </span>
          <input
            type="tel"
            id="nomor_whatsapp"
            name="nomor_whatsapp"
            value={formData.nomor_whatsapp}
            onChange={handleChange}
            required
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="8123456789"
          />
        </div>
      </div>

      <div className="mb-4 flex-1">
        <label htmlFor="catatan" className="block text-gray-700 font-medium mb-1">
          Catatan pesanan
        </label>
        <textarea
          id="catatan"
          name="catatan"
          value={formData.catatan}
          onChange={handleChange}
          className="w-full h-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          rows="4"
        ></textarea>
      </div>

      <div className="my-4">
        <div className="flex items-center mb-2">
          <input type="checkbox" id="newsletter" name="newsletter" className="mr-2" />
          <label htmlFor="newsletter" className="text-sm text-gray-700">Menerima pemberitahuan pemasaran</label>
        </div>
        <p className="text-xs text-gray-500 mb-2">
          Dengan mengklik 'Konfirmasi Pesanan!', Anda menyetujui kebijakan berikut.
        </p>
      </div>

      <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-3 rounded">
        Tolong datang 10 menit sebelum sesi foto dimulai.
      </div>

      <div className="mt-auto">
        <button
          type="submit"
          className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-full hover:bg-green-700 transition-colors duration-200"
        >
          Konfirmasi Pemesanan
        </button>
      </div>
    </form>
  );
};

export default BookingForm;