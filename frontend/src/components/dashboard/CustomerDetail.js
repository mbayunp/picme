// src/components/dashboard/CustomerDetail.js
import React, { useState, useEffect } from "react";
import { 
    FaUserCircle, FaBoxOpen, FaStar, FaArrowLeft, 
    FaCalendarAlt, FaClock, FaMapMarkerAlt, FaInfoCircle 
} from "react-icons/fa";
import moment from "moment";

// Helper function format Rupiah
const formatRupiah = (number) => {
    if (typeof number !== 'number') return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(number);
};

// Helper status badge
const StatusBadge = ({ status }) => {
    let colorClass = "bg-gray-100 text-gray-700";
    let label = status;

    if (status === 'confirmed') {
        colorClass = "bg-green-100 text-green-700";
        label = "Dikonfirmasi";
    } else if (status === 'pending') {
        colorClass = "bg-yellow-100 text-yellow-700";
        label = "Menunggu";
    } else if (status === 'canceled') {
        colorClass = "bg-red-100 text-red-700";
        label = "Dibatalkan";
    } else if (status === 'finished') {
        colorClass = "bg-blue-100 text-blue-700";
        label = "Selesai";
    }

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${colorClass}`}>
            {label}
        </span>
    );
};

function CustomerDetail({ customer, onBack, customerDetailData, fetchCustomerDetail, onOpenBookingDetail }) {
    const [activeTab, setActiveTab] = useState("agenda");
    const [localLoading, setLocalLoading] = useState(false);

    // Fetch data saat komponen dimuat atau customer berubah
    useEffect(() => {
        if (customer?.nomor_whatsapp) {
            setLocalLoading(true);
            fetchCustomerDetail(customer.nomor_whatsapp)
                .finally(() => setLocalLoading(false));
        }
    }, [customer, fetchCustomerDetail]);

    if (localLoading && !customerDetailData) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                <p>Memuat data pelanggan...</p>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="p-8 text-center text-red-500">
                Data pelanggan tidak ditemukan. 
                <button onClick={onBack} className="text-blue-500 underline ml-2">Kembali</button>
            </div>
        );
    }

    // Fungsi render baris tabel agar tidak duplikasi kode
    const renderBookingRow = (booking, index) => (
        <tr 
            key={index} 
            onClick={() => onOpenBookingDetail && onOpenBookingDetail(booking)} // Integrasi klik detail
            className="hover:bg-gray-50 transition-colors cursor-pointer"
        >
            <td className="px-4 py-3">
                <div className="flex items-center text-sm text-gray-900 font-medium">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    {moment(booking.tanggal).format("DD MMM YYYY")}
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-1 ml-6">
                    <FaClock className="mr-1" />
                    {booking.waktu_mulai ? booking.waktu_mulai.substring(0, 5) : '-'}
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-700">
                <div className="font-medium">{booking.package_name || "Tanpa Paket"}</div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
                <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-1 text-gray-400" />
                    {booking.studio_name}
                </div>
            </td>
            <td className="px-4 py-3 text-sm">
                <StatusBadge status={booking.status} />
            </td>
        </tr>
    );

    const renderContent = () => {
        if (activeTab === "agenda") {
            return (
                <>
                    {/* Tabel Akan Datang */}
                    <div className="mt-6">
                        <h4 className="text-lg font-bold mb-3 text-gray-800 flex items-center">
                            <span className="w-2 h-6 bg-green-500 rounded-full mr-2"></span>
                            Agenda Mendatang
                        </h4>
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paket</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokasi</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {customerDetailData?.upcomingBookings?.length > 0 ? (
                                        customerDetailData.upcomingBookings.map(renderBookingRow)
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-8 text-center text-gray-500 text-sm">
                                                <div className="flex flex-col items-center">
                                                    <FaCalendarAlt className="text-gray-300 text-4xl mb-2" />
                                                    Tidak ada agenda mendatang.
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tabel Riwayat */}
                    <div className="mt-8">
                        <h4 className="text-lg font-bold mb-3 text-gray-800 flex items-center">
                             <span className="w-2 h-6 bg-gray-400 rounded-full mr-2"></span>
                             Riwayat Pemesanan
                        </h4>
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paket</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokasi</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {customerDetailData?.pastBookings?.length > 0 ? (
                                        customerDetailData.pastBookings.map(renderBookingRow)
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-8 text-center text-gray-500 text-sm">
                                                <div className="flex flex-col items-center">
                                                    <FaBoxOpen className="text-gray-300 text-4xl mb-2" />
                                                    Belum ada riwayat pemesanan.
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            );
        }
        
        if (activeTab === "layanan") {
             // Analisis Preferensi Sederhana
             const bookings = [...(customerDetailData?.upcomingBookings || []), ...(customerDetailData?.pastBookings || [])];
             
             // Hitung studio favorit
             const studioCounts = {};
             bookings.forEach(b => { studioCounts[b.studio_name] = (studioCounts[b.studio_name] || 0) + 1; });
             const favoriteStudio = Object.keys(studioCounts).sort((a, b) => studioCounts[b] - studioCounts[a])[0] || "-";

             // Hitung paket favorit
             const packageCounts = {};
             bookings.forEach(b => { packageCounts[b.package_name] = (packageCounts[b.package_name] || 0) + 1; });
             const favoritePackage = Object.keys(packageCounts).sort((a, b) => packageCounts[b] - packageCounts[a])[0] || "-";

             return (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h4 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
                            <FaStar className="text-yellow-400 mr-2" /> Preferensi Pelanggan
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Studio Favorit</p>
                                <p className="text-lg font-medium text-gray-900">{favoriteStudio}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Paket Paling Sering</p>
                                <p className="text-lg font-medium text-gray-900">{favoritePackage}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                         <h4 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
                            <FaInfoCircle className="text-blue-500 mr-2" /> Catatan Internal
                        </h4>
                        <p className="text-gray-500 text-sm italic">
                            Fitur catatan pelanggan personal akan segera hadir.
                        </p>
                    </div>
                </div>
             );
        }
        
        return null;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            {/* Tombol Kembali */}
            <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center mr-2 group-hover:border-gray-400">
                    <FaArrowLeft className="text-xs" />
                </div>
                <span className="font-medium">Kembali ke Daftar Pelanggan</span>
            </button>

            {/* Header Profile */}
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-600 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center border-2 border-green-100 text-green-600 font-bold text-3xl">
                            {customer?.nama ? customer.nama.charAt(0).toUpperCase() : <FaUserCircle />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{customer?.nama}</h2>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-500 mt-1">
                                <span>{customer?.nomor_whatsapp}</span>
                                {customer?.email && (
                                    <>
                                        <span className="hidden sm:inline">•</span>
                                        <span>{customer.email}</span>
                                    </>
                                )}
                            </div>
                            <div className="mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {customer?.total_bookings > 5 ? "Pelanggan Loyal" : "Pelanggan Baru"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistik Singkat */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
                    <div className="text-center p-3 rounded-lg hover:bg-gray-50 transition">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Belanja</p>
                        <p className="text-xl font-bold text-green-600 mt-1">{formatRupiah(customerDetailData?.summary?.totalPenjualan || 0)}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg hover:bg-gray-50 transition">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Booking</p>
                        <p className="text-xl font-bold text-gray-800 mt-1">{customerDetailData?.summary?.totalBooking || 0}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg hover:bg-gray-50 transition">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Selesai</p>
                        <p className="text-xl font-bold text-blue-600 mt-1">{customerDetailData?.summary?.komplit || 0}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg hover:bg-gray-50 transition">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Batal</p>
                        <p className="text-xl font-bold text-red-500 mt-1">{customerDetailData?.summary?.pembatalan || 0}</p>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 mb-6 bg-white px-4 rounded-t-lg pt-2">
                <button
                    onClick={() => setActiveTab("agenda")}
                    className={`px-6 py-3 font-medium text-sm focus:outline-none transition-all border-b-2 ${
                        activeTab === "agenda" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                    Riwayat & Agenda
                </button>
                <button
                    onClick={() => setActiveTab("layanan")}
                    className={`px-6 py-3 font-medium text-sm focus:outline-none transition-all border-b-2 ${
                        activeTab === "layanan" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                    Statistik & Layanan
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[300px] animate-fade-in">
                {renderContent()}
            </div>
        </div>
    );
}

export default CustomerDetail;