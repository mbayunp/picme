import React from "react";

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
    if (!showModal) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-40 p-4">
            <div className="flex w-full max-w-lg max-h-[90vh] flex-col rounded-lg bg-white p-6">
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

                {selectedModalPackage && (
                    <div className="mb-4 flex justify-center">
                        <img
                            src={`http://localhost:8080/${selectedModalPackage.image_url}`}
                            alt={selectedModalPackage.nama_paket}
                            className="h-64 w-full rounded-lg bg-gray-100 object-contain"
                        />
                    </div>
                )}

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
                                                src={`http://localhost:8080/${pkg.image_url}`}
                                                alt={pkg.nama_paket}
                                                className="h-16 w-16 rounded-lg bg-gray-50 object-contain"
                                            />
                                        )}
                                        <div className="flex-grow">
                                            <p className="font-medium">{pkg.nama_paket}</p>
                                            <p className="text-sm text-gray-600">
                                                Rp {pkg.harga.toLocaleString("id-ID")} • 10min
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onSetQuantity(Math.max(1, quantity - 1))}
                            className="rounded-lg bg-gray-200 px-3 py-1"
                        >
                            -
                        </button>
                        <span className="font-semibold">{quantity}</span>
                        <button
                            onClick={() => onSetQuantity(quantity + 1)}
                            className="rounded-lg bg-gray-200 px-3 py-1"
                        >
                            +
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="rounded-full bg-gray-200 px-6 py-2 font-semibold text-gray-800 transition hover:bg-gray-300"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onAddToCart}
                            className="rounded-full bg-green-600 px-6 py-2 font-semibold text-white transition hover:bg-green-700"
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