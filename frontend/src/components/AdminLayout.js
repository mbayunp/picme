// src/components/AdminLayout.js
import React from 'react';

const AdminLayout = ({ activeTab, setActiveTab, children }) => {
    return (
        <div className="flex min-h-screen">
            <div className="w-64 bg-gray-900 text-white p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-8">Admin Panel</h2>
                <nav>
                    <button onClick={() => setActiveTab('posts')} className={`block w-full text-left py-4 px-6 mb-2 rounded-lg transition duration-300 ${activeTab === 'posts' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'}`}>
                        Postingan
                    </button>
                    <button onClick={() => setActiveTab('packages')} className={`block w-full text-left py-4 px-6 mb-2 rounded-lg transition duration-300 ${activeTab === 'packages' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'}`}>
                        Paket
                    </button>
                    <button onClick={() => setActiveTab('bookings')} className={`block w-full text-left py-4 px-6 mb-2 rounded-lg transition duration-300 ${activeTab === 'bookings' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'}`}>
                        Pemesanan (Kalender)
                    </button>
                    <button onClick={() => setActiveTab('bookings-data')} className={`block w-full text-left py-4 px-6 mb-2 rounded-lg transition duration-300 ${activeTab === 'bookings-data' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'}`}>
                        Detail Pemesanan
                    </button>
                    <button onClick={() => setActiveTab('customers')} className={`block w-full text-left py-4 px-6 mb-2 rounded-lg transition duration-300 ${activeTab === 'customers' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'}`}>
                        Data Pelanggan
                    </button>
                    <button onClick={() => setActiveTab('portfolio')} className={`block w-full text-left py-4 px-6 mb-2 rounded-lg transition duration-300 ${activeTab === 'portfolio' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'}`}>
                        Portfolio
                    </button>
                    <button onClick={() => {
                        localStorage.removeItem('admin-token');
                        window.location.href = '/admin/login';
                    }} className="block w-full text-left py-4 px-6 rounded-lg transition duration-300 hover:bg-gray-800">
                        Logout
                    </button>
                </nav>
            </div>
            <div className="flex-grow p-6 bg-gray-100">
                <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;