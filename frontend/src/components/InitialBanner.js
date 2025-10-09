import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

// Komponen Pembantu untuk tombol navigasi Carousel
const ArrowPrev = ({ onClickHandler }) => (
    <button
        type="button"
        onClick={onClickHandler}
        className="absolute -left-12 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white bg-opacity-75 text-xl text-gray-800 shadow-lg transition-opacity duration-200 hover:bg-opacity-100"
    >
        <FaChevronLeft size={16} />
    </button>
);

const ArrowNext = ({ onClickHandler }) => (
    <button
        type="button"
        onClick={onClickHandler}
        className="absolute -right-12 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white bg-opacity-75 text-xl text-gray-800 shadow-lg transition-opacity duration-200 hover:bg-opacity-100"
    >
        <FaChevronRight size={16} />
    </button>
);

const getImageUrl = (path) => {
    if (path && path.startsWith('http')) {
        return path;
    }
    // ✅ PERBAIKAN: Perbaiki jalur gambar sesuai folder baru
    return `http://localhost:8080/${path}`;
};


const InitialBanner = ({ bannerData, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (bannerData && bannerData.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex(prevIndex => 
                    prevIndex === bannerData.length - 1 ? 0 : prevIndex + 1
                );
            }, 4000); 
            return () => clearInterval(timer);
        }
    }, [bannerData]);

    const handleNextClick = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === bannerData.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handlePrevClick = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? bannerData.length - 1 : prevIndex - 1
        );
    };

    const handleClose = () => {
        localStorage.setItem('bannerClosedDate', moment().format('YYYY-MM-DD'));
        onClose(); 
    };

    if (!bannerData || bannerData.length === 0) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="relative flex w-full max-w-xl flex-col items-center justify-center">
                <div className="relative w-full">
                    
                    <div className="relative w-full overflow-hidden rounded-md shadow-lg">
                        
                        {bannerData.length > 1 && (
                            <>
                                <ArrowPrev onClickHandler={handlePrevClick} />
                                <ArrowNext onClickHandler={handleNextClick} />
                            </>
                        )}

                        <div 
                            className="flex transition-transform duration-500 ease-in-out" 
                            style={{ transform: `translateX(-${currentIndex * 100}%)`, width: `${bannerData.length * 100}%` }}
                        >
                            {bannerData.map((banner, index) => (
                                <div
                                    key={index}
                                    className="w-full flex-shrink-0 relative"
                                    style={{ width: `${100 / bannerData.length}%` }} 
                                >
                                    <img
                                        src={getImageUrl(banner.gambar)}
                                        alt={`Pengumuman ${index + 1}`}
                                        className="w-full h-auto max-h-[80vh] object-cover rounded-md"
                                        style={{ aspectRatio: '16/9' }} 
                                        onError={(e) => {
                                            e.target.onerror = null; // Menghindari looping tak terbatas
                                            e.target.src = "https://placehold.co/1000x700/D1D5DB/1F2937?text=Gagal+Memuat+Gambar";
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
                            {bannerData.map((_, index) => (
                                <button 
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`size-2 rounded-full transition-colors duration-300 ${
                                        currentIndex === index ? 'bg-white' : 'bg-gray-400 bg-opacity-70'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="z-50 mt-4 flex justify-center">
                    <button
                        onClick={handleClose}
                        className="rounded-lg bg-blue-600 px-6 py-2 font-bold text-white shadow-md transition duration-300 hover:bg-blue-700"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InitialBanner;