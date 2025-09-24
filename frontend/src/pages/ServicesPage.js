import React, { useState, useEffect } from "react";
import axios from "axios";
import BookingSummary from "./BookingSummary";

const BookingForm = ({ formData, handleChange, handleSubmit, selectedTime }) => {
  return (
    <form onSubmit={handleSubmit} className="w-full">
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
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [weekStartDate, setWeekStartDate] = useState(getMonday(new Date()));
  const [dateMode, setDateMode] = useState("week");

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

  const studios = [
    { name: "Picme Photo Studio 1", address: "cluster pramuka Blok C.4," },
    { name: "Picme Photo Studio 2", address: "cluster pramuka Blok C.4," },
    { name: "Picme Photo Studio 3", address: "Cluster Pramuka Blok C.4" },
    { name: "Picme Photo Studio 4", address: "Cluster Pramuka Blok C.4" },
  ];

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

  const normalizeSlots = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((s) =>
      typeof s === "string"
        ? { time: s, isAvailable: true }
        : s && typeof s === "object" && s.time
        ? { time: s.time, isAvailable: !!s.isAvailable }
        : null
    ).filter(Boolean);
  };

  useEffect(() => {
    if (selectedDate && selectedStudio) {
      fetchAvailableSlots(selectedDate, selectedStudio.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedStudio]);

  const fetchAvailableSlots = async (date, studio) => {
    setLoadingSlots(true);
    try {
      const formattedDate = date.toISOString().split("T")[0];
      const response = await axios.get(
        `http://localhost:8080/api/services/slots?date=${formattedDate}&studio=${studio}`
      );
      setAvailableSlots({
        pagi: normalizeSlots(response.data.pagi || []),
        sore: normalizeSlots(response.data.sore || []),
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

  const handleSlotClick = (time) => {
    setFormData({ ...formData, waktu_mulai: time, waktu_selesai: "" });
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

    const [startHour, startMinute] = formData.waktu_mulai.split(':').map(Number);
    const endHour = startHour + 1;
    const waktuSelesai = `${String(endHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;

    const bookingData = {
      nama: formData.nama,
      email: formData.email,
      nomor_whatsapp: formData.nomor_whatsapp,
      catatan: formData.catatan,
      tanggal: selectedDate.toISOString().split("T")[0],
      waktu_mulai: formData.waktu_mulai,
      waktu_selesai: waktuSelesai,
      package_id: formData.package_id,
      studio_name: selectedStudio.name,
      jumlah_orang: formData.jumlah_orang,
    };

    try {
      await axios.post("http://localhost:8080/api/services", bookingData);

      setMessage("Pemesanan berhasil!");
      setStep(0);
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

  const handleStudioSelect = (studio) => {
    setSelectedStudio(studio);
  };

  const handleContinueToPackages = () => {
      if (selectedStudio) {
          setStep(1);
          window.scrollTo({ top: 0, behavior: "smooth" });
      }
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

      {/* STEP 0: PILIH STUDIO */}
      {step === 0 && (
        <>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Pilih Lokasi
          </h1>
          <div className="max-w-md mx-auto">
            <div className="p-4 mb-6 bg-white rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <img
                  src={require("../assets/images/PicmeLogo.png")}
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
                onClick={() => handleStudioSelect(studio)}
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
              onClick={handleContinueToPackages}
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
        </>
      )}

      {/* STEP 1: PILIH PAKET */}
      {step === 1 && (
        <>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Pilih Paket
          </h1>
          <button
            onClick={() => setStep(0)}
            className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            ← Kembali
          </button>
          <p className="text-center text-lg font-semibold mb-6">
            Studio terpilih: <span className="text-blue-600">{selectedStudio.name}</span>
          </p>

          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold mb-3">Pilih Paket</h3>
            {loadingPackages ? (
              <p className="text-gray-500">Memuat paket...</p>
            ) : (
              <div className="grid gap-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="border rounded-lg p-3 flex gap-4 items-center cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  >
                    {pkg.image_url && (
                      <img
                        src={`http://localhost:8080/assets/images/${pkg.image_url}`}
                        alt={pkg.nama_paket}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-grow">
                      <p className="font-bold text-lg">{pkg.nama_paket}</p>
                      <p className="text-sm text-gray-700 mb-2">
                        {pkg.deskripsi_paket}
                      </p>
                      <p className="text-md text-gray-900 font-semibold">
                        Rp {pkg.harga.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePackageClick(pkg)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition"
                    >
                      Pilih
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showModal && selectedPackage && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-lg w-full max-w-sm flex flex-col items-center text-center">
                {selectedPackage.image_url && (
                  <img
                    src={`http://localhost:8080/assets/images/${selectedPackage.image_url}`}
                    alt={selectedPackage.nama_paket}
                    className="w-48 h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h2 className="text-lg font-bold mb-1">
                  {selectedPackage.nama_paket}
                </h2>
                <p className="text-sm text-gray-600 mb-2">
                  Rp {selectedPackage.harga.toLocaleString("id-ID")}
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
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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

      {/* STEP 2: PILIH TANGGAL & WAKTU */}
      {step === 2 && (
        <>
          <h1 className="text-3xl font-bold text-center mb-4">
            Pilih Tanggal & Waktu
          </h1>
          <button
            onClick={() => setStep(1)}
            className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            ← Kembali
          </button>

          <p className="text-center text-lg font-semibold text-gray-700 mb-2">
            {weekStartDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}
          </p>

          <div className="flex justify-center gap-3 mb-6">
            <button
              onClick={() => setDateMode("week")}
              className={`px-4 py-2 rounded-full font-medium ${
                dateMode === "week" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Mingguan
            </button>
            <button
              onClick={() => setDateMode("calendar")}
              className={`px-4 py-2 rounded-full font-medium ${
                dateMode === "calendar" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Kalender
            </button>
          </div>

          {dateMode === "week" && (
            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                onClick={handlePrevWeek}
                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 shadow-sm"
              >
                ←
              </button>
              {getWeekDays().map((day) => (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center px-4 py-3 rounded-xl shadow-sm text-sm transition-colors duration-200 ${
                    selectedDate.toDateString() === day.toDateString()
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-200 hover:bg-blue-50"
                  }`}
                >
                  <span className="text-xs">{getDayName(day)}</span>
                  <span className="text-lg font-semibold">{day.getDate()}</span>
                </button>
              ))}
              <button
                onClick={handleNextWeek}
                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 shadow-sm"
              >
                →
              </button>
            </div>
          )}

          {dateMode === "calendar" && (
            <div className="flex justify-center mb-6">
              <input
                type="date"
                value={selectedDate.toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="border px-4 py-2 rounded-lg shadow-sm"
              />
            </div>
          )}

          {loadingSlots ? (
            <p className="text-center text-gray-500">Memuat jadwal...</p>
          ) : (
            <>
              <p className="text-center text-gray-700 mb-3 font-medium">
                Kapan kamu ingin memulai?
              </p>

              <h3 className="text-center mt-6 mb-3 text-lg font-semibold border-b pb-1">
                Pagi
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {availableSlots.pagi.map((slotObj, index) => (
                  <button
                    key={index}
                    disabled={!slotObj.isAvailable}
                    onClick={() => handleSlotClick(slotObj.time)}
                    className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-colors duration-200 ${
                      formData.waktu_mulai === slotObj.time
                        ? "bg-blue-600 text-white"
                        : slotObj.isAvailable
                        ? "bg-gray-100 text-gray-800 hover:bg-blue-50"
                        : "bg-red-100 text-red-500 cursor-not-allowed"
                    }`}
                  >
                    {slotObj.time}
                  </button>
                ))}
              </div>

              <h3 className="text-center mt-8 mb-3 text-lg font-semibold border-b pb-1">
                Sore
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {availableSlots.sore.map((slotObj, index) => (
                  <button
                    key={index}
                    disabled={!slotObj.isAvailable}
                    onClick={() => handleSlotClick(slotObj.time)}
                    className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-colors duration-200 ${
                      formData.waktu_mulai === slotObj.time
                        ? "bg-blue-600 text-white"
                        : slotObj.isAvailable
                        ? "bg-gray-100 text-gray-800 hover:bg-blue-50"
                        : "bg-red-100 text-red-500 cursor-not-allowed"
                    }`}
                  >
                    {slotObj.time}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-center mt-10">
            <button
              onClick={() => {
                setStep(3);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={!formData.waktu_mulai}
              className={`px-8 py-3 rounded-full font-semibold shadow-md ${
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

      {/* STEP 3: KONFIRMASI PEMESANAN */}
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

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <BookingSummary
                studio={selectedStudio.name}
                date={selectedDate}
                time={formData.waktu_mulai}
                selectedPackage={selectedPackage}
                quantity={formData.jumlah_orang}
              />
            </div>

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