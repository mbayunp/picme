// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin-token'));
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', action: null });

    const showModal = useCallback((title, message, action = null) => {
        setModalInfo({ show: true, title, message, action });
    }, []);

    const closeModal = useCallback(() => {
        setModalInfo({ show: false, title: '', message: '', action: null });
    }, []);

    useEffect(() => {
        const checkAuth = () => setIsAuthenticated(!!localStorage.getItem('admin-token'));
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    return { isAuthenticated, modalInfo, showModal, closeModal };
};