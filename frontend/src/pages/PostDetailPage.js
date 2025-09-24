import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

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

        const response = await axios.get(`http://localhost:8080/api/posts/${id}`);
        setPost(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching post:', err);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl text-gray-500">Memuat postingan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }
  
  if (!post) {
      return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <p className="text-xl text-red-500">Postingan tidak ditemukan.</p>
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
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          {post.title}
        </h1>
        <div className="text-sm text-gray-500 mb-8">
          Diposting pada{" "}
          {new Date(post.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        
        {post.image_url && (
          <img
            src={`http://localhost:8080/assets/images/${post.image_url}`}
            alt={post.title}
            className="w-full h-auto object-cover rounded-lg shadow-lg mb-8 max-h-[500px]"
          />
        )}
        
        <div className="text-lg leading-relaxed text-gray-800">
          <p>{post.content}</p>
        </div>
      </div>
    </div>
  );
}

export default PostDetailPage;