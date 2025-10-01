import React, { useState, useEffect } from "react";
import { FaUserCircle, FaBook, FaBoxOpen, FaTicketAlt, FaStar, FaChevronDown } from "react-icons/fa";
import moment from "moment";

// Helper function untuk memformat angka menjadi format Rupiah
const formatRupiah = (number) => {
    if (typeof number !== 'number') return '-';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(number);
};

function CustomerDetail({ customer, onBack, customerDetailData, fetchCustomerDetail }) {
    const [activeTab, setActiveTab] = useState("agenda");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (customer) {
            setLoading(true);
            fetchCustomerDetail(customer.nomor_whatsapp);
        }
    }, [customer, fetchCustomerDetail]);

    useEffect(() => {
        if (customerDetailData) {
            console.log("Customer Detail Data:", customerDetailData);
            setLoading(false);
        }
    }, [customerDetailData]);

    if (loading) {
        return <div>Memuat data pelanggan...</div>;
    }

    if (!customerDetailData) {
        return <div className="text-red-500">Data pelanggan tidak ditemukan</div>;
    }

    const renderContent = () => {
        if (activeTab === "agenda") {
            return (
                <>
                    {/* Tabel Akan Datang */}
                    <div className="mt-8">
                        <h4 className="text-lg font-bold mb-2">Akan Datang</h4>
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Studio</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {customerDetailData?.upcomingBookings?.length > 0 ? (
                                        customerDetailData.upcomingBookings.map((booking, index) => (
                                            <tr key={index}>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-green-600">
                                                    {moment(booking.tanggal).format("DD/MM/YYYY")}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm">{booking.package_name}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm">{booking.nama}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm">{booking.studio_name}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm">{booking.catatan}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4 text-gray-500">
                                                Tidak ada data
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tabel Berlalu */}
                    <div className="mt-8">
                        <h4 className="text-lg font-bold mb-2">Berlalu</h4>
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Studio</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {customerDetailData?.pastBookings?.length > 0 ? (
                                        customerDetailData.pastBookings.map((booking, index) => (
                                            <tr key={index}>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-green-600">
                                                    {moment(booking.tanggal).format("DD/MM/YYYY")}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm">{booking.package_name}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm">{booking.nama}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm">{booking.studio_name}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm">{booking.catatan}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                        booking.status === 'canceled' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4 text-gray-500">
                                                Tidak ada data
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
        return <div className="p-4 text-gray-500">Fitur ini akan datang.</div>;
    };

    return (
        <div className="p-8">
            <button onClick={onBack} className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
                ← Kembali
            </button>
            <h1 className="text-3xl font-bold mb-8">Ubah Data Pelanggan</h1>

            {/* Data Customer */}
            <div className="bg-white p-6 rounded-lg shadow-md border-b-2 border-green-600">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                        <span className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                            <FaUserCircle className="w-12 h-12 text-gray-500" />
                        </span>
                        <div>
                            <h3 className="text-2xl font-bold">{customerDetailData?.nama || "-"}</h3>
                            <div className="flex space-x-2 mt-2">
                                <button className="p-2 border rounded-full text-green-600 hover:bg-green-50"><FaBook /></button>
                                <button className="p-2 border rounded-full text-green-600 hover:bg-green-50"><FaBoxOpen /></button>
                                <button className="p-2 border rounded-full text-green-600 hover:bg-green-50"><FaTicketAlt /></button>
                                <button className="p-2 border rounded-full text-green-600 hover:bg-green-50"><FaStar /></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-7 gap-4 text-center mt-6 text-gray-600">
                    <div>
                        <p className="font-semibold text-lg">{formatRupiah(customerDetailData?.summary?.totalPenjualan || 0)}</p>
                        <p className="text-sm">Total Penjualan</p>
                    </div>
                    <div><p className="font-semibold text-lg">{customerDetailData?.summary?.penggunaanVoucher || 0}</p><p className="text-sm">Penggunaan voucher</p></div>
                    <div><p className="font-semibold text-lg text-red-500">{customerDetailData?.summary?.belumBayar || 0}</p><p className="text-sm">Belum bayar</p></div>
                    <div><p className="font-semibold text-lg">{customerDetailData?.summary?.totalBooking || 0}</p><p className="text-sm">Total Booking</p></div>
                    <div><p className="font-semibold text-lg">{customerDetailData?.summary?.komplit || 0}</p><p className="text-sm">Komplit</p></div>
                    <div><p className="font-semibold text-lg">{customerDetailData?.summary?.pembatalan || 0}</p><p className="text-sm">Pembatalan</p></div>
                    <div><p className="font-semibold text-lg text-red-500">{customerDetailData?.summary?.tidakHadir || 0}</p><p className="text-sm">Tidak hadir</p></div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mt-8 flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("agenda")}
                    className={`px-4 py-2 font-medium ${activeTab === "agenda" ? "border-b-2 border-green-600 text-green-600" : "text-gray-500"}`}
                >
                    Agenda
                </button>
                <button
                    onClick={() => setActiveTab("layanan")}
                    className={`px-4 py-2 font-medium ${activeTab === "layanan" ? "border-b-2 border-green-600 text-green-600" : "text-gray-500"}`}
                >
                    Layanan
                </button>
            </div>

            {/* Content */}
            <div className="mt-4 flex-grow">{renderContent()}</div>
        </div>
    );
}

export default CustomerDetail;