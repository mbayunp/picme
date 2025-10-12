import React, { useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaTimesCircle } from 'react-icons/fa';

// Helper untuk merender video (diperlukan untuk preview)
const VideoEmbed = ({ url }) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('v=') ? url.split('v=').pop().split('&')[0] : url.split('/').pop();
        return (
            <div className="relative w-full h-full">
                <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded YouTube Video"
                ></iframe>
            </div>
        );
    }
    return (
        <video controls className="w-full h-full">
            <source src={url} type="video/mp4" />
            Browser Anda tidak mendukung tag video.
        </video>
    );
};

// ✅ Tambahkan variabel lingkungan untuk URL API
const API_URL = process.env.REACT_APP_API_URL;

const PostsManager = ({ posts, fetchPosts, showModal, handleDelete }) => {
    const [newPost, setNewPost] = useState({ title: '', content: '', postType: 'single-image', mediaUrl: '' });
    const [imageFile, setImageFile] = useState(null);
    const [slideFiles, setSlideFiles] = useState([]);
    const [existingSlides, setExistingSlides] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPostId, setCurrentPostId] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    // Menggabungkan semua URL untuk pratinjau di satu tempat
    const combinedPreviewUrls = [
        ...existingSlides.map(url => `${API_URL}/assets/images/${url}`), // ✅ PERBAIKAN
        ...slideFiles.map(file => URL.createObjectURL(file))
    ];

    const resetForm = () => {
        setIsEditing(false);
        setCurrentPostId(null);
        setNewPost({ title: '', content: '', postType: 'single-image', mediaUrl: '' });
        setImageFile(null);
        setSlideFiles([]);
        setExistingSlides([]);
    };

    const handleInputChange = (e) => {
        setNewPost({ ...newPost, [e.target.name]: e.target.value });
    };

    const handlePostTypeChange = (e) => {
        setNewPost({ ...newPost, postType: e.target.value, mediaUrl: '' });
        setImageFile(null);
        setSlideFiles([]);
        setExistingSlides([]);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
    };
    
    const handleSlideFilesChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setSlideFiles(prevFiles => [...prevFiles, ...newFiles]);
    };
    
    const isVideoOrUrl = (url) => {
        return url.includes('http') || url.includes('www') || url.includes('.mp4');
    };

    const handleAddOrUpdatePost = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin-token');
            const formData = new FormData();
            formData.append('title', newPost.title);
            formData.append('content', newPost.content);
            
            if (newPost.postType === 'single-image') {
                if (imageFile) {
                    formData.append('image', imageFile);
                }
            } else if (newPost.postType === 'video-with-thumbnail') {
                if (imageFile) {
                    formData.append('image', imageFile);
                }
                if (newPost.mediaUrl) {
                    formData.append('media_url', newPost.mediaUrl);
                }
            } else if (newPost.postType === 'slides') {
                slideFiles.forEach(file => {
                    formData.append('slides', file); 
                });
                formData.append('existing_slides', JSON.stringify(existingSlides));
            }

            const config = {
                headers: {
                    'x-access-token': token,
                    'Content-Type': 'multipart/form-data',
                }
            };

            if (!isEditing) {
                if ((newPost.postType === 'single-image' || newPost.postType === 'video-with-thumbnail') && !imageFile) {
                    showModal('Gagal', 'Silakan unggah gambar utama atau thumbnail.');
                    return;
                }
                if (newPost.postType === 'slides' && (slideFiles.length === 0 && existingSlides.length === 0)) {
                    showModal('Gagal', 'Silakan unggah gambar untuk slide.');
                    return;
                }
                if (newPost.postType === 'video-with-thumbnail' && !newPost.mediaUrl) {
                    showModal('Gagal', 'Silakan masukkan URL video.');
                    return;
                }
            }

            if (isEditing) {
                // ✅ PERBAIKAN: Menggunakan variabel lingkungan
                await axios.put(`${API_URL}/api/posts/${currentPostId}`, formData, config);
                showModal('Berhasil', 'Postingan berhasil diperbarui!');
            } else {
                // ✅ PERBAIKAN: Menggunakan variabel lingkungan
                await axios.post(`${API_URL}/api/posts`, formData, config);
                showModal('Berhasil', 'Postingan berhasil ditambahkan!');
            }

            resetForm();
            fetchPosts();
        } catch (error) {
            console.error('Error adding/updating post:', error);
            showModal('Gagal', `Gagal ${isEditing ? 'memperbarui' : 'menambahkan'} postingan.`);
        }
    };

    const handleEditClick = (post) => {
        setIsEditing(true);
        setCurrentPostId(post.id);
        
        let postType = 'single-image';
        let mediaUrlDisplay = '';
        let existingSlidesArray = [];

        if (post.media_url) {
            if (Array.isArray(post.media_url)) {
                postType = 'slides';
                existingSlidesArray = post.media_url;
            } else if (isVideoOrUrl(post.media_url)) {
                postType = 'video-with-thumbnail';
                mediaUrlDisplay = post.media_url;
            }
        }
        
        setNewPost({ 
            title: post.title, 
            content: post.content,
            postType: postType,
            mediaUrl: mediaUrlDisplay
        });
        
        setExistingSlides(existingSlidesArray);
        setImageFile(null);
        setSlideFiles([]);
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    const handleRemoveSlide = (index) => {
        if (index < existingSlides.length) {
            setExistingSlides(prev => prev.filter((_, i) => i !== index));
        } else {
            setSlideFiles(prev => prev.filter((_, i) => i !== (index - existingSlides.length)));
        }
    };

    const handleDragStart = (e, index) => {
        e.dataTransfer.setData('slideIndex', index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragLeave = (e) => {
        setDragOverIndex(null);
    };

    const handleDrop = (e, dropIndex) => {
        const dragIndex = parseInt(e.dataTransfer.getData('slideIndex'));
        const combinedSlides = [...existingSlides, ...slideFiles];

        if (dragIndex < 0 || dragIndex >= combinedSlides.length || dropIndex < 0 || dropIndex >= combinedSlides.length) {
            return;
        }

        const [draggedItem] = combinedSlides.splice(dragIndex, 1);
        combinedSlides.splice(dropIndex, 0, draggedItem);
        
        const newExistingSlides = [];
        const newSlideFiles = [];

        combinedSlides.forEach(item => {
            if (typeof item === 'string') {
                newExistingSlides.push(item);
            } else {
                newSlideFiles.push(item);
            }
        });

        setExistingSlides(newExistingSlides);
        setSlideFiles(newSlideFiles);
        setDragOverIndex(null);
    };

    return (
        <div className="p-5 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Postingan' : 'Tambah Postingan Baru'}</h3>
            <form onSubmit={handleAddOrUpdatePost} className="flex flex-col gap-4 mb-8">
                <input
                    type="text"
                    name="title"
                    placeholder="Judul Postingan"
                    value={newPost.title}
                    onChange={handleInputChange}
                    required
                    className="p-2 border border-gray-300 rounded-md"
                />
                <textarea
                    name="content"
                    placeholder="Isi Postingan"
                    value={newPost.content}
                    onChange={handleInputChange}
                    required
                    className="p-2 border border-gray-300 rounded-md"
                />
                
                <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center">
                        <input type="radio" name="postType" value="single-image" checked={newPost.postType === 'single-image'} onChange={handlePostTypeChange} />
                        <span className="ml-2">Gambar Saja</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input type="radio" name="postType" value="slides" checked={newPost.postType === 'slides'} onChange={handlePostTypeChange} />
                        <span className="ml-2">Gambar Slide</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input type="radio" name="postType" value="video-with-thumbnail" checked={newPost.postType === 'video-with-thumbnail'} onChange={handlePostTypeChange} />
                        <span className="ml-2">Video + Thumbnail</span>
                    </label>
                </div>

                {(newPost.postType === 'single-image' || newPost.postType === 'video-with-thumbnail') && (
                    <>
                        <label className="block text-sm font-medium text-gray-700">Unggah Gambar Utama/Thumbnail</label>
                        <input type="file" name="image" onChange={handleImageChange} className="p-2 border border-gray-300 rounded-md" />
                    </>
                )}
                
                {newPost.postType === 'slides' && (
                    <>
                        <label className="block text-sm font-medium text-gray-700">Unggah Gambar Slide (Bisa pilih lebih dari satu)</label>
                        <input type="file" name="slides" multiple onChange={handleSlideFilesChange} className="p-2 border border-gray-300 rounded-md" />
                    </>
                )}

                {newPost.postType === 'video-with-thumbnail' && (
                    <>
                        <label className="block text-sm font-medium text-gray-700">URL Video</label>
                        <input
                            type="text"
                            name="mediaUrl"
                            placeholder="Contoh: https://youtu.be/videoID"
                            value={newPost.mediaUrl}
                            onChange={handleInputChange}
                            className="p-2 border border-gray-300 rounded-md"
                        />
                    </>
                )}
                
                {newPost.postType === 'slides' && combinedPreviewUrls.length > 0 && (
                    <div 
                        className="p-4 border border-gray-300 rounded-md"
                        onDragLeave={handleDragLeave}
                    >
                        <label className="block text-sm font-medium text-gray-700 mb-2">Atur Urutan Gambar (Drag & Drop)</label>
                        <div className="flex flex-wrap gap-2">
                            {combinedPreviewUrls.map((url, index) => (
                                <div 
                                    key={url + index} 
                                    className={`w-24 h-24 relative overflow-hidden rounded-md cursor-grab transition-all duration-200 
                                        ${dragOverIndex === index 
                                            ? 'border-2 border-blue-500 scale-105' 
                                            : 'border border-gray-300'
                                        }`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={(e) => handleDrop(e, index)}
                                >
                                    <img src={url} alt={`Pratinjau ${index}`} className="w-full h-full object-cover" />
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveSlide(index)}
                                        className="absolute top-1 right-1 text-red-500 hover:text-red-700 bg-white rounded-full"
                                    >
                                        <FaTimesCircle />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {newPost.postType !== 'slides' && imageFile && (
                    <div className="w-full h-48 border border-gray-300 rounded-lg overflow-hidden relative">
                        <img src={URL.createObjectURL(imageFile)} alt="Pratinjau Gambar" className="w-full h-full object-cover" />
                    </div>
                )}
                
                <div className="flex gap-2">
                    <button type="submit" className="bg-green-600 text-white p-2 rounded-md cursor-pointer hover:bg-green-700 transition">
                        {isEditing ? 'Perbarui Postingan' : 'Tambah Postingan'}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={handleCancelEdit} className="bg-red-600 text-white p-2 rounded-md cursor-pointer hover:bg-red-700 transition">
                            Batal
                        </button>
                    )}
                </div>
            </form>

            <hr className="my-6" />

            <h3 className="text-xl font-bold mb-4">Daftar Postingan</h3>
            <div className="flex flex-col gap-4">
                {posts.map(post => (
                    <div key={post.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between flex-wrap gap-4">
                        {post.image_url && (
                            // ✅ PERBAIKAN: Menggunakan variabel lingkungan
                            <img
                                src={`${API_URL}/assets/images/${post.image_url}`}
                                alt={post.title}
                                className="w-20 h-20 object-cover rounded-md"
                            />
                        )}
                        <div className="flex-grow">
                            <h4 className="font-semibold">{post.title}</h4>
                            <p className="text-sm text-gray-500">{post.content.substring(0, 100)}...</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => handleEditClick(post)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition text-sm">
                                <FaEdit className="inline mr-1" /> Edit
                            </button>
                            <button onClick={() => handleDelete('posts', post.id, 'Postingan berhasil dihapus!', 'Gagal menghapus postingan.', fetchPosts)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-sm">
                                <FaTrash className="inline mr-1" /> Hapus
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PostsManager;