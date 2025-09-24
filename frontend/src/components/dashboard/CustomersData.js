import React, { useState } from 'react';
import axios from 'axios';
import moment from 'moment';

const CustomersData = ({ customers, sortKey, sortDirection, handleSort, renderSortArrow, showModal, fetchCustomers }) => {
    const [isEditingCustomer, setIsEditingCustomer] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [customerForm, setCustomerForm] = useState({
        nama: '', email: '', nomor_whatsapp: '',
    });

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

    const formatLastVisitDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const sortedCustomers = [...customers].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        if (aValue === bValue) return 0;

        let comparison = 0;
        if (sortKey === 'last_visit_date') {
            comparison = moment(aValue).diff(moment(bValue));
        } else {
            if (aValue > bValue) comparison = 1;
            if (aValue < bValue) comparison = -1;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    return (
        <div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col">
            <h3 className="text-xl font-bold mb-4">Data Pelanggan</h3>
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
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('total_bookings')}>Total Pemesanan {renderSortArrow('total_bookings')}</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('last_visit_date')}>Kunjungan Terakhir {renderSortArrow('last_visit_date')}</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedCustomers.map((customer, index) => (
                            <tr key={index}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{customer.nama}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{customer.nomor_whatsapp}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{customer.total_bookings}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{formatLastVisitDate(customer.last_visit_date)}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEditCustomerClick(customer)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomersData;