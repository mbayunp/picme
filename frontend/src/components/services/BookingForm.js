// src/components/BookingForm.jsx

import React, { useState } from "react";

const BookingForm = ({ formData, handleChange, handleSubmit, selectedTime }) => {
    const [phoneError, setPhoneError] = useState('');

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        
        const rawValue = value.replace(/\D/g, '');

        if (rawValue.startsWith('0')) {
            setPhoneError("Nomor telepon tidak boleh diawali dengan 0.");
            handleChange(e); 
            return;
        }

        setPhoneError('');
        handleChange(e);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        const rawNumber = formData.nomor_whatsapp.trim();
        
        if (rawNumber.startsWith('0')) {
            setPhoneError("Gagal: Nomor telepon tidak boleh diawali dengan 0.");
            return;
        }

        if (!rawNumber) {
            setPhoneError("Nomor telepon wajib diisi.");
            return;
        }

        const formattedData = {
            ...formData,
            nomor_whatsapp: `62${rawNumber}`,
        };

        handleSubmit(formattedData); 
    };

    const isSubmitDisabled = !!phoneError || !formData.nama || !formData.email;

    return (
        <form onSubmit={handleFormSubmit} className="flex h-full w-full flex-col">
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
                        onChange={handlePhoneChange} 
                        required
                        className={`min-w-0 flex-1 rounded-r-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                            phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                        }`}
                        placeholder="8123456789 (tanpa 0 di depan)"
                        pattern="[1-9][0-9]{8,14}" 
                    />
                </div>
                {phoneError && <p className="mt-1 text-xs text-red-500 font-medium">{phoneError}</p>}
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
                    disabled={isSubmitDisabled} 
                    className={`w-full rounded-full px-6 py-3 font-bold text-white transition-colors duration-200 ${
                        isSubmitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    Konfirmasi Pemesanan
                </button>
            </div>
        </form>
    );
};

export default BookingForm;