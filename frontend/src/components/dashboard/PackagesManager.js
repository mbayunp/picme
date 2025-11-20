// src/components/dashboard/PackagesManager.jsx
import React, { useState, useMemo } from 'react';
import axiosInstance from '../../api/axiosInstance'; // ✅ Pakai instance baru

// Ambil URL API dari env
const API_URL = process.env.REACT_APP_API_URL;

const PackagesManager = ({ packages, fetchPackages, showModal, handleDelete }) => {
    // --- STATE ---
    const [newPackage, setNewPackage] = useState({
        nama_paket: '',
        harga: '',
        deskripsi_paket: '',
        studio_name: '',
        is_active: true,
        waktu_durasi: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentPackageId, setCurrentPackageId] = useState(null);
    const [selectedStudio, setSelectedStudio] = useState('All');

    // Daftar Studio (Hardcoded atau bisa dari props)
    const studios = [
        { name: "All", label: "Semua Studio" },
        { name: "Picme Photo Studio 1", label: "Picme Photo Studio 1" },
        { name: "Picme Photo Studio 2", label: "Picme Photo Studio 2" },
        { name: "Picme Photo Studio 3", label: "Picme Photo Studio 3" },
        { name: "Picme Photo Studio 4", label: "Picme Photo Studio 4" },
    ];

    // --- HELPER FUNCTIONS ---
    const resetForm = () => {
        setIsEditing(false);
        setCurrentPackageId(null);
        setNewPackage({
            nama_paket: '', harga: '', deskripsi_paket: '', studio_name: '',
            is_active: true, waktu_durasi: '',
        });
        setImageFile(null);
        setPreviewUrl('');
        const fileInput = document.getElementById('image-upload');
        if (fileInput) fileInput.value = '';
    };

    const formatPrice = (price) => {
        const num = Number(price);
        return isNaN(num) ? '0' : new Intl.NumberFormat('id-ID').format(num);
    };

    // --- HANDLERS ---
    const handlePackageInputChange = (e) => {
        const { name, value } = e.target;
        setNewPackage(prev => ({ ...prev, [name]: value }));
    };

    const handlePackageCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setNewPackage(prev => ({ ...prev, [name]: checked }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // --- LOGIKA SIMPAN DATA (ROBUST UTK DEPLOY) ---
    const handleAddOrUpdatePackage = async (e) => {
        e.preventDefault();
        
        try {
            let imageUrlToSave = '';

            // 1. Upload Gambar (Jika ada file baru)
            if (imageFile) {
                console.log('Mengupload gambar baru...');
                const uploadFormData = new FormData();
                uploadFormData.append('image', imageFile);
                
                // Upload ke endpoint khusus gambar
                const uploadRes = await axiosInstance.post('/api/upload', uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (uploadRes.data && uploadRes.data.imageUrl) {
                    imageUrlToSave = uploadRes.data.imageUrl;
                } else {
                    throw new Error("Gagal mendapatkan URL gambar dari server.");
                }
            } else if (isEditing) {
                // Jika edit tanpa ganti gambar, cari gambar lama
                const oldPackage = packages.find(p => p.id === currentPackageId);
                imageUrlToSave = oldPackage?.image_url || '';
            } else {
                return showModal('Gagal', 'Wajib upload gambar untuk paket baru.');
            }

            // 2. Susun Data Paket (FormData untuk text fields)
            const finalFormData = new FormData();
            finalFormData.append('nama_paket', newPackage.nama_paket);
            finalFormData.append('harga', newPackage.harga);
            finalFormData.append('deskripsi_paket', newPackage.deskripsi_paket || '');
            finalFormData.append('studio_name', newPackage.studio_name);
            // Kirim '1' atau '0' untuk status
            finalFormData.append('is_active', newPackage.is_active ? '1' : '0');
            // Kirim durasi jika ada
            if (newPackage.waktu_durasi) {
                finalFormData.append('waktu_durasi', newPackage.waktu_durasi);
            }
            // Masukkan URL gambar final
            finalFormData.append('image_url', imageUrlToSave);

            // 3. Kirim ke Backend
            if (isEditing) {
                await axiosInstance.put(`/api/packages/${currentPackageId}`, finalFormData);
                showModal('Berhasil', 'Paket berhasil diperbarui!');
            } else {
                await axiosInstance.post('/api/packages', finalFormData);
                showModal('Berhasil', 'Paket berhasil ditambahkan!');
            }

            resetForm();
            if (fetchPackages) fetchPackages();

        } catch (error) {
            console.error('Error saving package:', error);
            const msg = error.response?.data?.message || error.message || 'Terjadi kesalahan sistem.';
            showModal('Gagal', msg);
        }
    };

    const handleEditPackageClick = (pkg) => {
        setIsEditing(true);
        setCurrentPackageId(pkg.id);
        setNewPackage({
            nama_paket: pkg.nama_paket,
            harga: pkg.harga,
            deskripsi_paket: pkg.deskripsi_paket,
            studio_name: pkg.studio_name,
            is_active: (pkg.is_active === 1 || pkg.is_active === true),
            waktu_durasi: pkg.waktu_durasi || '',
        });
        
        if (pkg.image_url) {
             // Pastikan URL valid
             setPreviewUrl(`${API_URL}/${pkg.image_url}`);
        } else {
             setPreviewUrl('');
        }
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggleStatus = async (pkg) => {
        const currentStatus = (pkg.is_active === 1 || pkg.is_active === true);
        const newStatus = !currentStatus;

        try {
            await axiosInstance.patch(`/api/packages/${pkg.id}/status`, { is_active: newStatus });
            showModal('Berhasil', `Paket berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`);
            if (fetchPackages) fetchPackages();
        } catch (error) {
            console.error("Error toggling status:", error);
            showModal('Gagal', 'Gagal mengubah status paket.');
        }
    };

    // --- LOGIKA PENGELOMPOKAN (GROUPING) ---
    const groupedPackages = useMemo(() => {
        if (!Array.isArray(packages)) return {};
        
        // 1. Jika filter studio aktif (bukan 'All'), kembalikan satu grup saja
        if (selectedStudio !== 'All') {
            const filtered = packages.filter(pkg => pkg.studio_name === selectedStudio);
            return { [selectedStudio]: filtered };
        }

        // 2. Jika 'All', kelompokkan berdasarkan nama studio
        const groups = packages.reduce((acc, pkg) => {
            const studioName = pkg.studio_name || 'Tanpa Studio';
            if (!acc[studioName]) {
                acc[studioName] = [];
            }
            acc[studioName].push(pkg);
            return acc;
        }, {});

        // 3. Urutkan kunci (Nama Studio)
        const sortedKeys = Object.keys(groups).sort((a, b) => a.localeCompare(b));
        
        const sortedGroups = {};
        sortedKeys.forEach(key => {
            sortedGroups[key] = groups[key];
        });

        return sortedGroups;
    }, [packages, selectedStudio]);

    // Hitung total paket yang tampil
    const totalPackagesCount = Object.values(groupedPackages).flat().length;

    // --- RENDER ---
    return (
        <div className="p-5 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Paket' : 'Tambah Paket Baru'}</h3>
            
            {/* FORM INPUT */}
            <form onSubmit={handleAddOrUpdatePackage} className="flex flex-col gap-4 mb-8 bg-white p-6 rounded-lg shadow">
                <input type="text" name="nama_paket" placeholder="Nama Paket" value={newPackage.nama_paket} onChange={handlePackageInputChange} required className="p-2 border rounded-md" />
                
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" name="harga" placeholder="Harga (Rp)" value={newPackage.harga} onChange={handlePackageInputChange} required className="p-2 border rounded-md" />
                    <input type="number" name="waktu_durasi" placeholder="Durasi (Menit)" value={newPackage.waktu_durasi} onChange={handlePackageInputChange} className="p-2 border rounded-md" />
                </div>

                <textarea name="deskripsi_paket" placeholder="Deskripsi" value={newPackage.deskripsi_paket} onChange={handlePackageInputChange} required rows="3" className="p-2 border rounded-md" />
                
                <select name="studio_name" value={newPackage.studio_name} onChange={handlePackageInputChange} required className="p-2 border rounded-md bg-white">
                    <option value="" disabled>Pilih Studio</option>
                    {studios.filter(s => s.name !== 'All').map(s => <option key={s.name} value={s.name}>{s.label}</option>)}
                </select>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Gambar Paket</label>
                    <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" id="is_active" name="is_active" checked={newPackage.is_active} onChange={handlePackageCheckboxChange} className="w-4 h-4" />
                    <label htmlFor="is_active" className="text-sm">Paket Aktif?</label>
                </div>

                {previewUrl && (
                    <div className="w-32 h-32 border rounded overflow-hidden bg-gray-100">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="flex gap-2 mt-2">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        {isEditing ? 'Simpan Perubahan' : 'Tambah Paket'}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                            Batal
                        </button>
                    )}
                </div>
            </form>

            {/* DAFTAR PAKET (TERKELOMPOK) */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-bold">Daftar Paket ({totalPackagesCount})</h4>
                    <select value={selectedStudio} onChange={(e) => setSelectedStudio(e.target.value)} className="p-2 border rounded-md bg-white text-sm">
                        {studios.map(s => <option key={s.name} value={s.name}>{s.label}</option>)}
                    </select>
                </div>

                {/* Loop Group (Per Studio) */}
                {totalPackagesCount > 0 ? (
                    Object.entries(groupedPackages).map(([studioName, pkgList]) => (
                        <div key={studioName} className="mb-8 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                            
                            {/* Header Folder Studio (Hanya jika view All) */}
                            {selectedStudio === 'All' && (
                                <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                                    <h5 className="font-semibold text-blue-800">{studioName} ({pkgList.length})</h5>
                                </div>
                            )}

                            <div className="divide-y divide-gray-100">
                                {pkgList.map(pkg => (
                                    <div key={pkg.id} className={`p-4 flex flex-col md:flex-row items-start md:items-center gap-4 ${pkg.is_active ? '' : 'bg-gray-50 opacity-75'}`}>
                                        
                                        {/* Gambar */}
                                        <div className="flex-shrink-0 w-full md:w-24 h-24 bg-gray-200 rounded overflow-hidden border border-gray-200">
                                            <img 
                                                src={pkg.image_url ? `${API_URL}/${pkg.image_url}` : 'https://placehold.co/100?text=No+Img'} 
                                                alt={pkg.nama_paket} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>

                                        {/* Info Paket */}
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h5 className="text-lg font-bold text-gray-800 truncate">{pkg.nama_paket}</h5>
                                                <span className={`text-xs px-2 py-0.5 rounded font-medium ${pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 font-semibold mb-1">Rp {formatPrice(pkg.harga)}</p>
                                            <div className="text-sm text-gray-500 flex flex-col gap-0.5">
                                                <span>Durasi: {pkg.waktu_durasi ? `${pkg.waktu_durasi} Menit` : '-'}</span>
                                                <span className="line-clamp-1 text-gray-400">{pkg.deskripsi_paket}</span>
                                            </div>
                                        </div>

                                        {/* Tombol Aksi */}
                                        <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
                                            <button onClick={() => handleEditPackageClick(pkg)} className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded text-sm transition">
                                                Edit
                                            </button>
                                            <button onClick={() => handleToggleStatus(pkg)} className={`px-3 py-1.5 rounded text-sm border transition ${pkg.is_active ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}>
                                                {pkg.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete('packages', pkg.id, 'Paket dihapus!', 'Gagal hapus.', fetchPackages)} 
                                                className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded text-sm transition"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-500 text-lg">Tidak ada paket ditemukan untuk filter ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackagesManager;