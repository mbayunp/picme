import React from "react";
import PicmeLogo from "../../assets/images/PicmeLogo.png";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaTag } from "react-icons/fa";

// ✅ Tambahkan variabel lingkungan untuk URL API
const API_URL = process.env.REACT_APP_API_URL;

const BookingSummary = ({ studio, date, time, cart, formData }) => {
    const packageDuration = formData?.waktu_durasi || 0;

    const [startHour, startMinute] = time.split(":").map(Number);
    const totalMinutes = startHour * 60 + startMinute + packageDuration;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;

    const formattedEndHour = String(endHour).padStart(2, "0");
    const formattedEndMinute = String(endMinute).padStart(2, "0");
    const endTime = `${formattedEndHour}:${formattedEndMinute}`;

    const studioAddress = "Cluster Pramuka Blok C.4, Sukamulya, Kec. Karangtengah, Cianjur";

    const selectedPackage = cart.length > 0 ? cart[0] : null;
    const totalHarga = cart.reduce((sum, item) => sum + item.harga * item.quantity, 0);
    
    const displayImage = selectedPackage?.image_url 
        ? `${API_URL}/${selectedPackage.image_url}` 
        : PicmeLogo;

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 h-fit sticky top-24">
            {/* Header Ringkasan */}
            <div className="bg-gray-900 text-white p-6 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-1">Ringkasan Pesanan</h3>
                    <p className="text-gray-400 text-sm">Detail sesi foto Anda</p>
                </div>
                {/* Dekorasi Circle */}
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-600 rounded-full opacity-20"></div>
            </div>

            <div className="p-6 space-y-6">
                {/* 1. Info Studio & Paket */}
                <div className="flex gap-4 items-start">
                    <img
                        src={displayImage}
                        alt={selectedPackage?.nama_paket || "Paket"}
                        className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-sm"
                    />
                    <div>
                        <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                            {selectedPackage?.nama_paket || 'Nama Paket'}
                        </h4>
                        <div className="flex items-center text-sm text-gray-500">
                            <FaTag className="mr-2 text-green-500 text-xs" />
                            <span>{packageDuration} Menit</span>
                        </div>
                    </div>
                </div>

                <hr className="border-dashed border-gray-200" />

                {/* 2. Detail Jadwal */}
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg text-xs">
                            <FaMapMarkerAlt />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lokasi</p>
                            <p className="text-sm font-semibold text-gray-800">{studio}</p>
                            <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{studioAddress}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-green-50 text-green-600 rounded-lg text-xs">
                            <FaCalendarAlt />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal</p>
                            <p className="text-sm font-semibold text-gray-800">
                                {date.toLocaleDateString("id-ID", { weekday: 'long', day: "numeric", month: "long", year: "numeric" })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-orange-50 text-orange-600 rounded-lg text-xs">
                            <FaClock />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Waktu</p>
                            <p className="text-sm font-semibold text-gray-800">{time} - {endTime} WIB</p>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-200" />

                {/* 3. Total Harga */}
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Pembayaran</p>
                        <p className="text-xs text-gray-400">(Bayar di Studio)</p>
                    </div>
                    <p className="text-2xl font-extrabold text-green-600">
                        Rp {totalHarga.toLocaleString("id-ID")}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BookingSummary;