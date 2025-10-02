import React, { useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FaSearch, FaChevronDown } from 'react-icons/fa';
import { FaUpload, FaDownload } from 'react-icons/fa6';
import fileDownload from 'js-file-download';
import MergeModal from './MergeModal';

const CustomersData = ({ 
    customersData,
    sortKey, sortDirection, handleSort, renderSortArrow, showModal, 
    fetchCustomers, onSelectCustomer, currentPage, totalPages, totalItems, 
    setPage,
    searchQuery, setSearchQuery, 
    selectedTag, setSelectedTag,
    fetchDuplicateRecords,
    duplicateRecords,
    mergeCustomer
}) => {
    const [isEditingCustomer, setIsEditingCustomer] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [customerForm, setCustomerForm] = useState({
        nama: '', email: '', nomor_whatsapp: '',
    });
    
    const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showMergeModal, setShowMergeModal] = useState(false); // ✅ Tambahan state untuk modal
    const [customerToMerge, setCustomerToMerge] = useState(null); // ✅ Tambahan state
    
    const availableTags = ['Tag Baru', 'Loyal', 'VIP', 'Reguler'];

    const handleEditCustomerClick = (customer) => {
        setCurrentCustomer(customer);
        setCustomerForm({
            nama: customer.nama,
            email: customer.email,
            nomor_whatsapp: customer.nomor_whatsapp,
        });
        setIsEditingCustomer(true);
    };

    const handleCustomerFormChange = (e) => {
        const { name, value } = e.target;
        setCustomerForm(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateCustomer = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin-token');
            const config = { headers: { 'x-access-token': token } };
            const payload = {
                nama: customerForm.nama,
                email: customerForm.email,
                nomor_whatsapp: customerForm.nomor_whatsapp,
            };
            await axios.put(`http://localhost:8080/api/services/customer/${currentCustomer.nomor_whatsapp}`, payload, config);
            showModal('Berhasil', 'Data pelanggan berhasil diperbarui!');
            setIsEditingCustomer(false);
            setCurrentCustomer(null);
            fetchCustomers();
        } catch (error) {
            console.error('Error updating customer:', error);
            showModal('Gagal', 'Gagal memperbarui data pelanggan.');
        }
    };

    const handleCancelEdit = () => {
        setIsEditingCustomer(false);
        setCurrentCustomer(null);
    };

    const handleFilterByTag = (tag) => {
        setSelectedTag(tag);
        setIsTagsDropdownOpen(false);
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const formatLastVisitDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return moment(date).format('YYYY-MM-DD HH:mm:ss');
    };
    
    const handleExport = async () => {
        try {
            const token = localStorage.getItem('admin-token');
            const config = { 
                headers: { 'x-access-token': token },
                responseType: 'blob',
            };
            const response = await axios.get('http://localhost:8080/api/services/customers/export', config);
            fileDownload(response.data, `customers_data_${moment().format('YYYY-MM-DD')}.csv`);
            showModal('Berhasil', 'Data pelanggan berhasil diekspor.');
        } catch (error) {
            console.error('Error exporting customers:', error);
            showModal('Gagal', 'Gagal mengekspor data pelanggan.');
        }
    };

    const handleImportFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleImport = async () => {
        if (!selectedFile) {
            showModal('Peringatan', 'Mohon pilih file CSV untuk diimpor.');
            return;
        }
        const formData = new FormData();
        formData.append('csvFile', selectedFile);

        try {
            const token = localStorage.getItem('admin-token');
            const config = { 
                headers: { 
                    'x-access-token': token,
                    'Content-Type': 'multipart/form-data',
                }
            };
            await axios.post('http://localhost:8080/api/services/customers/import', formData, config);
            showModal('Berhasil', 'Data pelanggan berhasil diimpor!');
            setSelectedFile(null);
            fetchCustomers();
        } catch (error) {
            console.error('Error importing customers:', error);
            showModal('Gagal', 'Gagal mengimpor data pelanggan. Pastikan format file benar.');
        }
    };

    const handleMergeAll = async () => {
        showModal('Konfirmasi Gabung', 'Apakah Anda yakin ingin menggabungkan semua entri duplikat?', async () => {
            try {
                const token = localStorage.getItem('admin-token');
                const config = { headers: { 'x-access-token': token } };
                await axios.post('http://localhost:8080/api/services/customers/merge-duplicates', {}, config);
                showModal('Berhasil', 'Data pelanggan berhasil digabungkan!');
                fetchCustomers();
            } catch (error) {
                console.error('Error merging duplicates:', error);
                showModal('Gagal', 'Gagal menggabungkan data pelanggan.');
            }
        });
    };
    
    // ✅ FUNGSI BARU: untuk menampilkan modal gabung
    const handleShowMergeModal = async (customer) => {
        if (customer.total_bookings > 1) {
            setCustomerToMerge(customer);
            await fetchDuplicateRecords(customer.nomor_whatsapp);
            setShowMergeModal(true);
        } else {
            showModal('Info', 'Pelanggan ini tidak memiliki entri duplikat.');
        }
    };

    const handleCloseMergeModal = () => {
        setShowMergeModal(false);
        setCustomerToMerge(null);
    };

    const customersToDisplay = customersData.data;

    const renderPagination = () => {
        const pages = [];
        const safeTotalPages = totalPages || 1;
        
        const startPage = Math.max(1, currentPage - 1);
        const endPage = Math.min(safeTotalPages, currentPage + 1);

        if (startPage > 1) {
            pages.push(
                <button key={1} onClick={() => setPage(1)} className="px-3 py-1 rounded-lg mx-1 text-sm bg-gray-200 text-gray-700">1</button>
            );
            if (startPage > 2) {
                pages.push(<span key="ellipsis-start" className="mx-1">...</span>);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`px-3 py-1 rounded-lg mx-1 text-sm ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    {i}
                </button>
            );
        }

        if (endPage < safeTotalPages) {
            if (endPage < safeTotalPages - 1) {
                pages.push(<span key="ellipsis-end" className="mx-1">...</span>);
            }
            pages.push(
                <button key={safeTotalPages} onClick={() => setPage(safeTotalPages)} className="px-3 py-1 rounded-lg mx-1 text-sm bg-gray-200 text-gray-700">
                    {safeTotalPages}
                </button>
            );
        }
        
        const startItem = (currentPage - 1) * 10 + 1;
        const endItem = Math.min(currentPage * 10, totalItems);

        return (
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-700">
                    Menampilkan <span className="font-semibold">{startItem}-{endItem}</span> dari <span className="font-semibold">{totalItems}</span> pelanggan
                </span>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {pages}
                    <button
                        onClick={() => setPage(currentPage + 1)}
                        disabled={currentPage === safeTotalPages}
                        className="px-3 py-1 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2">
                        <button 
                            onClick={handleMergeAll} 
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 hover:bg-blue-700"
                        >
                            Gabungkan Semua Duplikat
                        </button>
                        <button className="bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 text-sm">Tanggal Lahir</button>
                        
                        <div className="relative">
                            <button
                                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                                className="bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 text-sm flex items-center"
                            >
                                Export <FaChevronDown className="inline ml-1" />
                            </button>
                            {isExportDropdownOpen && (
                                <div className="absolute z-10 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                                    <ul className="py-1 text-sm text-gray-700">
                                        <li onClick={handleExport}><a href="#" className="flex items-center px-4 py-2 hover:bg-gray-100"><FaDownload className="mr-2" /> Export CSV</a></li>
                                    </ul>
                                </div>
                            )}
                        </div>
                        <label htmlFor="import-csv" className="bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 text-sm flex items-center cursor-pointer">
                            <FaUpload className="mr-2" /> Import
                        </label>
                        <input id="import-csv" type="file" accept=".csv" onChange={handleImportFileChange} style={{ display: 'none' }} />
                        {selectedFile && <button onClick={handleImport} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">Proses Impor</button>}
                    </div>
                    <div className="flex space-x-2 items-center">
                        <div className="relative">
                            <button
                                onClick={() => setIsTagsDropdownOpen(!isTagsDropdownOpen)}
                                className="bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 text-sm flex items-center"
                            >
                                {selectedTag || 'All Tags'} <FaChevronDown className={`ml-2 transform transition-transform duration-200 ${isTagsDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isTagsDropdownOpen && (
                                <div className="absolute z-10 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                                    <ul className="py-1 text-sm text-gray-700">
                                        <li onClick={() => handleFilterByTag(null)}><a href="#" className="block px-4 py-2 hover:bg-gray-100">All Tags</a></li>
                                        {availableTags.map(tag => (
                                            <li key={tag} onClick={() => handleFilterByTag(tag)}><a href="#" className="block px-4 py-2 hover:bg-gray-100">{tag}</a></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => handleSort('nama')}
                                className="bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 text-sm flex items-center"
                            >
                                Nama {renderSortArrow('nama')}
                            </button>
                        </div>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Ketik kata kunci"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-48 p-2 border rounded-lg pr-8 text-sm"
                            />
                            <FaSearch className="absolute right-2 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {isEditingCustomer && (
                <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
                    <h4 className="text-lg font-bold mb-2">Edit Data Pelanggan</h4>
                    <form onSubmit={handleUpdateCustomer} className="grid grid-cols-2 gap-4">
                        <input type="text" name="nama" value={customerForm.nama} onChange={handleCustomerFormChange} className="p-2 border rounded" placeholder="Nama" />
                        <input type="email" name="email" value={customerForm.email} onChange={handleCustomerFormChange} className="p-2 border rounded" placeholder="Email" />
                        <input type="text" name="nomor_whatsapp" value={customerForm.nomor_whatsapp} onChange={handleCustomerFormChange} className="p-2 border rounded" placeholder="Nomor WhatsApp" disabled />
                        <div className="col-span-2 flex gap-2">
                            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Simpan</button>
                            <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500">Batal</button>
                        </div>
                    </form>
                </div>
            )}
            <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('nama')}>Nama {renderSortArrow('nama')}</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Telpon</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member ID</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loyalty Point</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('last_visit_date')}>Kunjungan Terakhir {renderSortArrow('last_visit_date')}</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('tanggal_lahir')}>Tanggal Lahir {renderSortArrow('tanggal_lahir')}</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pemesanan</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {customersToDisplay.map((customer, index) => (
                            <tr key={customer.nomor_whatsapp || index}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 flex items-center">
                                    <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                    </span>
                                    <button onClick={() => onSelectCustomer(customer)} className="text-blue-600 hover:underline">
                                        {customer.nama}
                                    </button>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{customer.nomor_whatsapp}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{customer.member_id || '-'}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{customer.loyalty_point || '-'}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{formatLastVisitDate(customer.last_visit_date)}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{customer.tanggal_lahir || '-'}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{customer.tags || '-'}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{customer.status || '-'}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-left text-sm font-medium">
                                    <button onClick={() => handleEditCustomerClick(customer)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    {/* ✅ TAMBAHAN: Tombol Gabung di setiap baris */}
                                    {customer.total_bookings > 1 && (
                                      <button 
                                          onClick={() => handleShowMergeModal(customer)} 
                                          className="text-blue-600 hover:underline ml-2"
                                      >
                                          Gabung
                                      </button>
                                    )}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{customer.total_bookings}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {renderPagination()}
            {/* ✅ TAMBAHAN: Modal untuk menggabungkan duplikat */}
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