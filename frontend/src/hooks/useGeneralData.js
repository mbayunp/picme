// src/hooks/useGeneralData.js
import { useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import moment from 'moment';

export const useGeneralData = (isAuthenticated, showModal) => {
    const [posts, setPosts] = useState([]);
    const [packages, setPackages] = useState([]);
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [contactMessages, setContactMessages] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    
    // State Studios
    const [studios] = useState([
        { id: '1', name: 'Picme Photo Studio 1' },
        { id: '2', name: 'Picme Photo Studio 2' },
        { id: '3', name: 'Picme Photo Studio 3' },
        { id: '4', name: 'Picme Photo Studio 4' },
    ]);

    // --- 1. Fetch Posts (Perbaikan Utama di sini) ---
    const fetchPosts = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            // Pastikan endpoint ini sesuai dengan backend Anda (biasanya /api/posts)
            const res = await axiosInstance.get('/api/posts'); 
            
            // Pastikan data yang disimpan adalah array
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setPosts(data);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error("Error fetching posts:", error);
                showModal('Error', 'Gagal memuat data postingan.');
            }
        }
    }, [isAuthenticated, showModal]);

    // --- 2. Fetch Packages ---
    const fetchPackages = useCallback(async () => { 
        if (!isAuthenticated) return;
        try {
            const res = await axiosInstance.get(`/api/packages`);
            setPackages(res.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error("Error fetching packages:", error);
            }
        }
    }, [isAuthenticated]);
    
    // --- 3. Fetch Portfolio (Dilengkapi juga) ---
    const fetchPortfolioItems = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const res = await axiosInstance.get('/api/portfolio');
            setPortfolioItems(res.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error fetching portfolio items:', error);
                showModal('Gagal', 'Gagal memuat data portfolio.');
            }
        }
    }, [isAuthenticated, showModal]);

    // --- 4. Fetch Contact Messages ---
    const fetchContactMessages = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const res = await axiosInstance.get(`/api/contact`);
            setContactMessages(res.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error fetching contact messages:', error);
            }
        }
    }, [isAuthenticated]);

const fetchDashboardData = useCallback(async (studioId = '') => {
        if (!isAuthenticated) return;
        try {
            // Ambil data sejak 7 hari lalu
            const startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
            
            // PENTING: Jangan pakai pagination (limit), ambil semua agar kalkulasi akurat
            let url = `/api/services?startDate=${startDate}&limit=1000`; 
            
            // Jika studioId ada (bukan string kosong 'All' atau ''), baru tambahkan filter
            // Pastikan logika ini benar: studioId harus valid ID atau Name
            if (studioId && studioId !== 'All') {
                const studio = studios.find(s => String(s.id) === String(studioId));
                if (studio) url += `&studio_name=${encodeURIComponent(studio.name)}`;
            }

            console.log("Fetching URL:", url); // Debugging: Cek URL di Console browser

            const res = await axiosInstance.get(url);
            // Handle response struktur (bisa array langsung atau objek dengan properti data)
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            
            // Set data ke state dashboardData (yang nanti dipakai Beranda sebagai 'bookings')
            setDashboardData({ recentActivities: data }); 

        } catch (error) {
             if (error.response?.status !== 401) showModal('Gagal', 'Gagal load dashboard.');
        }
    }, [isAuthenticated, showModal, studios]);
    
    // --- 6. Handle Delete (Global) ---
    const handleDelete = useCallback(async (endpoint, id, successMsg, failMsg, refetch) => {
        if (!isAuthenticated) return showModal('Error', 'Sesi tidak valid');
        showModal('Konfirmasi Hapus', 'Yakin hapus?', async () => {
             try {
                 await axiosInstance.delete(`/api/${endpoint}/${id}`);
                 showModal('Berhasil', successMsg);
                 if (refetch) refetch();
             } catch (e) {
                 showModal('Gagal', failMsg);
             }
        });
    }, [isAuthenticated, showModal]);

    return {
        posts, packages, portfolioItems, contactMessages, studios, dashboardData,
        fetchPosts, fetchPackages, fetchPortfolioItems, fetchContactMessages, fetchDashboardData,
        handleDelete
    };
};