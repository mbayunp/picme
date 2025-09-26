import React, { useState, useEffect } from "react";
import axios from "axios";

function PortfolioManager({ portfolioItems, fetchPortfolioItems, showModal, handleDelete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    category: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (fetchPortfolioItems) {
      fetchPortfolioItems();
    }
  }, [fetchPortfolioItems]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return "";
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);
    try {
      const response = await axios.post("http://localhost:8080/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-access-token": localStorage.getItem("admin-token")
        },
      });
      setIsUploading(false);
      return response.data.imageUrl;
    } catch (err) {
      console.error("Gagal mengupload gambar:", err);
      setError("Gagal mengupload gambar.");
      setIsUploading(false);
      return "";
    }
  };

  const handleSavePortfolio = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const imageUrl = selectedFile ? await handleUploadImage() : form.imageUrl;
    
    if (selectedFile && !imageUrl) {
        setLoading(false);
        return;
    }

    const portfolioData = { ...form, imageUrl };

    try {
      if (editingItem) {
        await axios.put(`http://localhost:8080/api/portfolio/${editingItem.id}`, portfolioData, {
            headers: {
                "x-access-token": localStorage.getItem("admin-token")
            }
        });
        showModal("Berhasil", "Item portfolio berhasil diperbarui.");
      } else {
        await axios.post("http://localhost:8080/api/portfolio", portfolioData, {
            headers: {
                "x-access-token": localStorage.getItem("admin-token")
            }
        });
        showModal("Berhasil", "Item portfolio berhasil ditambahkan.");
      }
      
      setForm({ title: "", description: "", imageUrl: "", category: "" });
      setSelectedFile(null);
      setEditingItem(null);
      fetchPortfolioItems();
    } catch (err) {
      console.error("Gagal menyimpan portfolio:", err);
      setError(`Gagal ${editingItem ? 'memperbarui' : 'menambahkan'} item portfolio.`);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const handleDeletePortfolio = (id) => {
    handleDelete("portfolio", id, "Item portfolio berhasil dihapus.", "Gagal menghapus item portfolio.", fetchPortfolioItems);
  };
  
  const handleCancelEdit = () => {
    setEditingItem(null);
    setForm({ title: "", description: "", imageUrl: "", category: "" });
    setSelectedFile(null);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Manajemen Portfolio</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingItem ? "Edit Item Portfolio" : "Tambah Item Portfolio Baru"}</h2>
        <form onSubmit={handleSavePortfolio} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Judul Portfolio"
            value={form.title}
            onChange={handleFormChange}
            required
            className="w-full p-2 border rounded"
          />
          <textarea
            name="description"
            placeholder="Deskripsi"
            value={form.description}
            onChange={handleFormChange}
            className="w-full p-2 border rounded"
          />
          <div className="flex items-center space-x-4">
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
            {form.imageUrl && (
              <img src={`http://localhost:8080/${form.imageUrl}`} alt="Current" className="w-24 h-24 object-cover rounded" />
            )}
          </div>
          {/* PERUBAHAN DI SINI: Ganti input teks menjadi dropdown */}
          <select
            name="category"
            value={form.category}
            onChange={handleFormChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="" disabled>Pilih Kategori</option>
            <option value="Studio Picme">Studio Picme</option>
            <option value="Senandung Photography">Senandung Photography</option>
          </select>
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading || isUploading}
              className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading || isUploading ? (isUploading ? "Mengupload..." : "Menyimpan...") : editingItem ? "Simpan Perubahan" : "Tambah Portfolio"}
            </button>
            {editingItem && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-400 text-white p-2 rounded-md hover:bg-gray-500 transition"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Daftar Portfolio</h2>
        <div className="space-y-4">
          {portfolioItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <img src={`http://localhost:8080/${item.image_url}`} alt={item.title} className="w-16 h-16 object-cover rounded" />
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.kategori}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEditClick(item)}
                  className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeletePortfolio(item.id)}
                  className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PortfolioManager;