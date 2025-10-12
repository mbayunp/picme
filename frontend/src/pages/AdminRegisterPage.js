import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ✅ PERBAIKAN: Menggunakan variabel lingkungan untuk URL API
const API_URL = process.env.REACT_APP_API_URL;

function AdminRegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // Tambahkan state untuk error
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Bersihkan pesan error sebelumnya
        try {
            // ✅ PERBAIKAN: Menggunakan variabel lingkungan
            await axios.post(`${API_URL}/api/auth/register`, { username, password });
            console.log('Akun berhasil didaftarkan! Silakan login.');
            navigate('/admin/login');
        } catch (error) {
            console.error('Registration error:', error.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.');
            // ✅ Tampilkan pesan error ke pengguna
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Pendaftaran gagal. Silakan coba lagi.');
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-sans p-4">
            <a href="/" className="absolute top-8 left-8 text-gray-600 hover:text-blue-600 transition-colors duration-300 font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Website
            </a>
            
            <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-sm">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Admin Register</h2>
                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-5 text-sm">
                        {errorMessage}
                    </div>
                )}
                <form onSubmit={handleRegister} className="flex flex-col space-y-5">
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
                        Daftar
                    </button>
                </form>
                <p className="text-center mt-6 text-sm text-gray-600">
                    Sudah punya akun? <a href="/admin/login" className="text-blue-600 hover:underline font-medium">Login di sini</a>
                </p>
            </div>
        </div>
    );
}

export default AdminRegisterPage;