import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import BookingDetailModal from './BookingDetailModal';
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const BookingsData = ({
    sortedBookings,
    packages,
    studios,
    sortKey,
    sortDirection,
    handleSort,
    renderSortArrow,
    formatShortDate,
    getPackageName,
    showModal,
    fetchAllBookings,
    handleDelete,
    handleConfirmBooking,
    handleCancelBooking,
    bookingData,
    currentPage,
    totalPages,
    setPage
}) => {
    
    // ✅ PERBAIKAN: Menambahkan 'currentPage' dan 'fetchAllBookings' ke dependency array
    useEffect(() => {
        if (fetchAllBookings) {
            fetchAllBookings(currentPage || 1);
        }
    }, [currentPage, fetchAllBookings]);

    const [isEditingBooking, setIsEditingBooking] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);
    const [bookingForm, setBookingForm] = useState({
        nama: '', email: '', nomor_whatsapp: '', catatan: '', tanggal: '', waktu_mulai: '', package_id: null, studio_name: '', jumlah_orang: 1, status: ''
    });
    const [selectedEvent, setSelectedEvent] = useState(null);

    // --- Handlers ---
    const handleViewDetail = (booking) => setSelectedEvent(booking);
    const handleCloseDetailModal = () => setSelectedEvent(null);
    
    const handleEditBookingClick = (booking) => {
        setCurrentBooking(booking);
        setBookingForm({
            nama: booking.nama || '',
            email: booking.email || '',
            nomor_whatsapp: booking.nomor_whatsapp || '',
            catatan: booking.catatan || '',
            tanggal: booking.tanggal ? moment(booking.tanggal).format('YYYY-MM-DD') : '',
            waktu_mulai: booking.waktu_mulai || '',
            package_id: booking.package_id != null ? booking.package_id.toString() : '',
            studio_name: booking.studio_name || '',
            jumlah_orang: booking.jumlah_orang != null ? booking.jumlah_orang : 1,
            status: booking.status || ''
        });
        setIsEditingBooking(true);
    };

    const handleBookingFormChange = (e) => {
        const { name, value } = e.target;
        setBookingForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateBooking = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin-token');
            const config = { headers: { 'x-access-token': token } };
            const payload = { 
                ...bookingForm, 
                package_id: parseInt(bookingForm.package_id), 
                jumlah_orang: parseInt(bookingForm.jumlah_orang) 
            };
            await axios.put(`${API_URL}/api/services/${currentBooking.id}`, payload, config);
            showModal('Berhasil', 'Pemesanan berhasil diperbarui!');
            setIsEditingBooking(false);
            setCurrentBooking(null);
            fetchAllBookings();
        } catch (error) {
            console.error('Error updating booking:', error);
            showModal('Gagal', 'Gagal memperbarui pemesanan.');
        }
    };

    const handleCancelEdit = () => {
        setIsEditingBooking(false);
        setCurrentBooking(null);
    };

    // --- UI Components ---
    const renderStatusBadge = (status) => {
        const styles = {
            confirmed: "bg-green-100 text-green-800 border-green-200",
            pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
            canceled: "bg-red-100 text-red-800 border-red-200",
            finished: "bg-blue-100 text-blue-800 border-blue-200"
        };
        const style = styles[status] || "bg-gray-100 text-gray-800 border-gray-200";
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${style} capitalize`}>
                {status}
            </span>
        );
    };

    const dataToDisplay = sortedBookings || [];

    // --- Pagination UI ---
    const renderPagination = () => {
        const safeTotalPages = totalPages || 1;
        if (safeTotalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                    Halaman <span className="font-medium">{currentPage}</span> dari <span className="font-medium">{safeTotalPages}</span>
                </span>
                <div className="flex gap-2">
                    <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-sm border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50">Prev</button>
                    <button onClick={() => setPage(Math.min(safeTotalPages, currentPage + 1))} disabled={currentPage === safeTotalPages} className="px-3 py-1.5 text-sm border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
                </div>
            </div>
        );
    };

    // --- RENDER UTAMA ---
    return (
        <>
            <div className="p-6 bg-gray-50 min-h-full rounded-xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Data Pemesanan</h3>
                    {/* Anda bisa menambahkan tombol Export di sini nanti */}
                </div>

                {/* Form Edit (Floating Card) */}
                {isEditingBooking && (
                    <div className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-blue-100 relative">
                        <button onClick={handleCancelEdit} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><FaTimesCircle size={20}/></button>
                        <h4 className="text-lg font-bold mb-4 text-blue-800">Edit Data Pemesanan</h4>
                        <form onSubmit={handleUpdateBooking} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Nama</label><input name="nama" value={bookingForm.nama} onChange={handleBookingFormChange} className="w-full p-2 border rounded-lg" /></div>
                            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Email</label><input name="email" value={bookingForm.email} onChange={handleBookingFormChange} className="w-full p-2 border rounded-lg" /></div>
                            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">WhatsApp</label><input name="nomor_whatsapp" value={bookingForm.nomor_whatsapp} onChange={handleBookingFormChange} className="w-full p-2 border rounded-lg" /></div>
                            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Paket</label>
                                <select name="package_id" value={bookingForm.package_id || ''} onChange={handleBookingFormChange} className="w-full p-2 border rounded-lg bg-white">
                                    <option value="">Pilih Paket</option>
                                    {packages.map(p => <option key={p.id} value={p.id}>{p.nama_paket}</option>)}
                                </select>
                            </div>
                            {/* ... Field lain disederhanakan untuk kerapian ... */}
                            {/* Anda harus melengkapi input untuk field lain (tanggal, waktu_mulai, studio_name, jumlah_orang, status) di sini */}
                            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Tanggal</label><input type="date" name="tanggal" value={bookingForm.tanggal} onChange={handleBookingFormChange} className="w-full p-2 border rounded-lg" /></div>
                            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Waktu Mulai</label><input type="time" name="waktu_mulai" value={bookingForm.waktu_mulai} onChange={handleBookingFormChange} className="w-full p-2 border rounded-lg" /></div>
                            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Studio</label>
                                <select name="studio_name" value={bookingForm.studio_name} onChange={handleBookingFormChange} className="w-full p-2 border rounded-lg bg-white">
                                    <option value="">Pilih Studio</option>
                                    {studios.map((s, index) => <option key={index} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Jml Orang</label><input type="number" name="jumlah_orang" value={bookingForm.jumlah_orang} onChange={handleBookingFormChange} className="w-full p-2 border rounded-lg" /></div>
                            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                                <select name="status" value={bookingForm.status} onChange={handleBookingFormChange} className="w-full p-2 border rounded-lg bg-white">
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="canceled">Canceled</option>
                                    <option value="finished">Finished</option>
                                </select>
                            </div>
                            <div className="space-y-1 md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Catatan</label><textarea name="catatan" value={bookingForm.catatan} onChange={handleBookingFormChange} className="w-full p-2 border rounded-lg" rows="2" /></div>

                            <div className="col-span-full flex justify-end gap-3 mt-2">
                                <button type="button" onClick={handleCancelEdit} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TABEL DATA */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th onClick={() => handleSort('nama')} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                        Nama {renderSortArrow('nama')}
                                    </th>
                                    <th onClick={() => handleSort('tanggal')} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                        Jadwal {renderSortArrow('tanggal')}
                                    </th>
                                    <th onClick={() => handleSort('studio_name')} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                        Lokasi {renderSortArrow('studio_name')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Paket
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dataToDisplay.length > 0 ? (
                                    dataToDisplay.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                            
                                            {/* Nama & Kontak */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                                                        {booking.nama ? booking.nama.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div onClick={() => handleViewDetail(booking)} className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline">
                                                            {booking.nama}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{booking.nomor_whatsapp}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Jadwal */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-medium">{formatShortDate(booking.tanggal)}</div>
                                                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md w-fit mt-1">
                                                    {booking.waktu_mulai?.slice(0,5)} - {booking.waktu_selesai?.slice(0,5)}
                                                </div>
                                            </td>

                                            {/* Studio */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {booking.studio_name}
                                            </td>

                                            {/* Paket */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                                                    {getPackageName(booking.package_id)}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {renderStatusBadge(booking.status)}
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    {booking.status === 'pending' && (
                                                        <button onClick={() => handleConfirmBooking(booking.id, fetchAllBookings)} className="text-green-600 hover:text-green-900 p-1" title="Konfirmasi">
                                                            <FaCheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleEditBookingClick(booking)} className="text-blue-600 hover:text-blue-900 p-1" title="Edit">
                                                        <FaEdit size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete('services', booking.id, 'Dihapus!', 'Gagal hapus.', fetchAllBookings)} className="text-red-600 hover:text-red-900 p-1" title="Hapus">
                                                        <FaTrash size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <FaInfoCircle size={48} className="mb-4 text-gray-300" />
                                                <p className="text-lg font-medium">Belum ada data pemesanan.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {renderPagination()}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <BookingDetailModal
                        selectedEvent={selectedEvent}
                        onClose={handleCloseDetailModal}
                        handleConfirmBooking={handleConfirmBooking}
                        handleCancelBooking={handleCancelBooking}
                        handleDelete={handleDelete}
                        showModal={showModal}
                        packages={packages}
                    />
                </div>
            )}
        </>
    );
};

export default BookingsData;