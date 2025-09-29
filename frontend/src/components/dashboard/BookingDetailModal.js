import React, { useState } from 'react';
import moment from 'moment';
import {
    FaMapPin,
    FaChevronDown,
    FaClock,
    FaCalendarAlt,
    FaHistory,
    FaBoxOpen,
    FaTimes
} from 'react-icons/fa';

// Komponen ini HANYA bertanggung jawab untuk konten modal.
const BookingDetailModal = ({ selectedEvent, onClose, handleConfirmBooking, showModal }) => {
    const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(true);
    const [isOtherDropdownOpen, setIsOtherDropdownOpen] = useState(false);

    if (!selectedEvent) {
        return null;
    }

    const eventData = selectedEvent;

    const handleOtherAction = (action) => {
        if (typeof showModal === 'function') {
            showModal('Informasi', `Fungsi ${action} akan diimplementasikan segera.`);
        } else {
            console.log(`Fungsi ${action} akan diimplementasikan.`);
        }
        setIsOtherDropdownOpen(false);
    };

    const onConfirmClick = () => {
        if (typeof handleConfirmBooking === 'function') {
            onClose(); // Tutup modal detail
            handleConfirmBooking(eventData.id, null); // Panggil modal konfirmasi dari hook
        } else {
            console.error('handleConfirmBooking is not a function');
            if (typeof showModal === 'function') {
                showModal('Error', 'Fungsi konfirmasi tidak tersedia.');
            }
        }
    };

    const totalHarga = eventData.package_price || 0;
    const duration = eventData.package_duration || 60;

    return (
        // ✅ HANYA konten modal, tanpa overlay. Parent akan menyediakan overlay.
        <div className="relative w-full max-w-xl mx-auto my-6 bg-white rounded-lg shadow-xl p-6">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h3 className="text-xl font-bold">Lihat Agenda</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                    <FaTimes size={20} />
                </button>
            </div>

            {/* Body */}
            <div className="py-4 overflow-y-auto max-h-[70vh]">
                <div className="p-4 bg-gray-100 rounded-lg flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <span className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-700">
                                {eventData.nama ? eventData.nama.charAt(0) : '?'}
                            </span>
                        </span>
                        <div>
                            <h4 className="font-semibold text-lg">{eventData.nama || 'Nama Pelanggan'}</h4>
                            <p className="text-sm text-gray-500">WA: {eventData.nomor_whatsapp || '-'}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 text-sm border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50">
                            Hubungi
                        </button>
                        <button
                            className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-200"
                            onClick={() => handleOtherAction('Lihat Detail')}
                        >
                            Detail
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between my-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                        <span
                            className={`px-2 py-1 rounded-full font-semibold ${
                                eventData.status === 'confirmed'
                                    ? 'bg-green-100 text-green-700'
                                    : eventData.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                            }`}
                        >
                            {eventData.status ? eventData.status.toUpperCase() : 'UNKNOWN'}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <FaMapPin className="text-red-500" />
                        <span>{eventData.studio_name || 'Studio'}</span>
                        <span>•</span>
                        <FaCalendarAlt className="text-red-500" />
                        <span>{moment(eventData.tanggal).format('DD MMM YYYY')}</span>
                        <span>•</span>
                        <FaClock className="text-red-500" />
                        <span>{eventData.waktu_mulai} - {eventData.waktu_selesai}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                    <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setIsBookingDetailsOpen(!isBookingDetailsOpen)}
                    >
                        <div className="flex items-center space-x-2">
                            {eventData.image_url ? (
                                <img
                                    src={`http://localhost:8080/${eventData.image_url}`}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/64x64/ccc/999?text=Paket';
                                    }}
                                    alt={eventData.package_name || 'Paket'}
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-sm">
                                    Paket
                                </div>
                            )}
                            <h5 className="font-bold">{eventData.package_name || 'Tanpa Paket'}</h5>
                        </div>
                        <FaChevronDown
                            className={`transform transition-transform duration-200 ${
                                isBookingDetailsOpen ? 'rotate-180' : 'rotate-0'
                            }`}
                        />
                    </div>
                    {isBookingDetailsOpen && (
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600 border-t pt-4">
                            <div>
                                <p className="text-xs text-gray-500">Jam Mulai</p>
                                <p className="font-semibold text-lg">{eventData.waktu_mulai || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Durasi</p>
                                <p className="font-semibold text-lg">{duration} Menit</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Staff</p>
                                <p className="font-semibold text-lg">{eventData.staff || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Harga Paket</p>
                                <p className="font-semibold text-lg">Rp {totalHarga.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Catatan</p>
                                <p className="text-sm italic">
                                    {eventData.catatan || 'Tidak ada catatan tambahan.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <FaClock />
                    <span>Data ditarik: {moment().format('DD MMMM YYYY, HH:mm:ss')}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div className="text-xl font-bold text-gray-800">
                    Total: <span className="text-red-500">Rp {totalHarga.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex space-x-2">
                    <div className="relative">
                        <button
                            onClick={() => setIsOtherDropdownOpen(!isOtherDropdownOpen)}
                            className="bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 flex items-center space-x-2 hover:bg-gray-100"
                        >
                            <span>Lainnya</span> <FaChevronDown />
                        </button>
                        {isOtherDropdownOpen && (
                            <div className="absolute z-10 bottom-full mb-2 right-0 w-48 bg-white border rounded-lg shadow-lg">
                                <ul className="py-1 text-sm text-gray-700">
                                    <li
                                        className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 cursor-pointer"
                                        onClick={() => handleOtherAction('Ubah Agenda')}
                                    >
                                        <FaCalendarAlt />
                                        <span>Ubah Agenda</span>
                                    </li>
                                    <li
                                        className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 cursor-pointer"
                                        onClick={() => handleOtherAction('Tambahkan Produk')}
                                    >
                                        <FaBoxOpen />
                                        <span>Tambahkan Produk</span>
                                    </li>
                                    <li
                                        className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 cursor-pointer"
                                        onClick={() => handleOtherAction('Jadwal Ulang')}
                                    >
                                        <FaHistory />
                                        <span>Jadwal Ulang</span>
                                    </li>
                                    <li
                                        className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-red-600 cursor-pointer"
                                        onClick={() => handleOtherAction('Batal')}
                                    >
                                        <FaMapPin />
                                        <span>Batal</span>
                                    </li>
                                    <li
                                        className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 cursor-pointer"
                                        onClick={() => handleOtherAction('Tidak Hadir')}
                                    >
                                        <FaMapPin />
                                        <span>Tidak hadir</span>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                    {eventData.status === 'pending' && (
                        <button
                            onClick={onConfirmClick}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold"
                        >
                            Konfirmasi
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingDetailModal;