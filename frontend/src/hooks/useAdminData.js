    // src/hooks/useAdminData.js
    import { useState, useEffect, useCallback } from 'react';
    import axios from 'axios';
    import moment from 'moment';

    const useAdminData = (activeTab, selectedStudio) => {
        const [posts, setPosts] = useState([]);
        const [bookings, setBookings] = useState([]);
        const [customers, setCustomers] = useState([]);
        const [packages, setPackages] = useState([]);
        const [portfolioItems, setPortfolioItems] = useState([]); // State baru untuk portfolio
        const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', action: null });
        const [sortKey, setSortKey] = useState('tanggal');
        const [sortDirection, setSortDirection] = useState('desc');
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
                const token = localStorage.getItem('admin-token');
                const config = { headers: { 'x-access-token': token } };
                const response = await axios.get('http://localhost:8080/api/posts', config);
                setPosts(response.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
                showModal('Gagal', 'Gagal memuat data postingan.');
            }
        }, [showModal]);

        const fetchBookings = useCallback(async () => {
            try {
                const token = localStorage.getItem('admin-token');
                const studioName = studios.find(s => s.id === selectedStudio)?.name;
                if (!studioName) {
                    setBookings([]);
                    return;
                }
                const config = {
                    headers: { 'x-access-token': token },
                    params: { studio_name: studioName }
                };
                const response = await axios.get('http://localhost:8080/api/services', config);
                setBookings(response.data);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            }
        }, [selectedStudio, studios]);

        const fetchAllBookings = useCallback(async () => {
            try {
                const token = localStorage.getItem('admin-token');
                const config = { headers: { 'x-access-token': token } };
                const response = await axios.get('http://localhost:8080/api/services', config);
                setBookings(response.data);
            } catch (error) {
                console.error('Error fetching all bookings:', error);
                showModal('Gagal', 'Gagal memuat data detail pemesanan.');
            }
        }, [showModal]);

        const fetchPackages = useCallback(async () => {
            try {
                const token = localStorage.getItem('admin-token');
                const config = { headers: { 'x-access-token': token } };
                const response = await axios.get('http://localhost:8080/api/packages', config);
                setPackages(response.data);
            } catch (error) {
                console.error('Error fetching packages:', error);
                showModal('Gagal', 'Gagal memuat data paket.');
            }
        }, [showModal]);

        const fetchCustomers = useCallback(async () => {
            try {
                const token = localStorage.getItem('admin-token');
                const config = { headers: { 'x-access-token': token } };
                const response = await axios.get('http://localhost:8080/api/services/customers', config);
                setCustomers(response.data);
            } catch (error) {
                console.error('Error fetching customers:', error);
                showModal('Gagal', 'Gagal memuat data pelanggan.');
            }
        }, [showModal]);

        const fetchPortfolioItems = useCallback(async () => {
            try {
                const token = localStorage.getItem('admin-token');
                const config = { headers: { 'x-access-token': token } };
                const response = await axios.get('http://localhost:8080/api/portfolio', config);
                setPortfolioItems(response.data);
            } catch (error) {
                console.error('Error fetching portfolio items:', error);
                showModal('Gagal', 'Gagal memuat data portfolio.');
            }
        }, [showModal]);

        const handleDelete = useCallback(async (endpoint, id, successMessage, failureMessage, refetchFunction) => {
            showModal('Konfirmasi', `Apakah Anda yakin ingin menghapus ini?`, async () => {
                try {
                    const token = localStorage.getItem('admin-token');
                    const config = { headers: { 'x-access-token': token } };
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
            if (!token) {
                return;
            }
            axios.defaults.headers.common['x-access-token'] = token;
            
            // Perbarui logika untuk mengambil data portfolio
            if (activeTab === 'posts') {
                fetchPosts();
            } else if (activeTab === 'bookings' && selectedStudio) {
                fetchBookings();
            } else if (activeTab === 'bookings-data') {
                fetchAllBookings();
                fetchPackages();
            } else if (activeTab === 'customers') {
                fetchCustomers();
            } else if (activeTab === 'packages') {
                fetchPackages();
            } else if (activeTab === 'portfolio') {
                fetchPortfolioItems();
            }
        }, [activeTab, selectedStudio, fetchPosts, fetchBookings, fetchAllBookings, fetchPackages, fetchCustomers, fetchPortfolioItems]);

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
            handleDelete,
            showModal,
            closeModal,
            handleSort,
            renderSortArrow,
            formatShortDate,
            getPackageName,
        };
    };

    export default useAdminData;