// src/hooks/useBookings.js
import { useState, useCallback, useMemo, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import moment from 'moment';

export const useBookings = (isAuthenticated, showModal, activeTab, selectedStudio) => {
    const [bookings, setBookings] = useState([]); // Untuk Kalender
    const [bookingPagination, setBookingPagination] = useState({
        data: [], currentPage: 1, totalPages: 1, totalItems: 0,
    });
    const [sortKey, setSortKey] = useState('tanggal');
    const [sortDirection, setSortDirection] = useState('desc');

    // --- Fetch untuk Kalender ---
    const fetchBookings = useCallback(async (studioId) => {
        if (!isAuthenticated) return;
        try {
            // Asumsi: Anda punya akses ke list studios di sini atau kirim studioName langsung
            // Untuk penyederhanaan, kita fetch semua jika logika studio rumit
            const res = await axiosInstance.get('/api/services'); 
            // Implementasikan filter studio di sini atau di backend
            const data = Array.isArray(res.data) ? res.data : res.data.data || [];
            setBookings(data);
        } catch (error) {
            if (error.response?.status !== 401) console.error('Error fetching calendar:', error);
        }
    }, [isAuthenticated]);

    // --- Fetch untuk Tabel (Paginated) ---
    const fetchAllBookings = useCallback(async (page = 1) => {
        if (!isAuthenticated) return;
        try {
            const res = await axiosInstance.get(`/api/services?page=${page}&limit=10`);
            setBookingPagination(res.data);
        } catch (error) {
            if (error.response?.status !== 401) showModal('Gagal', 'Gagal memuat data booking.');
        }
    }, [isAuthenticated, showModal]);

    // --- Actions ---
    const handleConfirmBooking = useCallback(async (id, callback) => {
        if (!isAuthenticated) return showModal('Error', 'Sesi tidak valid.');
        showModal('Konfirmasi Checkout', 'Yakin konfirmasi?', async () => {
            try {
                await axiosInstance.put(`/api/services/${id}/confirm`, {});
                showModal('Berhasil', 'Dikonfirmasi!');
                if (callback) callback();
                // Refresh logic can be handled by caller or useEffects
            } catch (error) {
                if (error.response?.status !== 401) showModal('Gagal', 'Gagal konfirmasi.');
            }
        });
    }, [isAuthenticated, showModal]);

    const handleCancelBooking = useCallback(async (id, callback) => {
        if (!isAuthenticated) return;
        showModal('Konfirmasi Batal', 'Yakin batal?', async () => {
            try {
                await axiosInstance.put(`/api/services/${id}/cancel`, {});
                showModal('Berhasil', 'Dibatalkan!');
                if (callback) callback();
            } catch (error) {
                if (error.response?.status !== 401) showModal('Gagal', 'Gagal membatalkan.');
            }
        });
    }, [isAuthenticated, showModal]);

    // --- Sorting ---
    const handleBookingSort = useCallback((key) => {
        if (sortKey === key) setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        else { setSortKey(key); setSortDirection('asc'); }
    }, [sortKey]);

    const sortedBookings = useMemo(() => {
        if (!bookingPagination.data?.length) return [];
        return [...bookingPagination.data].sort((a, b) => {
            const aValue = a[sortKey], bValue = b[sortKey];
            if (aValue == bValue) return 0;
            let comparison = 0;
            if (sortKey === 'tanggal') comparison = moment(aValue).diff(moment(bValue));
            else if (typeof aValue === 'number') comparison = aValue - bValue;
            else {
                const strA = String(aValue || '').toLowerCase(), strB = String(bValue || '').toLowerCase();
                if (strA > strB) comparison = 1;
                if (strA < strB) comparison = -1;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [bookingPagination.data, sortKey, sortDirection]);

    const setBookingPage = useCallback((page) => {
        if (page > 0 && page <= bookingPagination.totalPages) fetchAllBookings(page);
    }, [fetchAllBookings, bookingPagination.totalPages]);

    return {
        bookings, // Data Kalender
        bookingData: bookingPagination,
        sortedBookings,
        fetchBookings,
        fetchAllBookings,
        handleConfirmBooking,
        handleCancelBooking,
        setBookingPage,
        handleBookingSort,
        bookingSortKey: sortKey,
        bookingSortDirection: sortDirection,
        // Export pagination detail
        bookingCurrentPage: bookingPagination.currentPage,
        bookingTotalPages: bookingPagination.totalPages,
    };
};