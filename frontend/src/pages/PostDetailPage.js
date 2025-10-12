import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// ✅ PERBAIKAN: Tambahkan variabel lingkungan untuk URL API
const API_URL = process.env.REACT_APP_API_URL;

const MediaCarousel = ({ mediaUrls, title }) => {
    const [index, setIndex] = useState(0);

    const nextSlide = () => setIndex((prevIndex) => (prevIndex + 1) % mediaUrls.length);
    const prevSlide = () => setIndex((prevIndex) => (prevIndex - 1 + mediaUrls.length) % mediaUrls.length);

    useEffect(() => {
        setIndex(0);
    }, [mediaUrls]);

    if (!mediaUrls || mediaUrls.length === 0) return null;

    return (
        <div className="relative w-full aspect-video rounded-lg shadow-xl mb-8">
            <div className="relative w-full h-full overflow-hidden rounded-lg">
                <div 
                    className="flex transition-transform duration-500 ease-in-out h-full" 
                    style={{ transform: `translateX(-${index * 100}%)` }}
                >
                    {mediaUrls.map((url, i) => (
                        <div key={i} className="flex-shrink-0 w-full h-full">
                            <img
                                // ✅ PERBAIKAN: Menggunakan variabel lingkungan
                                src={url.startsWith('http') ? url : `${API_URL}/assets/images/${url}`}
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
                    <button onClick={prevSlide} className="absolute left-2 md:left-4 top-1/2 z-10 p-2 md:p-3 bg-black/50 text-white rounded-full transform -translate-y-1/2 hover:bg-black/70 transition-opacity duration-300">
                        <FaChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button onClick={nextSlide} className="absolute right-2 md:right-4 top-1/2 z-10 p-2 md:p-3 bg-black/50 text-white rounded-full transform -translate-y-1/2 hover:bg-black/70 transition-opacity duration-300">
                        <FaChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <div className="absolute bottom-2 md:bottom-3 left-0 right-0 flex justify-center space-x-1 md:space-x-2">
                        {mediaUrls.map((_, i) => (
                            <div key={i} className={`h-2 w-2 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-gray-400/70'}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const VideoEmbed = ({ url }) => {
    // ✅ PERBAIKAN: Tambahkan variabel lingkungan
    const API_URL = process.env.REACT_APP_API_URL;
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
            {/* ✅ PERBAIKAN: Menggunakan variabel lingkungan */}
            <source src={`${API_URL}/assets/images/${url}`} type="video/mp4" />
            Browser Anda tidak mendukung tag video.
        </video>
    );
};

function PostDetailPage() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [navigation, setNavigation] = useState({ prevId: null, nextId: null });

    useEffect(() => {
        const fetchPostAndNavigation = async () => {
            if (!id) {
                setError('ID postingan tidak valid.');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // ✅ PERBAIKAN: Menggunakan variabel lingkungan
                const response = await axios.get(`${API_URL}/posts/${id}`);
                setPost(response.data.post);
                setNavigation({
                    prevId: response.data.prevId,
                    nextId: response.data.nextId
                });
                setError(null);
            } catch (err) {
                console.error("Error fetching post:", err);
                setError(err.response?.status === 404 ? 'Postingan tidak ditemukan.' : 'Gagal memuat postingan.');
                setPost(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPostAndNavigation();
        window.scrollTo(0, 0);
    }, [id]);

    const renderMedia = (postData) => {
        if (postData.media_url) {
            if (Array.isArray(postData.media_url) && postData.media_url.length > 0) {
                // ✅ PERBAIKAN: Menggunakan variabel lingkungan
                const imageUrls = postData.media_url.map(url => url.startsWith('http') ? url : `${API_URL}/assets/images/${url}`);
                return <MediaCarousel mediaUrls={imageUrls} title={postData.title} />;
            }
            if (typeof postData.media_url === 'string' && postData.media_url.trim()) {
                if (postData.media_url.includes('youtube.com') || postData.media_url.includes('youtu.be') || postData.media_url.includes('.mp4')) {
                    return <VideoEmbed url={postData.media_url} />;
                }
                return (
                    <img
                        // ✅ PERBAIKAN: Menggunakan variabel lingkungan
                        src={postData.media_url.startsWith('http') ? postData.media_url : `${API_URL}/assets/images/${postData.media_url}`}
                        alt={postData.title}
                        className="w-full h-auto object-contain rounded-lg shadow-lg mb-8"
                    />
                );
            }
        } 
        if (postData.image_url) {
            // ✅ PERBAIKAN: Menggunakan variabel lingkungan
            const imageUrl = `${API_URL}/assets/images/${postData.image_url}`;
            return (
                <img
                    src={imageUrl}
                    alt={postData.title}
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
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-center px-4">
                <p className="text-xl text-red-500 mb-4">{error || "Postingan tidak ditemukan."}</p>
                <Link to="/newsletter" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Kembali ke Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link to="/newsletter" className="inline-flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 transition-colors duration-200">
                    <FaChevronLeft size={12} />
                    <span>Kembali ke semua berita</span>
                </Link>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
                    {post.title}
                </h1>
                <div className="text-sm text-gray-500 mb-8">
                    Diposting pada{" "}
                    {new Date(post.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                
                {renderMedia(post)}
                
                <div className="prose max-w-none text-base md:text-lg leading-relaxed text-gray-800" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />

                <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between items-center">
                    {navigation.prevId ? (
                        <Link to={`/blog/${navigation.prevId}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                            <FaChevronLeft />
                            <span>Sebelumnya</span>
                        </Link>
                    ) : (
                        <div />
                    )}

                    {navigation.nextId && (
                        <Link to={`/blog/${navigation.nextId}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                            <span>Selanjutnya</span>
                            <FaChevronRight />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PostDetailPage;