import React, { useMemo } from 'react';
import { FaClock, FaArrowLeft, FaChevronRight } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

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
        <div className="flex flex-col items-center w-full pt-8 pb-16 px-4 bg-gray-50 min-h-[calc(100vh-64px)]">
            
            {/* --- HEADER --- */}
            <div className="w-full max-w-4xl mb-8 flex flex-col md:flex-row items-center justify-between relative">
                <button
                    onClick={onBack}
                    className="absolute left-0 top-0 md:static flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 hover:bg-gray-100"
                >
                    <FaArrowLeft /> Kembali
                </button>
                
                <div className="text-center flex-grow mt-12 md:mt-0">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Pilih Paket Foto</h1>
                    <p className="text-gray-500 text-lg">
                        Studio: <span className="font-bold text-green-600">{selectedStudio.name}</span>
                    </p>
                </div>
                
                <div className="w-24 hidden md:block"></div>
            </div>

            {/* --- PACKAGE LIST (Berjajar ke Bawah) --- */}
            <div className="w-full max-w-4xl">
                {loadingPackages ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                        <p>Memuat paket...</p>
                    </div>
                ) : (
                    activeCategoryNames.length > 0 ? (
                        <div className="flex flex-col gap-4"> {/* Menggunakan Flex Column untuk list ke bawah */}
                            {activeCategoryNames.map((categoryName) => {
                                const displayPackage = activeGroupedPackages[categoryName]?.[0];
                                const duration = displayPackage?.waktu_durasi;
                                const startPrice = displayPackage?.harga;

                                return (
                                    <div
                                        key={categoryName}
                                        onClick={() => onOpenModal(categoryName)}
                                        className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row"
                                    >
                                        {/* Image Section (Kiri di desktop, Atas di mobile) */}
                                        <div className="w-full sm:w-48 h-48 sm:h-auto relative flex-shrink-0 bg-gray-100 overflow-hidden">
                                            <img
                                                src={displayPackage?.image_url ? `${API_URL}/${displayPackage.image_url}` : 'https://placehold.co/400x300?text=No+Image'}
                                                alt={categoryName}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                                            />
                                            {/* Overlay gradient halus */}
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                        </div>

                                        {/* Content Section (Kanan) */}
                                        <div className="p-5 flex-grow flex flex-col justify-center">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                                                    {categoryName}
                                                </h3>
                                                {/* Icon Panah di kanan (Hiasan) */}
                                                <FaChevronRight className="text-gray-300 group-hover:text-green-500 transition-colors" />
                                            </div>
                                            
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                                <FaClock className="text-green-600" />
                                                <span>{duration ? `${duration} Menit` : '-'}</span>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Mulai Dari</span>
                                                    <span className="text-xl font-bold text-gray-900">
                                                        Rp {startPrice ? startPrice.toLocaleString("id-ID") : '-'}
                                                    </span>
                                                </div>
                                                
                                                <button className="bg-white border-2 border-green-600 text-green-600 px-6 py-2 rounded-lg font-bold text-sm shadow-sm group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                                                    Pilih Paket
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-500 text-lg">Tidak ada paket aktif yang tersedia untuk studio ini.</p>
                            <button onClick={onBack} className="mt-4 text-green-600 font-medium hover:underline">
                                Pilih studio lain
                            </button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Step1_SelectPackage;