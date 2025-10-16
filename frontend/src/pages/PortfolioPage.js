import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function PortfolioPage() {
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getImageUrl = (path) => {
        if (path && path.startsWith('http')) {
            return path;
        }
        return `${API_URL}/${path}`;
    };

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/portfolio`);
                setPortfolioItems(response.data);
            } catch (error) {
                console.error('Error fetching portfolio:', error);
                setError('Gagal memuat item portfolio. Coba lagi nanti.');
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, []);

    if (loading) {
        return (
            <div className="font-sans text-gray-900 bg-white min-h-screen pt-32 text-center">
                <p className="text-xl">Memuat portfolio...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="font-sans text-gray-900 bg-white min-h-screen pt-32 text-center">
                <p className="text-red-500 text-xl">{error}</p>
            </div>
        );
    }

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen pt-32 pb-20">
            <div className="max-w-screen-xl mx-auto px-5 mb-16">
                <h1 className="text-4xl md:text-7xl font-light leading-none">
                    <span className="font-bold">Designing a</span> <span className="block md:inline">Senandung.photography</span>
                </h1>
                <div className="mt-8 flex items-center space-x-2 text-sm text-gray-500 uppercase tracking-widest">
                    <span>Our Works</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-8">
                {portfolioItems.map(item => (
                    <div 
                        key={item.id} 
                        className="group transform transition duration-300 hover:-translate-y-1 hover:shadow-2xl bg-white rounded-xl overflow-hidden"
                    >
                        <div className="w-full relative h-64 md:h-[28rem] bg-gray-100 flex items-center justify-center">
                            <img 
                                src={getImageUrl(item.image_url)} 
                                alt={item.title} 
                                className="w-full h-full object-contain rounded-t-xl group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className="p-4">
                            <div className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-wider">
                                <span>{item.kategori}</span>
                                <span className="text-gray-400">•</span>
                                <span>May 24, 2024</span>
                            </div>
                            <h3 className="mt-2 text-lg font-bold">{item.title}</h3>
                            <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PortfolioPage;