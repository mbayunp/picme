import React from "react";

const BookingForm = ({ formData, handleChange, handleSubmit, selectedTime }) => {
    return (
        <form onSubmit={handleSubmit} className="flex h-full w-full flex-col">
            <h2 className="mb-2 text-2xl font-bold">Tambahkan detail informasi anda</h2>
            <p className="mb-4 text-sm text-gray-500">untuk mengkonfirmasi pesanan</p>

            <div className="mb-4">
                <label htmlFor="nama" className="mb-1 block font-medium text-gray-700">
                    Nama Lengkap
                </label>
                <input
                    type="text"
                    id="nama"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="email" className="mb-1 block font-medium text-gray-700">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="nomor_whatsapp" className="mb-1 block font-medium text-gray-700">
                    Nomor Telepon
                </label>
                <div className="flex">
                    <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500">
                        +62
                    </span>
                    <input
                        type="tel"
                        id="nomor_whatsapp"
                        name="nomor_whatsapp"
                        value={formData.nomor_whatsapp}
                        onChange={handleChange}
                        required
                        className="min-w-0 flex-1 rounded-r-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="8123456789"
                    />
                </div>
            </div>

            <div className="mb-4 flex-1">
                <label htmlFor="catatan" className="mb-1 block font-medium text-gray-700">
                    Catatan pesanan
                </label>
                <textarea
                    id="catatan"
                    name="catatan"
                    value={formData.catatan}
                    onChange={handleChange}
                    className="h-full w-full resize-none rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="4"
                ></textarea>
            </div>

            <div className="my-4">
                <div className="mb-2 flex items-center">
                    <input type="checkbox" id="newsletter" name="newsletter" className="mr-2" />
                    <label htmlFor="newsletter" className="text-sm text-gray-700">
                        Menerima pemberitahuan pemasaran
                    </label>
                </div>
                <p className="mb-2 text-xs text-gray-500">
                    Dengan mengklik 'Konfirmasi Pesanan!', Anda menyetujui kebijakan berikut.
                </p>
            </div>

            <div className="mb-4 rounded border-l-4 border-yellow-400 bg-yellow-50 p-3 text-yellow-700">
                Tolong datang 10 menit sebelum sesi foto dimulai.
            </div>

            <div className="mt-auto">
                <button
                    type="submit"
                    className="w-full rounded-full bg-green-600 px-6 py-3 font-bold text-white transition-colors duration-200 hover:bg-green-700"
                >
                    Konfirmasi Pemesanan
                </button>
            </div>
        </form>
    );
};

export default BookingForm;