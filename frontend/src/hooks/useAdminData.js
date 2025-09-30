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
    const [customerDetail, setCustomerDetail] = useState(null);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', action: null });
    const [sortKey, setSortKey] = useState('tanggal');
    const [sortDirection, setSortDirection] = useState('desc');
    

    const showModal = useCallback((title, message, action = null) => {
        setModalInfo({ show: true, title, message, action });
    }, []);

    const closeModal = useCallback(() => {
        setModalInfo({ show: false, title: '', message: '', action: null });
    }, []);

    const token = localStorage.getItem('admin-token');
    const config = {
        headers: { 'x-access-token': token }
    };

    const fetchPosts = useCallback(async () => {
        if (activeTab !== 'posts') return;
        try {
            const res = await axios.get(`${API_URL}/posts`, config);
            setPosts(res.data);
        } catch (error) {
            console.error("Error fetching posts:", error);
            showModal('Error', 'Gagal memuat data postingan.');
        }
    }, [activeTab, showModal, config]);

    const fetchPackages = useCallback(async () => {
        if (activeTab !== 'packages') return;
        try {
            const res = await axios.get(`${API_URL}/packages`, config);
            setPackages(res.data);
        } catch (error) {
            console.error("Error fetching packages:", error);
            showModal('Error', 'Gagal memuat data paket.');
        }
    }, [activeTab, showModal, config]);

    const fetchBookings = useCallback(async (studioId) => {
        if (activeTab !== 'bookings' || !selectedStudio) return;
        try {
            const studioName = studios.find(s => s.id === studioId)?.name;
            if (!studioName) {
                setBookings([]);
                return;
            }
            const res = await axios.get(`${API_URL}/services?studio_name=${encodeURIComponent(studioName)}`, config);
            setBookings(res.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            if (error.response && error.response.status === 401) {
                showModal('Unauthorized', 'Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.');
            }
        }
    }, [studios, showModal, activeTab, selectedStudio, config]);

    const fetchAllBookings = useCallback(async () => {
        if (activeTab !== 'bookings-data') return;
        try {
            const res = await axios.get(`${API_URL}/services`, config);
            setBookings(res.data);
        } catch (error) {
            console.error('Error fetching all bookings:', error);
            showModal('Gagal', 'Gagal memuat data detail pemesanan.');
        }
    }, [activeTab, showModal, config]);

    const fetchCustomers = useCallback(async () => {
        if (activeTab !== 'customers') return;
        try {
            const res = await axios.get(`${API_URL}/services/customers`, config);
            setCustomers(res.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            showModal('Gagal', 'Gagal memuat data pelanggan.');
        }
    }, [activeTab, showModal, config]);

    const fetchPortfolioItems = useCallback(async () => {
        if (activeTab !== 'portfolio') return;
        try {
            const res = await axios.get(`${API_URL}/portfolio`, config);
            setPortfolioItems(res.data);
        } catch (error) {
            console.error('Error fetching portfolio items:', error);
            showModal('Gagal', 'Gagal memuat data portfolio.');
        }
    }, [activeTab, showModal, config]);

    const fetchCustomerDetail = useCallback(async (nomor_whatsapp) => {
        try {
            const res = await axios.get(`${API_URL}/services/customer/${nomor_whatsapp}`, config);
            setCustomerDetail(res.data);
        } catch (error) {
            console.error('Error fetching customer detail:', error);
        }
    }, [config]);

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
        if (!bookings) return [];
        return [...bookings].sort((a, b) => {
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
    }, [bookings, sortKey, sortDirection]);
    
    const sortedCustomers = useMemo(() => {
        if (!customers) return [];
        return [...customers].sort((a, b) => {
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
    }, [customers, sortKey, sortDirection]);
    
    useEffect(() => {
        // Ini adalah useEffect yang diperbarui untuk mencegah data ganda
        // dan hanya mengambil data yang relevan dengan activeTab
        const fetchData = async () => {
            if (!token) return; // Jangan fetch jika tidak ada token
            
            if (activeTab === 'posts') await fetchPosts();
            else if (activeTab === 'packages') await fetchPackages();
            else if (activeTab === 'bookings' && selectedStudio) {
                await fetchPackages();
                await fetchBookings(selectedStudio);
            }
            else if (activeTab === 'bookings-data') await fetchAllBookings();
            else if (activeTab === 'customers' && !selectedCustomer) await fetchCustomers();
            else if (activeTab === 'portfolio') await fetchPortfolioItems();
        };

        fetchData();
        
    }, [activeTab, selectedStudio, selectedCustomer, token]);
    
    useEffect(() => {
        if (activeTab === 'customers' && selectedCustomer) {
            fetchCustomerDetail(selectedCustomer.nomor_whatsapp);
        }
    }, [activeTab, selectedCustomer, fetchCustomerDetail]);

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
        showModal,
        closeModal,
        handleSort,
        renderSortArrow,
        formatShortDate,
        getPackageName,
    };
};

export default useAdminData;