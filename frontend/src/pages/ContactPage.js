import React, { useState } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { MdOutlineAccessTime } from 'react-icons/md';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
        website: '' // 🕵️‍♂️ Honeypot field (disembunyikan)
    });
    const [statusMessage, setStatusMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage('');

        // 🚨 Anti-spam: Jika field tersembunyi diisi → tolak kiriman
        if (formData.website) {
            setStatusMessage('Terindikasi sebagai spam, pesan tidak dikirim.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(`${API_URL}/api/contact`, {
                name: formData.name,
                email: formData.email,
                message: formData.message,
            });
            setStatusMessage('✅ Pesan Anda telah terkirim!');
            setFormData({ name: '', email: '', message: '', website: '' }); // reset form
        } catch (error) {
            console.error("Failed to send message:", error);
            setStatusMessage('❌ Gagal mengirim pesan. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
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
                {/* FORM KONTAK */}
                <div className="bg-white p-10 rounded-xl shadow-2xl transform transition-transform duration-300 border border-gray-200">
                    <h2 className="text-3xl font-bold mb-8 text-gray-800">Kirim Pesan</h2>
                    
                    {statusMessage && (
                        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
                            statusMessage.includes('✅') ? 'bg-green-100 text-green-700' :
                            statusMessage.includes('spam') ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                            {statusMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 🔒 Honeypot field (disembunyikan dari manusia) */}
                        <input
                            type="text"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            style={{ display: "none" }}
                            tabIndex="-1"
                            autoComplete="off"
                        />

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
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
                                value={formData.email}
                                onChange={handleChange}
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
                                value={formData.message}
                                onChange={handleChange}
                                rows="5"
                                placeholder="Tulis pesan Anda di sini..."
                                required
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full font-bold py-3 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                isSubmitting
                                    ? "bg-gray-400 text-white cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                            }`}
                        >
                            {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
                        </button>
                    </form>
                </div>

                {/* INFORMASI KONTAK */}
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
                                <span className="text-sm text-gray-600">
                                    Cluster Pramuka Satu No.4 Blok C, Sukamulya, Kec. Karangtengah, Kabupaten Cianjur, Jawa Barat 43281
                                </span>
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
