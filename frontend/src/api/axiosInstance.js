// src/api/axiosInstance.js
import axios from 'axios';
    const API_URL = process.env.REACT_APP_API_URL;

    const axiosInstance = axios.create({
    baseURL: API_URL,
    });

    axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin-token');
        if (token) {
    config.headers['x-access-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
    );

    axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
    console.error("Sesi tidak valid atau telah berakhir. Melakukan logout...");

    localStorage.removeItem('admin-token');

    window.location.href = '/admin/login'; 

    }

    return Promise.reject(error);
    }
    );

    export default axiosInstance;