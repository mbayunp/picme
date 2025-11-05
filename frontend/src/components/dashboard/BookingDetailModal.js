// src/components/dashboard/BookingDetailModal.js

import React, { useState, useMemo } from 'react';
import moment from 'moment';
import 'moment/locale/id'; // Impor lokal Indonesia
import {
    FaMapPin, FaChevronDown, FaClock, FaCalendarAlt,
    FaHistory, FaTimes, FaBan, FaTrash
} from 'react-icons/fa';

moment.locale('id'); // Set lokal

const BookingDetailModal = ({ 
    selectedEvent, 
    onClose, 
    handleConfirmBooking, 
    showModal, 
    handleDelete, 
    handleCancelBooking,
    packages
}) => {
    const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(true);
    const [isOtherDropdownOpen, setIsOtherDropdownOpen] = useState(false);
    
    const API_URL = process.env.REACT_APP_API_URL;

    // Cari URL gambar paket
    const packageImageUrl = useMemo(() => {
        if (!selectedEvent?.package_id || !Array.isArray(packages) || packages.length === 0) {
            return null;
        }
        const selectedPkg = packages.find(
            pkg => String(pkg.id) === String(selectedEvent.package_id)
        );
        return selectedPkg?.image_url || null;
    }, [selectedEvent, packages]);


    if (!selectedEvent) {
        return null;
    }

    const eventData = selectedEvent;

    // --- Fungsi Helper Internal ---
    const onCancelClickInternal = () => {
         setIsOtherDropdownOpen(false);
        if (typeof handleCancelBooking === 'function') {
            handleCancelBooking(eventData.id, onClose);
        } else {
             console.error('handleCancelBooking is not a function');
             if (typeof showModal === 'function') showModal('Error', 'Fungsi pembatalan tidak tersedia.');
        }
    };

     const onDeleteClickInternal = () => {
         setIsOtherDropdownOpen(false);
         if (typeof handleDelete === 'function') {
             handleDelete('services', eventData.id, 'Pemesanan berhasil dihapus!', 'Gagal menghapus pemesanan.', () => { onClose(); });
         } else {
             console.error('handleDelete is not a function');
             if (typeof showModal === 'function') showModal('Error', 'Fungsi hapus tidak tersedia.');
         }
    };

    const onConfirmClickInternal = () => {
        if (typeof handleConfirmBooking === 'function') {
            handleConfirmBooking(eventData.id, onClose);
        } else {
            console.error('handleConfirmBooking is not a function');
             if (typeof showModal === 'function') showModal('Error', 'Fungsi konfirmasi tidak tersedia.');
        }
    };

    const formatWhatsAppNumber = (number) => {
        if (!number) return null;
        const cleanNumber = number.replace(/\D/g, '');
        if (cleanNumber.startsWith('0')) { return `62${cleanNumber.substring(1)}`; }
        if (cleanNumber.startsWith('62')) { return cleanNumber; }
        return `62${cleanNumber}`;
    };
    // ------------------------------------------

    // Kalkulasi
    const totalHarga = (parseInt(eventData.package_price, 10) || 0) * (parseInt(eventData.jumlah_orang, 10) || 1);
    const startMoment = moment(eventData.waktu_mulai, 'HH:mm:ss');
    const endMoment = moment(eventData.waktu_selesai, 'HH:mm:ss');
    const calculatedDuration = endMoment.isValid() && startMoment.isValid() ? endMoment.diff(startMoment, 'minutes') : 0;
    const duration = calculatedDuration > 0 ? calculatedDuration : (eventData.waktu_durasi || 0);
    const formattedWaNumber = formatWhatsAppNumber(eventData.nomor_whatsapp);
    const waUrl = formattedWaNumber
        ? `https://wa.me/${formattedWaNumber}?text=Halo%20${encodeURIComponent(eventData.nama)}...`
        : '#';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
            <div className="relative w-full max-w-2xl mx-auto my-6 bg-white rounded-lg shadow-xl p-6">
                {/* Header Modal */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800">Lihat Agenda</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Konten Modal */}
                <div className="py-4 overflow-y-auto max-h-[70vh] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {/* Info Pelanggan */}
                    <div className="p-4 bg-gray-100 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                         <div className="flex items-center space-x-4">
                             <span className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                                 <span className="text-xl font-bold text-gray-600">
                                     {eventData.nama ? eventData.nama.charAt(0).toUpperCase() : '?'}
                                 </span>
                             </span>
                             <div>
                                 <h4 className="font-semibold text-lg text-gray-900">{eventData.nama || 'Nama Pelanggan'}</h4>
                                 <p className="text-sm text-gray-500">WA: {eventData.nomor_whatsapp || '-'}</p>
                             </div>
                         </div>
                         <div className="flex items-center space-x-2 flex-shrink-0 self-start sm:self-center">
                            <a href={waUrl} target="_blank" rel="noopener noreferrer" className={`px-3 py-1 text-xs sm:text-sm border rounded-lg ${formattedWaNumber ? 'border-blue-500 text-blue-500 hover:bg-blue-50' : 'border-gray-400 text-gray-400 cursor-not-allowed'}`} > Hubungi </a>
                         </div>
                    </div>

                    {/* Status, Studio, Tanggal, Waktu */}
                    <div className="flex items-center justify-between flex-wrap gap-y-2 my-3 text-sm text-gray-600">
                        <span className={`px-2.5 py-1 rounded-full font-semibold text-xs ${ eventData.status === 'confirmed' || eventData.status === 'finished' ? 'bg-green-100 text-green-700' : eventData.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700' }`} >
                            {eventData.status ? eventData.status.toUpperCase() : 'UNKNOWN'}
                        </span>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-right">
                            <span className="flex items-center gap-1"><FaMapPin className="text-red-500 flex-shrink-0" />{eventData.studio_name || 'Studio'}</span>
                            <span className="flex items-center gap-1"><FaCalendarAlt className="text-red-500 flex-shrink-0" />{moment(eventData.tanggal).format('DD MMM YYYY')}</span>
                            <span className="flex items-center gap-1"><FaClock className="text-red-500 flex-shrink-0" />{moment(eventData.waktu_mulai, 'HH:mm:ss').format('HH:mm')} - {moment(eventData.waktu_selesai, 'HH:mm:ss').format('HH:mm')}</span>
                        </div>
                    </div>

                    {/* Detail Booking (Dropdown) */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm mb-4">
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsBookingDetailsOpen(!isBookingDetailsOpen)} >
                            <div className="flex items-center space-x-3">
                                
                                {/* PERBAIKAN GAMBAR DI SINI */}
                                {packageImageUrl ? (
                                    <img
                                        src={`${API_URL}/${packageImageUrl}`} // URL Lengkap
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/64x64/eee/ccc?text=Img'; }}
                                        alt={eventData.package_name || 'Paket'}
                                        className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs flex-shrink-0">
                                        Paket
                                    </div>
                                )}
                                <h5 className="font-bold text-base md:text-lg text-gray-800">{eventData.package_name || 'Tanpa Paket'}</h5>
                            </div>
                            <FaChevronDown className={`transform transition-transform duration-200 text-gray-500 ${ isBookingDetailsOpen ? 'rotate-180' : 'rotate-0' }`} />
                        </div>

                        {/* Konten Dropdown */}
                        {isBookingDetailsOpen && (
                            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-gray-700 border-t pt-4">
                                <div><p className="text-xs text-gray-500 uppercase tracking-wider">Jam Mulai</p><p className="font-semibold text-base">{moment(eventData.waktu_mulai, 'HH:mm:ss').format('HH:mm')}</p></div>
                                <div><p className="text-xs text-gray-500 uppercase tracking-wider">Durasi</p><p className="font-semibold text-base">{duration > 0 ? `${duration} Menit` : '-'}</p></div>
                                <div><p className="text-xs text-gray-500 uppercase tracking-wider">Staff</p><p className="font-semibold text-base">{eventData.staff || 'N/A'}</p></div>
                                <div><p className="text-xs text-gray-500 uppercase tracking-wider">Total Harga</p><p className="font-semibold text-base">Rp {totalHarga.toLocaleString('id-ID')}</p></div>
                                <div><p className="text-xs text-gray-500 uppercase tracking-wider">Jumlah Orang</p><p className="font-semibold text-base">{eventData.jumlah_orang || '1'}</p></div>
                                <div className="col-span-2"> <p className="text-xs text-gray-500 uppercase tracking-wider">Catatan</p> <p className="text-sm italic mt-1 text-gray-600"> {eventData.catatan || 'Tidak ada catatan tambahan.'} </p> </div>
                            </div>
                        )}
                    </div>

                    {/* Info Waktu Data */}
                    <div className="flex items-center space-x-2 text-xs text-gray-400 mt-2"> <FaHistory /> <span>Data booking dibuat: {eventData.created_at ? moment(eventData.created_at).format('DD MMM YYYY, HH:mm') : '-'}</span> </div>
                </div>

                {/* Footer Modal (Tombol Aksi) */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200 gap-3">
                    <div className="text-lg md:text-xl font-bold text-gray-800 self-start sm:self-center">
                        Total: <span className="text-red-600">Rp {totalHarga.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex space-x-2 self-end sm:self-center">
                         <div className="relative">
                            <button onClick={() => setIsOtherDropdownOpen(prev => !prev)} className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 flex items-center space-x-2 hover:bg-gray-100 text-sm font-medium" >
                                <span>Lainnya</span> <FaChevronDown size={12} className={`transition-transform ${isOtherDropdownOpen ? 'rotate-180':''}`} />
                            </button>
                            {isOtherDropdownOpen && (
                                <div className="absolute z-20 bottom-full mb-2 right-0 w-48 bg-white border rounded-lg shadow-lg py-1">
                                    {eventData.status !== 'canceled' && eventData.status !== 'finished' && (
                                        <button onClick={onCancelClickInternal} className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 text-sm" > <FaBan/> Batalkan </button>
                                    )}
                                    <button onClick={onDeleteClickInternal} className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 text-sm" > <FaTrash/> Hapus </button>
                                </div>
                            )}
                        </div>
                        
                        {/* Tombol Checkout / Status */}
                        {eventData.status === 'pending' && (
                            <button
                                onClick={onConfirmClickInternal}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold text-sm"
                            > Checkout </button>
                        )}
                         {(eventData.status === 'confirmed' || eventData.status === 'finished') && (
                              <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm cursor-default">Selesai</span>
                         )}
                         {eventData.status === 'canceled' && (
                              <span className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold text-sm cursor-default">Dibatalkan</span>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailModal;