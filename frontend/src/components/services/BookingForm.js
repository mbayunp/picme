import React, { useState } from "react";
import { FaUser, FaEnvelope, FaPhoneAlt, FaStickyNote, FaInfoCircle } from "react-icons/fa";

const BookingForm = ({ formData, handleChange, handleSubmit }) => {
    const [phoneError, setPhoneError] = useState('');

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        const rawValue = value.replace(/\D/g, ''); // Hanya angka

        if (rawValue.startsWith('0')) {
            setPhoneError("Nomor telepon tidak boleh diawali dengan 0 (Gunakan format 8xxx)");
        } else {
            setPhoneError('');
        }
        handleChange(e);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const rawNumber = formData.nomor_whatsapp.trim();
        
        if (rawNumber.startsWith('0')) {
            setPhoneError("Nomor telepon tidak boleh diawali dengan 0.");
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

    const isSubmitDisabled = !!phoneError || !formData.nama || !formData.email || !formData.nomor_whatsapp;

    return (
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-6 w-full">
            
            {/* Header Form */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Lengkapi Data Diri</h2>
                <p className="text-sm text-gray-500">Isi informasi kontak Anda untuk konfirmasi pemesanan.</p>
            </div>

            {/* Input Groups */}
            <div className="space-y-5">
                
                {/* Nama Lengkap */}
                <div className="relative group">
                    <label htmlFor="nama" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUser className="text-gray-400 group-focus-within:text-green-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            id="nama"
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            required
                            placeholder="Masukkan nama Anda"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="relative group">
                    <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Alamat Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaEnvelope className="text-gray-400 group-focus-within:text-green-500 transition-colors" />
                        </div>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="contoh@email.com"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* WhatsApp */}
                <div className="relative group">
                    <label htmlFor="nomor_whatsapp" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nomor WhatsApp</label>
                    <div className="flex rounded-xl shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 text-gray-500 font-medium text-sm">
                            🇮🇩 +62
                        </span>
                        <div className="relative flex-grow">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaPhoneAlt className="text-gray-400 group-focus-within:text-green-500 transition-colors text-xs" />
                            </div>
                            <input
                                type="tel"
                                id="nomor_whatsapp"
                                name="nomor_whatsapp"
                                value={formData.nomor_whatsapp}
                                onChange={handlePhoneChange}
                                required
                                placeholder="81234567890"
                                className={`w-full pl-9 pr-4 py-3 rounded-r-xl border bg-gray-50 focus:bg-white focus:ring-2 outline-none transition-all ${
                                    phoneError 
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                    : 'border-gray-200 focus:border-green-500 focus:ring-green-500'
                                }`}
                            />
                        </div>
                    </div>
                    {phoneError && <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1"><FaInfoCircle/> {phoneError}</p>}
                </div>

                {/* Catatan */}
                <div className="relative group">
                    <label htmlFor="catatan" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Catatan Tambahan (Opsional)</label>
                    <div className="relative">
                         <div className="absolute top-3 left-3 pointer-events-none">
                            <FaStickyNote className="text-gray-400 group-focus-within:text-green-500 transition-colors" />
                        </div>
                        <textarea
                            id="catatan"
                            name="catatan"
                            value={formData.catatan}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Contoh: Request background warna putih..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none resize-none"
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex gap-3 items-start">
                <FaInfoCircle className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-sm font-medium text-yellow-800">Info Penting</p>
                    <p className="text-xs text-yellow-700 mt-1">
                        Mohon datang 10 menit sebelum jadwal sesi foto dimulai agar tidak mengurangi waktu pemotretan Anda.
                    </p>
                </div>
            </div>

            {/* Checkbox & Button */}
            <div className="mt-auto pt-4">
                <div className="flex items-center mb-6">
                    <input 
                        id="newsletter" 
                        type="checkbox" 
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer" 
                    />
                    <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
                        Saya ingin menerima info promo terbaru via email.
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform duration-200 flex justify-center items-center gap-2 ${
                        isSubmitDisabled 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 text-white hover:bg-green-700 hover:-translate-y-1 hover:shadow-green-500/30'
                    }`}
                >
                    Konfirmasi Pemesanan
                </button>
                
                <p className="text-center text-xs text-gray-400 mt-4">
                    Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan kami.
                </p>
            </div>
        </form>
    );
};

export default BookingForm;