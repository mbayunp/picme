import React from 'react';

const Step1_SelectPackage = ({ selectedStudio, groupedPackages, loadingPackages, onOpenModal, onBack }) => {
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
          <div className="grid gap-3">
            {Object.keys(groupedPackages).map((categoryName) => (
              <div
                key={categoryName}
                className="border rounded-lg p-3 flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
              >
                {groupedPackages[categoryName][0]?.image_url && (
                  <img
                    src={`http://localhost:8080/assets/images/${groupedPackages[categoryName][0]?.image_url}`}
                    alt={categoryName}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-grow flex flex-col justify-center">
                  <p className="font-bold text-lg">{categoryName}</p>
                  <p className="text-md text-gray-900 font-semibold">
                    Mulai dari Rp{" "}
                    {groupedPackages[categoryName][0]?.harga.toLocaleString(
                      "id-ID"
                    )}
                  </p>
                </div>
                <button
                  onClick={() => onOpenModal(categoryName)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition"
                >
                  Pilih
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Step1_SelectPackage;