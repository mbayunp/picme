import React, { useState, useEffect } from "react";

const BookingModal = ({
  showModal,
  onClose,
  modalCurrentPackage,
  selectedModalPackage,
  onSelectModalPackage,
  quantity,
  onSetQuantity,
  onAddToCart,
}) => {
  const API_URL = process.env.REACT_APP_API_URL;

  // ✅ Semua hook harus dipanggil di atas, tidak boleh di bawah return
  const [numberOfPeople, setNumberOfPeople] = useState(quantity);

  const isPartyPackage =
    selectedModalPackage?.nama_paket &&
    selectedModalPackage.nama_paket.toLowerCase().includes("party");

  // ✅ Sinkronisasi jumlah orang dengan kuantitas global
  useEffect(() => {
    if (isPartyPackage) {
      const validPeopleCount = Math.max(4, numberOfPeople);
      onSetQuantity(validPeopleCount);
    }
  }, [numberOfPeople, isPartyPackage, onSetQuantity]);

  // ✅ Reset state lokal saat modal dibuka atau paket berubah
  useEffect(() => {
    if (showModal) {
      setNumberOfPeople(isPartyPackage ? Math.max(4, quantity) : 1);
    }
  }, [showModal, selectedModalPackage, isPartyPackage, quantity]);

  // ✅ Return harus diletakkan setelah semua hook
  if (!showModal) {
    return null;
  }

  const handlePeopleChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) value = 1;
    setNumberOfPeople(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-40 p-4">
      <div className="flex w-full max-w-lg max-h-[90vh] flex-col rounded-lg bg-white p-6">
        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Pilih layanan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* GAMBAR PAKET TERPILIH */}
        {selectedModalPackage && (
          <div className="mb-4 flex justify-center">
            <img
              src={`${API_URL}/${selectedModalPackage.image_url}`}
              alt={selectedModalPackage.nama_paket}
              className="h-64 w-full rounded-lg bg-gray-100 object-contain"
            />
          </div>
        )}

        {/* DAFTAR PILIHAN PAKET */}
        <div className="flex-1 overflow-y-auto pr-2">
          {modalCurrentPackage && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-bold">
                  {modalCurrentPackage[0]?.nama_paket.split(" - ")[0]}
                </h3>
                <p className="whitespace-pre-wrap text-sm text-gray-600">
                  {modalCurrentPackage[0]?.deskripsi_paket}
                </p>
              </div>

              <div className="mb-4">
                <p className="mb-2 font-semibold text-gray-700">
                  {modalCurrentPackage.length} Pilihan
                </p>

                {modalCurrentPackage.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => onSelectModalPackage(pkg)}
                    className={`mb-2 flex cursor-pointer items-center gap-4 rounded-lg border p-3 transition ${
                      selectedModalPackage?.id === pkg.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 bg-gray-100 hover:bg-gray-200"
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
                        src={`${API_URL}/${pkg.image_url}`}
                        alt={pkg.nama_paket}
                        className="h-16 w-16 rounded-lg bg-gray-50 object-contain"
                      />
                    )}

                    <div className="flex-grow">
                      <p className="font-medium">{pkg.nama_paket}</p>
                      <p className="text-sm text-gray-600">
                        Rp {pkg.harga.toLocaleString("id-ID")} •{" "}
                        {pkg.waktu_durasi || 10}min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* FOOTER (JUMLAH / PARTY) */}
        <div className="mt-auto border-t pt-4">
          {isPartyPackage ? (
            <div className="mb-4 flex items-center justify-between">
              <label htmlFor="jumlahOrang" className="font-semibold text-gray-700">
                Jumlah Orang
              </label>
              <input
                type="number"
                id="jumlahOrang"
                name="jumlahOrang"
                min="4"
                value={numberOfPeople}
                onChange={handlePeopleChange}
                className="w-24 rounded-lg border-gray-300 text-center font-semibold shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold text-gray-700">Jumlah</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSetQuantity(Math.max(1, quantity - 1))}
                  className="rounded-lg bg-gray-200 px-3 py-1 font-bold text-lg"
                >
                  -
                </button>
                <span className="font-semibold text-lg w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => onSetQuantity(quantity + 1)}
                  className="rounded-lg bg-gray-200 px-3 py-1 font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="w-full rounded-full bg-gray-200 px-6 py-2 font-semibold text-gray-800 transition hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              onClick={onAddToCart}
              className="w-full rounded-full bg-green-600 px-6 py-2 font-semibold text-white transition hover:bg-green-700"
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
