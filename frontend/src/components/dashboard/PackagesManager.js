import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios'; // Atau ganti dengan axiosInstance jika sudah Anda buat

const API_URL = process.env.REACT_APP_API_URL;

const PackagesManager = ({ packages, fetchPackages, showModal, handleDelete }) => {
    const [newPackage, setNewPackage] = useState({
        nama_paket: '',
        harga: '',
        deskripsi_paket: '',
        studio_name: '',
        is_active: true,
        waktu_durasi: '', // State awal durasi kosong (opsional)
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentPackageId, setCurrentPackageId] = useState(null);
    const [selectedStudio, setSelectedStudio] = useState('All'); // State untuk filter

    const studios = [
        { name: "All", label: "Semua Studio" },
        { name: "Picme Photo Studio 1", label: "Picme Photo Studio 1" },
        { name: "Picme Photo Studio 2", label: "Picme Photo Studio 2" },
        { name: "Picme Photo Studio 3", label: "Picme Photo Studio 3" },
        { name: "Picme Photo Studio 4", label: "Picme Photo Studio 4" },
    ];

    // --- Fungsi Form ---
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
        } else {
            const oldPackage = packages.find(p => p.id === currentPackageId);
            if (isEditing && oldPackage?.image_url) {
                setPreviewUrl(`${API_URL}/${oldPackage.image_url}`);
            } else {
                setPreviewUrl('');
            }
        }
    };
    const handleAddOrUpdatePackage = async (e) => {
        e.preventDefault();
        console.log('handleAddOrUpdatePackage triggered...');
        try {
            const token = localStorage.getItem('admin-token');
            if (!token) {
                console.error("Token admin tidak ditemukan.");
                showModal('Gagal', 'Sesi Anda tidak valid. Silakan login kembali.');
                return;
            }

            const finalFormData = new FormData();
            let imageUrl = null;

            console.log('Current package state:', newPackage);
            console.log('Image file selected:', imageFile);

            if (imageFile) {
                console.log('Uploading new image...');
                const uploadFormData = new FormData();
                uploadFormData.append('image', imageFile);
                const uploadConfig = { headers: { 'Content-Type': 'multipart/form-data', 'x-access-token': token } };
                // Ganti axios.post dengan axiosInstance.post jika Anda menggunakan instance
                const uploadRes = await axios.post(`${API_URL}/api/upload`, uploadFormData, uploadConfig);
                if (!uploadRes.data?.imageUrl) {
                    console.error('Upload Error: imageUrl not found in response', uploadRes.data);
                    showModal('Gagal Upload', 'Gagal mendapatkan URL gambar setelah upload.');
                    return;
                }
                imageUrl = uploadRes.data.imageUrl;
                console.log('Image uploaded, URL:', imageUrl);
            } else {
                console.log('No new image file selected.');
            }

            console.log('Appending form data...');
            finalFormData.append('nama_paket', newPackage.nama_paket);
            finalFormData.append('harga', Number(newPackage.harga));
            finalFormData.append('deskripsi_paket', newPackage.deskripsi_paket);
            finalFormData.append('studio_name', newPackage.studio_name);
            finalFormData.append('is_active', newPackage.is_active);
            finalFormData.append('waktu_durasi', newPackage.waktu_durasi); // Kirim string kosong jika tidak diisi
            console.log('Appended waktu_durasi:', newPackage.waktu_durasi);

            if (imageUrl) {
                finalFormData.append('image_url', imageUrl);
                console.log('Appended new image URL:', imageUrl);
            } else if (isEditing) {
                const oldPackage = packages.find(p => p.id === currentPackageId);
                if (oldPackage?.image_url) {
                    finalFormData.append('image_url', oldPackage.image_url);
                    console.log('Appended old image URL:', oldPackage.image_url);
                } else {
                    console.warn("Editing package without an old or new image URL.");
                    finalFormData.append('image_url', ''); // Kirim string kosong jika backend butuh
                }
            } else if (!isEditing && !imageFile) { // Validasi gambar wajib untuk paket baru
                console.log('Validation failed: Image is required for new package.');
                showModal('Gagal', 'Silakan unggah gambar untuk paket baru.');
                return;
            }

            const packageConfig = { headers: { 'x-access-token': token } };

            console.log('Data being sent (FormData entries):');
            for (let pair of finalFormData.entries()) { console.log(pair[0]+ ': '+ pair[1]); }

            if (isEditing) {
                console.log('Sending PUT request to update package:', currentPackageId);
                // Ganti axios.put dengan axiosInstance.put jika pakai instance
                await axios.put(`${API_URL}/api/packages/${currentPackageId}`, finalFormData, packageConfig);
                showModal('Berhasil', 'Paket berhasil diperbarui!');
            } else {
                if (!finalFormData.has('image_url')) {
                    console.log('Validation failed: image_url missing in FormData before POST.');
                    showModal('Gagal', 'URL gambar tidak siap untuk dikirim. Coba lagi.');
                    return;
                }
                console.log('Sending POST request to add new package...');
                // Ganti axios.post dengan axiosInstance.post jika pakai instance
                await axios.post(`${API_URL}/api/packages`, finalFormData, packageConfig);
                showModal('Berhasil', 'Paket berhasil ditambahkan!');
            }

            console.log('Package added/updated successfully. Resetting form...');
            resetForm();
            fetchPackages();
        } catch (error) {
            console.error('Error in handleAddOrUpdatePackage:', error.response?.data || error.message || error);
            const errorMessage = error.response?.data?.message || `Gagal ${isEditing ? 'memperbarui' : 'menambahkan'} paket.`;
            showModal('Gagal', `${errorMessage}. Coba periksa semua input.`);
        }
    };
    const handleEditPackageClick = (pkg) => {
        setIsEditing(true);
        setCurrentPackageId(pkg.id);
        setNewPackage({
            nama_paket: pkg.nama_paket || '',
            harga: pkg.harga || '',
            deskripsi_paket: pkg.deskripsi_paket || '',
            studio_name: pkg.studio_name || '',
            is_active: pkg.is_active === 1 || pkg.is_active === true,
            waktu_durasi: pkg.waktu_durasi ? String(pkg.waktu_durasi) : '',
        });
        if (pkg.image_url) setPreviewUrl(`${API_URL}/${pkg.image_url}`);
        else setPreviewUrl('');
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleCancelEdit = () => { resetForm(); };
    
    // ===============================================
    // ⭐️ Perbaikan Toggle Status (Sudah Benar)
    // ===============================================
    const handleToggleStatus = async (pkg) => {
        const currentIsActive = pkg.is_active === 1 || pkg.is_active === true;
        const newStatus = !currentIsActive; // Toggle boolean
        const actionText = newStatus ? 'mengaktifkan' : 'menonaktifkan';
        try {
            const token = localStorage.getItem('admin-token');
            const config = { headers: { 'x-access-token': token } };
            
            // ✅ Menggunakan .patch sesuai backend
            await axios.patch(`${API_URL}/api/packages/${pkg.id}/status`, { is_active: newStatus }, config);
            
            showModal('Berhasil', `Paket berhasil di${actionText}.`);
            fetchPackages();
        } catch (error) {
            console.error(`Error ${actionText} package:`, error);
            showModal('Gagal', `Gagal ${actionText} paket.`);
        }
    };

    // ===============================================
    // ⭐️ LOGIKA PENGELOMPOKAN PAKET BARU
    // ===============================================
    const groupedPackages = useMemo(() => {
        if (!Array.isArray(packages)) return {};
        
        let filtered = packages;
        
        // 1. Filter data berdasarkan studio yang dipilih
        if (selectedStudio !== 'All') {
            filtered = packages.filter(pkg => pkg.studio_name === selectedStudio);
        }

        // 2. Jika filter aktif (bukan 'All'), tidak perlu dikelompokkan
        if (selectedStudio !== 'All') {
            return { [selectedStudio]: filtered };
        }

        // 3. Jika 'All' dipilih, kelompokkan berdasarkan studio_name
        const groups = filtered.reduce((acc, pkg) => {
            const studioName = pkg.studio_name || 'Tanpa Studio'; // Fallback jika studio_name NULL
            
            // Inisialisasi array jika studio baru
            if (!acc[studioName]) {
                acc[studioName] = [];
            }
            
            acc[studioName].push(pkg);
            return acc;
        }, {});

        // 4. Urutkan kelompok studio berdasarkan nama (Picme Photo Studio 1, 2, 3, 4, dll.)
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            if (a === 'Tanpa Studio') return 1; // Selalu pindahkan 'Tanpa Studio' ke akhir
            if (b === 'Tanpa Studio') return -1;
            return a.localeCompare(b);
        });

        const sortedGroups = {};
        sortedKeys.forEach(key => {
            // Urutkan paket dalam setiap kelompok berdasarkan nama paket
            groups[key].sort((a, b) => (a.nama_paket || '').localeCompare(b.nama_paket || ''));
            sortedGroups[key] = groups[key];
        });

        return sortedGroups;

    }, [packages, selectedStudio]);


    // Format harga
    const formatPrice = (price) => {
        const numPrice = Number(price);
        return !isNaN(numPrice) ? numPrice.toLocaleString('id-ID') : '0';
    };

    const allPackageCount = packages.length;
    const currentFilteredCount = Object.values(groupedPackages).flat().length;


    return (
        <div className="p-5 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Paket' : 'Tambah Paket Baru'}</h3>
            
            {/* --- FORM TAMBAH/EDIT --- */}
            <form onSubmit={handleAddOrUpdatePackage} className="flex flex-col gap-4 mb-8 bg-white p-6 rounded-lg shadow">
                {/* Input Nama Paket */}
                <input type="text" name="nama_paket" placeholder="Nama Paket" value={newPackage.nama_paket} onChange={handlePackageInputChange} required className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                {/* Input Harga */}
                <input type="number" name="harga" placeholder="Harga (contoh: 50000)" value={newPackage.harga} onChange={handlePackageInputChange} required min="0" className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                {/* Input Durasi */}
                <input
                    type="number"
                    name="waktu_durasi"
                    placeholder="Durasi (menit, 1-30, kosongkan jika tidak ada)"
                    value={newPackage.waktu_durasi}
                    onChange={handlePackageInputChange}
                    min="1" // Browser validation: min 1 jika diisi
                    max="30" // Browser validation: max 30
                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {/* Input Deskripsi */}
                <textarea name="deskripsi_paket" placeholder="Deskripsi Paket" value={newPackage.deskripsi_paket} onChange={handlePackageInputChange} required rows="3" className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                {/* Select Studio */}
                <select name="studio_name" value={newPackage.studio_name} onChange={handlePackageInputChange} required className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white" >
                    <option value="" disabled>Pilih Studio</option>
                    {studios.filter(s => s.name !== 'All').map(studio => (<option key={studio.name} value={studio.name}>{studio.label}</option>))}
                </select>
                {/* Input File Gambar */}
                <div>
                    <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1"> Gambar Paket {isEditing ? '(Kosongkan jika tidak ingin ganti)' : '(Wajib diisi)'} </label>
                    <input id="image-upload" type="file" name="image" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} className="p-2 border border-gray-300 rounded-md w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
                {/* Checkbox Status Aktif */}
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="is_active" name="is_active" checked={newPackage.is_active} onChange={handlePackageCheckboxChange} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700"> Paket Aktif (Bisa dipesan customer) </label>
                </div>
                {/* Preview Gambar */}
                {previewUrl && ( <div className="w-36 h-36 border border-gray-300 rounded-lg overflow-hidden bg-gray-100"> <img src={previewUrl} alt="Pratinjau Gambar" className="w-full h-full object-cover" /> </div> )}
                {/* Tombol Aksi Form */}
                <div className="flex gap-2 mt-2">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-700 transition duration-200"> {isEditing ? 'Perbarui Paket' : 'Tambah Paket'} </button>
                    {isEditing && ( <button type="button" onClick={handleCancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-gray-600 transition duration-200"> Batal </button> )}
                </div>
            </form>
            
            {/* --- DAFTAR PAKET --- */}
            <div className="mt-8">
                <h4 className="text-lg font-bold mb-3">Daftar Paket ({currentFilteredCount} dari {allPackageCount})</h4>
                
                {/* Filter Studio */}
                <div className="flex items-center gap-4 mb-4">
                    <label htmlFor="studio-filter" className="font-medium text-gray-700 text-sm">Filter Studio:</label>
                    <select id="studio-filter" value={selectedStudio} onChange={(e) => setSelectedStudio(e.target.value)} className="p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-blue-500 focus:border-blue-500" >
                        {studios.map(studio => (<option key={studio.name} value={studio.name}>{studio.label}</option>))}
                    </select>
                </div>
                
                {/* List Paket (Tampilan Folder/Grup) */}
                <div className="flex flex-col gap-6">
                    {currentFilteredCount > 0 ? (
                        // Map melalui KELOMPOK STUDIO
                        Object.entries(groupedPackages).map(([studioName, pkgList]) => (
                            <div key={studioName} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                
                                {/* Header Folder Studio */}
                                {selectedStudio === 'All' && (
                                    <div className="bg-blue-50 p-3 font-semibold text-blue-800 border-b border-blue-200 flex justify-between items-center">
                                        <span>{studioName} ({pkgList.length} Paket)</span>
                                    </div>
                                )}
                                
                                {/* Item Paket dalam Folder */}
                                <div className="flex flex-col gap-0">
                                    {pkgList.map(pkg => (
                                        <div 
                                            key={pkg.id} 
                                            className={`p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-opacity duration-300 ${!(pkg.is_active === 1 || pkg.is_active === true) ? 'opacity-50 bg-gray-50' : ''} ${selectedStudio === 'All' ? 'border-b border-gray-100' : ''}`}
                                        >
                                            {/* Gambar & Info */}
                                            <div className="flex items-center gap-4 flex-grow w-full md:w-auto">
                                                {pkg.image_url && ( <img src={`${API_URL}/${pkg.image_url}`} alt={pkg.nama_paket} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-md flex-shrink-0 bg-gray-200" onError={(e) => { e.target.style.display = 'none'; }} /> )}
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap"> 
                                                        <h4 className="font-semibold text-base md:text-lg">{pkg.nama_paket}</h4> 
                                                        {/* Badge Status */} 
                                                        {(pkg.is_active === 1 || pkg.is_active === true) ? (<span className="text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-800">Aktif</span>) : (<span className="text-xs font-medium px-2 py-0.5 rounded bg-red-100 text-red-800">Nonaktif</span>)}
                                                    </div>
                                                    <p className="text-sm text-gray-700 font-medium">Rp {formatPrice(pkg.harga)}</p>
                                                    <p className="text-sm text-gray-500">Durasi: {pkg.waktu_durasi ? `${pkg.waktu_durasi} menit` : '-'}</p>
                                                    
                                                    {/* Tampilkan Studio hanya saat difilter 'All' */}
                                                    {selectedStudio !== 'All' && (
                                                         <p className="text-xs text-gray-400 mt-1">Studio: {pkg.studio_name}</p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Tombol Aksi Paket */}
                                            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end flex-shrink-0">
                                                <button onClick={() => handleEditPackageClick(pkg)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition text-xs sm:text-sm">Edit</button>
                                                <button onClick={() => handleToggleStatus(pkg)} className={`text-white px-3 py-1 rounded-md transition text-xs sm:text-sm ${(pkg.is_active === 1 || pkg.is_active === true) ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}>
                                                    {(pkg.is_active === 1 || pkg.is_active === true) ? 'Nonaktifkan' : 'Aktifkan'}
                                                </button>
                                                <button onClick={() => handleDelete('packages', pkg.id, 'Paket berhasil dihapus!', 'Gagal menghapus paket.', fetchPackages)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition text-xs sm:text-sm">Hapus</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : ( 
                        <p className="text-center text-gray-500 py-4">Tidak ada paket yang cocok dengan filter.</p> 
                    )}
                </div>
            </div>
        </div>
    );
};

export default PackagesManager;