import React from 'react';

const BookingModal = ({ showModal, onClose, modalCurrentPackage, selectedModalPackage, onSelectModalPackage, quantity, onSetQuantity, onAddToCart }) => {
  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Pilih layanan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {selectedModalPackage && (
          <div className="flex justify-center mb-4">
            <img
              src={`http://localhost:8080/assets/images/${selectedModalPackage.image_url}`}
              alt={selectedModalPackage.nama_paket}
              className="w-full h-64 object-contain rounded-lg bg-gray-100"
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2">
          {modalCurrentPackage && (
            <>
              <div className="mb-4">
                <h3 className="font-bold text-lg">{modalCurrentPackage[0]?.nama_paket.split(' - ')[0]}</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{modalCurrentPackage[0]?.deskripsi_paket}</p>
              </div>
              <div className="mb-4">
                <p className="font-semibold text-gray-700 mb-2">{modalCurrentPackage.length} Pilihan</p>
                {modalCurrentPackage.map(pkg => (
                  <div
                    key={pkg.id}
                    onClick={() => onSelectModalPackage(pkg)}
                    className={`flex items-center gap-4 p-3 border rounded-lg mb-2 cursor-pointer transition ${
                      selectedModalPackage?.id === pkg.id ? 'bg-blue-50 border-blue-600' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="package_selection"
                      checked={selectedModalPackage?.id === pkg.id}
                      readOnly
                      className="form-radio h-5 w-5 text-blue-600"
                    />
                    {pkg.image_url && (
                      <img
                        src={`http://localhost:8080/assets/images/${pkg.image_url}`}
                        alt={pkg.nama_paket}
                        className="w-16 h-16 object-contain rounded-lg bg-gray-50"
                      />
                    )}
                    <div className="flex-grow">
                      <p className="font-medium">{pkg.nama_paket}</p>
                      <p className="text-sm text-gray-600">Rp {pkg.harga.toLocaleString("id-ID")} • 10min</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSetQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1 bg-gray-200 rounded-lg"
            >
              -
            </button>
            <span className="font-semibold">{quantity}</span>
            <button
              onClick={() => onSetQuantity(quantity + 1)}
              className="px-3 py-1 bg-gray-200 rounded-lg"
            >
              +
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-full font-semibold hover:bg-gray-300 transition"
            >
              Batal
            </button>
            <button
              onClick={onAddToCart}
              className="px-6 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition"
            >
              Tambah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;