import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';

const useAdminData = (activeTab, selectedStudio, selectedCustomer) => {
    const [posts, setPosts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', action: null });
    const [sortKey, setSortKey] = useState('tanggal');
    const [sortDirection, setSortDirection] = useState('desc');
    const [customerDetail, setCustomerDetail] = useState(null);
    const studios = [
        { id: '1', name: 'Picme Photo Studio 1' },
        { id: '2', name: 'Picme Photo Studio 2' },
        { id: '3', name: 'Picme Photo Studio 3' },
        { id: '4', name: 'Picme Photo Studio 4' },
    ];

    const showModal = useCallback((title, message, action = null) => {
        setModalInfo({ show: true, title, message, action });
    }, []);

    const closeModal = useCallback(() => {
        setModalInfo({ show: false, title: '', message: '', action: null });
    }, []);

    const fetchPosts = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/posts');
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
            showModal('Gagal', 'Gagal memuat data postingan.');
        }
    }, [showModal]);

    const fetchPackages = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/packages');
            setPackages(response.data);
        } catch (error) {
            console.error('Error fetching packages:', error);
            showModal('Gagal', 'Gagal memuat data paket.');
        }
    }, [showModal]);

    const fetchBookings = useCallback(async (studioId) => {
        try {
            const studioName = studios.find(s => s.id === studioId)?.name;
            if (!studioName) {
                setBookings([]);
                return;
            }
            const config = {
                params: { studio_name: studioName }
            };
            const response = await axios.get('http://localhost:8080/api/services', config);
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            if (error.response && error.response.status === 401) {
                showModal('Unauthorized', 'Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.');
            }
        }
    }, [studios, showModal]);

    const fetchAllBookings = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/services');
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching all bookings:', error);
            showModal('Gagal', 'Gagal memuat data detail pemesanan.');
        }
    }, [showModal]);

    const fetchCustomers = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/services/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            showModal('Gagal', 'Gagal memuat data pelanggan.');
        }
    }, [showModal]);

    const fetchPortfolioItems = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/portfolio');
            setPortfolioItems(response.data);
        } catch (error) {
            console.error('Error fetching portfolio items:', error);
            showModal('Gagal', 'Gagal memuat data portfolio.');
        }
    }, [showModal]);

    const fetchCustomerDetail = useCallback(async (nomor_whatsapp) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/services/customer/${nomor_whatsapp}`);
            setCustomerDetail(response.data);
        } catch (error) {
            console.error('Error fetching customer detail:', error);
        }
    }, []);

    const handleConfirmBooking = useCallback(async (id, onClose) => {
        showModal('Konfirmasi Checkout', 'Apakah Anda yakin ingin mengkonfirmasi dan melakukan checkout pemesanan ini?', async () => {
            try {
                const config = { headers: { 'x-access-token': localStorage.getItem('admin-token') } };
                await axios.put(`http://localhost:8080/api/services/${id}/confirm`, {}, config); 
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
    }, [showModal, fetchAllBookings]);

    const handleDelete = useCallback(async (endpoint, id, successMessage, failureMessage, refetchFunction) => {
        showModal('Konfirmasi', `Apakah Anda yakin ingin menghapus ini?`, async () => {
            try {
                const config = { headers: { 'x-access-token': localStorage.getItem('admin-token') } };
                await axios.delete(`http://localhost:8080/api/${endpoint}/${id}`, config);
                showModal('Berhasil', successMessage);
                refetchFunction();
            } catch (error) {
                console.error('Error deleting:', error);
                showModal('Gagal', failureMessage);
            }
        });
    }, [showModal]);

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

    const sortedBookings = [...bookings].sort((a, b) => {
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

    const sortedCustomers = [...customers].sort((a, b) => {
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

    useEffect(() => {
        const token = localStorage.getItem('admin-token');
        if (token) {
            axios.defaults.headers.common['x-access-token'] = token;
        } else {
            delete axios.defaults.headers.common['x-access-token'];
        }

        if (activeTab === 'posts') {
            fetchPosts();
        } else if (activeTab === 'bookings-data') {
            fetchAllBookings();
        } else if (activeTab === 'customers' && !selectedCustomer) {
            fetchCustomers();
        } else if (activeTab === 'packages') {
            fetchPackages();
        } else if (activeTab === 'portfolio') {
            fetchPortfolioItems();
        } else if (activeTab === 'bookings' && selectedStudio) {
            fetchPackages();
            fetchBookings(selectedStudio);
        }
    }, [activeTab, selectedCustomer, selectedStudio, fetchPosts, fetchAllBookings, fetchCustomers, fetchPackages, fetchPortfolioItems, fetchBookings]);
    
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
        showModal,
        closeModal,
        handleSort,
        renderSortArrow,
        formatShortDate,
        getPackageName,
    };
};

export default useAdminData;