import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const API_URL = "http://localhost:8080/api";

const MediaCarousel = ({ mediaUrls, title }) => {
    const [index, setIndex] = useState(0);

    const nextSlide = () => setIndex((index + 1) % mediaUrls.length);
    const prevSlide = () => setIndex((index - 1 + mediaUrls.length) % mediaUrls.length);

    if (mediaUrls.length === 0) return null;
    const mediaCount = mediaUrls.length;

    return (
        <div className="relative w-full aspect-video rounded-lg shadow-xl mb-8">
            <div className="relative w-full h-full overflow-hidden">
                <div 
                    className="flex transition-transform duration-500 ease-in-out h-full" 
                    style={{ transform: `translateX(-${index * 100 / mediaCount}%)`, width: `${mediaCount * 100}%` }}
                >
                    {mediaUrls.map((url, i) => (
                        <div key={i} className="flex-shrink-0 w-full h-full" style={{ width: `${100 / mediaCount}%` }}>
                            <img
                                src={url.startsWith('http') ? url : `http://localhost:8080/assets/images/${url}`}
                                alt={`${title} Slide ${i + 1}`}
                                className="w-full h-full object-contain"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600/D1D5DB/1F2937?text=Gambar+Gagal+Dimuat"; }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            
            {mediaUrls.length > 1 && (
                <>
                    <button onClick={prevSlide} className="absolute left-2 md:left-4 top-1/2 z-10 p-2 md:p-3 bg-black/50 text-white rounded-full transform -translate-y-1/2 hover:bg-black/70">
                        <FaChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button onClick={nextSlide} className="absolute right-2 md:right-4 top-1/2 z-10 p-2 md:p-3 bg-black/50 text-white rounded-full transform -translate-y-1/2 hover:bg-black/70">
                        <FaChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <div className="absolute bottom-2 md:bottom-3 left-0 right-0 flex justify-center space-x-1 md:space-x-2">
                        {mediaUrls.map((_, i) => (
                            <div key={i} className={`size-1 md:size-2 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-gray-400'}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const VideoEmbed = ({ url }) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('v=') ? url.split('v=').pop().split('&')[0] : url.split('/').pop();
        return (
            <div className="relative w-full aspect-video mb-8 rounded-lg shadow-xl">
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
        <video controls className="w-full h-auto mb-8 rounded-lg shadow-xl" style={{ maxHeight: '60vh' }}>
            <source src={url} type="video/mp4" />
            Browser Anda tidak mendukung tag video.
        </video>
    );
};

function PostDetailPage() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                if (!id) {
                    setError('ID postingan tidak valid.');
                    setLoading(false);
                    return;
                }
                const response = await axios.get(`${API_URL}/posts/${id}`);
                setPost(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching post:", err);
                if (err.response && err.response.status === 404) {
                    setError('Postingan tidak ditemukan.');
                } else {
                    setError('Gagal memuat postingan. Silakan coba lagi nanti.');
                }
                setPost(null);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    const renderMedia = (post) => {
        if (post.media_url) {
            if (Array.isArray(post.media_url) && post.media_url.length > 0) {
                const imageUrls = post.media_url.map(url => url.startsWith('http') ? url : `http://localhost:8080/assets/images/${url}`);
                return <MediaCarousel mediaUrls={imageUrls} title={post.title} />;
            }
            else if (typeof post.media_url === 'string' && post.media_url.trim()) {
                if (post.media_url.includes('youtube.com') || post.media_url.includes('youtu.be') || post.media_url.includes('.mp4')) {
                    return <VideoEmbed url={post.media_url} />;
                }
                return (
                    <img
                        src={post.media_url.startsWith('http') ? post.media_url : `http://localhost:8080/assets/images/${post.media_url}`}
                        alt={post.title}
                        className="w-full h-auto object-contain rounded-lg shadow-lg mb-8"
                    />
                );
            }
        } 
        else if (post.image_url) {
            const imageUrl = `http://localhost:8080/assets/images/${post.image_url}`;
            if (imageUrl.includes('youtube.com') || imageUrl.includes('youtu.be') || imageUrl.includes('.mp4')) {
                return <VideoEmbed url={imageUrl} />;
            }
            return (
                <img
                    src={imageUrl}
                    alt={post.title}
                    className="w-full h-auto object-contain rounded-lg shadow-lg mb-8"
                />
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <p className="text-xl text-gray-500">Memuat postingan...</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <p className="text-xl text-red-500">{error || "Postingan tidak ditemukan."}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-5 py-8">
                <button
                    onClick={() => window.history.back()}
                    className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                    ← Kembali
                </button>
                <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
                    {post.title}
                </h1>
                <div className="text-xs md:text-sm text-gray-500 mb-8">
                    Diposting pada{" "}
                    {new Date(post.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                
                {renderMedia(post)}
                
                <div className="text-base md:text-lg leading-relaxed text-gray-800">
                    <p>{post.content}</p>
                </div>
            </div>
        </div>
    );
}

export default PostDetailPage;