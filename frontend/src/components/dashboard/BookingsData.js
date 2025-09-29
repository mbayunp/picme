import React, { useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import BookingDetailModal from './BookingDetailModal';

const BookingsData = ({
    bookings,
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
}) => {
    const [isEditingBooking, setIsEditingBooking] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);
    const [bookingForm, setBookingForm] = useState({
        nama: '',
        email: '',
        nomor_whatsapp: '',
        catatan: '',
        tanggal: '',
        waktu_mulai: '',
        package_id: null,
        studio_name: '',
        jumlah_orang: 1,
        status: ''
    });

    // ✅ State untuk modal detail pemesanan
    const [selectedEvent, setSelectedEvent] = useState(null);

    // ✅ Fungsi untuk menampilkan modal detail
    const handleViewDetail = (booking) => {
        setSelectedEvent(booking);
    };

    // ✅ Fungsi untuk menutup modal detail
    const handleCloseDetailModal = () => {
        setSelectedEvent(null);
    };

    const handleConfirmBookingLocal = (id) => {
        handleConfirmBooking(id, () => {
            fetchAllBookings();
            showModal('Berhasil', 'Pemesanan berhasil dikonfirmasi!');
        });
    };

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
                nama: bookingForm.nama,
                email: bookingForm.email,
                nomor_whatsapp: bookingForm.nomor_whatsapp,
                catatan: bookingForm.catatan,
                tanggal: bookingForm.tanggal,
                waktu_mulai: bookingForm.waktu_mulai,
                package_id: bookingForm.package_id ? parseInt(bookingForm.package_id, 10) : null,
                studio_name: bookingForm.studio_name,
                jumlah_orang: parseInt(bookingForm.jumlah_orang, 10) || 1,
                status: bookingForm.status
            };
            await axios.put(`http://localhost:8080/api/services/${currentBooking.id}`, payload, config);
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

    const renderBookingStatus = (status) => {
        switch (status) {
            case 'confirmed':
                return (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Confirmed
                    </span>
                );
            case 'pending':
                return (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                    </span>
                );
            case 'canceled':
                return (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Canceled
                    </span>
                );
            default:
                return (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {status}
                    </span>
                );
        }
    };

    const dataToDisplay = [...bookings].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        if (aValue === bValue) return 0;
        let comparison = 0;
        if (sortKey === 'tanggal') {
            comparison = moment(aValue).diff(moment(bValue));
        } else {
            if (aValue > bValue) comparison = 1;
            if (aValue < bValue) comparison = -1;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    return (
        <>
            <div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col">
                <h3 className="text-xl font-bold mb-4">Detail Pemesanan</h3>
                {isEditingBooking && (
                    <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
                        <h4 className="text-lg font-bold mb-2">Edit Pemesanan</h4>
                        <form onSubmit={handleUpdateBooking} className="grid grid-cols-2 gap-4">
                            <input type="text" name="nama" value={bookingForm.nama} onChange={handleBookingFormChange} className="p-2 border rounded" placeholder="Nama" />
                            <input type="email" name="email" value={bookingForm.email} onChange={handleBookingFormChange} className="p-2 border rounded" placeholder="Email" />
                            <input type="text" name="nomor_whatsapp" value={bookingForm.nomor_whatsapp} onChange={handleBookingFormChange} className="p-2 border rounded" placeholder="Nomor WhatsApp" />
                            <select name="package_id" value={bookingForm.package_id || ''} onChange={handleBookingFormChange} className="p-2 border rounded">
                                <option value="">Pilih Paket (opsional)</option>
                                {packages.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nama_paket} - Rp{p.harga}
                                    </option>
                                ))}
                            </select>
                            <input type="date" name="tanggal" value={bookingForm.tanggal} onChange={handleBookingFormChange} className="p-2 border rounded" />
                            <input type="time" name="waktu_mulai" value={bookingForm.waktu_mulai} onChange={handleBookingFormChange} className="p-2 border rounded" />
                            <select name="studio_name" value={bookingForm.studio_name} onChange={handleBookingFormChange} className="p-2 border rounded">
                                <option value="">Pilih Studio</option>
                                {studios.map((s) => (
                                    <option key={s.id} value={s.name}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            <input type="number" name="jumlah_orang" value={bookingForm.jumlah_orang} onChange={handleBookingFormChange} className="p-2 border rounded" placeholder="Jumlah Orang" />
                            <textarea name="catatan" value={bookingForm.catatan} onChange={handleBookingFormChange} className="col-span-2 p-2 border rounded" placeholder="Catatan (opsional)" />
                            <div className="col-span-2 flex gap-2">
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                                    Simpan
                                </button>
                                <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500">
                                    Batal
                                </button>
                                {currentBooking && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleDelete('services', currentBooking.id, 'Pemesanan berhasil dihapus!', 'Gagal menghapus pemesanan.', fetchAllBookings);
                                            setIsEditingBooking(false);
                                            setCurrentBooking(null);
                                        }}
                                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                    >
                                        Hapus
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}
                <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm mt-4">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('nama')}>
                                    Nama {renderSortArrow('nama')}
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    No. WA
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('studio_name')}>
                                    Studio {renderSortArrow('studio_name')}
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('tanggal')}>
                                    Tanggal {renderSortArrow('tanggal')}
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Waktu
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Paket
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dataToDisplay.map((booking) => (
                                <tr key={booking.id}>
                                    <td onClick={() => handleViewDetail(booking)} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 cursor-pointer hover:text-blue-600">
                                        {booking.nama}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{booking.email}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{booking.nomor_whatsapp}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{booking.studio_name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{formatShortDate(booking.tanggal)}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {booking.waktu_mulai.substring(0, 5)} - {booking.waktu_selesai.substring(0, 5)}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{getPackageName(booking.package_id)}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">{renderBookingStatus(booking.status)}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex gap-2">
                                            {booking.status === 'pending' && (
                                                <button onClick={() => handleConfirmBooking(booking.id, fetchAllBookings)} className="text-green-600 hover:text-green-900">
                                                    Konfirmasi
                                                </button>
                                            )}
                                            <button onClick={() => handleEditBookingClick(booking)} className="text-indigo-600 hover:text-indigo-900">
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete('services', booking.id, 'Pemesanan berhasil dihapus!', 'Gagal menghaapus pemesanan.', fetchAllBookings)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedEvent && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
                    <BookingDetailModal
                        selectedEvent={selectedEvent}
                        onClose={handleCloseDetailModal}
                        handleConfirmBooking={handleConfirmBooking}
                        showModal={showModal}
                    />
                </div>
            )}
        </>
    );
};

export default BookingsData;