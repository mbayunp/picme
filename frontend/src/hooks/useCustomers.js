// src/hooks/useCustomers.js
// import { useState, useCallback, useMemo, useEffect } from 'react'; // Baris Asli
import { useState, useCallback, useMemo } from 'react'; // ✅ PERBAIKAN: Hapus 'useEffect'
import axiosInstance from '../api/axiosInstance';
import moment from 'moment';

export const useCustomers = (isAuthenticated, showModal, activeTab) => {
    const [customerPagination, setCustomerPagination] = useState({
        data: [], currentPage: 1, totalPages: 1, totalItems: 0,
    });
    const [customerDetail, setCustomerDetail] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const [duplicateRecords, setDuplicateRecords] = useState([]);
    const [sortKey, setSortKey] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');

    // --- Fetch Customers ---
    const fetchCustomers = useCallback(async (page = 1, search = '') => {
        if (!isAuthenticated) return;
        try {
            const res = await axiosInstance.get(`/api/services/customers?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
            setCustomerPagination(res.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error fetching customers:', error);
                showModal('Gagal', 'Gagal memuat data pelanggan.');
            }
        }
    }, [isAuthenticated, showModal]);

    // --- Fetch Customer Detail ---
    const fetchCustomerDetail = useCallback(async (nomor_whatsapp) => {
        if (!isAuthenticated || !nomor_whatsapp) return;
        try {
            const res = await axiosInstance.get(`/api/services/customer/${nomor_whatsapp}`);
            setCustomerDetail(res.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error fetching customer detail:', error);
                setCustomerDetail(null);
            }
        }
    }, [isAuthenticated]);

    // --- Duplicate & Merge ---
    const fetchDuplicateRecords = useCallback(async (nomor_whatsapp) => {
        if (!isAuthenticated || !nomor_whatsapp) return;
        try {
            const res = await axiosInstance.get(`/api/services/customers/duplicates/${nomor_whatsapp}`);
            setDuplicateRecords(res.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error fetching duplicates:', error);
                setDuplicateRecords([]);
            }
        }
    }, [isAuthenticated]);

    const mergeCustomer = useCallback(async (masterId, duplicateIds) => {
        if (!isAuthenticated) return showModal('Error', 'Sesi tidak valid.');
        showModal('Konfirmasi Gabung', `Yakin ingin gabungkan data?`, async () => {
            try {
                await axiosInstance.post(`/api/services/customers/merge-single`, { masterId, duplicateIds });
                showModal('Berhasil', 'Data pelanggan berhasil digabungkan.');
                fetchCustomers(1, searchQuery);
                setDuplicateRecords([]);
            } catch (error) {
                if (error.response?.status !== 401) showModal('Gagal', 'Gagal menggabungkan data.');
            }
        });
    }, [isAuthenticated, showModal, fetchCustomers, searchQuery]);

    // --- Sorting ---
    const handleCustomerSort = useCallback((key) => {
        if (sortKey === key) setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        else { setSortKey(key); setSortDirection('asc'); }
    }, [sortKey]);

    const sortedCustomers = useMemo(() => {
        if (!customerPagination.data?.length) return [];
        return [...customerPagination.data].sort((a, b) => {
            const aValue = a[sortKey], bValue = b[sortKey];
            
            // ✅ PERBAIKAN: Mengganti '==' menjadi '===' (Baris 83)
            if (aValue === bValue) return 0; 

            let comparison = 0;
            if (sortKey === 'last_visit_date') comparison = moment(aValue).diff(moment(bValue));
            else if (typeof aValue === 'number') comparison = (aValue || 0) - (bValue || 0);
            else {
                const strA = String(aValue || '').toLowerCase(), strB = String(bValue || '').toLowerCase();
                if (strA > strB) comparison = 1;
                if (strA < strB) comparison = -1;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [customerPagination.data, sortKey, sortDirection]);

    const setCustomerPage = useCallback((page) => {
        if (page > 0 && page <= customerPagination.totalPages) fetchCustomers(page, searchQuery);
    }, [fetchCustomers, customerPagination.totalPages, searchQuery]);

    return {
        customersData: customerPagination,
        sortedCustomers,
        customerDetail,
        fetchCustomers,
        fetchCustomerDetail,
        fetchDuplicateRecords,
        duplicateRecords,
        mergeCustomer,
        searchQuery, setSearchQuery,
        selectedTag, setSelectedTag,
        setPage: setCustomerPage,
        handleSort: handleCustomerSort,
        sortKey, sortDirection,
        currentPage: customerPagination.currentPage,
        totalPages: customerPagination.totalPages,
        totalItems: customerPagination.totalItems,
    };
};