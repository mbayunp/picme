// src/pages/AdminDashboard.js

import React, { useState, useEffect } from 'react';
import useAdminData from '../hooks/useAdminData';
import AdminLayout from '../components/AdminLayout';

// --- Komponen Dashboard ---
import PostsManager from '../components/dashboard/PostsManager';
import PackagesManager from '../components/dashboard/PackagesManager';
import CustomersData from '../components/dashboard/CustomersData';
import CustomerDetail from '../components/dashboard/CustomerDetail';
import PortfolioManager from '../components/dashboard/PortfolioManager';
import FinancialReport from '../components/dashboard/FinancialReport';
import ContactMessages from '../components/dashboard/ContactMessages';
import AnnouncementManager from '../components/dashboard/AnnouncementManager';
import Beranda from '../components/dashboard/Beranda';
import BookingDetailModal from '../components/dashboard/BookingDetailModal';

// ✅ IMPORT BARU: Pengelola Booking (Gabungan Kalender & Data)
import BookingsManager from '../components/dashboard/BookingsManager'; 

// --- Komponen Modal Konfirmasi Sederhana ---
const Modal = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
      <h4 className="text-xl font-bold mb-4">{title}</h4>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Batal
          </button>
        )}
        <button
          onClick={onConfirm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          OK
        </button>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('beranda');
  const [selectedStudio, setSelectedStudio] = useState('1');
  const {
    posts, bookings, packages, studios, modalInfo, sortKey, sortDirection,
    sortedBookings, handleDelete, showModal, closeModal,
    fetchPosts, fetchAllBookings, fetchPackages, fetchCustomers,
    handleSort, renderSortArrow, formatShortDate, getPackageName, portfolioItems,
    fetchPortfolioItems, handleConfirmBooking,
    handleCancelBooking, contactMessages, fetchContactMessages, customersData,
    currentPage, totalPages, totalItems, setPage, bookingData, bookingCurrentPage,
    bookingTotalPages, setBookingPage, duplicateRecords, fetchDuplicateRecords,
    mergeCustomer,
    dashboardData,
    fetchDashboardData,
    selectedCustomer, 
    setSelectedCustomer, 
    fetchCustomerDetail
  } = useAdminData(activeTab, selectedStudio, null);

  // ✅ PENTING: Memastikan packages  di awal agar gambar di modal selalu muncul
  useEffect(() => {
    if (fetchPackages) {
      fetchPackages();
    }
  }, [fetchPackages]);

  // State untuk modal detail booking (jika dipanggil dari Beranda/Dashboard global)
  const [isBookingDetailModalOpen, setIsBookingDetailModalOpen] = useState(false);
  const [selectedBookingEvent, setSelectedBookingEvent] = useState(null);

  const handleOpenBookingDetailModal = (event) => {
    setSelectedBookingEvent(event);
    setIsBookingDetailModalOpen(true);
  };

  const handleCloseBookingDetailModal = () => {
    setIsBookingDetailModalOpen(false);
    setSelectedBookingEvent(null);
  };

  // Fungsi render konten utama berdasarkan tab yang aktif
  const renderContent = () => {
    switch (activeTab) {
      case 'beranda':
        return (
          <Beranda
            bookings={dashboardData?.recentActivities || []}
            studios={studios}
            onStudioChange={fetchDashboardData}
            dashboardData={dashboardData}
          />
        );

      // ✅ BAGIAN 1: Menggunakan BookingsManager (Gabungan)
      case 'bookings':
        return (
          <BookingsManager
            // Props untuk Kalender
            bookings={bookings}
            studios={studios}
            selectedStudio={selectedStudio}
            setSelectedStudio={setSelectedStudio}
            
            // Props untuk Data Tabel
            sortedBookings={sortedBookings}
            sortKey={sortKey}
            sortDirection={sortDirection}
            handleSort={handleSort}
            renderSortArrow={renderSortArrow}
            formatShortDate={formatShortDate}
            getPackageName={getPackageName}
            fetchAllBookings={fetchAllBookings}
            bookingData={bookingData}
            currentPage={bookingCurrentPage}
            totalPages={bookingTotalPages}
            setPage={setBookingPage}

            // Props Umum (Shared)
            packages={packages} // Penting untuk gambar paket
            showModal={showModal}
            handleDelete={handleDelete}
            handleConfirmBooking={handleConfirmBooking}
            handleCancelBooking={handleCancelBooking}
          />
        );
      
      // Case 'bookings-data' DIHAPUS karena sudah digabung ke 'bookings'

      case 'packages':
        return (
          <PackagesManager
            packages={packages}
            fetchPackages={fetchPackages}
            showModal={showModal}
            handleDelete={handleDelete}
          />
        );

      case 'posts':
        return (
          <PostsManager
            posts={posts}
            fetchPosts={fetchPosts}
            showModal={showModal}
            handleDelete={handleDelete}
          />
        );

      // ✅ BAGIAN 2: Logika Detail Pelanggan
      case 'customers':
        // Jika ada customer yang dipilih, tampilkan detailnya
        if (selectedCustomer) {
            return (
                <CustomerDetail 
                    customer={selectedCustomer}
                    onBack={() => setSelectedCustomer(null)}
                    fetchCustomerDetail={fetchCustomerDetail}
                    onOpenBookingDetail={handleOpenBookingDetailModal}
                />
            );
        }
        // Jika tidak, tampilkan tabel daftar pelanggan
        return (
          <CustomersData
            customersData={customersData}
            sortKey={sortKey}
            sortDirection={sortDirection}
            handleSort={handleSort}
            renderSortArrow={renderSortArrow}
            showModal={showModal}
            fetchCustomers={fetchCustomers}
            onSelectCustomer={setSelectedCustomer} // ✅ Fungsi ini akan men-trigger perpindahan ke Detail
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            setPage={setPage}
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
            portfolioItems={portfolioItems}
            fetchPortfolioItems={fetchPortfolioItems}
            showModal={showModal}
            handleDelete={handleDelete}
          />
        );

      case 'financial-report':
        return <FinancialReport packages={packages} studios={studios} />;

      case 'contact-messages':
        return (
          <ContactMessages
            messages={contactMessages}
            fetchMessages={fetchContactMessages}
            showModal={showModal}
          />
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}

      {/* Modal Konfirmasi Global */}
      {modalInfo.show && (
        <Modal
          title={modalInfo.title}
          message={modalInfo.message}
          onConfirm={() => {
            if (modalInfo.action) modalInfo.action();
            closeModal();
          }}
          onCancel={modalInfo.action ? closeModal : null}
        />
      )}

      {/* Modal Detail Booking (Global/Beranda) */}
      {isBookingDetailModalOpen && selectedBookingEvent && (
        <BookingDetailModal
          selectedEvent={selectedBookingEvent}
          onClose={handleCloseBookingDetailModal}
          handleConfirmBooking={handleConfirmBooking}
          handleCancelBooking={handleCancelBooking}
          handleDelete={handleDelete}
          showModal={showModal}
          packages={packages} // Pastikan packages diteruskan ke sini juga
        />
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;