import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import gambar lokal Anda
import portfolio1 from '../assets/images/portfolio1.jpg';
import portfolio2 from '../assets/images/portfolio2.jpg';
import portfolio3 from '../assets/images/portfolio3.jpg';

function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState([]);

  const imageMap = {
    'portfolio1.jpg': portfolio1,
    'portfolio2.jpg': portfolio2,
    'portfolio3.jpg': portfolio3,
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/portfolio');
        setPortfolioItems(response.data);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      }
    };
    fetchPortfolio();
  }, []);

  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen pt-32">
      {/* Header Utama */}
      <div className="max-w-screen-xl mx-auto px-5 mb-16">
        <h1 className="text-6xl md:text-7xl font-light leading-none">
          <span className="font-bold">Designing a</span> Better World Today
        </h1>
        <div className="mt-8 flex items-center space-x-2 text-sm text-gray-500 uppercase tracking-widest">
          <span>Our Works</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Grid Portfolio dengan Konsep Masonry */}
      <div className="max-w-screen-xl mx-auto px-5 columns-1 sm:columns-2 lg:columns-3 gap-8">
        {portfolioItems.map(item => (
          <div 
            key={item.id} 
            className="mb-8 p-3 transform transition duration-300 hover:-translate-y-1 hover:shadow-2xl bg-white rounded-lg break-inside-avoid-column"
          >
            <img 
              src={imageMap[item.image_url]} 
              alt={item.title} 
              className="w-full object-cover rounded-md" 
            />
            <div className="mt-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider">{item.title} • May 24, 2024</div>
              <h3 className="mt-2 text-xl font-medium">{item.description}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PortfolioPage;