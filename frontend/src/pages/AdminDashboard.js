// src/pages/AdminDashboard.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminData from '../hooks/useAdminData';
import AdminLayout from '../components/AdminLayout';
import PostsManager from '../components/dashboard/PostsManager';
import PackagesManager from '../components/dashboard/PackagesManager';
import BookingsCalendar from '../components/dashboard/BookingsCalendar';
import BookingsData from '../components/dashboard/BookingsData';
import CustomersData from '../components/dashboard/CustomersData';
import PortfolioManager from '../components/dashboard/PortfolioManager';
import CustomerDetail from '../components/dashboard/CustomerDetail';
import FinancialReport from '../components/dashboard/FinancialReport';
import ContactMessages from '../components/dashboard/ContactMessages';
import AnnouncementManager from '../components/dashboard/AnnouncementManager';
import Beranda from '../components/dashboard/Beranda';
import BookingDetailModal from '../components/dashboard/BookingDetailModal'; // Impor komponen modal


const Modal = ({ title, message, onConfirm, onCancel }) => (
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
    const [activeTab, setActiveTab] = useState('beranda');
    const [selectedStudio, setSelectedStudio] = useState('1');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const {
        posts, bookings, packages, studios, modalInfo, sortKey, sortDirection, sortedBookings, sortedCustomers,
        handleDelete, showModal, closeModal, fetchPosts, fetchBookings, fetchAllBookings, fetchPackages, fetchCustomers,
        handleSort, renderSortArrow, formatShortDate, getPackageName, portfolioItems, fetchPortfolioItems,
        customerDetail, fetchCustomerDetail,
        handleConfirmBooking, handleCancelBooking, contactMessages, fetchContactMessages,
        customersData, currentPage, totalPages, totalItems, setPage,
        bookingData, bookingCurrentPage, bookingTotalPages, setBookingPage,
        duplicateRecords, fetchDuplicateRecords, mergeCustomer,
    } = useAdminData(activeTab, selectedStudio, selectedCustomer);
    
    // State untuk mengelola modal detail pemesanan
    const [isBookingDetailModalOpen, setIsBookingDetailModalOpen] = useState(false);
    const [selectedBookingEvent, setSelectedBookingEvent] = useState(null);

    // Fungsi untuk membuka modal detail pemesanan
    const handleOpenBookingDetailModal = (event) => {
        setSelectedBookingEvent(event);
        setIsBookingDetailModalOpen(true);
    };

    // Fungsi untuk menutup modal detail pemesanan
    const handleCloseBookingDetailModal = () => {
        setIsBookingDetailModalOpen(false);
        setSelectedBookingEvent(null);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'posts':
                return <PostsManager posts={posts} fetchPosts={fetchPosts} showModal={showModal} handleDelete={handleDelete} />;
            case 'beranda':
                return <Beranda bookings={sortedBookings} studios={studios} />;
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
                        handleDelete={handleDelete} // Pastikan prop ini ada
                        handleConfirmBooking={handleConfirmBooking}
                        handleCancelBooking={handleCancelBooking}
                    />
                );
            case "bookings-data":
                return (
                    <BookingsData
                        sortedBookings={sortedBookings}
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
                        handleDelete={handleDelete} // Pastikan prop ini ada
                        handleConfirmBooking={handleConfirmBooking}
                        handleCancelBooking={handleCancelBooking}
                        bookingData={bookingData}
                        currentPage={bookingCurrentPage}
                        totalPages={bookingTotalPages}
                        setPage={setBookingPage}
                    />
                );
            case 'customers':
                return (
                    <CustomersData
                        customersData={customersData} sortKey={sortKey} sortDirection={sortDirection}
                        handleSort={handleSort} renderSortArrow={renderSortArrow} showModal={showModal}
                        fetchCustomers={fetchCustomers} onSelectCustomer={setSelectedCustomer}
                        currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} setPage={setPage}
                        duplicateRecords={duplicateRecords}
                        fetchDuplicateRecords={fetchDuplicateRecords}
                        mergeCustomer={mergeCustomer}
                    />
                );
            case 'announcements':
                return <AnnouncementManager showModal={showModal} />;
            case 'portfolio':
                return (
                    <PortfolioManager
                        portfolioItems={portfolioItems} fetchPortfolioItems={fetchPortfolioItems}
                        showModal={showModal} handleDelete={handleDelete}
                    />
                );
            case 'financial-report':
                return <FinancialReport packages={packages} studios={studios} />;
            case 'contact-messages':
                return <ContactMessages messages={contactMessages} fetchMessages={fetchContactMessages} showModal={showModal} />;
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
            
            {/* Modal Detail Pemesanan */}
            {isBookingDetailModalOpen && selectedBookingEvent && (
                <BookingDetailModal
                    selectedEvent={selectedBookingEvent}
                    onClose={handleCloseBookingDetailModal}
                    handleConfirmBooking={handleConfirmBooking}
                    handleCancelBooking={handleCancelBooking}
                    handleDelete={handleDelete} // Prop yang dibutuhkan untuk menghapus
                    showModal={showModal}
                />
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;