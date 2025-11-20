import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { FaEdit, FaTrash, FaTimesCircle, FaImage, FaVideo, FaLayerGroup } from 'react-icons/fa';

// Ambil URL API dari environment variable
const API_URL = process.env.REACT_APP_API_URL;

const PostsManager = ({ posts, fetchPosts, showModal, handleDelete }) => {
    // --- STATE ---
    const [newPost, setNewPost] = useState({ title: '', content: '', postType: 'single-image', mediaUrl: '' });
    
    // State untuk File (yang akan diupload)
    const [imageFile, setImageFile] = useState(null); // File objek (Thumbnail/Main Image)
    const [slideFiles, setSlideFiles] = useState([]); // Array File objek (Slides Baru)
    
    // State untuk Preview & Data Lama
    const [thumbnailPreview, setThumbnailPreview] = useState(''); 
    const [existingSlides, setExistingSlides] = useState([]); // Array URL String (Slides yang sudah ada di DB)
    
    const [isEditing, setIsEditing] = useState(false);
    const [currentPostId, setCurrentPostId] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    // --- HELPER FUNCTIONS ---

    // Helper untuk menampilkan thumbnail di daftar postingan
    const getThumbnail = (post) => {
        // 1. Cek apakah ada image_url utama
        if (post.image_url) {
            if (post.image_url.startsWith('http')) return post.image_url;
            return `${API_URL}/assets/images/${post.image_url}`;
        }

        // 2. Jika tipe Slides tapi tidak ada image_url utama, ambil slide pertama
        if (Array.isArray(post.media_url) && post.media_url.length > 0) {
             const firstSlide = post.media_url[0];
             return `${API_URL}/assets/images/${firstSlide}`;
        }

        // 3. Fallback
        return 'https://placehold.co/100?text=No+Img';
    };

    // Helper untuk ikon tipe postingan
    const getPostTypeIcon = (post) => {
        if (Array.isArray(post.media_url) || (typeof post.media_url === 'string' && post.media_url.includes('['))) return <FaLayerGroup title="Slides" />;
        if (post.media_url && (post.media_url.includes('youtube') || post.media_url.includes('mp4'))) return <FaVideo title="Video" />;
        return <FaImage title="Single Image" />;
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentPostId(null);
        setNewPost({ title: '', content: '', postType: 'single-image', mediaUrl: '' });
        setImageFile(null);
        setSlideFiles([]);
        setExistingSlides([]);
        setThumbnailPreview('');
        // Reset input file element
        document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
    };

    // --- HANDLERS INPUT ---

    const handleInputChange = (e) => {
        setNewPost({ ...newPost, [e.target.name]: e.target.value });
    };

    const handlePostTypeChange = (e) => {
        setNewPost({ ...newPost, postType: e.target.value, mediaUrl: '' });
        setImageFile(null);
        setSlideFiles([]);
        setThumbnailPreview('');
        setExistingSlides([]);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };
    
    const handleSlideFilesChange = (e) => {
        const files = Array.from(e.target.files);
        setSlideFiles(prev => [...prev, ...files]);
    };

    // --- HANDLERS HAPUS ITEM SLIDE (SAAT EDIT/CREATE) ---

    const handleRemoveSlideFile = (index) => {
        setSlideFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingSlide = (urlToRemove) => {
        setExistingSlides(prev => prev.filter(url => url !== urlToRemove));
    };

    // --- HANDLERS DRAG & DROP (SLIDES) ---

    // Menggabungkan slides lama dan baru untuk keperluan drag & drop view
    const combinedSlidesForView = [
        ...existingSlides.map(url => ({ type: 'existing', url, id: url })),
        ...slideFiles.map((file, index) => ({ type: 'new', url: URL.createObjectURL(file), file, id: index }))
    ];

    const handleDragStart = (e, index) => {
        e.dataTransfer.setData('slideIndex', index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e, dropIndex) => {
        const dragIndex = parseInt(e.dataTransfer.getData('slideIndex'));
        if (dragIndex === dropIndex) return;

        // Kita perlu memanipulasi array gabungan, lalu memisahkannya kembali
        const newCombined = [...combinedSlidesForView];
        const [draggedItem] = newCombined.splice(dragIndex, 1);
        newCombined.splice(dropIndex, 0, draggedItem);

        // Pisahkan kembali ke state masing-masing
        const newExisting = [];
        const newFiles = [];

        newCombined.forEach(item => {
            if (item.type === 'existing') newExisting.push(item.url);
            else newFiles.push(item.file);
        });

        setExistingSlides(newExisting);
        setSlideFiles(newFiles);
        setDragOverIndex(null);
    };

    // --- LOGIKA UTAMA: SIMPAN POST ---

    const handleAddOrUpdatePost = async (e) => {
        e.preventDefault();
        
        try {
            // 1. Upload Thumbnail (Jika ada file baru)
            let finalImageUrl = thumbnailPreview; 
            
            // Jika preview berupa blob (artinya file lokal baru), upload dulu
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
                // Upload ke endpoint umum /api/upload
                const res = await axiosInstance.post('/api/upload', formData, {
                     headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalImageUrl = res.data.imageUrl; // Simpan nama file dari server
            } else if (isEditing && thumbnailPreview.includes(API_URL)) {
                 // Jika edit dan pakai gambar lama, bersihkan URL agar hanya nama file/path relatif
                 finalImageUrl = thumbnailPreview.replace(`${API_URL}/assets/images/`, ''); 
                 finalImageUrl = finalImageUrl.replace(`${API_URL}/`, ''); 
            }

            // 2. Upload Slides (Jika ada file baru)
            let finalSlidesUrls = [...existingSlides]; // Mulai dengan slide lama yang tidak dihapus
            
            if (slideFiles.length > 0) {
                // Upload satu per satu untuk mendapatkan nama file dari server
                const uploadPromises = slideFiles.map(file => {
                    const fd = new FormData();
                    fd.append('image', file);
                    return axiosInstance.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                });
                
                const responses = await Promise.all(uploadPromises);
                const newUrls = responses.map(r => r.data.imageUrl);
                finalSlidesUrls = [...finalSlidesUrls, ...newUrls];
            }

            // 3. Susun Payload Akhir
            const payload = new FormData();
            payload.append('title', newPost.title);
            payload.append('content', newPost.content);
            payload.append('image_url', finalImageUrl || '');

            // Tentukan isi media_url berdasarkan tipe
            let mediaUrlValue = '';
            if (newPost.postType === 'slides') {
                mediaUrlValue = JSON.stringify(finalSlidesUrls);
            } else if (newPost.postType === 'video-with-thumbnail') {
                mediaUrlValue = newPost.mediaUrl;
            }
            payload.append('media_url', mediaUrlValue);

            // 4. Kirim ke Backend (Create atau Update)
            if (isEditing) {
                await axiosInstance.put(`/api/posts/${currentPostId}`, payload);
                showModal('Berhasil', 'Postingan diperbarui!');
            } else {
                await axiosInstance.post('/api/posts', payload);
                showModal('Berhasil', 'Postingan ditambahkan!');
            }

            resetForm();
            fetchPosts();

        } catch (error) {
            console.error('Error saving post:', error);
            showModal('Gagal', 'Gagal menyimpan postingan. Cek koneksi atau ukuran file.');
        }
    };

    // --- HANDLER EDIT ---

    const handleEditClick = (post) => {
        setIsEditing(true);
        setCurrentPostId(post.id);
        
        let type = 'single-image';
        let mediaUrlVal = '';
        let currentSlides = [];

        // Deteksi tipe berdasarkan isi media_url
        if (Array.isArray(post.media_url)) {
            type = 'slides';
            currentSlides = post.media_url;
        } else if (post.media_url && (post.media_url.includes('http') || post.media_url.includes('www'))) {
            type = 'video-with-thumbnail';
            mediaUrlVal = post.media_url;
        }

        setNewPost({ 
            title: post.title, 
            content: post.content, 
            postType: type, 
            mediaUrl: mediaUrlVal 
        });

        // Set Preview Thumbnail
        if (post.image_url) {
             const fullUrl = post.image_url.startsWith('http') ? post.image_url : `${API_URL}/assets/images/${post.image_url}`;
             setThumbnailPreview(fullUrl);
        } else {
             setThumbnailPreview('');
        }
        
        setExistingSlides(currentSlides);
        setImageFile(null);
        setSlideFiles([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        resetForm();
    };


    // --- RENDER UI ---

    return (
        <div className="p-5 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Postingan' : 'Tambah Postingan Baru'}</h3>
            
            {/* FORM AREA */}
            <form onSubmit={handleAddOrUpdatePost} className="flex flex-col gap-4 mb-8 bg-white p-6 rounded shadow">
                <input
                    type="text" name="title" placeholder="Judul Postingan" required
                    value={newPost.title} onChange={handleInputChange}
                    className="p-2 border rounded-md"
                />
                <textarea
                    name="content" placeholder="Isi Postingan" required rows="4"
                    value={newPost.content} onChange={handleInputChange}
                    className="p-2 border rounded-md"
                />
                
                {/* Pilihan Tipe */}
                <div className="flex gap-4">
                    {['single-image', 'slides', 'video-with-thumbnail'].map(type => (
                        <label key={type} className="inline-flex items-center cursor-pointer">
                            <input 
                                type="radio" name="postType" value={type}
                                checked={newPost.postType === type} 
                                onChange={handlePostTypeChange}
                                className="mr-2"
                            />
                            <span className="capitalize">{type.replace(/-/g, ' ')}</span>
                        </label>
                    ))}
                </div>

                {/* Input Gambar Utama (Thumbnail) */}
                {(newPost.postType === 'single-image' || newPost.postType === 'video-with-thumbnail') && (
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Gambar Utama / Thumbnail</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        {thumbnailPreview && (
                            <img src={thumbnailPreview} alt="Preview" className="mt-2 h-32 object-cover rounded border"/>
                        )}
                    </div>
                )}

                {/* Input Khusus Slides */}
                {newPost.postType === 'slides' && (
                    <div className="border p-4 rounded bg-gray-50">
                        <label className="block text-sm font-medium mb-2 text-gray-700">Gambar Slide (Drag & Drop untuk urutan)</label>
                        <input type="file" multiple accept="image/*" onChange={handleSlideFilesChange} className="block w-full mb-4 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700"/>
                        
                        {/* Area Preview & Reorder Slides */}
                        <div className="flex flex-wrap gap-2">
                            {combinedSlidesForView.map((item, index) => (
                                <div 
                                    key={index} 
                                    className={`relative w-24 h-24 rounded overflow-hidden cursor-move transition-all ${dragOverIndex === index ? 'border-2 border-blue-500 scale-105' : 'border border-gray-300'}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, index)}
                                >
                                    <img 
                                        src={item.type === 'existing' ? `${API_URL}/assets/images/${item.url}` : item.url} 
                                        alt={`Slide ${index}`} 
                                        className="w-full h-full object-cover"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => item.type === 'existing' ? handleRemoveExistingSlide(item.url) : handleRemoveSlideFile(item.id)} 
                                        className="absolute -top-1 -right-1 text-red-500 bg-white rounded-full shadow hover:text-red-700"
                                    >
                                        <FaTimesCircle />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Khusus Video */}
                {newPost.postType === 'video-with-thumbnail' && (
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">URL Video (YouTube/MP4)</label>
                        <input type="text" name="mediaUrl" value={newPost.mediaUrl} onChange={handleInputChange} placeholder="https://..." className="p-2 border rounded-md w-full"/>
                    </div>
                )}

                <div className="flex gap-2 mt-4">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        {isEditing ? 'Simpan Perubahan' : 'Simpan'}
                    </button>
                    {isEditing && <button type="button" onClick={handleCancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Batal</button>}
                </div>
            </form>

            <hr className="my-8 border-gray-300" />

            {/* DAFTAR POSTINGAN */}
            <h3 className="text-xl font-bold mb-4">Daftar Postingan ({posts.length})</h3>
            
            <div className="flex flex-col gap-4">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <div key={post.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:shadow-md transition-shadow">
                            
                            {/* Preview Gambar (Dengan Helper getThumbnail) */}
                            <div className="relative flex-shrink-0 w-full sm:w-24 h-24 bg-gray-100 rounded-md overflow-hidden border border-gray-200 group">
                                <img 
                                    src={getThumbnail(post)} 
                                    alt={post.title} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { 
                                        e.target.onerror = null; 
                                        e.target.src = 'https://placehold.co/100?text=Error'; 
                                    }}
                                />
                                <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white p-1 rounded text-xs">
                                    {getPostTypeIcon(post)}
                                </div>
                            </div>

                            {/* Konten Text */}
                            <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-lg font-bold text-gray-800 truncate">{post.title}</h4>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {post.content}
                                </p>
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 capitalize">
                                        {Array.isArray(post.media_url) ? 'Slides' : (post.media_url && post.media_url.length > 5 ? 'Video' : 'Single Image')}
                                    </span>
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                <button 
                                    onClick={() => handleEditClick(post)} 
                                    className="flex items-center justify-center gap-2 bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded text-sm hover:bg-blue-50 transition"
                                >
                                    <FaEdit /> Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete('posts', post.id, 'Postingan dihapus!', 'Gagal hapus.', fetchPosts)} 
                                    className="flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded text-sm hover:bg-red-50 transition"
                                >
                                    <FaTrash /> Hapus
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-white rounded-lg border border-gray-200 border-dashed">
                        <p className="text-gray-500">Belum ada postingan blog.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostsManager;