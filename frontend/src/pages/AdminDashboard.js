import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminData from '../hooks/useAdminData';
import AdminLayout from '../components/AdminLayout';
// import Modal from '../components/Modal'; // ✅ HAPUS IMPORT YANG HILANG
import PostsManager from '../components/dashboard/PostsManager';
import PackagesManager from '../components/dashboard/PackagesManager';
import BookingsCalendar from '../components/dashboard/BookingsCalendar';
import BookingsData from '../components/dashboard/BookingsData';
import CustomersData from '../components/dashboard/CustomersData';
import PortfolioManager from '../components/dashboard/PortfolioManager';
import CustomerDetail from '../components/dashboard/CustomerDetail';

// ✅ DEFINISI KOMPONEN MODAL YANG BERFUNGSI (DIPINDAHKAN KE SINI)
const Modal = ({ title, message, onConfirm, onCancel }) => (
    // Z-INDEX TERTINGGI (z-50) untuk memastikan modal ini di atas semua yang lain
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h4 className="text-xl font-bold mb-4">{title}</h4>
            <p className="text-gray-700 mb-6">{message}</p>
            <div className="flex justify-end space-x-4">
                {onCancel && (
                    <button onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                        Batal
                    </button>
                )}
                <button onClick={onConfirm} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    OK
                </button>
            </div>
        </div>
    </div>
);


const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('bookings');
    const [selectedStudio, setSelectedStudio] = useState('1'); 
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const {
        posts, bookings, customers, packages, studios, modalInfo, sortKey, sortDirection, sortedBookings, sortedCustomers,
        handleDelete, showModal, closeModal, fetchPosts, fetchBookings, fetchAllBookings, fetchPackages, fetchCustomers,
        handleSort, renderSortArrow, formatShortDate, getPackageName, portfolioItems, fetchPortfolioItems,
        customerDetail, fetchCustomerDetail,
        handleConfirmBooking 
    } = useAdminData(activeTab, selectedStudio, selectedCustomer);

    const renderContent = () => {
        switch (activeTab) {
            case 'posts':
                return <PostsManager posts={posts} fetchPosts={fetchPosts} showModal={showModal} handleDelete={handleDelete} />;
            case 'packages':
                return <PackagesManager packages={packages} fetchPackages={fetchPackages} showModal={showModal} handleDelete={handleDelete} />;
            case 'bookings':
                return (
                    <BookingsCalendar
                        bookings={bookings}
                        studios={studios}
                        selectedStudio={selectedStudio}
                        setSelectedStudio={setSelectedStudio}
                        packages={packages}
                        showModal={showModal}
                        handleDelete={handleDelete}
                        handleConfirmBooking={handleConfirmBooking}
                    />
                );
            case "bookings-data":
                return (
                    <BookingsData
                        bookings={sortedBookings} packages={packages} studios={studios} sortKey={sortKey} sortDirection={sortDirection}
                        handleSort={handleSort} renderSortArrow={renderSortArrow} formatShortDate={formatShortDate} getPackageName={getPackageName}
                        showModal={showModal} fetchAllBookings={fetchAllBookings} handleDelete={handleDelete}
                        handleConfirmBooking={handleConfirmBooking}
                    />
                );
            case 'customers':
                if (selectedCustomer) {
                    return <CustomerDetail
                                customer={selectedCustomer}
                                onBack={() => setSelectedCustomer(null)}
                                customerDetailData={customerDetail}
                                fetchCustomerDetail={fetchCustomerDetail}
                            />;
                }
                return (
                    <CustomersData
                        customers={sortedCustomers} sortKey={sortKey} sortDirection={sortDirection}
                        handleSort={handleSort} renderSortArrow={renderSortArrow} showModal={showModal}
                        fetchCustomers={fetchCustomers} onSelectCustomer={setSelectedCustomer}
                    />
                );
            case 'portfolio':
                return (
                    <PortfolioManager
                        portfolioItems={portfolioItems} fetchPortfolioItems={fetchPortfolioItems}
                        showModal={showModal} handleDelete={handleDelete}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
            {modalInfo.show && (
                <Modal
                    title={modalInfo.title} message={modalInfo.message}
                    onConfirm={() => { if (modalInfo.action) { modalInfo.action(); } closeModal(); }}
                    onCancel={modalInfo.action ? closeModal : null}
                />
            )}
        </AdminLayout>
    );
};
export default AdminDashboard;
