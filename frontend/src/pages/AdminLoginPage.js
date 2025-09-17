import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Perbaiki URL endpoint agar sesuai dengan backend
            const response = await axios.post('http://localhost:8080/api/auth/login', { username, password });
            const token = response.data.token;
            localStorage.setItem('admin-token', token);
            navigate('/admin');
        } catch (error) {
            // Mengganti alert dengan cara yang lebih ramah pengguna
            // Anda bisa menggunakan state untuk menampilkan pesan error di UI
            console.error('Login error:', error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-sans p-4">
            {/* Tombol kembali ke website, diposisikan di kiri atas */}
            <a href="/" className="absolute top-8 left-8 text-gray-600 hover:text-blue-600 transition-colors duration-300 font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Website
            </a>
            
            {/* Card form login */}
            <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-sm">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Admin Login</h2>
                <form onSubmit={handleLogin} className="flex flex-col space-y-5">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    />
                    <button
                        type="submit"
                        className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        Login
                    </button>
                </form>
                <p className="text-center mt-6 text-sm text-gray-600">
                    Belum punya akun? <a href="/admin/register" className="text-blue-600 hover:underline font-medium">Daftar di sini</a>
                </p>
            </div>
        </div>
    );
}

export default AdminLoginPage;
