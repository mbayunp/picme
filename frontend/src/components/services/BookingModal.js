import React, { useState, useEffect } from "react";

const BookingModal = ({
  showModal,
  onClose,
  modalCurrentPackage, // Ini array paket dalam satu kategori (misal: semua "Paket Intimate")
  selectedModalPackage, // Ini paket spesifik yang dipilih (misal: "Paket Intimate - 15min")
  onSelectModalPackage,
  quantity, // Jumlah item (untuk paket non-party)
  onSetQuantity,
  onAddToCart,
}) => {
  const API_URL = process.env.REACT_APP_API_URL;

  // State lokal untuk jumlah orang (khusus paket Party)
  const [numberOfPeople, setNumberOfPeople] = useState(quantity);

  // Cek apakah paket *yang sedang dipilih* adalah tipe "Party"
  const isPartyPackage =
    selectedModalPackage?.nama_paket &&
    selectedModalPackage.nama_paket.toLowerCase().includes("party");

  // Sinkronisasi jumlah orang (state lokal) dengan quantity (state global) untuk paket Party
  useEffect(() => {
    if (isPartyPackage) {
      // Pastikan minimal 4 orang untuk Party
      const validPeopleCount = Math.max(4, numberOfPeople);
      // Update state global quantity jika state lokal berubah
      if(validPeopleCount !== quantity) {
          onSetQuantity(validPeopleCount);
      }
    }
     // Optional: Reset quantity ke 1 jika beralih dari Party ke non-Party
    // else if (quantity !== 1) {
    //     onSetQuantity(1);
    // }
  }, [numberOfPeople, isPartyPackage, onSetQuantity, quantity]); // Tambahkan quantity

  // Reset state lokal saat modal dibuka atau paket *terpilih* berubah
  useEffect(() => {
    if (showModal && selectedModalPackage) { // Pastikan ada selectedModalPackage
        const initialQuantity = selectedModalPackage.nama_paket?.toLowerCase().includes("party") ? Math.max(4, quantity) : 1;
        setNumberOfPeople(initialQuantity);
        // Sinkronkan quantity global jika perlu
        if (initialQuantity !== quantity) {
            onSetQuantity(initialQuantity);
        }
    } else if (!showModal) {
        // Reset saat modal ditutup
        setNumberOfPeople(1);
    }
  }, [showModal, selectedModalPackage]); // Dependensi utama

  if (!showModal) {
    return null;
  }

  // Handler perubahan input jumlah orang (hanya untuk Party)
  const handlePeopleChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isPartyPackage) {
         if (isNaN(value) || value < 4) value = 4;
    } else {
         if (isNaN(value) || value < 1) value = 1;
    }
    setNumberOfPeople(value);
  };

  // Handler untuk menambah item ke keranjang
   const handleAddToCartClick = () => {
        if (!selectedModalPackage) {
            console.warn("No package selected to add to cart.");
            return;
        }
        onAddToCart(); // Panggil fungsi dari props
   };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-40 p-4">
      <div className="flex w-full max-w-lg max-h-[90vh] flex-col rounded-lg bg-white p-6">
        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Pilih layanan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            {/* ... (SVG close icon) ... */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> </svg>
          </button>
        </div>

        {/* GAMBAR PAKET TERPILIH */}
        {selectedModalPackage?.image_url && ( // Ambil gambar dari paket yang dipilih
          <div className="mb-4 flex justify-center">
            <img
              src={`${API_URL}/${selectedModalPackage.image_url}`}
              alt={selectedModalPackage.nama_paket}
              className="h-48 md:h-64 w-full rounded-lg bg-gray-100 object-contain" // object-contain agar tidak terpotong
            />
          </div>
        )}

        {/* DAFTAR PILIHAN PAKET */}
        <div className="flex-1 overflow-y-auto pr-2">
          {modalCurrentPackage && modalCurrentPackage.length > 0 && ( // Pastikan array tidak kosong
            <>
              {/* Judul & Deskripsi Kategori */}
              <div className="mb-4">
                <h3 className="text-lg font-bold">
                  {/* Ambil nama kategori dari paket pertama */}
                  {modalCurrentPackage[0]?.nama_paket?.split(" - ")[0] || "Pilihan Paket"}
                </h3>
                {/* Tampilkan deskripsi jika ada */}
                {modalCurrentPackage[0]?.deskripsi_paket && (
                    <p className="whitespace-pre-wrap text-sm text-gray-600 mt-1">
                        {modalCurrentPackage[0].deskripsi_paket}
                    </p>
                )}
              </div>

              {/* Pilihan Paket Spesifik */}
              <div className="mb-4">
                <p className="mb-2 font-semibold text-gray-700">{modalCurrentPackage.length} Pilihan</p>

                {modalCurrentPackage.map((pkg) => {
                  // ⭐️ TAMBAHKAN CONSOLE LOG DI SINI ⭐️
                  console.log('Rendering package in modal:', pkg);
                  // ⭐️ ------------------------------ ⭐️
                  return (
                      <div
                        key={pkg.id}
                        onClick={() => onSelectModalPackage(pkg)}
                        className={`mb-2 flex cursor-pointer items-center gap-4 rounded-lg border p-3 transition ${
                          selectedModalPackage?.id === pkg.id
                            ? "border-blue-600 bg-blue-50 ring-1 ring-blue-500" // Tambah ring
                            : "border-gray-300 bg-white hover:bg-gray-50" // Ubah background
                        }`}
                      >
                        {/* Radio Button */}
                        <input type="radio" name="package_selection" checked={selectedModalPackage?.id === pkg.id} readOnly className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500 flex-shrink-0" />
                        {/* Gambar Kecil Paket */}
                        {pkg.image_url && (<img src={`${API_URL}/${pkg.image_url}`} alt={pkg.nama_paket} className="h-14 w-14 md:h-16 md:w-16 rounded-lg bg-gray-100 object-contain flex-shrink-0" />)}
                        {/* Info Paket */}
                        <div className="flex-grow">
                          <p className="font-medium">{pkg.nama_paket}</p>
                          <p className="text-sm text-gray-600">
                            Rp {pkg.harga ? pkg.harga.toLocaleString("id-ID") : '-'}{" "}
                            {/* Baris yang menampilkan durasi */}
                            • {pkg.waktu_durasi ? `${pkg.waktu_durasi} menit` : '-'}
                          </p>
                        </div>
                      </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* FOOTER (JUMLAH / PARTY) */}
        <div className="mt-auto border-t pt-4">
            {/* Tampilkan input jumlah orang HANYA jika paket terpilih adalah Party */}
            {isPartyPackage ? (
                <div className="mb-4 flex items-center justify-between">
                    <label htmlFor="jumlahOrang" className="font-semibold text-gray-700">Jumlah Orang (Min. 4)</label>
                    <input
                        type="number" id="jumlahOrang" name="jumlahOrang"
                        min="4" // Set minimum di input
                        value={numberOfPeople}
                        onChange={handlePeopleChange}
                        className="w-24 rounded-lg border-gray-300 text-center font-semibold shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
             ) : (
                // Tampilkan tombol +/- HANYA jika paket terpilih BUKAN Party
                selectedModalPackage && !isPartyPackage && ( // Pastikan ada paket terpilih dulu
                    <div className="mb-4 flex items-center justify-between">
                        <span className="font-semibold text-gray-700">Jumlah</span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onSetQuantity(Math.max(1, quantity - 1))} // Global quantity
                                disabled={quantity <= 1} // Disable jika sudah 1
                                className="rounded-lg bg-gray-200 px-3 py-1 font-bold text-lg disabled:opacity-50"
                            > - </button>
                            <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
                            <button
                                onClick={() => onSetQuantity(quantity + 1)} // Global quantity
                                className="rounded-lg bg-gray-200 px-3 py-1 font-bold text-lg"
                            > + </button>
                        </div>
                    </div>
                )
             )}

            {/* Tombol Aksi Batal & Tambah */}
            <div className="flex gap-2">
                <button
                    onClick={onClose}
                    className="w-full rounded-full bg-gray-200 px-6 py-2 font-semibold text-gray-800 transition hover:bg-gray-300"
                > Batal </button>
                <button
                    onClick={handleAddToCartClick} // Gunakan handler baru
                    disabled={!selectedModalPackage} // Disable jika belum ada paket terpilih
                    className="w-full rounded-full bg-green-600 px-6 py-2 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                > Tambah </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;

