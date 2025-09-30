import React from "react";
import PicmeLogo from "../../assets/images/PicmeLogo.png";

const Step0_SelectStudio = ({ studios, selectedStudio, onSelectStudio, onContinue }) => {
    return (
        <div className="flex w-full flex-col items-center">
            <h1 className="mb-8 text-3xl font-bold text-gray-800">Pilih Lokasi</h1>
            <div className="w-full max-w-md">
                <div className="mb-6 rounded-lg bg-white p-4 text-center shadow-md">
                    <div className="mb-4 flex justify-center">
                        <img src={PicmeLogo} alt="Picme Logo" className="w-56" />
                    </div>
                    <p className="text-lg font-bold">Picme Photo Studio Cianjur</p>
                </div>
                {studios.map((studio) => (
                    <div
                        key={studio.name}
                        onClick={() => onSelectStudio(studio)}
                        className={`mb-4 cursor-pointer rounded-lg border p-4 transition-colors duration-200 ${
                            selectedStudio?.name === studio.name
                                ? "border-blue-600 bg-blue-100"
                                : "border-gray-300 bg-white hover:bg-gray-100"
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-8 w-8 text-gray-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="flex-grow">
                                <p className="text-lg font-semibold">{studio.name}</p>
                                <p className="text-sm text-gray-500">08:00 - 18:00 Buka</p>
                                <p className="text-xs text-gray-400">{studio.address}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 text-center">
                <button
                    onClick={onContinue}
                    disabled={!selectedStudio}
                    className={`rounded-full px-8 py-3 font-semibold shadow-md ${
                        selectedStudio
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "cursor-not-allowed bg-gray-300 text-gray-500"
                    }`}
                >
                    Lanjutkan
                </button>
            </div>
        </div>
    );
};

export default Step0_SelectStudio;