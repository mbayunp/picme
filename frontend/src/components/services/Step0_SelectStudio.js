import React from "react";
import PicmeLogo from "../../assets/images/PicmeLogo.png";
import { FaClock, FaCheckCircle, FaStore, FaArrowRight } from "react-icons/fa";

// Component Kartu Studio yang difokuskan untuk Mobile
const StudioCard = ({ studio, isSelected, onSelectStudio }) => (
    <div
        key={studio.name}
        onClick={() => onSelectStudio(studio)}
        className={`relative group cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 flex items-center gap-4 hover:shadow-lg ${
            isSelected
                ? "border-green-600 bg-green-50 ring-4 ring-green-600/20 shadow-md transform scale-[1.01]"
                : "border-gray-200 bg-white shadow-sm hover:border-green-300"
        }`}
    >
        {/* Badge Checkmark */}
        {isSelected && (
            <div className="absolute top-[-10px] right-[-10px] bg-green-600 p-2 rounded-full text-white shadow-lg z-10">
                <FaCheckCircle className="text-sm" />
            </div>
        )}

        {/* Icon Studio (Lebih Kecil untuk Mobile) */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-colors duration-300 shadow-inner 
            bg-gray-100 text-gray-400 
            group-hover:bg-green-50 group-hover:text-green-500
            aria-[selected=true]:bg-green-100 aria-[selected=true]:text-green-700"
             aria-selected={isSelected}
        >
            <FaStore />
        </div>

        {/* Info Studio */}
        <div className="flex-grow min-w-0">
            <h3 className={`text-lg font-bold transition-colors ${isSelected ? 'text-green-800' : 'text-gray-900'}`}>
                {studio.name}
            </h3>

            {/* Jam Buka */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                <FaClock className="text-green-500 flex-shrink-0" size={12} />
                <span className="font-medium">08:00 - 18:00 WIB</span>
            </div>
        </div>
    </div>
);


const Step0_SelectStudio = ({ studios, selectedStudio, onSelectStudio, onContinue }) => {
    
    const isStudioSelected = !!selectedStudio;

    return (
        <div className="flex w-full flex-col items-center pt-8 pb-28 px-4 bg-gray-50 min-h-screen">
            
            <div className="text-center mb-10 w-full max-w-lg">
                <img 
                    src={PicmeLogo} 
                    alt="Picme Logo" 
                    className="h-40 w-auto object-contain mx-auto mb-4 drop-shadow-sm 
                                sm:h-40" 
                />

                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight leading-snug">
                    Pilih <span className="text-green-600">Studio</span>
                </h1>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    Pilih lokasi cabang terdekat untuk sesi foto Anda.
                </p>
            </div>

            {/* --- GRID STUDIO CARDS (Mobile First: Single Column) --- */}
            <div className="w-full max-w-lg grid grid-cols-1 gap-4 mb-8">
                {studios.map((studio) => (
                    <StudioCard 
                        key={studio.name} 
                        studio={studio} 
                        isSelected={selectedStudio?.name === studio.name} 
                        onSelectStudio={onSelectStudio} 
                    />
                ))}
            </div>

            {/* --- ACTION BUTTON (Fixed Footer) --- */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-2xl border-t border-gray-100 z-50">
                 <div className="w-full max-w-lg mx-auto">
                    <button
                        onClick={onContinue}
                        disabled={!isStudioSelected}
                        className={`w-full rounded-xl py-3 px-8 font-bold text-base shadow-lg transition-all transform duration-300 flex justify-center items-center gap-2 ${
                            isStudioSelected
                                ? "bg-green-600 text-white hover:bg-green-700 active:scale-[0.98] shadow-green-500/50"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                        <span className="text-sm uppercase font-semibold tracking-wider">Lanjutkan Pemesanan</span>
                        {isStudioSelected && <FaArrowRight className="ml-2 text-lg" />}
                    </button>
                    {isStudioSelected && (
                        <p className="text-center text-bold text-[10px] text-gray-500 mt-2 truncate">
                            Anda memilih: {selectedStudio.name}
                        </p>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default Step0_SelectStudio;