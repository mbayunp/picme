// BookingForm.js
import React from "react";

export default function BookingForm({ formData, handleChange, handleSubmit }) {
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto"
    >
      <h2 className="text-xl font-bold mb-4">Tambahkan detail informasi anda</h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Nama Lengkap
        </label>
        <input
          type="text"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Nomor Telepon
        </label>
        <input
          type="tel"
          name="nomor_whatsapp"
          value={formData.nomor_whatsapp}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Catatan</label>
        <textarea
          name="catatan"
          rows="3"
          value={formData.catatan}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-500"
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white font-bold py-3 rounded-full hover:bg-green-700"
      >
        Konfirmasi Pemesanan
      </button>
    </form>
  );
}
