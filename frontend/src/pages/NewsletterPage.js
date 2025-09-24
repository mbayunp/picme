import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function NewsletterPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/posts');
                setPosts(response.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen pt-24">
            {/* Header Utama, mengadopsi gaya dari PortfolioPage */}
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
            
            {/* Grid Postingan dengan konsep Masonry, seperti PortfolioPage */}
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
                                {post.image_url && (
                                    <img
                                        src={`http://localhost:8080/assets/images/${post.image_url}`}
                                        alt={post.title}
                                        className="w-full h-48 object-cover rounded-md flex-shrink-0"
                                    />
                                )}
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