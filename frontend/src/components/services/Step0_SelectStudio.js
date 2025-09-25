import React from 'react';

const Step0_SelectStudio = ({ studios, selectedStudio, onSelectStudio, onContinue }) => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Pilih Lokasi
      </h1>
      <div className="w-full max-w-md">
        <div className="p-4 mb-6 bg-white rounded-lg shadow-md text-center">
          <div className="flex justify-center mb-4">
           <img
            src={require("../../assets/images/PicmeLogo.png")}
            alt="Picme Logo"
            className="w-56"
            />
          </div>
          <p className="font-bold text-lg">
            Picme Photo Studio Cianjur
          </p>
        </div>
        {studios.map((studio) => (
          <div
            key={studio.name}
            onClick={() => onSelectStudio(studio)}
            className={`p-4 mb-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
              selectedStudio?.name === studio.name
                ? "bg-blue-100 border-blue-600"
                : "bg-white border-gray-300 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <svg
                  className="w-8 h-8 text-gray-500"
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
                <p className="font-semibold text-lg">{studio.name}</p>
                <p className="text-sm text-gray-500">
                  08:00 - 18:00 Buka
                </p>
                <p className="text-xs text-gray-400">{studio.address}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-6">
        <button
          onClick={onContinue}
          disabled={!selectedStudio}
          className={`px-8 py-3 rounded-full font-semibold shadow-md ${
            selectedStudio
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Lanjutkan
        </button>
      </div>
    </div>
  );
};

export default Step0_SelectStudio;