// src/hooks/useAdminData.js

import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import moment from 'moment';

// ✅ PERBAIKAN: Menggunakan variabel lingkungan untuk URL API
const API_URL = process.env.REACT_APP_API_URL + '/api';

const getTokenConfig = () => {
    const token = localStorage.getItem('admin-token');
    return {
        headers: { 'x-access-token': token }
    };
};

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
    const [duplicateRecords, setDuplicateRecords] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin-token'));
    
    const [dashboardData, setDashboardData] = useState(null);

    const showModal = useCallback((title, message, action = null) => {
        setModalInfo({ show: true, title, message, action });
    }, []);

    const closeModal = useCallback(() => {
        setModalInfo({ show: false, title: '', message: '', action: null });
    }, []);

    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(!!localStorage.getItem('admin-token'));
        };
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const processBookingsForDashboard = (bookings) => {
        const salesByDate = {};
        for (let i = 6; i >= 0; i--) {
            const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
            salesByDate[date] = 0;
        }
        let totalSales = 0;
        (bookings || []).forEach(b => {
            if (b.status === 'confirmed') {
                const date = moment(b.tanggal).format('YYYY-MM-DD');
                if (salesByDate[date] !== undefined) {
                    const price = b.package_price || 0;
                    salesByDate[date] += price;
                    totalSales += price;
                }
            }
        });

        const agendaByDate = { confirmed: {}, canceled: {} };
        for (let i = 6; i >= 0; i--) {
            const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
            agendaByDate.confirmed[date] = 0;
            agendaByDate.canceled[date] = 0;
        }
        let totalConfirmed = 0;
        let totalCanceled = 0;
        (bookings || []).forEach(b => {
            const date = moment(b.tanggal).format('YYYY-MM-DD');
            if (agendaByDate.confirmed[date] !== undefined) {
                if (b.status === 'confirmed') {
                    agendaByDate.confirmed[date]++;
                    totalConfirmed++;
                }
                if (b.status === 'canceled') {
                    agendaByDate.canceled[date]++;
                    totalCanceled++;
                }
            }
        });

        const recentActivities = [...(bookings || [])]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
        
        return {
            salesData: {
                labels: Object.keys(salesByDate),
                values: Object.values(salesByDate),
                total: totalSales
            },
            agendaData: {
                labels: Object.keys(agendaByDate.confirmed),
                confirmedValues: Object.values(agendaByDate.confirmed),
                canceledValues: Object.values(agendaByDate.canceled),
                totalConfirmed: totalConfirmed,
                totalCanceled: totalCanceled
            },
            recentActivities: recentActivities
        };
    };
    
        const fetchDashboardData = useCallback(async (studioId = '') => {
        if (!isAuthenticated) return;
        setDashboardData(null); 

        try {
        const startDate = moment().subtract(6, 'days').format('YYYY-MM-DD');
        let url = `${API_URL}/services?startDate=${startDate}`;

        if (studioId) {
        const studioName = studios.find(s => String(s.id) === String(studioId))?.name;
        if (studioName) {
        url += `&studio_name=${encodeURIComponent(studioName)}`;
        }
        }

        const res = await axios.get(url, getTokenConfig());
        const filteredBookings = Array.isArray(res.data) ? res.data : res.data.data || [];

        setBookings(filteredBookings);

        const summary = processBookingsForDashboard(filteredBookings);
        setDashboardData(summary);

        } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showModal('Gagal', 'Gagal memuat data ringkasan untuk beranda.');

        setBookings([]);
        setDashboardData({ salesData: { labels: [], values: [], total: 0 }, agendaData: { labels: [], confirmedValues: [], canceledValues: [], totalConfirmed: 0, totalCanceled: 0 }, recentActivities: [] });
        }
        }, [studios, showModal, isAuthenticated]);

    const fetchPosts = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            // ✅ PERBAIKAN: Menggunakan variabel lingkungan
            const res = await axios.get(`${API_URL}/posts`, getTokenConfig());
            setPosts(res.data);
        } catch (error) {
            console.error("Error fetching posts:", error);
            showModal('Error', 'Gagal memuat data postingan.');
        }
    }, [showModal, isAuthenticated]);

    const fetchPackages = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            // ✅ PERBAIKAN: Menggunakan variabel lingkungan
            const res = await axios.get(`${API_URL}/packages`, getTokenConfig());
            setPackages(res.data);
        } catch (error) {
            console.error("Error fetching packages:", error);
            showModal('Error', 'Gagal memuat data paket.');
        }
    }, [showModal, isAuthenticated]);

    const fetchBookings = useCallback(async (studioId) => {
        if (!isAuthenticated) return;
        try {
            const studioName = studios.find(s => s.id === studioId)?.name;
            if (!studioName) {
                setBookings([]);
                return;
            }
            // ✅ PERBAIKAN: Menggunakan variabel lingkungan
            const res = await axios.get(`${API_URL}/services?studio_name=${encodeURIComponent(studioName)}`, getTokenConfig());
            
            const data = Array.isArray(res.data) ? res.data : res.data.data || [];
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            if (error.response && error.response.status === 401) {
                showModal('Unauthorized', 'Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.');
            }
        }
    }, [studios, showModal, isAuthenticated]);

    const fetchAllBookings = useCallback(async (page = 1) => {
        if (activeTab !== 'bookings-data' || !isAuthenticated) return;
        try {
            // ✅ PERBAIKAN: Menggunakan variabel lingkungan
            const res = await axios.get(`${API_URL}/services?page=${page}&limit=10`, getTokenConfig());
            setBookingPagination(res.data);
            console.log("Booking data with pagination:", res.data);
        } catch (error) {
            console.error('Error fetching all bookings:', error);
            showModal('Gagal', 'Gagal memuat data detail pemesanan.');
        }
    }, [activeTab, showModal, isAuthenticated]);

    const fetchCustomers = useCallback(async (page = 1, search = '') => {
        if (activeTab !== 'customers' || !isAuthenticated) return;
        try {
            // ✅ PERBAIKAN: Menggunakan variabel lingkungan
            const res = await axios.get(`${API_URL}/services/customers?page=${page}&limit=10&search=${encodeURIComponent(search)}`, getTokenConfig());
            setCustomerPagination(res.data);
            console.log("Customer data with pagination:", res.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            showModal('Gagal', 'Gagal memuat data pelanggan.');
        }
    }, [activeTab, showModal, isAuthenticated]);

    const fetchPortfolioItems = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            // ✅ PERBAIKAN: Menggunakan variabel lingkungan
            const res = await axios.get(`${API_URL}/portfolio`, getTokenConfig());
            setPortfolioItems(res.data);
        } catch (error) {
            console.error('Error fetching portfolio items:', error);
            showModal('Gagal', 'Gagal memuat data portfolio.');
        }
    }, [showModal, isAuthenticated]);

    const fetchCustomerDetail = useCallback(async (nomor_whatsapp) => {
        if (!isAuthenticated) return;
        try {
            // ✅ PERBAIKAN: Menggunakan variabel lingkungan
            const res = await axios.get(`${API_URL}/services/customer/${nomor_whatsapp}`, getTokenConfig());
            setCustomerDetail(res.data);
            console.log("Customer Detail fetched:", res.data);
        } catch (error) {
            console.error('Error fetching customer detail:', error);
            setCustomerDetail(null);
        }
    }, [isAuthenticated]);

    const fetchContactMessages = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            // ✅ PERBAIKAN: Menggunakan variabel lingkungan
            const res = await axios.get(`${API_URL}/contact`, getTokenConfig());
            setContactMessages(res.data);
        } catch (error) {
            console.error('Error fetching contact messages:', error);
            showModal('Gagal', 'Gagal memuat pesan kontak.');
        }
    }, [showModal, isAuthenticated]);

    const handleConfirmBooking = useCallback(async (id, onClose) => {
        if (!isAuthenticated) return showModal('Error', 'Anda harus login untuk melakukan aksi ini.');
        showModal('Konfirmasi Checkout', 'Apakah Anda yakin ingin mengkonfirmasi dan melakukan checkout pemesanan ini?', async () => {
            try {
                // ✅ PERBAIKAN: Menggunakan variabel lingkungan
                await axios.put(`${API_URL}/services/${id}/confirm`, {}, getTokenConfig()); 
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
    }, [showModal, fetchAllBookings, isAuthenticated]);

    const handleDelete = useCallback(async (endpoint, id, successMessage, failureMessage, refetchFunction) => {
        if (!isAuthenticated) return showModal('Error', 'Anda harus login untuk melakukan aksi ini.');
        showModal('Konfirmasi', `Apakah Anda yakin ingin menghapus data ini?`, async () => {
            try {
                // ✅ PERBAIKAN: Menggunakan variabel lingkungan
                await axios.delete(`${API_URL}/${endpoint}/${id}`, getTokenConfig());
                showModal('Berhasil', successMessage);
                refetchFunction();
            } catch (error) {
                console.error('Error deleting:', error);
                showModal('Gagal', failureMessage);
            }
        });
    }, [showModal, isAuthenticated]);
    
    const handleCancelBooking = useCallback(async (id) => {
        if (!isAuthenticated) return showModal('Error', 'Anda harus login untuk melakukan aksi ini.');
        try {
            // ✅ PERBAIKAN: Menggunakan variabel lingkungan
            await axios.put(`${API_URL}/services/${id}/cancel`, {}, getTokenConfig());
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
    }, [showModal, activeTab, fetchAllBookings, fetchBookings, selectedStudio, isAuthenticated]);
    
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
        return [...customerPagination.data].sort((a, b) => {
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
        if (activeTab === 'beranda' && isAuthenticated) {
            fetchDashboardData(selectedStudio);
        }
    }, [activeTab, selectedStudio, fetchDashboardData, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) {
            setCustomerDetail(null);
            return;
        }

        const fetchData = async () => {
            if (activeTab === 'posts') await fetchPosts();
            else if (activeTab === 'packages') await fetchPackages();
            else if (activeTab === 'portfolio') await fetchPortfolioItems();
            else if (activeTab === 'contact-messages') await fetchContactMessages();
            
            if (activeTab === 'customers' && selectedCustomer) {
                await fetchCustomerDetail(selectedCustomer.nomor_whatsapp);
            }
        };

        fetchData();
        
    }, [
        activeTab,
        selectedCustomer,
        fetchPosts,
        fetchPackages,
        fetchPortfolioItems,
        fetchContactMessages,
        fetchCustomerDetail,
        isAuthenticated
    ]);

    useEffect(() => {
        if (activeTab === 'bookings' && selectedStudio && isAuthenticated) {
            fetchBookings(selectedStudio);
        }
    }, [activeTab, selectedStudio, fetchBookings, isAuthenticated]);
    
    useEffect(() => {
        if (activeTab === 'customers' && !selectedCustomer && isAuthenticated) {
            fetchCustomers(customerPagination.currentPage, searchQuery);
        }
    }, [activeTab, selectedCustomer, fetchCustomers, customerPagination.currentPage, searchQuery, isAuthenticated]);
    
    useEffect(() => {
        if (activeTab === 'bookings-data' && isAuthenticated) {
            fetchAllBookings(bookingPagination.currentPage);
        }
    }, [activeTab, fetchAllBookings, bookingPagination.currentPage, isAuthenticated]);

    const setCustomerPage = useCallback((page) => {
        if (page > 0 && page <= customerPagination.totalPages) {
            fetchCustomers(page, searchQuery);
        }
    }, [fetchCustomers, customerPagination.totalPages, searchQuery]);

    const setBookingPage = useCallback((page) => {
        if (page > 0 && page <= bookingPagination.totalPages) {
            fetchAllBookings(page);
        }
    }, [fetchAllBookings, bookingPagination.totalPages]);

    const fetchDuplicateRecords = useCallback(async (nomor_whatsapp) => {
        if (!isAuthenticated) return;
        try {
            // ✅ PERBAIKAN: Menggunakan variabel lingkungan
            const res = await axios.get(`${API_URL}/services/customers/duplicates/${nomor_whatsapp}`, getTokenConfig());
            setDuplicateRecords(res.data);
        } catch (error) {
            console.oducts('Error fetching duplicate records:', error);
            setDuplicateRecords([]);
        }
    }, [isAuthenticated]);

    const mergeCustomer = useCallback(async (masterId, duplicateIds) => {
        if (!isAuthenticated) return showModal('Error', 'Anda harus login untuk melakukan aksi ini.');
        try {
            const payload = { masterId, duplicateIds };
            // ✅ PERBAIKAN: Menggunakan variabel lingkungan
            await axios.post(`${API_URL}/services/customers/merge-single`, payload, getTokenConfig());
            showModal('Berhasil', 'Data pelanggan berhasil digabungkan.');
            fetchCustomers(1, searchQuery);
        } catch (error) {
            console.error('Error merging customer:', error);
            showModal('Gagal', 'Gagal menggabungkan data pelanggan.');
        }
    }, [fetchCustomers, showModal, searchQuery, isAuthenticated]);

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
        setBookingPage: setBookingPage,
        duplicateRecords,
        fetchDuplicateRecords,
        mergeCustomer,
        dashboardData,
    };
};

export default useAdminData;