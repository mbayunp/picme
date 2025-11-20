import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useCustomers } from './useCustomers';
import { useBookings } from './useBookings';
import { useGeneralData } from './useGeneralData';
import moment from 'moment';

const useAdminData = (activeTab, selectedStudio, initialCustomer) => {
    // 1. Auth & Modal (Core)
    const { isAuthenticated, modalInfo, showModal, closeModal } = useAuth();

    // 2. State Lokal (Cross-cutting)
    const [selectedCustomer, setSelectedCustomer] = useState(initialCustomer || null);

    // 3. Sub-Hooks
    const general = useGeneralData(isAuthenticated, showModal);
    const customers = useCustomers(isAuthenticated, showModal, activeTab);
    const bookings = useBookings(isAuthenticated, showModal, activeTab, selectedStudio);

    // 4. Helper: Format Data & Package Name (Utility)
    const formatShortDate = (dateString) => {
        if (!dateString) return '-';
        return moment(dateString).format('DD/MM/YYYY');
    };
    
    const getPackageName = (packageId) => {
        const pkg = general.packages.find(p => String(p.id) === String(packageId));
        return pkg ? pkg.nama_paket : 'Tanpa Paket';
    };

    const renderSortArrow = (currentKey, targetKey, direction) => {
         if (currentKey === targetKey) return direction === 'asc' ? ' ▲' : ' ▼';
         return ' ↕';
    };

    // 5. Efek Samping (Orchestrator) - Mengatur kapan fetch data terjadi
    //    Ini menggantikan useEffect raksasa di kode lama Anda
    
    // Fetch Dashboard Data (Beranda)
    useEffect(() => {
        if (activeTab === 'beranda' && isAuthenticated) {
            general.fetchDashboardData(selectedStudio);
        }
    }, [activeTab, selectedStudio, isAuthenticated]);

    // Fetch Data per Tab
    useEffect(() => {
        if (!isAuthenticated) return;
        const load = async () => {
            switch (activeTab) {
                case 'posts': await general.fetchPosts(); break;
                case 'packages': await general.fetchPackages(); break;
                case 'portfolio': await general.fetchPortfolioItems(); break;
                case 'contact-messages': await general.fetchContactMessages(); break;
                case 'bookings': 
                     if(selectedStudio) await bookings.fetchBookings(selectedStudio);
                     break;
                case 'bookings-data': 
                     await bookings.fetchAllBookings(bookings.bookingCurrentPage); 
                     break;
                case 'customers':
                     // Jika ada customer terpilih, fetch detailnya
                     if (selectedCustomer?.nomor_whatsapp) {
                         await customers.fetchCustomerDetail(selectedCustomer.nomor_whatsapp);
                     } else {
                         // Jika tidak, fetch list (pagination)
                         await customers.fetchCustomers(customers.currentPage, customers.searchQuery);
                         // Reset detail agar bersih
                         // setCustomerDetail(null); // Opsional, sudah dihandle hook customers
                     }
                     break;
                default: break;
            }
        };
        load();
    }, [activeTab, selectedStudio, isAuthenticated, selectedCustomer]);

    // Return Gabungan
    return {
        // Auth & UI
        isAuthenticated, modalInfo, showModal, closeModal,
        
        // State UI Lokal
        selectedCustomer, setSelectedCustomer,

        // Utilities
        formatShortDate, getPackageName, 
        renderSortArrow: (key) => renderSortArrow(
            // Logika deteksi sort key mana yang aktif (customer atau booking)
            activeTab === 'customers' ? customers.sortKey : bookings.bookingSortKey, 
            key, 
            activeTab === 'customers' ? customers.sortDirection : bookings.bookingSortDirection
        ),
        handleSort: activeTab === 'customers' ? customers.handleSort : bookings.handleBookingSort,

        // General Data
        ...general,

        // Customers Data
        ...customers,
        
        // Bookings Data
        ...bookings,
    };
};

export default useAdminData;