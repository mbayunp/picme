// src/components/AdminLayout.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt, FaTachometerAlt, FaCalendarAlt, FaUsers, FaImage, FaCameraRetro, FaChartLine, FaEnvelope } from 'react-icons/fa';

const AdminLayout = ({ activeTab, setActiveTab, children }) => {
    return (
        <div className="flex min-h-screen bg-gray-100 text-gray-800">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-6 shadow-lg flex flex-col">
                <div className="flex-1 overflow-y-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
                    </div>
                    <nav>
                        <ul>
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('bookings')}
                                    className={`w-full text-left flex items-center p-3 rounded-lg transition-colors duration-200 ${activeTab === 'bookings' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <FaCalendarAlt className="mr-3" /> Jadwal Booking
                                </button>
                            </li>
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('bookings-data')}
                                    className={`w-full text-left flex items-center p-3 rounded-lg transition-colors duration-200 ${activeTab === 'bookings-data' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <FaTachometerAlt className="mr-3" /> Data Booking
                                </button>
                            </li>
                            {/* ... menu lainnya */}
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('customers')}
                                    className={`w-full text-left flex items-center p-3 rounded-lg transition-colors duration-200 ${activeTab === 'customers' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <FaUsers className="mr-3" /> Data Pelanggan
                                </button>
                            </li>
                            {/* ✅ Menu baru untuk Pesan Kontak */}
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('contact-messages')}
                                    className={`w-full text-left flex items-center p-3 rounded-lg transition-colors duration-200 ${activeTab === 'contact-messages' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <FaEnvelope className="mr-3" /> Pesan Masuk
                                </button>
                            </li>
                            {/* ... menu lainnya */}
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('posts')}
                                    className={`w-full text-left flex items-center p-3 rounded-lg transition-colors duration-200 ${activeTab === 'posts' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <FaImage className="mr-3" /> Blog Posts
                                </button>
                            </li>
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('packages')}
                                    className={`w-full text-left flex items-center p-3 rounded-lg transition-colors duration-200 ${activeTab === 'packages' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <FaCameraRetro className="mr-3" /> Manajemen Paket
                                </button>
                            </li>
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('financial-report')}
                                    className={`w-full text-left flex items-center p-3 rounded-lg transition-colors duration-200 ${activeTab === 'financial-report' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <FaChartLine className="mr-3" /> Rekapan Keuangan
                                </button>
                            </li>
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('portfolio')}
                                    className={`w-full text-left flex items-center p-3 rounded-lg transition-colors duration-200 ${activeTab === 'portfolio' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <FaImage className="mr-3" /> Manajemen Portfolio
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div className="mt-8">
                    <Link
                        to="/admin/login"
                        className="w-full flex items-center p-3 rounded-lg text-red-500 hover:bg-red-100 transition-colors duration-200"
                    >
                        <FaSignOutAlt className="mr-3" /> Logout
                    </Link>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        </div>
    );
};

export default AdminLayout;