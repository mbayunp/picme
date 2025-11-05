import React, { useState, useMemo } from 'react'; // Tambahkan useMemo
// 1. Ganti 'axios' dengan 'axiosInstance'
import axiosInstance from '../../api/axiosInstance'; // <-- Pastikan path ini benar
import moment from 'moment';
import 'moment/locale/id'; // Impor lokal
import { FaSearch, FaChevronDown } from 'react-icons/fa';
import { FaUpload, FaDownload } from 'react-icons/fa6';
import fileDownload from 'js-file-download';
import MergeModal from './MergeModal'; // Pastikan path ini benar

// Set lokal moment
moment.locale('id');

// const API_URL = process.env.REACT_APP_API_URL; // Tidak perlu jika baseURL di instance

const CustomersData = ({
    customersData, // Ini adalah objek pagination { data: [], currentPage, ... }
    sortKey, sortDirection, handleSort, renderSortArrow, showModal,
    fetchCustomers, // Fungsi untuk fetch ulang data
    onSelectCustomer, // Fungsi untuk klik detail
    currentPage, totalPages, totalItems,
    setPage, // Fungsi untuk ganti halaman
    searchQuery, setSearchQuery, // Props ini sekarang diterima dari AdminDashboard
    selectedTag, setSelectedTag,
    fetchDuplicateRecords,
    duplicateRecords,
    mergeCustomer
}) => {
    const [isEditingCustomer, setIsEditingCustomer] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [customerForm, setCustomerForm] = useState({ nama: '', email: '', nomor_whatsapp: '' });
    
    const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showMergeModal, setShowMergeModal] = useState(false);
    const [customerToMerge, setCustomerToMerge] = useState(null);

    const availableTags = ['Tag Baru', 'Loyal', 'VIP', 'Reguler'];

    const handleEditCustomerClick = (customer) => {
        setCurrentCustomer(customer);
        setCustomerForm({
            nama: customer.nama || '',
            email: customer.email || '',
            nomor_whatsapp: customer.nomor_whatsapp || '',
        });
        setIsEditingCustomer(true);
    };

    const handleCustomerFormChange = (e) => {
        const { name, value } = e.target;
        setCustomerForm(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateCustomer = async (e) => {
        e.preventDefault();
        if (!currentCustomer) return;
        try {
            // 2. Gunakan 'axiosInstance.put' dan hapus 'config' token
            const payload = {
                nama: customerForm.nama,
                email: customerForm.email,
                nomor_whatsapp: customerForm.nomor_whatsapp,
            };
            await axiosInstance.put(`/api/services/customer/${currentCustomer.nomor_whatsapp}`, payload);
            showModal('Berhasil', 'Data pelanggan berhasil diperbarui!');
            setIsEditingCustomer(false);
            setCurrentCustomer(null);
            if (typeof fetchCustomers === 'function') {
                fetchCustomers(currentPage, searchQuery); // Fetch ulang halaman saat ini
            }
        } catch (error) {
            // Interceptor menangani 401
            if (error.response?.status !== 401) {
                console.error('Error updating customer:', error);
                showModal('Gagal', 'Gagal memperbarui data pelanggan.');
            }
        }
    };

    const handleCancelEdit = () => {
        setIsEditingCustomer(false);
        setCurrentCustomer(null);
    };

    // --- Fungsi Filter & Search ---
    const handleFilterByTag = (tag) => {
        if (typeof setSelectedTag === 'function') {
            setSelectedTag(tag);
        }
        setIsTagsDropdownOpen(false);
    };

    const handleSearch = (e) => {
        if (typeof setSearchQuery === 'function') {
            setSearchQuery(e.target.value);
        }
    };

    // --- Fungsi Format Tanggal ---
    const formatLastVisitDate = (dateString) => {
        if (!dateString) return '-';
        return moment(dateString).format('DD MMM YYYY, HH:mm'); // Format lebih mudah dibaca
    };
    
    // --- Fungsi Ekspor ---
    const handleExport = async () => {
        try {
            // 3. Gunakan 'axiosInstance.get'
            const response = await axiosInstance.get(`/api/services/customers/export`, {
                responseType: 'blob', // responseType tetap diperlukan
            });
            fileDownload(response.data, `customers_data_${moment().format('YYYY-MM-DD')}.csv`);
            showModal('Berhasil', 'Data pelanggan berhasil diekspor.');
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error exporting customers:', error);
                showModal('Gagal', 'Gagal mengekspor data pelanggan.');
            }
        }
        setIsExportDropdownOpen(false); // Tutup dropdown
    };

    // --- Fungsi Impor ---
    const handleImportFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleImport = async () => {
        if (!selectedFile) { /* ... handle no file ... */ return; }
        const formData = new FormData();
        formData.append('csvFile', selectedFile);

        try {
            // 4. Gunakan 'axiosInstance.post'
            await axiosInstance.post(`/api/services/customers/import`, formData);
            showModal('Berhasil', 'Data pelanggan berhasil diimpor!');
            setSelectedFile(null); // Kosongkan file
             const fileInput = document.getElementById('import-csv');
             if (fileInput) fileInput.value = '';
            if (typeof fetchCustomers === 'function') fetchCustomers(1); // Kembali ke halaman 1
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error importing customers:', error);
                showModal('Gagal', 'Gagal mengimpor data pelanggan. Pastikan format file benar.');
            }
        }
    };

    // --- Fungsi Merge ---
    const handleMergeAll = async () => {
        showModal('Konfirmasi Gabung', 'Apakah Anda yakin ingin menggabungkan semua entri duplikat?', async () => {
            try {
                // 5. Gunakan 'axiosInstance.post'
                await axiosInstance.post(`/api/services/customers/merge-duplicates`, {});
                showModal('Berhasil', 'Data pelanggan berhasil digabungkan!');
                if (typeof fetchCustomers === 'function') fetchCustomers(1);
            } catch (error) {
                if (error.response?.status !== 401) {
                    console.error('Error merging duplicates:', error);
                    showModal('Gagal', 'Gagal menggabungkan data pelanggan.');
                }
            }
        });
    };
    
    const handleShowMergeModal = async (customer) => {
        if (customer.total_bookings > 1) {
            setCustomerToMerge(customer);
            if (typeof fetchDuplicateRecords === 'function') {
                await fetchDuplicateRecords(customer.nomor_whatsapp);
            }
            setShowMergeModal(true);
        } else {
            showModal('Info', 'Pelanggan ini tidak memiliki entri duplikat.');
        }
    };

    const handleCloseMergeModal = () => {
        setShowMergeModal(false);
        setCustomerToMerge(null);
    };

    // 6. ✅ PENJAGAAN UTAMA: Pastikan customersData.data adalah array
    // Beri nilai default array kosong jika 'customersData' atau 'customersData.data' undefined
    const customersToDisplay = useMemo(() => customersData?.data || [], [customersData]);

    // --- Render Pagination ---
    const renderPagination = () => {
        const pages = [];
        const safeTotalPages = totalPages || 1;
        const safeCurrentPage = currentPage || 1;
        
        const startPage = Math.max(1, safeCurrentPage - 1);
        const endPage = Math.min(safeTotalPages, safeCurrentPage + 1);

        if (startPage > 1) {
            pages.push( <button key={1} onClick={() => setPage(1)} className="px-3 py-1 rounded-lg mx-1 text-sm bg-gray-200 text-gray-700">1</button> );
            if (startPage > 2) {
                pages.push(<span key="ellipsis-start" className="mx-1">...</span>);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`px-3 py-1 rounded-lg mx-1 text-sm ${safeCurrentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    {i}
                </button>
            );
        }

        if (endPage < safeTotalPages) {
            if (endPage < safeTotalPages - 1) {
                pages.push(<span key="ellipsis-end" className="mx-1">...</span>);
            }
            pages.push( <button key={safeTotalPages} onClick={() => setPage(safeTotalPages)} className="px-3 py-1 rounded-lg mx-1 text-sm bg-gray-200 text-gray-700"> {safeTotalPages} </button> );
        }
        
        const startItem = (safeCurrentPage - 1) * 10 + 1;
        const endItem = Math.min(safeCurrentPage * 10, totalItems || 0);

        return (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
                <span className="text-sm text-gray-700">
                    Menampilkan <span className="font-semibold">{Math.min(startItem, totalItems || 0)} - {Math.min(endItem, totalItems || 0)}</span> dari <span className="font-semibold">{totalItems || 0}</span> pelanggan
                </span>
                <div className="flex items-center space-x-1">
                    <button onClick={() => setPage(safeCurrentPage - 1)} disabled={safeCurrentPage === 1} className="px-3 py-1 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 text-sm" >
                        Previous
                    </button>
                    {pages}
                    <button onClick={() => setPage(safeCurrentPage + 1)} disabled={safeCurrentPage === safeTotalPages} className="px-3 py-1 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 text-sm" >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={handleMergeAll} 
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 hover:bg-blue-700"
                        >
                            Gabungkan Semua Duplikat
                        </button>
                        
                        {/* Dropdown Export */}
                        <div className="relative">
                            <button
                                onClick={() => setIsExportDropdownOpen(prev => !prev)}
                                className="bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 text-sm flex items-center"
                            >
                                Export <FaChevronDown className="inline ml-1 text-xs" />
                            </button>
                            {isExportDropdownOpen && (
                                <div className="absolute z-10 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                                    <ul className="py-1 text-sm text-gray-700">
                                        <li onClick={handleExport}><span className="cursor-pointer flex items-center px-4 py-2 hover:bg-gray-100"><FaDownload className="mr-2" /> Export CSV</span></li>
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        {/* Tombol Import */}
                        <label htmlFor="import-csv" className="bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 text-sm flex items-center cursor-pointer">
                            <FaUpload className="mr-2" /> Import
                        </label>
                        <input id="import-csv" type="file" accept=".csv" onChange={handleImportFileChange} style={{ display: 'none' }} />
                        {selectedFile && <button onClick={handleImport} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">Proses Impor</button>}
                    </div>
                    
                    {/* Search Bar */}
                    <div className="flex space-x-2 items-center">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Cari nama atau no. WA"
                                value={searchQuery || ''}
                                onChange={handleSearch}
                                onKeyPress={(e) => e.key === 'Enter' && fetchCustomers(1, searchQuery)} // Trigger search on Enter
                                className="w-full sm:w-48 p-2 border rounded-lg pr-8 text-sm"
                            />
                            <FaSearch className="absolute right-2 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Edit */}
            {isEditingCustomer && (
                <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
                    <h4 className="text-lg font-bold mb-2">Edit Data Pelanggan</h4>
                    <form onSubmit={handleUpdateCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="nama" value={customerForm.nama} onChange={handleCustomerFormChange} className="p-2 border rounded" placeholder="Nama" />
                        <input type="email" name="email" value={customerForm.email} onChange={handleCustomerFormChange} className="p-2 border rounded" placeholder="Email" />
                        <input type="text" name="nomor_whatsapp" value={customerForm.nomor_whatsapp} onChange={handleCustomerFormChange} className="p-2 border rounded" placeholder="Nomor WhatsApp" disabled />
                        <div className="col-span-1 md:col-span-2 flex gap-2">
                            {/* 7. ✅ PERBAIKAN TYPO: Ganti '</g>' menjadi '</button>' */}
                            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Simpan</button>
                            <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500">Batal</button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Tabel Data */}
            <div className="flex-grow overflow-x-auto bg-white rounded-lg shadow-sm mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('nama')}>Nama {renderSortArrow('nama')}</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Telpon</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('last_visit_date')}>Kunjungan Terakhir {renderSortArrow('last_visit_date')}</th>
                            <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Booking</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            {/* Hapus kolom duplikat jika tidak perlu */}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* 8. ✅ PENJAGAAN (fallback jika masih loading/kosong) */}
                        {!customersData ? (
                            <tr><td colSpan="6" className="px-3 py-4 text-center text-gray-500">Memuat data pelanggan...</td></tr>
                        ) : customersToDisplay.length === 0 ? (
                            <tr><td colSpan="6" className="px-3 py-4 text-center text-gray-500">Tidak ada pelanggan ditemukan.</td></tr>
                        ) : (
                            // Gunakan customersToDisplay yang sudah aman (selalu array)
                            customersToDisplay.map((customer, index) => (
                                <tr key={customer.nomor_whatsapp || index}>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 flex items-center">
                                        <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0">
                                            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                        </span>
                                        <button onClick={() => onSelectCustomer(customer)} className="text-blue-600 hover:underline text-left">
                                            {customer.nama}
                                        </button>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{customer.nomor_whatsapp}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{customer.email || '-'}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{formatLastVisitDate(customer.last_visit_date)}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-center">{customer.total_bookings}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-left text-sm font-medium">
                                        <button onClick={() => handleEditCustomerClick(customer)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        {customer.total_bookings > 1 && (
                                            <button onClick={() => handleShowMergeModal(customer)} className="text-blue-600 hover:underline ml-2">
                                                Gabung
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Render pagination jika ada data */}
            {(totalItems || 0) > 0 && renderPagination()}

            {/* Merge Modal */}
            {showMergeModal && (
                <MergeModal
                    onClose={handleCloseMergeModal}
                    customerToMerge={customerToMerge}
                    duplicateRecords={duplicateRecords}
                    mergeCustomer={mergeCustomer}
                />
            )}
        </div>
    );
};

export default CustomersData;