// NewsletterPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function NewsletterPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto my-10 p-5 font-sans min-h-screen pt-32">
      <h1 className="text-center mb-10 text-4xl font-bold">Newsletter & Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
              {post.image_url && (
                <img
                  src={`http://localhost:8080/assets/images/${post.image_url}`}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-gray-700 leading-relaxed text-sm mb-4">{post.content}</p>
                </div>
                <span className="block mt-4 text-gray-500 text-xs">
                  {new Date(post.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">Belum ada postingan yang tersedia.</p>
        )}
      </div>
    </div>
  );
}

export default NewsletterPage;
