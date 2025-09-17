import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PortfolioPage.css';

// Import gambar lokal Anda
import portfolio1 from '../assets/images/portfolio1.jpg';
import portfolio2 from '../assets/images/portfolio2.jpg';
import portfolio3 from '../assets/images/portfolio3.jpg';

function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState([]);

  // Buat map untuk memetakan nama file dari database ke gambar yang diimpor
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
    <div className="portfolio-page">
      <h1>Portfolio Foto</h1>
      <div className="portfolio-grid">
        {portfolioItems.map(item => (
          <div key={item.id} className="portfolio-item">
            {/* Menggunakan imageMap untuk mendapatkan gambar yang benar */}
            <img src={imageMap[item.image_url]} alt={item.title} />
            <div className="portfolio-info">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PortfolioPage;
