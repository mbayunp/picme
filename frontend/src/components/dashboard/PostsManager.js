import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PostsManager = ({ posts, fetchPosts, showModal, handleDelete }) => {
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentPostId, setCurrentPostId] = useState(null);

    // Fungsi untuk mereset form
    const resetForm = () => {
        setIsEditing(false);
        setCurrentPostId(null);
        setNewPost({ title: '', content: '' });
        setImageFile(null);
        setPreviewUrl('');
    };

    const handleInputChange = (e) => {
        setNewPost({ ...newPost, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            // Jika file dihapus, kembalikan ke URL gambar lama (jika ada)
            const oldPost = posts.find(p => p.id === currentPostId);
            if (oldPost) {
                setPreviewUrl(`http://localhost:8080/assets/images/${oldPost.image_url}`);
            } else {
                setPreviewUrl('');
            }
        }
    };

    const handleAddOrUpdatePost = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin-token');
            const formData = new FormData();
            formData.append('title', newPost.title);
            formData.append('content', newPost.content);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const config = {
                headers: {
                    'x-access-token': token,
                    'Content-Type': 'multipart/form-data',
                }
            };

            if (isEditing) {
                await axios.put(`http://localhost:8080/api/posts/${currentPostId}`, formData, config);
                showModal('Berhasil', 'Postingan berhasil diperbarui!');
            } else {
                if (!imageFile) {
                    showModal('Gagal', 'Silakan unggah gambar untuk postingan baru.');
                    return;
                }
                await axios.post('http://localhost:8080/api/posts', formData, config);
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
        setNewPost({ title: post.title, content: post.content });
        setPreviewUrl(`http://localhost:8080/assets/images/${post.image_url}`);
        setImageFile(null); // Penting: reset file gambar agar tidak dikirim ulang jika tidak diubah
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    return (
        <div className="p-5 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Kelola Postingan</h3>
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
                        {isEditing ? 'Perbarui Postingan' : 'Tambah Postingan'}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={handleCancelEdit} className="bg-red-600 text-white p-2 rounded-md cursor-pointer hover:bg-red-700 transition">
                            Batal
                        </button>
                    )}
                </div>
            </form>
            <div className="flex flex-col gap-4">
                {posts.map(post => (
                    <div key={post.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                        {post.image_url && (
                            <img
                                src={`http://localhost:8080/assets/images/${post.image_url}`}
                                alt={post.title}
                                className="w-24 h-24 object-cover rounded-md mr-4"
                            />
                        )}
                        <div className="flex-grow">
                            <h4 className="font-semibold">{post.title}</h4>
                            <p className="text-sm text-gray-500">{post.content.substring(0, 100)}...</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEditClick(post)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition">Edit</button>
                            <button onClick={() => handleDelete('posts', post.id, 'Postingan berhasil dihapus!', 'Gagal menghapus postingan.', fetchPosts)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition">Hapus</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PostsManager;