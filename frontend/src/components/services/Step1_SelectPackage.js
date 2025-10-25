import React, { useMemo } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

const Step1_SelectPackage = ({ selectedStudio, groupedPackages, loadingPackages, onOpenModal, onBack }) => {

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
        <div className="flex flex-col items-center w-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                Pilih Paket
            </h1>
            <div className="w-full max-w-3xl mb-6 flex justify-start">
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                >
                    ← Kembali
                </button>
            </div>
            <p className="text-center text-lg font-semibold mb-6">
                Studio terpilih:{" "}
                <span className="text-blue-600">{selectedStudio.name}</span>
            </p>
            <div className="w-full max-w-3xl">
                <h3 className="text-lg font-semibold mb-3">Pilih Paket</h3>
                {loadingPackages ? (
                    <p className="text-gray-500 text-center">Memuat paket...</p>
                ) : (
                    activeCategoryNames.length > 0 ? (
                        <div className="grid gap-3">
                            {activeCategoryNames.map((categoryName) => {
                                const displayPackage = activeGroupedPackages[categoryName]?.[0]; 
                                const duration = displayPackage?.waktu_durasi; 

                                return (
                                    <div
                                        key={categoryName}
                                        className="border rounded-lg p-3 flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        {displayPackage?.image_url && (
                                            <img
                                                src={`${API_URL}/${displayPackage.image_url}`}
                                                alt={categoryName}
                                                className="w-24 h-24 object-cover rounded-lg flex-shrink-0 bg-gray-200"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        )}
                                        <div className="flex-grow flex flex-col justify-center">
                                            <p className="font-bold text-lg">{categoryName}</p>
                                            <p className="text-md text-gray-900 font-semibold">
                                                Mulai dari Rp{" "}
                                                {displayPackage?.harga ? displayPackage.harga.toLocaleString("id-ID") : '-'}
                                            </p>
                                            {/* Tampilkan Durasi */}
                                            <p className="text-sm text-gray-500 mt-1">
                                                Durasi: {duration ? `${duration} menit` : '-'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onOpenModal(categoryName)}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition flex-shrink-0"
                                        >
                                            Pilih
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">
                            Tidak ada paket aktif yang tersedia untuk studio ini.
                        </p>
                    )
                )}
            </div>
        </div>
    );
};

export default Step1_SelectPackage;
