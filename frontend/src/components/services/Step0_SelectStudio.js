import React from "react";
import PicmeLogo from "../../assets/images/PicmeLogo.png";
import { FaMapMarkerAlt, FaClock, FaCheckCircle, FaStore } from "react-icons/fa";

const Step0_SelectStudio = ({ studios, selectedStudio, onSelectStudio, onContinue }) => {

    return (
        <div className="flex w-full flex-col items-center pt-10 pb-16 px-4 bg-gray-50 min-h-[calc(100vh-64px)]">
            
            {/* --- HEADER SECTION (Logo Besar dalam Kotak) --- */}
            <div className="text-center mb-12 w-full max-w-3xl flex flex-col items-center">
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 
                                transform transition-all duration-500 ease-in-out 
                                hover:shadow-2xl hover:-translate-y-2 hover:scale-105 hover:border-green-200
                                mb-8 inline-block">
                    <img 
                        src={PicmeLogo} 
                        alt="Picme Logo" 
                        className="h-24 md:h-32 lg:h-40 object-contain drop-shadow-sm" 
                    />
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
                    Pilih Lokasi <span className="text-green-600">Studio</span>
                </h1>
                <p className="text-gray-500 text-lg md:text-xl max-w-xl leading-relaxed">
                    Silakan pilih cabang studio terdekat untuk sesi foto Anda.
                </p>
            </div>

            {/* --- GRID STUDIO CARDS (TANPA GAMBAR FOTO) --- */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {studios.map((studio) => {
                    const isSelected = selectedStudio?.name === studio.name;
                    return (
                        <div
                            key={studio.name}
                            onClick={() => onSelectStudio(studio)}
                            className={`relative group cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 shadow-sm hover:shadow-lg flex items-start gap-5 ${
                                isSelected
                                    ? "border-green-500 bg-green-50/50 ring-4 ring-green-500/10 transform scale-[1.01]"
                                    : "border-gray-200 bg-white hover:border-green-300 hover:-translate-y-1"
                            }`}
                        >
                            {/* Ikon Studio (Pengganti Foto) */}
                            <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-colors duration-300 shadow-sm ${
                                isSelected 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-100 text-gray-400 group-hover:bg-green-100 group-hover:text-green-600'
                            }`}>
                                <FaStore />
                            </div>

                            {/* Info Studio */}
                            <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className={`text-xl font-bold mb-2 transition-colors ${isSelected ? 'text-green-800' : 'text-gray-800'}`}>
                                        {studio.name}
                                    </h3>
                                    
                                    {/* Checkmark Icon */}
                                    {isSelected && (
                                        <FaCheckCircle className="text-2xl text-green-500 animate-bounce-short" />
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-3">
                                    <FaClock className={`${isSelected ? 'text-green-600' : 'text-gray-400'}`} />
                                    <span>08:00 - 18:00 WIB</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- ACTION BUTTON --- */}
            <div className="w-full max-w-md sticky bottom-6 z-20">
                <button
                    onClick={onContinue}
                    disabled={!selectedStudio}
                    className={`w-full rounded-2xl py-4 px-8 font-bold text-lg shadow-xl transition-all transform duration-300 flex justify-center items-center gap-2 ${
                        selectedStudio
                            ? "bg-green-600 text-white hover:bg-green-700 hover:-translate-y-1 hover:shadow-green-500/40"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                    <span>Lanjutkan Pemesanan</span>
                    {selectedStudio && <span className="text-xl">→</span>}
                </button>
            </div>
        </div>
    );
};

export default Step0_SelectStudio;