// src/hooks/useAdminData.js

import { useState, useEffect, useCallback, useMemo } from 'react';
// Ganti axios dengan axiosInstance
import axiosInstance from '../api/axiosInstance'; // <-- Pastikan path ini benar
import moment from 'moment';

// Fungsi ini sudah tidak diperlukan lagi
/*
const getTokenConfig = () => {
    // ...
};
*/

const useAdminData = (activeTab, selectedStudio, selectedCustomer) => {
    // State Anda (tidak berubah)
    const [posts, setPosts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [customers, setCustomers] = useState([]); // State untuk data mentah customer jika perlu
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
    const [sortKey, setSortKey] = useState('tanggal'); // Default sort untuk bookings
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
    const [selectedTag, setSelectedTag] = useState(null); // Jika Anda punya filter tag untuk customer
    const [duplicateRecords, setDuplicateRecords] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin-token'));
    const [dashboardData, setDashboardData] = useState(null);

    // Fungsi showModal & closeModal (tidak berubah)
    const showModal = useCallback((title, message, action = null) => {
        setModalInfo({ show: true, title, message, action });
    }, []);

    const closeModal = useCallback(() => {
        setModalInfo({ show: false, title: '', message: '', action: null });
    }, []);

    // Listener untuk storage (tidak berubah)
    useEffect(() => {
        const checkAuth = () => setIsAuthenticated(!!localStorage.getItem('admin-token'));
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    // Fungsi helper processBookingsForDashboard (tidak berubah)
     const processBookingsForDashboard = useCallback((bookingsData) => {
        const salesByDate = {};
        for (let i = 6; i >= 0; i--) {
            const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
            salesByDate[date] = 0;
        }
        let totalSales = 0;
        (bookingsData || []).forEach(b => {
            if (b.status === 'confirmed') {
                const date = moment(b.tanggal).format('YYYY-MM-DD');
                if (salesByDate[date] !== undefined) {
                    // Pastikan kalkulasi harga benar
                    const price = (parseInt(b.package_price, 10) || 0);
                    const quantity = (parseInt(b.jumlah_orang, 10) || 1);
                    const itemTotal = price * quantity;
                    salesByDate[date] += itemTotal;
                    // Hanya hitung total jika tanggalnya dalam 7 hari terakhir
                    if (moment(date).isSameOrAfter(moment().subtract(6, 'days'), 'day')) {
                         totalSales += itemTotal;
                    }
                }
            }
        });

        const agendaByDate = { confirmed: {}, canceled: {} };
        for (let i = 6; i >= 0; i--) { // Data agenda untuk 7 hari ke depan
            const date = moment().add(i, 'days').format('YYYY-MM-DD');
            agendaByDate.confirmed[date] = 0;
            agendaByDate.canceled[date] = 0;
        }
        let totalConfirmedUpcoming = 0;
        let totalCanceledUpcoming = 0;
        (bookingsData || []).forEach(b => {
            const date = moment(b.tanggal).format('YYYY-MM-DD');
            // Cek apakah tanggal ada di objek agenda (7 hari ke depan)
            if (agendaByDate.confirmed[date] !== undefined) {
                if (b.status === 'confirmed') {
                    agendaByDate.confirmed[date]++;
                    totalConfirmedUpcoming++;
                }
                 // Consider 'pending' or other statuses if relevant for upcoming agenda?
                if (b.status === 'canceled') { // Mungkin Anda tidak ingin menampilkan canceled di agenda mendatang?
                    // agendaByDate.canceled[date]++;
                    // totalCanceledUpcoming++;
                }
            }
        });

        const recentActivities = [...(bookingsData || [])]
            .sort((a, b) => new Date(b.created_at || b.tanggal) - new Date(a.created_at || a.tanggal))
            .slice(0, 5);

        return {
            salesData: { labels: Object.keys(salesByDate), values: Object.values(salesByDate), total: totalSales },
            agendaData: { labels: Object.keys(agendaByDate.confirmed), confirmedValues: Object.values(agendaByDate.confirmed), canceledValues: Object.values(agendaByDate.canceled), totalConfirmed: totalConfirmedUpcoming, totalCanceled: totalCanceledUpcoming },
            recentActivities: recentActivities
        };
    }, []); // Hook ini murni


    // --- FUNGSI FETCH DATA (SEMUA TELAH DIPERBARUI) ---

    const fetchDashboardData = useCallback(async (studioId = '') => {
        if (!isAuthenticated) return;
        setDashboardData(null); // Reset saat fetch baru
        console.log("Fetching dashboard data for studioId:", studioId); // Debug log

        try {
            const startDate = moment().subtract(6, 'days').format('YYYY-MM-DD');
            // Gunakan path relatif
            let url = `/api/services?startDate=${startDate}`; // Ambil data 7 hari terakhir untuk kalkulasi

            if (studioId) {
                const studio = studios.find(s => String(s.id) === String(studioId));
                 if (studio?.name) { // Periksa apakah studio ditemukan dan punya nama
                    url += `&studio_name=${encodeURIComponent(studio.name)}`;
                    console.log("Fetching for specific studio:", studio.name); // Debug log
                } else {
                     console.warn("Studio not found for ID:", studioId); // Peringatan jika ID studio tidak valid
                }
            } else {
                 console.log("Fetching for all studios"); // Debug log
            }


            // Gunakan axiosInstance, hapus getTokenConfig()
            const res = await axiosInstance.get(url);
            // Cek struktur data respons
            const fetchedBookings = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            console.log("Fetched bookings for dashboard:", fetchedBookings); // Debug log


            // Update state bookings global juga (opsional, tergantung kebutuhan)
            // setBookings(fetchedBookings); // Mungkin tidak perlu jika hanya untuk dashboard

            const summary = processBookingsForDashboard(fetchedBookings);
            console.log("Processed dashboard summary:", summary); // Debug log
            setDashboardData(summary);

        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error fetching dashboard data:', error);
                showModal('Gagal', 'Gagal memuat data ringkasan untuk beranda.');
            }
            // Set data default jika gagal (kecuali 401)
            setBookings([]); // Pastikan state bookings juga direset
            setDashboardData({ salesData: { labels: [], values: [], total: 0 }, agendaData: { labels: [], confirmedValues: [], canceledValues: [], totalConfirmed: 0, totalCanceled: 0 }, recentActivities: [] });
        }
    }, [studios, showModal, isAuthenticated, processBookingsForDashboard]); // Tambahkan dependensi

    const fetchPosts = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const res = await axiosInstance.get(`/api/posts`);
            setPosts(res.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error("Error fetching posts:", error);
                showModal('Error', 'Gagal memuat data postingan.');
            }
        }
    }, [showModal, isAuthenticated]);

    const fetchPackages = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const res = await axiosInstance.get(`/api/packages`);
            setPackages(res.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error("Error fetching packages:", error);
                showModal('Error', 'Gagal memuat data paket.');
            }
        }
    }, [showModal, isAuthenticated]);

    const fetchBookings = useCallback(async (studioId) => { // Untuk kalender
        if (!isAuthenticated) return;
        try {
            const studioName = studios.find(s => String(s.id) === String(studioId))?.name;
            let url = '/api/services'; // Default ambil semua jika studioId tidak valid
            if (studioName) {
                 url += `?studio_name=${encodeURIComponent(studioName)}`;
            } else if (studioId) { // Jika ada studioId tapi tidak ketemu namanya
                 console.warn("Studio ID for calendar not found:", studioId);
                 // Mungkin set bookings jadi kosong?
                 setBookings([]);
                 return;
            }
            const res = await axiosInstance.get(url);
            const data = Array.isArray(res.data) ? res.data : res.data.data || [];
            setBookings(data); // Set state bookings global
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error fetching calendar bookings:', error);
                showModal('Error', 'Gagal memuat data jadwal booking.');
            }
        }
    }, [studios, isAuthenticated, showModal]); // Tambah showModal

    const fetchAllBookings = useCallback(async (page = 1) => { // Untuk tabel data booking
        if (activeTab !== 'bookings-data' || !isAuthenticated) return;
        try {
            const res = await axiosInstance.get(`/api/services?page=${page}&limit=10`); // Sesuaikan limit jika perlu
            setBookingPagination(res.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error fetching paginated bookings:', error);
                showModal('Gagal', 'Gagal memuat data detail pemesanan.');
            }
        }
    }, [activeTab, showModal, isAuthenticated]);

    const fetchCustomers = useCallback(async (page = 1, search = '') => {
        if (activeTab !== 'customers' || !isAuthenticated) return;
        try {
            const res = await axiosInstance.get(`/api/services/customers?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
            setCustomerPagination(res.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error fetching customers:', error);
                showModal('Gagal', 'Gagal memuat data pelanggan.');
            }
        }
    }, [activeTab, showModal, isAuthenticated]);

    const fetchPortfolioItems = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const res = await axiosInstance.get(`/api/portfolio`);
            setPortfolioItems(res.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error fetching portfolio items:', error);
                showModal('Gagal', 'Gagal memuat data portfolio.');
            }
        }
    }, [showModal, isAuthenticated]);

    const fetchCustomerDetail = useCallback(async (nomor_whatsapp) => {
        if (!isAuthenticated || !nomor_whatsapp) return;
        try {
            const res = await axiosInstance.get(`/api/services/customer/${nomor_whatsapp}`);
            setCustomerDetail(res.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error fetching customer detail:', error);
                setCustomerDetail(null); // Reset jika gagal
            }
        }
    }, [isAuthenticated]);

    const fetchContactMessages = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const res = await axiosInstance.get(`/api/contact`);
            setContactMessages(res.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error fetching contact messages:', error);
                showModal('Gagal', 'Gagal memuat pesan kontak.');
            }
        }
    }, [showModal, isAuthenticated]);

    // --- FUNGSI AKSI (SEMUA TELAH DIPERBARUI) ---

    const handleConfirmBooking = useCallback(async (id, onClose) => {
        if (!isAuthenticated) return showModal('Error', 'Sesi tidak valid.');
        showModal('Konfirmasi Checkout', 'Yakin ingin konfirmasi dan checkout?', async () => {
            try {
                await axiosInstance.put(`/api/services/${id}/confirm`, {});
                showModal('Berhasil', 'Pemesanan berhasil dikonfirmasi!');
                if (onClose) onClose();
                // Refresh data yang relevan
                if (activeTab === 'bookings-data') fetchAllBookings(bookingPagination.currentPage);
                else if (activeTab === 'bookings') fetchBookings(selectedStudio);
                else fetchDashboardData(selectedStudio); // Update dashboard
            } catch (error) {
                if (error.response?.status !== 401) {
                    console.error('Error confirming booking:', error);
                    showModal('Gagal', error.response?.data?.message || 'Gagal mengkonfirmasi.');
                }
            }
        });
    }, [showModal, isAuthenticated, activeTab, fetchAllBookings, fetchBookings, fetchDashboardData, selectedStudio, bookingPagination.currentPage]);

    const handleDelete = useCallback(async (endpoint, id, successMessage, failureMessage, refetchFunction) => {
        if (!isAuthenticated) return showModal('Error', 'Sesi tidak valid.');
        showModal('Konfirmasi Hapus', `Yakin ingin menghapus data ini?`, async () => {
            try {
                await axiosInstance.delete(`/api/${endpoint}/${id}`);
                showModal('Berhasil', successMessage);
                if (refetchFunction) refetchFunction();
            } catch (error) {
                if (error.response?.status !== 401) {
                    console.error('Error deleting:', error);
                    showModal('Gagal', error.response?.data?.message || failureMessage);
                }
            }
        });
    }, [showModal, isAuthenticated]);

    const handleCancelBooking = useCallback(async (id, onClose) => {
        if (!isAuthenticated) return showModal('Error', 'Sesi tidak valid.');
         showModal('Konfirmasi Batal', 'Yakin ingin membatalkan pemesanan ini?', async () => {
             try {
                await axiosInstance.put(`/api/services/${id}/cancel`, {});
                showModal('Berhasil', 'Pemesanan berhasil dibatalkan!');
                if(onClose) onClose();
                // Refresh data yang relevan
                if (activeTab === 'bookings-data') fetchAllBookings(bookingPagination.currentPage);
                else if (activeTab === 'bookings') fetchBookings(selectedStudio);
                else fetchDashboardData(selectedStudio); // Update dashboard
            } catch (error) {
                if (error.response?.status !== 401) {
                    console.error('Error canceling booking:', error);
                    showModal('Gagal', 'Gagal membatalkan pemesanan.');
                }
            }
        });
    }, [showModal, isAuthenticated, activeTab, fetchAllBookings, fetchBookings, fetchDashboardData, selectedStudio, bookingPagination.currentPage]);

    // --- FUNGSI SORTING (Tidak berubah) ---
    const handleSort = useCallback((key) => {
        if (sortKey === key) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc'); // Default ke asc saat ganti kolom
        }
    }, [sortKey]);

    const renderSortArrow = useCallback((key) => {
        if (sortKey === key) {
            return sortDirection === 'asc' ? ' ▲' : ' ▼';
        }
        return ' ↕'; // Indikator bisa sort
    }, [sortKey, sortDirection]);

    // --- FUNGSI FORMATTING (Tidak berubah) ---
    const formatShortDate = useCallback((dateString) => {
        if (!dateString) return '-';
         // Coba parse dengan moment untuk fleksibilitas format
        const mDate = moment(dateString);
        if (!mDate.isValid()) return '-';
        // Format ke DD/MM/YYYY
        return mDate.format('DD/MM/YYYY');
    }, []);

    const getPackageName = useCallback((packageId) => {
        const pkg = packages.find(p => String(p.id) === String(packageId)); // Bandingkan sebagai string
        return pkg ? pkg.nama_paket : 'Tanpa Paket';
    }, [packages]);

    // --- MEMOIZED SORTED DATA (Tidak berubah) ---
    const sortedBookings = useMemo(() => {
        if (!bookingPagination.data?.length) return []; // Cek data array
        return [...bookingPagination.data].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];
            if (aValue == bValue) return 0; // Gunakan == untuk handle null/undefined

            let comparison = 0;
            if (sortKey === 'tanggal' || sortKey === 'created_at') { // Tambah created_at jika perlu
                comparison = moment(aValue).diff(moment(bValue));
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            }
            else { // Sort string (case-insensitive)
                const strA = String(aValue || '').toLowerCase();
                const strB = String(bValue || '').toLowerCase();
                 if (strA > strB) comparison = 1;
                 if (strA < strB) comparison = -1;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [bookingPagination.data, sortKey, sortDirection]);

    const sortedCustomers = useMemo(() => {
        if (!customerPagination.data?.length) return [];
        return [...customerPagination.data].sort((a, b) => {
             const aValue = a[sortKey];
             const bValue = b[sortKey];
             if (aValue == bValue) return 0;

             let comparison = 0;
             if (sortKey === 'last_visit_date') {
                 comparison = moment(aValue).diff(moment(bValue));
             } else if (sortKey === 'total_bookings' || sortKey === 'total_spent') { // Sort angka
                 comparison = (aValue || 0) - (bValue || 0);
             } else { // Sort string
                const strA = String(aValue || '').toLowerCase();
                const strB = String(bValue || '').toLowerCase();
                 if (strA > strB) comparison = 1;
                 if (strA < strB) comparison = -1;
             }
             return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [customerPagination.data, sortKey, sortDirection]);

    // --- USEEFFECT HOOKS (Logika fetch tidak berubah, hanya memanggil fungsi baru) ---
    useEffect(() => {
        if (activeTab === 'beranda' && isAuthenticated) {
            fetchDashboardData(selectedStudio); // Trigger fetch saat tab/studio berubah
        }
    }, [activeTab, selectedStudio, fetchDashboardData, isAuthenticated]); // Dependencies

    useEffect(() => {
        if (!isAuthenticated) { setCustomerDetail(null); return; }
        const fetchDataForTab = async () => {
            console.log("Fetching data for tab:", activeTab); // Debug log
            if (activeTab === 'posts') await fetchPosts();
            else if (activeTab === 'packages') await fetchPackages();
            else if (activeTab === 'portfolio') await fetchPortfolioItems();
            else if (activeTab === 'contact-messages') await fetchContactMessages();
            // Fetch detail customer HANYA jika tab customer aktif DAN ada customer terpilih
            if (activeTab === 'customers' && selectedCustomer?.nomor_whatsapp) {
                await fetchCustomerDetail(selectedCustomer.nomor_whatsapp);
            } else if (activeTab !== 'customers') {
                 setCustomerDetail(null); // Reset detail jika pindah dari tab customer
            }
        };
        fetchDataForTab();
    }, [ activeTab, selectedCustomer, fetchPosts, fetchPackages, fetchPortfolioItems, fetchContactMessages, fetchCustomerDetail, isAuthenticated ]); // Dependencies

    useEffect(() => {
        // Fetch bookings untuk kalender HANYA jika tab 'bookings' aktif
        if (activeTab === 'bookings' && selectedStudio && isAuthenticated) {
            fetchBookings(selectedStudio);
        }
    }, [activeTab, selectedStudio, fetchBookings, isAuthenticated]); // Dependencies

    useEffect(() => {
        // Fetch data customer (paginated) HANYA jika tab 'customers' aktif dan TIDAK ada detail yg dipilih
        if (activeTab === 'customers' && !selectedCustomer && isAuthenticated) {
            fetchCustomers(customerPagination.currentPage, searchQuery);
        }
    }, [activeTab, selectedCustomer, fetchCustomers, customerPagination.currentPage, searchQuery, isAuthenticated]); // Dependencies

    useEffect(() => {
        // Fetch data booking (paginated) HANYA jika tab 'bookings-data' aktif
        if (activeTab === 'bookings-data' && isAuthenticated) {
            fetchAllBookings(bookingPagination.currentPage);
        }
    }, [activeTab, fetchAllBookings, bookingPagination.currentPage, isAuthenticated]); // Dependencies

    // --- Pagination handlers (tidak berubah) ---
    const setCustomerPage = useCallback((page) => {
        if (page > 0 && page <= customerPagination.totalPages) {
            fetchCustomers(page, searchQuery); // Panggil fetch dengan halaman baru
        }
    }, [fetchCustomers, customerPagination.totalPages, searchQuery]);

    const setBookingPage = useCallback((page) => {
        if (page > 0 && page <= bookingPagination.totalPages) {
            fetchAllBookings(page); // Panggil fetch dengan halaman baru
        }
    }, [fetchAllBookings, bookingPagination.totalPages]);

    // --- DUPLICATE & MERGE (Sudah diperbarui) ---
    const fetchDuplicateRecords = useCallback(async (nomor_whatsapp) => {
        if (!isAuthenticated || !nomor_whatsapp) return;
        try {
            const res = await axiosInstance.get(`/api/services/customers/duplicates/${nomor_whatsapp}`);
            setDuplicateRecords(res.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error fetching duplicate records:', error);
                setDuplicateRecords([]);
            }
        }
    }, [isAuthenticated]);

    const mergeCustomer = useCallback(async (masterId, duplicateIds) => {
        if (!isAuthenticated) return showModal('Error', 'Sesi tidak valid.');
         showModal('Konfirmasi Gabung', `Yakin ingin gabungkan ${duplicateIds.length} data ke ID ${masterId}?`, async () => {
             try {
                const payload = { masterId, duplicateIds };
                await axiosInstance.post(`/api/services/customers/merge-single`, payload);
                showModal('Berhasil', 'Data pelanggan berhasil digabungkan.');
                fetchCustomers(1, searchQuery); // Refresh halaman pertama customer
                setDuplicateRecords([]); // Kosongkan daftar duplikat
            } catch (error) {
                if (error.response?.status !== 401) {
                    console.error('Error merging customer:', error);
                    showModal('Gagal', 'Gagal menggabungkan data pelanggan.');
                }
            }
        });
    }, [fetchCustomers, showModal, searchQuery, isAuthenticated]);

    // Nilai yang dikembalikan hook
    return {
        posts,
        bookings, // Data bookings global (mungkin dari fetchBookings atau fetchDashboardData)
        customers: customerPagination.data, // Kembalikan data customer dari state pagination
        packages,
        portfolioItems,
        studios,
        modalInfo,
        sortKey,
        sortDirection,
        // Gunakan sorted data yang sudah di-memoized
        sortedBookings, // Untuk tabel data booking
        sortedCustomers, // Untuk tabel data customer
        fetchPosts,
        fetchBookings, // Untuk kalender
        fetchAllBookings, // Untuk tabel data booking
        fetchPackages,
        fetchCustomers, // Untuk tabel data customer
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
        // Pagination state & setters untuk customer
        customersData: customerPagination, // Kembalikan seluruh objek pagination jika perlu
        currentPage: customerPagination.currentPage,
        totalPages: customerPagination.totalPages,
        totalItems: customerPagination.totalItems,
        setPage: setCustomerPage, // Setter untuk customer page
        // Search & Filter state untuk customer
        searchQuery,
        setSearchQuery,
        selectedTag,
        setSelectedTag,
        // Pagination state & setters untuk booking
        bookingData: bookingPagination, // Kembalikan seluruh objek pagination jika perlu
        bookingCurrentPage: bookingPagination.currentPage,
        bookingTotalPages: bookingPagination.totalPages,
        setBookingPage: setBookingPage, // Setter untuk booking page
        // Duplicate & Merge
        duplicateRecords,
        fetchDuplicateRecords,
        mergeCustomer,
        // Data dashboard
        dashboardData,
        // Status autentikasi jika perlu diakses dari luar hook
        isAuthenticated,
    };
};

export default useAdminData;