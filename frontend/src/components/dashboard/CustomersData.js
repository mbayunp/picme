import React, { useState, useMemo, useRef } from 'react'; // Tambahkan useRef
import axiosInstance from '../../api/axiosInstance';
import moment from 'moment';
import 'moment/locale/id';
import { FaSearch, FaChevronDown, FaFilter, FaTimes } from 'react-icons/fa'; // Tambah icon Filter & Times
import { FaUpload, FaDownload } from 'react-icons/fa6';
import fileDownload from 'js-file-download';
import MergeModal from './MergeModal';

// Set lokal moment
moment.locale('id');

const CustomersData = ({
    customersData,
    sortKey, sortDirection, handleSort, renderSortArrow, showModal,
    fetchCustomers,
    onSelectCustomer,
    currentPage, totalPages, totalItems,
    setPage,
    searchQuery, setSearchQuery,
    selectedTag, setSelectedTag,
    fetchDuplicateRecords,
    duplicateRecords,
    mergeCustomer
}) => {
    // --- State ---
    const [isEditingCustomer, setIsEditingCustomer] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [customerForm, setCustomerForm] = useState({ nama: '', email: '', nomor_whatsapp: '' });

    const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showMergeModal, setShowMergeModal] = useState(false);
    const [customerToMerge, setCustomerToMerge] = useState(null);

    // Ref untuk input file (Pengganti document.getElementById)
    const fileInputRef = useRef(null);

    const availableTags = ['Tag Baru', 'Loyal', 'VIP', 'Reguler'];

    // --- Handler Edit Customer ---
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
                fetchCustomers(currentPage, searchQuery);
            }
        } catch (error) {
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

    // --- Handler Filter & Search ---
    const handleFilterByTag = (tag) => {
        if (typeof setSelectedTag === 'function') {
            setSelectedTag(tag);
            // Reset halaman ke 1 saat filter berubah agar hasil terlihat
            if (setPage) setPage(1);
        }
        setIsTagsDropdownOpen(false);
    };

    const clearTagFilter = () => {
        if (typeof setSelectedTag === 'function') setSelectedTag('');
        setIsTagsDropdownOpen(false);
    };

    const handleSearchChange = (e) => {
        if (typeof setSearchQuery === 'function') {
            setSearchQuery(e.target.value);
        }
    };

    const triggerSearch = () => {
        if (typeof fetchCustomers === 'function') {
            fetchCustomers(1, searchQuery); // Selalu kembali ke halaman 1 saat search
        }
    };

    // --- Helper Format ---
    const formatLastVisitDate = (dateString) => {
        if (!dateString) return '-';
        return moment(dateString).format('DD MMM YYYY, HH:mm');
    };

    // --- Handler Export & Import ---
    const handleExport = async () => {
        try {
            const response = await axiosInstance.get(`/api/services/customers/export`, {
                responseType: 'blob',
            });
            fileDownload(response.data, `customers_data_${moment().format('YYYY-MM-DD')}.csv`);
            showModal('Berhasil', 'Data pelanggan berhasil diekspor.');
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error exporting customers:', error);
                showModal('Gagal', 'Gagal mengekspor data pelanggan.');
            }
        }
        setIsExportDropdownOpen(false);
    };

    const handleImportFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleImport = async () => {
        if (!selectedFile) return;
        const formData = new FormData();
        formData.append('csvFile', selectedFile);

        try {
            await axiosInstance.post(`/api/services/customers/import`, formData);
            showModal('Berhasil', 'Data pelanggan berhasil diimpor!');
            setSelectedFile(null);
            
            // Reset input file menggunakan Ref (Best Practice React)
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            
            if (typeof fetchCustomers === 'function') fetchCustomers(1);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error importing customers:', error);
                showModal('Gagal', 'Gagal mengimpor data pelanggan. Pastikan format file CSV benar.');
            }
        }
    };

    // --- Handler Merge ---
    const handleMergeAll = async () => {
        showModal('Konfirmasi Gabung', 'Apakah Anda yakin ingin menggabungkan semua entri duplikat secara otomatis?', async () => {
            try {
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

    // --- Data Display ---
    const customersToDisplay = useMemo(() => customersData?.data || [], [customersData]);

    // --- Render Pagination ---
    const renderPagination = () => {
        const safeTotalPages = totalPages || 1;
        const safeCurrentPage = currentPage || 1;
        
        const pages = [];
        const startPage = Math.max(1, safeCurrentPage - 1);
        const endPage = Math.min(safeTotalPages, safeCurrentPage + 1);

        if (startPage > 1) {
            pages.push(<button key={1} onClick={() => setPage(1)} className="px-3 py-1 rounded-lg mx-1 text-sm bg-gray-200 text-gray-700">1</button>);
            if (startPage > 2) pages.push(<span key="ellipsis-start" className="mx-1">...</span>);
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
            if (endPage < safeTotalPages - 1) pages.push(<span key="ellipsis-end" className="mx-1">...</span>);
            pages.push(<button key={safeTotalPages} onClick={() => setPage(safeTotalPages)} className="px-3 py-1 rounded-lg mx-1 text-sm bg-gray-200 text-gray-700">{safeTotalPages}</button>);
        }

        const startItem = (safeCurrentPage - 1) * 10 + 1;
        const endItem = Math.min(safeCurrentPage * 10, totalItems || 0);

        return (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
                <span className="text-sm text-gray-700">
                    Menampilkan <span className="font-semibold">{Math.min(startItem, totalItems || 0)} - {Math.min(endItem, totalItems || 0)}</span> dari <span className="font-semibold">{totalItems || 0}</span> pelanggan
                </span>
                <div className="flex items-center space-x-1">
                    <button onClick={() => setPage(safeCurrentPage - 1)} disabled={safeCurrentPage === 1} className="px-3 py-1 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 text-sm">Previous</button>
                    {pages}
                    <button onClick={() => setPage(safeCurrentPage + 1)} disabled={safeCurrentPage === safeTotalPages} className="px-3 py-1 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 text-sm">Next</button>
                </div>
            </div>
        );
    };

    return (
        <div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                    
                    {/* KIRI: Tombol Aksi (Merge, Import, Export) */}
                    <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                        <button onClick={handleMergeAll} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                            Gabungkan Duplikat
                        </button>
                        
                        {/* Dropdown Export */}
                        <div className="relative">
                            <button onClick={() => setIsExportDropdownOpen(prev => !prev)} className="bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 text-sm flex items-center hover:bg-gray-50">
                                Export <FaChevronDown className="ml-2 text-xs" />
                            </button>
                            {isExportDropdownOpen && (
                                <div className="absolute z-20 mt-1 w-40 bg-white border rounded-lg shadow-lg">
                                    <ul className="py-1 text-sm text-gray-700">
                                        <li onClick={handleExport} className="cursor-pointer px-4 py-2 hover:bg-gray-100 flex items-center">
                                            <FaDownload className="mr-2" /> Export CSV
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Import */}
                        <label htmlFor="import-csv" className="bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 text-sm flex items-center cursor-pointer hover:bg-gray-50">
                            <FaUpload className="mr-2" /> Import
                        </label>
                        <input 
                            id="import-csv" 
                            type="file" 
                            accept=".csv" 
                            onChange={handleImportFileChange} 
                            style={{ display: 'none' }} 
                            ref={fileInputRef} // Gunakan Ref
                        />
                        {selectedFile && (
                            <button onClick={handleImport} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                                Proses: {selectedFile.name}
                            </button>
                        )}
                    </div>

                    {/* KANAN: Search & Filter */}
                    <div className="flex space-x-2 items-center w-full lg:w-auto justify-end">
                        
                        {/* Filter Dropdown (DITAMBAHKAN) */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsTagsDropdownOpen(prev => !prev)}
                                className={`px-3 py-2 rounded-lg border text-sm flex items-center ${selectedTag ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-600'}`}
                            >
                                <FaFilter className="mr-2" /> 
                                {selectedTag || 'Filter Tag'}
                                <FaChevronDown className="ml-2 text-xs" />
                            </button>
                            
                            {isTagsDropdownOpen && (
                                <div className="absolute right-0 z-20 mt-1 w-40 bg-white border rounded-lg shadow-lg">
                                    <ul className="py-1 text-sm text-gray-700">
                                        <li onClick={clearTagFilter} className="cursor-pointer px-4 py-2 hover:bg-gray-100 text-red-500 flex items-center">
                                            <FaTimes className="mr-2" /> Reset Filter
                                        </li>
                                        {availableTags.map(tag => (
                                            <li key={tag} onClick={() => handleFilterByTag(tag)} className="cursor-pointer px-4 py-2 hover:bg-gray-100">
                                                {tag}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Search Input */}
                        <div className="relative flex items-center w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Cari nama atau WA..."
                                value={searchQuery || ''}
                                onChange={handleSearchChange}
                                onKeyPress={(e) => e.key === 'Enter' && triggerSearch()}
                                className="w-full p-2 pl-3 pr-10 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button 
                                onClick={triggerSearch} 
                                className="absolute right-1 top-1 bottom-1 px-2 text-gray-400 hover:text-blue-600"
                                aria-label="Cari"
                            >
                                <FaSearch />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            {isEditingCustomer && (
                <div className="mt-2 bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500 mb-4">
                    <h4 className="text-lg font-bold mb-3">Edit Data Pelanggan</h4>
                    <form onSubmit={handleUpdateCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold text-gray-600 mb-1">Nama</label>
                            <input type="text" name="nama" value={customerForm.nama} onChange={handleCustomerFormChange} className="p-2 border rounded focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold text-gray-600 mb-1">Email</label>
                            <input type="email" name="email" value={customerForm.email} onChange={handleCustomerFormChange} className="p-2 border rounded focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div className="flex flex-col md:col-span-2">
                            <label className="text-xs font-semibold text-gray-600 mb-1">WhatsApp (ID - Tidak dapat diubah)</label>
                            <input type="text" name="nomor_whatsapp" value={customerForm.nomor_whatsapp} disabled className="p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed" />
                        </div>
                        <div className="col-span-1 md:col-span-2 flex gap-3 mt-2">
                            <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 shadow-sm">Simpan Perubahan</button>
                            <button type="button" onClick={handleCancelEdit} className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300 shadow-sm">Batal</button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Data Table */}
            <div className="flex-grow overflow-x-auto bg-white rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('nama')}>
                                Nama {renderSortArrow('nama')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Telepon</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('last_visit_date')}>
                                Kunjungan Terakhir {renderSortArrow('last_visit_date')}
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {!customersData ? (
                            <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Memuat data pelanggan...</td></tr>
                        ) : customersToDisplay.length === 0 ? (
                            <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Tidak ada pelanggan ditemukan.</td></tr>
                        ) : (
                            customersToDisplay.map((customer, index) => (
                                <tr key={customer.nomor_whatsapp || index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3 font-bold text-xs">
                                                {customer.nama ? customer.nama.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <button onClick={() => onSelectCustomer(customer)} className="text-blue-600 hover:underline text-left">
                                                {customer.nama || 'Tanpa Nama'}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{customer.nomor_whatsapp}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{customer.email || '-'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatLastVisitDate(customer.last_visit_date)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                                        <span className="px-2 py-1 rounded-full bg-gray-100 text-xs font-semibold">{customer.total_bookings}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium">
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => handleEditCustomerClick(customer)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                            {customer.total_bookings > 1 && (
                                                <button onClick={() => handleShowMergeModal(customer)} className="text-orange-600 hover:text-orange-900 flex items-center text-xs bg-orange-50 px-2 py-1 rounded border border-orange-200">
                                                    Gabung Duplikat
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Render pagination */}
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