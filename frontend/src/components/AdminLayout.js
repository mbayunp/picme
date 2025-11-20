// src/components/AdminLayout.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaSignOutAlt, 
    FaTachometerAlt, 
    FaCalendarAlt, 
    FaUsers, 
    FaImage, 
    FaCameraRetro, 
    FaChartLine, 
    FaEnvelope, 
    FaBullhorn 
} from 'react-icons/fa';

const AdminLayout = ({ activeTab, setActiveTab, children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('admin-token');
        navigate('/admin/login');
    };

    // Helper untuk class tombol sidebar agar kode lebih rapi
    const getLinkClass = (tabName) => {
        const baseClass = "w-full text-left flex items-center p-3 rounded-lg transition-colors duration-200";
        const activeClass = "bg-blue-600 text-white shadow";
        const inactiveClass = "text-gray-600 hover:bg-gray-200";
        return `${baseClass} ${activeTab === tabName ? activeClass : inactiveClass}`;
    };

    return (
        <div className="flex min-h-screen bg-gray-100 text-gray-800">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-6 shadow-lg flex flex-col fixed h-full overflow-y-auto z-10">
                <div className="flex-1">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
                    </div>
                    <nav>
                        <ul>
                            {/* Menu Beranda */}
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('beranda')}
                                    className={getLinkClass('beranda')}
                                >
                                    <FaTachometerAlt className="mr-3" /> Beranda
                                </button>
                            </li>

                            {/* ✅ Menu Manajemen Booking (Gabungan Jadwal & Data) */}
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('bookings')}
                                    className={getLinkClass('bookings')}
                                >
                                    <FaCalendarAlt className="mr-3" /> Manajemen Booking
                                </button>
                            </li>

                            {/* Menu Data Pelanggan */}
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('customers')}
                                    className={getLinkClass('customers')}
                                >
                                    <FaUsers className="mr-3" /> Data Pelanggan
                                </button>
                            </li>

                            {/* Menu Pengumuman */}
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('announcements')}
                                    className={getLinkClass('announcements')}
                                >
                                    <FaBullhorn className="mr-3" /> Pengumuman
                                </button>
                            </li>

                            {/* Menu Pesan Masuk */}
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('contact-messages')}
                                    className={getLinkClass('contact-messages')}
                                >
                                    <FaEnvelope className="mr-3" /> Pesan Masuk
                                </button>
                            </li>

                            {/* Menu Blog Posts */}
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('posts')}
                                    className={getLinkClass('posts')}
                                >
                                    <FaImage className="mr-3" /> Blog Posts
                                </button>
                            </li>

                            {/* Menu Manajemen Paket */}
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('packages')}
                                    className={getLinkClass('packages')}
                                >
                                    <FaCameraRetro className="mr-3" /> Manajemen Paket
                                </button>
                            </li>

                            {/* Menu Rekapan Keuangan */}
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('financial-report')}
                                    className={getLinkClass('financial-report')}
                                >
                                    <FaChartLine className="mr-3" /> Rekapan Keuangan
                                </button>
                            </li>

                            {/* Menu Manajemen Portfolio */}
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('portfolio')}
                                    className={getLinkClass('portfolio')}
                                >
                                    <FaImage className="mr-3" /> Manajemen Portfolio
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
                
                {/* Logout Section */}
                <div className="mt-8 border-t pt-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center p-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors duration-200"
                    >
                        <FaSignOutAlt className="mr-3" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            {/* Ditambahkan margin-left (ml-64) agar konten tidak tertutup sidebar yang fixed */}
            <div className="flex-1 flex flex-col ml-64 min-w-0">
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;