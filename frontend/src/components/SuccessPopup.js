import React from 'react';

function SuccessPopup({ message, onClose }) {
  if (!message) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 w-full max-w-md text-center">
        {/* Ikon Centang Hijau */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Pemesanan Berhasil!</h3>
        <p className="text-sm text-gray-600 mb-6">
          {message}
        </p>
        
        <button
          onClick={onClose}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Oke
        </button>
      </div>
    </div>
  );
}

export default SuccessPopup;