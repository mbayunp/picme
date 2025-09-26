import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminData from '../hooks/useAdminData';
import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import PostsManager from '../components/dashboard/PostsManager';
import PackagesManager from '../components/dashboard/PackagesManager';
import BookingsCalendar from '../components/dashboard/BookingsCalendar';
import BookingsData from '../components/dashboard/BookingsData';
import CustomersData from '../components/dashboard/CustomersData';
import PortfolioManager from '../components/dashboard/PortfolioManager';
import CustomerDetail from '../components/dashboard/CustomerDetail'; // Komponen baru

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('bookings-data');
    const [selectedStudio, setSelectedStudio] = useState('1');
    const [selectedCustomer, setSelectedCustomer] = useState(null); // State baru untuk detail pelanggan

    const {
        posts,
        bookings,
        customers,
        packages,
        studios,
        modalInfo,
        sortKey,
        sortDirection,
        sortedBookings,
        sortedCustomers,
        handleDelete,
        showModal,
        closeModal,
        fetchPosts,
        fetchBookings,
        fetchAllBookings,
        fetchPackages,
        fetchCustomers,
        handleSort,
        renderSortArrow,
        formatShortDate,
        getPackageName,
        portfolioItems,
        fetchPortfolioItems
    } = useAdminData(activeTab, selectedStudio);

    const renderContent = () => {
        switch (activeTab) {
            case 'posts':
                return <PostsManager posts={posts} fetchPosts={fetchPosts} showModal={showModal} handleDelete={handleDelete} />;
            case 'packages':
                return <PackagesManager packages={packages} fetchPackages={fetchPackages} showModal={showModal} handleDelete={handleDelete} />;
            case 'bookings':
                return <BookingsCalendar bookings={bookings} studios={studios} selectedStudio={selectedStudio} setSelectedStudio={setSelectedStudio} handleDelete={handleDelete} />;
            case 'bookings-data':
                return (
                    <BookingsData
                        bookings={sortedBookings}
                        packages={packages}
                        studios={studios}
                        sortKey={sortKey}
                        sortDirection={sortDirection}
                        handleSort={handleSort}
                        renderSortArrow={renderSortArrow}
                        formatShortDate={formatShortDate}
                        getPackageName={getPackageName}
                        showModal={showModal}
                        fetchAllBookings={fetchAllBookings}
                        handleDelete={handleDelete}
                    />
                );
            case 'customers':
                // Tampilkan detail pelanggan jika ada yang dipilih
                if (selectedCustomer) {
                    return <CustomerDetail customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />;
                }
                // Tampilkan tabel pelanggan
                return (
                    <CustomersData
                        customers={sortedCustomers}
                        sortKey={sortKey}
                        sortDirection={sortDirection}
                        handleSort={handleSort}
                        renderSortArrow={renderSortArrow}
                        showModal={showModal}
                        fetchCustomers={fetchCustomers}
                        onSelectCustomer={setSelectedCustomer} // Teruskan fungsi ini ke CustomersData
                    />
                );
            case 'portfolio':
                return (
                    <PortfolioManager
                        portfolioItems={portfolioItems}
                        fetchPortfolioItems={fetchPortfolioItems}
                        showModal={showModal}
                        handleDelete={handleDelete}
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
                    title={modalInfo.title}
                    message={modalInfo.message}
                    onConfirm={() => {
                        if (modalInfo.action) {
                            modalInfo.action();
                        }
                        closeModal();
                    }}
                    onCancel={modalInfo.action ? closeModal : null}
                />
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;