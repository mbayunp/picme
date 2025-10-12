import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// ✅ PERBAIKAN: Tambahkan variabel lingkungan untuk URL API
const API_URL = process.env.REACT_APP_API_URL;

function NewsletterPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // ✅ PERBAIKAN: Menggunakan variabel lingkungan
                const response = await axios.get(`${API_URL}/api/posts`);
                setPosts(response.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const getThumbnailUrl = (post) => {
        if (post.image_url) {
            // ✅ PERBAIKAN: Menggunakan variabel lingkungan
            return `${API_URL}/assets/images/${post.image_url}`;
        }
        
        if (Array.isArray(post.media_url) && post.media_url.length > 0) {
            // ✅ PERBAIKAN: Menggunakan variabel lingkungan
            return `${API_URL}/assets/images/${post.media_url[0]}`;
        }
        
        return 'https://placehold.co/800x600/D1D5DB/1F2937?text=No+Image';
    };

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen pt-24">
            <div className="max-w-screen-xl mx-auto px-5 mb-16">
                <h1 className="text-6xl md:text-7xl font-light leading-none">
                    <span className="font-bold">Our latest</span> Stories & News
                </h1>
                <div className="mt-8 flex items-center space-x-2 text-sm text-gray-500 uppercase tracking-widest">
                    <span>Read Our Blog</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </div>
            
            <div className="max-w-screen-xl mx-auto px-5">
                {loading ? (
                    <div className="text-center text-gray-500">Memuat postingan...</div>
                ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map(post => (
                            <Link
                                key={post.id}
                                to={`/blog/${post.id}`}
                                className="block h-full p-3 transform transition duration-300 hover:-translate-y-1 hover:shadow-2xl bg-white rounded-lg flex flex-col"
                            >
                                <img
                                    src={getThumbnailUrl(post)}
                                    alt={post.title}
                                    className="w-full h-48 object-cover rounded-md flex-shrink-0"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600/D1D5DB/1F2937?text=No+Image"; }}
                                />
                                <div className="mt-4 flex flex-col flex-grow">
                                    <h3 className="mt-2 text-xl font-medium">{post.title}</h3>
                                    <p className="text-sm text-gray-700 mt-2 flex-grow">
                                        {post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content}
                                    </p>
                                    <div className="mt-4">
                                        <span className="block text-gray-500 text-xs">
                                            {new Date(post.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                        <span className="mt-2 inline-block text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200">
                                            Baca Selengkapnya
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="col-span-full text-center text-gray-500">Belum ada postingan yang tersedia.</p>
                )}
            </div>
        </div>
    );
}

export default NewsletterPage;