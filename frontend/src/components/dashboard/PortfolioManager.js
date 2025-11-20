import React, { useState, useEffect } from "react";
// Gunakan axiosInstance agar token otomatis ter-handle
import axiosInstance from "../../api/axiosInstance"; 
import { FaEdit, FaTrash, FaPlus, FaImage, FaTimes } from "react-icons/fa";

// Ambil URL API dari environment variable
const API_URL = process.env.REACT_APP_API_URL;

function PortfolioManager({ portfolioItems, fetchPortfolioItems, showModal, handleDelete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State Form
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    category: "Studio Picme" // Default category
  });
  
  // State File Upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Reset form saat komponen dimuat atau mode edit dibatalkan
  const resetForm = () => {
    setForm({ title: "", description: "", imageUrl: "", category: "Studio Picme" });
    setSelectedFile(null);
    setPreviewUrl("");
    setEditingItem(null);
    setError(null);
    // Reset input file element
    const fileInput = document.getElementById('portfolio-image');
    if (fileInput) fileInput.value = '';
  };

  useEffect(() => {
    if (fetchPortfolioItems) {
      fetchPortfolioItems();
    }
  }, [fetchPortfolioItems]);

  // Handlers
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSavePortfolio = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
        let finalImageUrl = form.imageUrl;

        // 1. Upload Gambar jika ada file baru
        if (selectedFile) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("image", selectedFile);
            
            // Gunakan axiosInstance
            const uploadRes = await axiosInstance.post('/api/upload', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            finalImageUrl = uploadRes.data.imageUrl;
            setIsUploading(false);
        }

        // Validasi gambar wajib
        if (!finalImageUrl) {
            setLoading(false);
            setIsUploading(false);
            setError("Gambar wajib diunggah.");
            return;
        }

        const portfolioData = { ...form, imageUrl: finalImageUrl };

        // 2. Simpan Data Portfolio
        if (editingItem) {
            await axiosInstance.put(`/api/portfolio/${editingItem.id}`, portfolioData);
            showModal("Berhasil", "Item portfolio berhasil diperbarui.");
        } else {
            await axiosInstance.post('/api/portfolio', portfolioData);
            showModal("Berhasil", "Item portfolio berhasil ditambahkan.");
        }
        
        resetForm();
        fetchPortfolioItems();
    } catch (err) {
        console.error("Gagal menyimpan portfolio:", err);
        setError(err.response?.data?.message || "Gagal menyimpan data.");
        setIsUploading(false);
    } finally {
        setLoading(false);
    }
  };
  
  const handleEditClick = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description,
      imageUrl: item.image_url,
      category: item.kategori,
    });
    // Set preview dari URL yang ada
    if (item.image_url) {
        setPreviewUrl(`${API_URL}/${item.image_url}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const handleDeletePortfolio = (id) => {
    handleDelete("portfolio", id, "Item portfolio berhasil dihapus.", "Gagal menghapus item portfolio.", fetchPortfolioItems);
  };

  // Helper untuk menampilkan gambar dengan fallback
  const getImageUrl = (path) => {
      if (!path) return 'https://placehold.co/300x200?text=No+Image';
      if (path.startsWith('http')) return path;
      return `${API_URL}/${path}`;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-full rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Portfolio</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola galeri dan showcase karya studio Anda.</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700"><FaTimes /></button>
        </div>
      )}
      
      {/* FORM INPUT */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
        <h2 className="text-lg font-bold mb-4 flex items-center text-gray-700 border-b pb-2">
            {editingItem ? <><FaEdit className="mr-2"/> Edit Portfolio</> : <><FaPlus className="mr-2"/> Tambah Portfolio Baru</>}
        </h2>
        
        <form onSubmit={handleSavePortfolio} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom Kiri: Input Teks */}
          <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Contoh: Wedding Budi & Ani"
                    value={form.title}
                    onChange={handleFormChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="Studio Picme">Studio Picme</option>
                    <option value="Senandung Photography">Senandung Photography</option>
                    {/* Tambahkan kategori lain jika perlu */}
                  </select>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    name="description"
                    placeholder="Deskripsi singkat tentang foto ini..."
                    value={form.description}
                    onChange={handleFormChange}
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
              </div>
          </div>

          {/* Kolom Kanan: Upload Gambar */}
          <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Portfolio</label>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition bg-gray-50 h-full relative group">
                  <div className="space-y-1 text-center">
                      {previewUrl ? (
                          <div className="relative">
                              <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded shadow-sm object-contain" />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition flex items-center justify-center">
                                  {/* Overlay effect */}
                              </div>
                          </div>
                      ) : (
                          <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                      )}
                      
                      <div className="flex text-sm text-gray-600 justify-center mt-4">
                        <label htmlFor="portfolio-image" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload file</span>
                          <input id="portfolio-image" name="image" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                        </label>
                        <p className="pl-1">atau drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
              </div>
          </div>

          {/* Tombol Aksi (Full Width di Bawah) */}
          <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t mt-2">
            {editingItem && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={loading || isUploading}
              className={`px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                ${loading || isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading || isUploading ? (
                  <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Menyimpan...
                  </span>
              ) : editingItem ? "Simpan Perubahan" : "Tambah Portfolio"}
            </button>
          </div>
        </form>
      </div>

      {/* LIST PORTFOLIO (GRID CARD) */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Galeri Portfolio ({portfolioItems.length})</h2>
        
        {portfolioItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
                <FaImage className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">Belum ada item portfolio.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {portfolioItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 flex flex-col group">
                {/* Image Area */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img 
                        src={getImageUrl(item.image_url)} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x200?text=Error'; }}
                    />
                    <div className="absolute top-2 right-2">
                        <span className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                            {item.kategori}
                        </span>
                    </div>
                </div>
                
                {/* Content Area */}
                <div className="p-4 flex-grow">
                    <h3 className="font-bold text-gray-800 mb-1 line-clamp-1" title={item.title}>{item.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 h-10">{item.description || "Tidak ada deskripsi."}</p>
                </div>
                
                {/* Action Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400">ID: {item.id}</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleEditClick(item)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"
                            title="Edit"
                        >
                            <FaEdit />
                        </button>
                        <button 
                            onClick={() => handleDeletePortfolio(item.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
                            title="Hapus"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
}

export default PortfolioManager;