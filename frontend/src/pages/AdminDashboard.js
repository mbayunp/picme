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

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('bookings-data');
    const [selectedStudio, setSelectedStudio] = useState('1');

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
        getPackageName
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
                return (
                    <CustomersData
                        customers={sortedCustomers}
                        sortKey={sortKey}
                        sortDirection={sortDirection}
                        handleSort={handleSort}
                        renderSortArrow={renderSortArrow}
                        showModal={showModal}
                        fetchCustomers={fetchCustomers}
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