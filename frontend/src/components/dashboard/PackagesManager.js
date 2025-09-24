import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PackagesManager = ({ packages, fetchPackages, showModal, handleDelete }) => {
    const [newPackage, setNewPackage] = useState({ nama_paket: '', harga: '', deskripsi_paket: '', studio_name: '' });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentPackageId, setCurrentPackageId] = useState(null);
    const [selectedStudio, setSelectedStudio] = useState('All'); // State baru untuk filter studio

    const studios = [
        { name: "All", label: "Semua Studio" },
        { name: "Picme Photo Studio 1", label: "Picme Photo Studio 1" },
        { name: "Picme Photo Studio 2", label: "Picme Photo Studio 2" },
        { name: "Picme Photo Studio 3", label: "Picme Photo Studio 3" },
        { name: "Picme Photo Studio 4", label: "Picme Photo Studio 4" },
    ];

    // Fungsi untuk membersihkan state form
    const resetForm = () => {
        setIsEditing(false);
        setCurrentPackageId(null);
        setNewPackage({ nama_paket: '', harga: '', deskripsi_paket: '', studio_name: '' });
        setImageFile(null);
        setPreviewUrl('');
    };

    const handlePackageInputChange = (e) => {
        setNewPackage({ ...newPackage, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            const oldPackage = packages.find(p => p.id === currentPackageId);
            if (oldPackage) {
                setPreviewUrl(`http://localhost:8080/assets/images/${oldPackage.image_url}`);
            } else {
                setPreviewUrl('');
            }
        }
    };

    const handleAddOrUpdatePackage = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin-token');
            const formData = new FormData();
            formData.append('nama_paket', newPackage.nama_paket);
            formData.append('harga', newPackage.harga);
            formData.append('deskripsi_paket', newPackage.deskripsi_paket);
            formData.append('studio_name', newPackage.studio_name); // Tambahkan studio_name ke formData

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const config = {
                headers: {
                    'x-access-token': token,
                    'Content-Type': 'multipart/form-data',
                },
            };

            if (isEditing) {
                await axios.put(`http://localhost:8080/api/packages/${currentPackageId}`, formData, config);
                showModal('Berhasil', 'Paket berhasil diperbarui!');
            } else {
                if (!imageFile) {
                    showModal('Gagal', 'Silakan unggah gambar untuk paket baru.');
                    return;
                }
                await axios.post('http://localhost:8080/api/packages', formData, config);
                showModal('Berhasil', 'Paket berhasil ditambahkan!');
            }

            resetForm();
            fetchPackages();
        } catch (error) {
            console.error('Error adding/updating package:', error);
            showModal('Gagal', `Gagal ${isEditing ? 'memperbarui' : 'menambahkan'} paket.`);
        }
    };

    const handleEditPackageClick = (pkg) => {
        setIsEditing(true);
        setCurrentPackageId(pkg.id);
        setNewPackage({
            nama_paket: pkg.nama_paket,
            harga: pkg.harga,
            deskripsi_paket: pkg.deskripsi_paket,
            studio_name: pkg.studio_name // Pastikan studio_name terisi saat edit
        });
        
        setPreviewUrl(`http://localhost:8080/assets/images/${pkg.image_url}`);
        setImageFile(null); 
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    const filteredPackages = selectedStudio === 'All'
        ? packages
        : packages.filter(pkg => pkg.studio_name === selectedStudio);
    
    // Perbaikan agar harga tetap diformat saat form diedit
    const formatPrice = (price) => {
        return price ? price.toLocaleString('id-ID') : '';
    };

    return (
        <div className="p-5 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Paket' : 'Tambah Paket Baru'}</h3>
            <form onSubmit={handleAddOrUpdatePackage} className="flex flex-col gap-4 mb-8">
                <input
                    type="text"
                    name="nama_paket"
                    placeholder="Nama Paket"
                    value={newPackage.nama_paket}
                    onChange={handlePackageInputChange}
                    required
                    className="p-2 border border-gray-300 rounded-md"
                />
                <input
                    type="number"
                    name="harga"
                    placeholder="Harga"
                    value={newPackage.harga}
                    onChange={handlePackageInputChange}
                    required
                    className="p-2 border border-gray-300 rounded-md"
                />
                <textarea
                    name="deskripsi_paket"
                    placeholder="Deskripsi Paket"
                    value={newPackage.deskripsi_paket}
                    onChange={handlePackageInputChange}
                    required
                    className="p-2 border border-gray-300 rounded-md"
                />
                <select
                    name="studio_name"
                    value={newPackage.studio_name}
                    onChange={handlePackageInputChange}
                    required
                    className="p-2 border border-gray-300 rounded-md"
                >
                    <option value="" disabled>Pilih Studio</option>
                    {studios.filter(s => s.name !== 'All').map(studio => (
                        <option key={studio.name} value={studio.name}>{studio.label}</option>
                    ))}
                </select>
                <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    className="p-2 border border-gray-300 rounded-md"
                />
                {previewUrl && (
                    <div className="w-36 h-36 border border-gray-300 rounded-lg overflow-hidden">
                        <img src={previewUrl} alt="Pratinjau Gambar" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="flex gap-2">
                    <button type="submit" className="bg-green-600 text-white p-2 rounded-md cursor-pointer hover:bg-green-700 transition">
                        {isEditing ? 'Perbarui Paket' : 'Tambah Paket'}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={handleCancelEdit} className="bg-red-600 text-white p-2 rounded-md cursor-pointer hover:bg-red-700 transition">
                            Batal
                        </button>
                    )}
                </div>
            </form>

            <div className="mt-8">
                <h4 className="text-lg font-bold mb-3">Daftar Paket</h4>
                <div className="flex items-center gap-4 mb-4">
                    <label htmlFor="studio-filter" className="font-medium text-gray-700">Filter berdasarkan Studio:</label>
                    <select
                        id="studio-filter"
                        value={selectedStudio}
                        onChange={(e) => setSelectedStudio(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md"
                    >
                        {studios.map(studio => (
                            <option key={studio.name} value={studio.name}>{studio.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-4">
                    {filteredPackages.map(pkg => (
                        <div key={pkg.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                            {pkg.image_url && (
                                <img
                                    src={`http://localhost:8080/assets/images/${pkg.image_url}`}
                                    alt={pkg.nama_paket}
                                    className="w-24 h-24 object-cover rounded-md mr-4"
                                />
                            )}
                            <div className="flex-grow">
                                <h4 className="font-semibold">{pkg.nama_paket}</h4>
                                <p className="text-sm text-gray-500">Rp {pkg.harga.toLocaleString('id-ID')}</p>
                                <p className="text-xs text-gray-400 mt-1">Studio: {pkg.studio_name}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEditPackageClick(pkg)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition">Edit</button>
                                <button onClick={() => handleDelete('packages', pkg.id, 'Paket berhasil dihapus!', 'Gagal menghapus paket.', fetchPackages)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition">Hapus</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PackagesManager;