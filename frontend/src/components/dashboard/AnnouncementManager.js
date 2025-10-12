import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FaTimes } from 'react-icons/fa';

const AnnouncementManager = ({ showModal }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAnnouncement, setCurrentAnnouncement] = useState({
        id: null,
        gambar: '',
        isActive: true
    });
    const [imageFile, setImageFile] = useState(null);

    // ✅ PERBAIKAN: Menggunakan variabel lingkungan
    const API_URL = `${process.env.REACT_APP_API_URL}/api`;

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin-token');
            const response = await axios.get(`${API_URL}/announcements`, { headers: { 'x-access-token': token } });
            setAnnouncements(response.data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentAnnouncement(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('admin-token');
            const config = { 
                headers: { 
                    'x-access-token': token,
                    'Content-Type': 'multipart/form-data' 
                } 
            };

            const formData = new FormData();
            if (imageFile) {
                formData.append('gambar', imageFile);
            } else {
                formData.append('gambar', currentAnnouncement.gambar);
            }
            formData.append('isActive', currentAnnouncement.isActive);

            if (isEditing) {
                await axios.put(`${API_URL}/announcements/${currentAnnouncement.id}`, formData, config);
                showModal('Berhasil', 'Pengumuman berhasil diperbarui.');
            } else {
                await axios.post(`${API_URL}/announcements`, formData, config);
                showModal('Berhasil', 'Pengumuman baru berhasil ditambahkan.');
            }
            
            fetchAnnouncements();
            handleCancelEdit();
        } catch (error) {
            console.error('Error saving announcement:', error);
            showModal('Gagal', 'Gagal menyimpan pengumuman.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (announcement) => {
        setIsEditing(true);
        setCurrentAnnouncement(announcement);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setCurrentAnnouncement({ id: null, gambar: '', isActive: true });
        setImageFile(null);
    };

    const handleDeleteClick = (id) => {
        showModal('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus pengumuman ini?', async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('admin-token');
                await axios.delete(`${API_URL}/announcements/${id}`, { headers: { 'x-access-token': token } });
                showModal('Berhasil', 'Pengumuman berhasil dihapus.');
                fetchAnnouncements();
            } catch (error) {
                console.error('Error deleting announcement:', error);
                showModal('Gagal', 'Gagal menghapus pengumuman.');
            } finally {
                setLoading(false);
            }
        });
    };

    const getImageUrl = (path) => {
      if (path && path.startsWith('http')) {
        return path;
      }
      // ✅ PERBAIKAN: Menggunakan variabel lingkungan
      return `${process.env.REACT_APP_API_URL}/${path}`;
    };

    return (
        <div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col">
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Pengumuman' : 'Tambah Pengumuman Baru'}</h3>
            
            <form onSubmit={handleSave} className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Gambar Pengumuman</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                        />
                        {currentAnnouncement.gambar && (
                            <div className="mt-2">
                                {/* ✅ PERBAIKAN: Gunakan fungsi getImageUrl */}
                                <img 
                                    src={getImageUrl(currentAnnouncement.gambar)} 
                                    alt="Preview" 
                                    className="w-full h-auto max-h-48 object-contain rounded-lg border" 
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center mt-2">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={currentAnnouncement.isActive}
                                onChange={handleFormChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                Aktifkan Pengumuman
                            </label>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
                    >
                        {isEditing ? 'Simpan Perubahan' : 'Tambah Pengumuman'}
                    </button>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-500"
                        >
                            Batal
                        </button>
                    )}
                </div>
            </form>

            <h3 className="text-xl font-bold mb-4 mt-6">Daftar Pengumuman</h3>
            {loading ? (
                <div className="text-center text-gray-500">Memuat pengumuman...</div>
            ) : (
                <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Ditambahkan</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {announcements.map((announcement) => (
                                <tr key={announcement.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <img src={getImageUrl(announcement.gambar)} alt="Pengumuman" className="h-16 w-32 object-cover rounded" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {announcement.isActive ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {moment(announcement.addedDate).format('DD MMMM YYYY')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEditClick(announcement)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                                        <button onClick={() => handleDeleteClick(announcement.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AnnouncementManager;