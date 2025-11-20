import React, { useState } from "react";
import { FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaWhatsapp} from 'react-icons/fa';
import { MdOutlineAccessTime } from 'react-icons/md';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
        website: '' // 🕵️‍♂️ Honeypot field
    });
    const [statusMessage, setStatusMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage('');

        if (formData.website) {
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post(`${API_URL}/api/contact`, {
                name: formData.name,
                email: formData.email,
                message: formData.message,
            });
            setStatusMessage('success');
            setFormData({ name: '', email: '', message: '', website: '' });
        } catch (error) {
            console.error("Failed to send message:", error);
            setStatusMessage('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-200 pt-28 pb-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-2">Hubungi Kami</h2>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                        Mari Mulai <span className="text-blue-600">Cerita Foto</span> Anda
                    </h1>
                    <p className="text-lg text-gray-600">
                        Punya pertanyaan seputar paket, jadwal, atau lokasi? Isi formulir di bawah atau kunjungi studio kami langsung.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* KIRI: Info Kontak & Peta */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Informasi Studio</h3>
                            <div className="space-y-6">
                                {/* Alamat */}
                                <div className="flex items-start space-x-4 group">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Alamat</p>
                                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                            Cluster Pramuka Satu No.4 Blok C, Sukamulya, Kec. Karangtengah, Kabupaten Cianjur, Jawa Barat 43281
                                        </p>
                                    </div>
                                </div>

                                {/* WhatsApp (Link Aktif) */}
                                <div className="flex items-start space-x-4 group">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                                        <FaWhatsapp />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">WhatsApp / Telepon</p>
                                        <a
                                            href="https://wa.me/6285175095670"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-gray-600 mt-1 hover:text-green-600 hover:underline transition-colors flex items-center gap-1"
                                        >
                                            0851-7509-5670
                                        </a>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-start space-x-4 group">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                        <FaEnvelope />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Email</p>
                                        <a href="mailto:picmeandyou.official@gmail.com" className="text-sm text-gray-600 mt-1 hover:text-purple-600 hover:underline transition-colors">
                                            picmeandyou.official@gmail.com
                                        </a>
                                    </div>
                                </div>

                                {/* Jam Operasional */}
                                <div className="flex items-start space-x-4 group">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                                        <MdOutlineAccessTime />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Jam Operasional</p>
                                        <p className="text-sm text-gray-600 mt-1">Senin - Minggu: 08.00 - 18.00</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MAPS */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 h-64 relative group">
                            <iframe
                                title="Lokasi Picme Studio"
                                className="w-full h-full border-0 grayscale group-hover:grayscale-0 transition-all duration-500"
                                src="https://maps.google.com/maps?q=Cluster%20Pramuka%20Satu%20No.4%20Blok%20C,%20Sukamulya,%20Cianjur&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                allowFullScreen
                                loading="lazy"
                            ></iframe>
                            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-semibold shadow-sm pointer-events-none">
                                📍 Picme Studio
                            </div>
                        </div>
                    </div>

                    {/* KANAN: Form Kontak */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-50 rounded-full blur-3xl opacity-50"></div>

                            <div className="relative">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Kirim Pesan</h3>
                                <p className="text-gray-500 mb-8">Kami akan membalas pesan Anda secepatnya.</p>

                                {statusMessage && (
                                    <div className={`mb-6 p-4 rounded-xl flex items-center text-sm font-medium animate-fade-in-down ${
                                        statusMessage === 'success'
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                        {statusMessage === 'success'
                                            ? '✅ Pesan terkirim! Terima kasih telah menghubungi kami.'
                                            : '❌ Gagal mengirim pesan. Mohon periksa koneksi Anda.'}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <input type="text" name="website" value={formData.website} onChange={handleChange} className="hidden" tabIndex="-1" autoComplete="off" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                                            <input
                                                type="text" id="name" name="name"
                                                value={formData.name} onChange={handleChange}
                                                placeholder="Isi Nama" required
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
                                            <input
                                                type="email" id="email" name="email"
                                                value={formData.email} onChange={handleChange}
                                                placeholder="nama@email.com" required
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-semibold text-gray-700">Pesan</label>
                                        <textarea
                                            id="message" name="message"
                                            value={formData.message} onChange={handleChange}
                                            rows="6" placeholder="Tuliskan detail kebutuhan foto Anda..." required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 resize-none"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all duration-300 flex justify-center items-center space-x-2 ${
                                            isSubmitting
                                                ? "bg-gray-400 cursor-not-allowed text-gray-100"
                                                : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30 hover:-translate-y-1 text-white"
                                        }`}
                                    >
                                        <span>{isSubmitting ? "Sedang Mengirim..." : "Kirim Pesan"}</span>
                                        {!isSubmitting && <FaPaperPlane className="text-sm" />}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ContactPage;