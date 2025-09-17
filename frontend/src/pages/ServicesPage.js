// src/pages/ServicesPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import BookingSummary from "./BookingSummary";

const BookingForm = ({ formData, handleChange, handleSubmit, selectedTime }) => {
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
    >
      <h2 className="text-2xl font-bold mb-4">Detail Kontak</h2>

      <div className="mb-4">
        <label htmlFor="nama" className="block text-gray-700 font-medium mb-1">
          Nama Lengkap
        </label>
        <input
          type="text"
          id="nama"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="nomor_whatsapp"
          className="block text-gray-700 font-medium mb-1"
        >
          Nomor WhatsApp
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
            +62
          </span>
          <input
            type="tel"
            id="nomor_whatsapp"
            name="nomor_whatsapp"
            value={formData.nomor_whatsapp}
            onChange={handleChange}
            required
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="8123456789"
          />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="catatan" className="block text-gray-700 font-medium mb-1">
          Catatan
        </label>
        <textarea
          id="catatan"
          name="catatan"
          value={formData.catatan}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
        ></textarea>
      </div>

      {/* Pemberitahuan 10 menit */}
      <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-3 rounded">
        Tolong datang 10 menit sebelum sesi foto dimulai.
      </div>

      <div className="mt-6 flex flex-col items-start gap-2">
        <p className="text-sm text-gray-600">
          Waktu terpilih:{" "}
          <span className="font-semibold text-gray-800">{selectedTime}</span>
        </p>
        <button
          type="submit"
          className="bg-green-600 text-white font-bold py-3 px-6 rounded-full hover:bg-green-700 transition-colors duration-200"
        >
          Konfirmasi Pemesanan
        </button>
      </div>
    </form>
  );
};

function ServicesPage() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStudio, setSelectedStudio] = useState("Picme Photo Studio 1");
  const [weekStartDate, setWeekStartDate] = useState(new Date());

  const [availableSlots, setAvailableSlots] = useState({ pagi: [], sore: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    nomor_whatsapp: "",
    catatan: "",
    waktu_mulai: "",
    waktu_selesai: "",
    package_id: null,
    studio_name: "",
    jumlah_orang: 1,
  });

  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  const getDayName = (date) => {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    return days[date.getDay()];
  };

  const getWeekDays = () => {
    const weekDays = [];
    const start = new Date(weekStartDate);
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  useEffect(() => {
    const fetchPackages = async () => {
      setLoadingPackages(true);
      try {
        const response = await axios.get("http://localhost:8080/api/packages");
        const formattedPackages = response.data.map((pkg) => ({
          ...pkg,
          id: parseInt(pkg.id, 10),
        }));
        setPackages(formattedPackages);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoadingPackages(false);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedStudio) {
      fetchAvailableSlots(selectedDate, selectedStudio);
    }
  }, [selectedDate, selectedStudio]);

  const fetchAvailableSlots = async (date, studio) => {
    setLoadingSlots(true);
    try {
      const formattedDate = date.toISOString().split("T")[0];
      const response = await axios.get(
        `http://localhost:8080/api/services/slots?date=${formattedDate}&studio=${studio}`
      );
      setAvailableSlots({
        pagi: response.data.pagi || [],
        sore: response.data.sore || [],
      });
    } catch (error) {
      console.error("Error fetching slots:", error);
      setAvailableSlots({ pagi: [], sore: [] });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSlotClick = (slot) => {
    setFormData({ ...formData, waktu_mulai: slot, waktu_selesai: "" });
  };

  const handlePackageClick = (pkg) => {
    setSelectedPackage(pkg);
    setQuantity(1);
    setShowModal(true);
  };

  const handleAddToCart = () => {
    if (!selectedPackage) return;

    const newItem = { ...selectedPackage, quantity };
    setCart([...cart, newItem]);

    const newPackageId = parseInt(selectedPackage.id, 10);
    setFormData({
      ...formData,
      package_id: isNaN(newPackageId) ? null : newPackageId,
      jumlah_orang: quantity,
    });

    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.package_id || isNaN(formData.package_id)) {
      setMessage("Pilih paket terlebih dahulu!");
      return;
    }
    if (!selectedDate || !formData.waktu_mulai) {
      setMessage("Pilih tanggal dan slot waktu!");
      return;
    }
    if (!formData.jumlah_orang || formData.jumlah_orang < 1) {
      setMessage("Isi jumlah orang minimal 1!");
      return;
    }

    const bookingData = {
      nama: formData.nama,
      email: formData.email,
      nomor_whatsapp: formData.nomor_whatsapp,
      catatan: formData.catatan,
      tanggal: selectedDate.toISOString().split("T")[0],
      waktu_mulai: formData.waktu_mulai,
      package_id: formData.package_id,
      studio_name: selectedStudio,
      jumlah_orang: formData.jumlah_orang,
    };

    try {
      await axios.post("http://localhost:8080/api/services", bookingData);

      setMessage("Pemesanan berhasil!");
      setStep(1);
      setFormData({
        nama: "",
        email: "",
        nomor_whatsapp: "",
        catatan: "",
        waktu_mulai: "",
        waktu_selesai: "",
        package_id: null,
        studio_name: "",
        jumlah_orang: 1,
      });
      setSelectedDate(new Date());
      setCart([]);
    } catch (error) {
      console.error("Error submitting booking:", error.response || error);
      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Terjadi kesalahan saat memesan. Silakan coba lagi.";
      setMessage(errorMessage);
    }
  };

  const handleStudioChange = (studioName) => {
    setSelectedStudio(studioName);
    setSelectedDate(new Date());
    setAvailableSlots([]);
  };

  const handlePrevWeek = () => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(weekStartDate.getDate() - 7);
    setWeekStartDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(weekStartDate.getDate() + 7);
    setWeekStartDate(newDate);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-6">
      {message && (
        <div
          className={`px-4 py-3 rounded relative mb-4 border ${
            message.toLowerCase().includes("berhasil")
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-red-100 border-red-400 text-red-700"
          }`}
          role="alert"
        >
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Pilih Studio & Paket
          </h1>
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            {[
              "Picme Photo Studio 1",
              "Picme Photo Studio 2",
              "Picme Photo Studio 3",
              "Picme Photo Studio 4",
            ].map((studio) => (
              <button
                key={studio}
                onClick={() => handleStudioChange(studio)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedStudio === studio
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {studio}
              </button>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold mb-3">Pilih Paket</h3>
            {loadingPackages ? (
              <p className="text-gray-500">Memuat paket...</p>
            ) : (
              <div className="grid gap-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="border rounded-lg p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                  >
                    <div>
                      <p className="font-medium">{pkg.nama_paket}</p>
                      <p className="text-sm text-gray-500">
                        Rp {pkg.harga.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePackageClick(pkg)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Pilih
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showModal && selectedPackage && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-80">
                <h2 className="text-lg font-bold mb-3">
                  {selectedPackage.nama_paket}
                </h2>
                <p className="mb-2 text-gray-600">
                  Harga: Rp {selectedPackage.harga.toLocaleString("id-ID")}
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span className="font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1 bg-gray-300 rounded"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          )}

          {cart.length > 0 && (
            <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-white shadow-lg border rounded-lg p-4 w-96">
              <h3 className="font-bold mb-2">Keranjang</h3>
              <ul className="max-h-32 overflow-y-auto mb-3">
                {cart.map((item, index) => (
                  <li key={index} className="flex justify-between text-sm mb-1">
                    <span>
                      {item.nama_paket} × {item.quantity}
                    </span>
                    <span>
                      Rp {(item.harga * item.quantity).toLocaleString("id-ID")}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setStep(2);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full bg-green-600 text-white py-2 rounded"
              >
                Lanjutkan →
              </button>
            </div>
          )}
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <h1 className="text-2xl font-bold text-center mb-6">Pilih Waktu</h1>
          <button
            onClick={() => setStep(1)}
            className="mb-4 px-3 py-1 bg-gray-300 rounded"
          >
            ← Kembali
          </button>

          {loadingSlots ? (
            <p className="text-gray-500">Memuat jadwal...</p>
          ) : (
            <>
              <p className="text-center text-gray-600 mb-2">
                Kapan kamu ingin memulai?
              </p>

              {/* kelompok pagi */}
              <h3 className="text-center mt-4 mb-2 font-medium">Pagi</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {availableSlots.pagi.map((slot, index) => (
                  <button
                    key={index}
                    disabled={!slot.isAvailable}
                    onClick={() => handleSlotClick(slot.time)}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      formData.waktu_mulai === slot.time
                        ? "bg-blue-600 text-white"
                        : slot.isAvailable
                        ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        : "bg-red-100 text-red-500 cursor-not-allowed"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>

              {/* kelompok sore */}
              <h3 className="text-center mt-6 mb-2 font-medium">Sore</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {availableSlots.sore.map((slot, index) => (
                  <button
                    key={index}
                    disabled={!slot.isAvailable}
                    onClick={() => handleSlotClick(slot.time)}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      formData.waktu_mulai === slot.time
                        ? "bg-blue-600 text-white"
                        : slot.isAvailable
                        ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        : "bg-red-100 text-red-500 cursor-not-allowed"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>

              {/* tombol lanjut */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => {
                    setStep(3);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={!formData.waktu_mulai}
                  className={`px-6 py-2 rounded-full font-semibold ${
                    formData.waktu_mulai
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Lanjutkan →
                </button>
              </div>
            </>
          )}
        </>
      )}

     {step === 3 && (
  <>
    <h1 className="text-2xl font-bold text-center mb-6">
      Konfirmasi Pemesanan
    </h1>
    <button
      onClick={() => setStep(2)}
      className="mb-4 px-3 py-1 bg-gray-300 rounded"
    >
      ← Kembali
    </button>

    {/* Grid 2 kolom untuk summary & form */}
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* kotak summary */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <BookingSummary
          studio={selectedStudio}
          date={selectedDate}
          time={formData.waktu_mulai}
          selectedPackage={selectedPackage}
          quantity={formData.jumlah_orang}
        />
      </div>

      {/* kotak form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <BookingForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          selectedTime={formData.waktu_mulai}
        />
      </div>
    </div>
  </>
)}
    </div>
  );
}

export default ServicesPage;
