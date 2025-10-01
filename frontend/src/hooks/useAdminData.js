// src/hooks/useAdminData.js

import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import moment from 'moment';

const API_URL = "http://localhost:8080/api";

const useAdminData = (activeTab, selectedStudio, selectedCustomer) => {
    const [posts, setPosts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [studios, setStudios] = useState([
        { id: '1', name: 'Picme Photo Studio 1' },
        { id: '2', name: 'Picme Photo Studio 2' },
        { id: '3', name: 'Picme Photo Studio 3' },
        { id: '4', name: 'Picme Photo Studio 4' },
    ]);
    const [contactMessages, setContactMessages] = useState([]);
    const [customerDetail, setCustomerDetail] = useState(null);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', action: null });
    const [sortKey, setSortKey] = useState('tanggal');
    const [sortDirection, setSortDirection] = useState('desc');
    const [customerPagination, setCustomerPagination] = useState({
        data: [],
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
    });
    const [bookingPagination, setBookingPagination] = useState({
        data: [],
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);

    const config = useMemo(() => {
        const token = localStorage.getItem('admin-token');
        return {
            headers: { 'x-access-token': token }
        };
    }, []);

    const showModal = useCallback((title, message, action = null) => {
        setModalInfo({ show: true, title, message, action });
    }, []);

    const closeModal = useCallback(() => {
        setModalInfo({ show: false, title: '', message: '', action: null });
    }, []);

    const fetchPosts = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/posts`, config);
            setPosts(res.data);
        } catch (error) {
            console.error("Error fetching posts:", error);
            showModal('Error', 'Gagal memuat data postingan.');
        }
    }, [showModal, config]);

    const fetchPackages = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/packages`, config);
            setPackages(res.data);
        } catch (error) {
            console.error("Error fetching packages:", error);
            showModal('Error', 'Gagal memuat data paket.');
        }
    }, [showModal, config]);

    const fetchBookings = useCallback(async (studioId) => {
        try {
            const studioName = studios.find(s => s.id === studioId)?.name;
            if (!studioName) {
                setBookings([]);
                return;
            }
            const res = await axios.get(`${API_URL}/services?studio_name=${encodeURIComponent(studioName)}`, config);
            // ✅ PERBAIKAN: Memastikan bookings selalu array
            setBookings(res.data.data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            if (error.response && error.response.status === 401) {
                showModal('Unauthorized', 'Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.');
            }
        }
    }, [studios, showModal, config]);

    const fetchAllBookings = useCallback(async (page = 1) => {
        if (activeTab !== 'bookings-data') return;
        try {
            const res = await axios.get(`${API_URL}/services?page=${page}&limit=10`, config);
            setBookingPagination(res.data);
            console.log("Booking data with pagination:", res.data);
        } catch (error) {
            console.error('Error fetching all bookings:', error);
            showModal('Gagal', 'Gagal memuat data detail pemesanan.');
        }
    }, [activeTab, showModal, config]);

    const fetchCustomers = useCallback(async (page = 1) => {
        if (activeTab !== 'customers') return;
        try {
            const res = await axios.get(`${API_URL}/services/customers?page=${page}&limit=10`, config);
            setCustomerPagination(res.data);
            console.log("Customer data with pagination:", res.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            showModal('Gagal', 'Gagal memuat data pelanggan.');
        }
    }, [activeTab, showModal, config]);

    const fetchPortfolioItems = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/portfolio`, config);
            setPortfolioItems(res.data);
        } catch (error) {
            console.error('Error fetching portfolio items:', error);
            showModal('Gagal', 'Gagal memuat data portfolio.');
        }
    }, [showModal, config]);

    const fetchCustomerDetail = useCallback(async (nomor_whatsapp) => {
        try {
            const res = await axios.get(`${API_URL}/services/customer/${nomor_whatsapp}`, config);
            setCustomerDetail(res.data);
            console.log("Customer Detail fetched:", res.data);
        } catch (error) {
            console.error('Error fetching customer detail:', error);
            setCustomerDetail(null);
        }
    }, [config]);

    const fetchContactMessages = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/contact`, config);
            setContactMessages(res.data);
        } catch (error) {
            console.error('Error fetching contact messages:', error);
            showModal('Gagal', 'Gagal memuat pesan kontak.');
        }
    }, [showModal, config]);

    const handleConfirmBooking = useCallback(async (id, onClose) => {
        showModal('Konfirmasi Checkout', 'Apakah Anda yakin ingin mengkonfirmasi dan melakukan checkout pemesanan ini?', async () => {
            try {
                await axios.put(`${API_URL}/services/${id}/confirm`, {}, config); 
                showModal('Berhasil', 'Pemesanan berhasil dikonfirmasi dan checkout!');
                if (onClose) onClose();
                fetchAllBookings();
            } catch (error) {
                console.error('Error confirming booking:', error);
                let errorMessage = 'Gagal mengkonfirmasi pemesanan.';
                if (error.response && error.response.status === 401) {
                    errorMessage = 'Otentikasi gagal. Sesi Anda habis.';
                } else if (error.response && error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
                showModal('Gagal', errorMessage);
            }
        });
    }, [showModal, fetchAllBookings, config]);

    const handleDelete = useCallback(async (endpoint, id, successMessage, failureMessage, refetchFunction) => {
        showModal('Konfirmasi', `Apakah Anda yakin ingin menghapus data ini?`, async () => {
            try {
                await axios.delete(`${API_URL}/${endpoint}/${id}`, config);
                showModal('Berhasil', successMessage);
                refetchFunction();
            } catch (error) {
                console.error('Error deleting:', error);
                showModal('Gagal', failureMessage);
            }
        });
    }, [showModal, config]);
    
    const handleCancelBooking = useCallback(async (id) => {
        try {
            await axios.put(`${API_URL}/services/${id}/cancel`, {}, config);
            showModal('Berhasil', 'Pemesanan berhasil dibatalkan!');
            if (activeTab === 'bookings') {
                fetchBookings(selectedStudio);
            } else if (activeTab === 'bookings-data') {
                fetchAllBookings();
            }
        } catch (error) {
            console.error('Error canceling booking:', error);
            showModal('Gagal', 'Gagal membatalkan pemesanan.');
        }
    }, [config, showModal, activeTab, fetchAllBookings, fetchBookings, selectedStudio]);
    
    const handleSort = useCallback((key) => {
        if (sortKey === key) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    }, [sortKey]);

    const renderSortArrow = useCallback((key) => {
        if (sortKey === key) {
            return sortDirection === 'asc' ? ' ▲' : ' ▼';
        }
        return null;
    }, [sortKey, sortDirection]);

    const formatShortDate = useCallback((dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }, []);

    const getPackageName = useCallback((packageId) => {
        const pkg = packages.find(p => p.id === packageId);
        return pkg ? pkg.nama_paket : 'Tanpa Paket';
    }, [packages]);

    const sortedBookings = useMemo(() => {
        if (!bookingPagination.data) return [];
        return [...bookingPagination.data].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];
            if (aValue === bValue) return 0;
            let comparison = 0;
            if (sortKey === 'tanggal') {
                comparison = moment(aValue).diff(moment(bValue));
            } else {
                if (aValue > bValue) comparison = 1;
                if (aValue < bValue) comparison = -1;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [bookingPagination.data, sortKey, sortDirection]);
    
    const sortedCustomers = useMemo(() => {
    if (!customerPagination.data) return [];
    return [...customerPagination.data].filter(customer => {
        const matchesSearch = customer.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              customer.nomor_whatsapp?.includes(searchQuery);
        const matchesTag = selectedTag ? customer.tags?.includes(selectedTag) : true;
        return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
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
}, [customerPagination.data, sortKey, sortDirection, searchQuery, selectedTag]);
    
    useEffect(() => {
        if (!config.headers['x-access-token']) {
            setCustomerDetail(null);
            return;
        }

        const fetchData = async () => {
            if (activeTab === 'posts') await fetchPosts();
            else if (activeTab === 'packages') await fetchPackages();
            else if (activeTab === 'bookings' && selectedStudio) {
                // ✅ PERBAIKAN: Memanggil fetchBookings saat tab aktif
                await fetchPackages();
                await fetchBookings(selectedStudio);
            }
            else if (activeTab === 'bookings-data') {
                // Biarkan useEffect di bawah yang memuat
            }
            else if (activeTab === 'customers') {
                // Biarkan useEffect di bawah yang memuat
            }
            else if (activeTab === 'portfolio') await fetchPortfolioItems();
            else if (activeTab === 'contact-messages') await fetchContactMessages();
            
            if (activeTab === 'customers' && selectedCustomer) {
                await fetchCustomerDetail(selectedCustomer.nomor_whatsapp);
            }
        };

        fetchData();
        
    }, [
        activeTab,
        selectedStudio,
        selectedCustomer,
        config,
        fetchPosts,
        fetchPackages,
        fetchBookings,
        fetchAllBookings,
        fetchCustomers,
        fetchPortfolioItems,
        fetchContactMessages,
        fetchCustomerDetail
    ]);

    useEffect(() => {
        if (activeTab === 'customers' && !selectedCustomer) {
            fetchCustomers(customerPagination.currentPage);
        }
    }, [activeTab, selectedCustomer, fetchCustomers, customerPagination.currentPage]);
    
    useEffect(() => {
        if (activeTab === 'bookings-data') {
            fetchAllBookings(bookingPagination.currentPage);
        }
    }, [activeTab, fetchAllBookings, bookingPagination.currentPage]);

    const setCustomerPage = useCallback((page) => {
        if (page > 0 && page <= customerPagination.totalPages) {
            fetchCustomers(page);
        }
    }, [fetchCustomers, customerPagination.totalPages]);

    const setBookingPage = useCallback((page) => {
        if (page > 0 && page <= bookingPagination.totalPages) {
            fetchAllBookings(page);
        }
    }, [fetchAllBookings, bookingPagination.totalPages]);

    return {
        posts,
        bookings,
        customers,
        packages,
        portfolioItems,
        studios,
        modalInfo,
        sortKey,
        sortDirection,
        sortedBookings,
        sortedCustomers,
        fetchPosts,
        fetchBookings,
        fetchAllBookings,
        fetchPackages,
        fetchCustomers,
        fetchPortfolioItems,
        customerDetail,
        fetchCustomerDetail,
        handleDelete,
        handleConfirmBooking,
        handleCancelBooking,
        contactMessages,
        fetchContactMessages,
        showModal,
        closeModal,
        handleSort,
        renderSortArrow,
        formatShortDate,
        getPackageName,
        customersData: customerPagination,
        currentPage: customerPagination.currentPage,
        totalPages: customerPagination.totalPages,
        totalItems: customerPagination.totalItems,
        setPage: setCustomerPage,
        searchQuery,
        setSearchQuery,
        selectedTag,
        setSelectedTag,
        bookingData: bookingPagination,
        bookingCurrentPage: bookingPagination.currentPage,
        bookingTotalPages: bookingPagination.totalPages,
        setBookingPage: setBookingPage
    };
};

export default useAdminData;