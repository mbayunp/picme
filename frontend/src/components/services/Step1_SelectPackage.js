import React, { useMemo } from 'react';
import { FaClock, FaArrowLeft, FaChevronRight, FaCameraRetro } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

// Fungsi untuk format rupiah yang lebih rapi
const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(num);

const Step1_SelectPackage = ({ selectedStudio, groupedPackages, loadingPackages, onOpenModal, onBack }) => {
    // Filter hanya paket aktif
    const activeGroupedPackages = useMemo(() => {
        if (!groupedPackages) return {};

        const activeGroups = {};
        Object.entries(groupedPackages).forEach(([categoryName, packagesArray]) => {
            const activePackages = packagesArray.filter(
                (pkg) => String(pkg.is_active) === '1' || pkg.is_active === true
            );

            if (activePackages.length > 0) {
                activeGroups[categoryName] = activePackages;
            }
        });
        return activeGroups;
    }, [groupedPackages]);

    const activeCategoryNames = Object.keys(activeGroupedPackages);

    return (
        <div className="flex flex-col items-center w-full pt-8 pb-16 px-4 bg-gray-50 min-h-screen">
            
            {/* --- HEADER --- */}
            <div className="w-full max-w-4xl mb-10 relative">
                <button
                    onClick={onBack}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors font-semibold bg-white px-3 py-1.5 rounded-full shadow-md border border-gray-200 hover:bg-green-50 z-10 text-sm"
                >
                    <FaArrowLeft size={12} /> Kembali
                </button>
                
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Pilih Paket Foto</h1>
                    <p className="text-gray-500 text-base">
                        Studio: <span className="font-bold text-green-600">{selectedStudio.name}</span>
                    </p>
                </div>
            </div>

            {/* --- PACKAGE LIST --- */}
            <div className="w-full max-w-4xl">
                {loadingPackages ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                        <p>Memuat paket...</p>
                    </div>
                ) : (
                    activeCategoryNames.length > 0 ? (
                        <div className="flex flex-col gap-6"> 
                            {activeCategoryNames.map((categoryName) => {
                                const displayPackage = activeGroupedPackages[categoryName]?.[0];
                                const duration = displayPackage?.waktu_durasi;
                                const startPrice = displayPackage?.harga;

                                return (
                                    <div
                                        key={categoryName}
                                        onClick={() => onOpenModal(categoryName)}
                                        className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-lg hover:shadow-2xl hover:border-green-400 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row transform hover:-translate-y-0.5"
                                    >
                                        
                                        {/* Image Section (Kiri di desktop, Atas di mobile) */}
                                        <div className="w-full sm:w-60 h-40 sm:h-auto relative flex-shrink-0 bg-gray-100 overflow-hidden">
                                            {displayPackage?.image_url ? (
                                                <img
                                                    src={`${API_URL}/${displayPackage.image_url}`}
                                                    alt={categoryName}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <FaCameraRetro size={48} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Section (Kanan) */}
                                        <div className="p-5 flex-grow flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-2xl font-extrabold text-gray-900 group-hover:text-green-700 transition-colors">
                                                        {categoryName}
                                                    </h3>
                                                    {/* Panah Indikator */}
                                                    <FaChevronRight className="text-xl text-gray-300 group-hover:text-green-500 transition-colors mt-1" />
                                                </div>
                                                
                                                {/* Durasi */}
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                                    <FaClock className="text-green-600" />
                                                    <span className="font-medium">{duration ? `${duration} Menit Sesi Foto` : 'Durasi tidak tersedia'}</span>
                                                </div>
                                            </div>

                                            {/* Footer Price & Button */}
                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Mulai Dari</span>
                                                    <span className="text-2xl font-bold text-green-700">
                                                        Rp {startPrice ? formatRupiah(startPrice) : '-'}
                                                    </span>
                                                </div>
                                                
                                                <button 
                                                    // Tombol dibuat "ghost" / outline dan menjadi solid saat hover
                                                    className="bg-white border-2 border-green-600 text-green-600 px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all duration-300 transform group-hover:bg-green-600 group-hover:text-white group-hover:shadow-green-500/50"
                                                >
                                                    Lihat Detail & Pilih
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 shadow-md">
                            <p className="text-gray-500 text-lg">Tidak ada paket aktif yang tersedia untuk studio ini.</p>
                            <button onClick={onBack} className="mt-4 text-green-600 font-medium hover:underline flex items-center mx-auto gap-2">
                                <FaArrowLeft size={12}/> Pilih studio lain
                            </button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Step1_SelectPackage;