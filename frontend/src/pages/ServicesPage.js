import React, { useState, useEffect } from "react";
import axios from "axios";
import BookingSummary from "../components/services/BookingSummary";
import BookingForm from "../components/services/BookingForm";
import Step0_SelectStudio from "../components/services/Step0_SelectStudio";
import Step1_SelectPackage from "../components/services/Step1_SelectPackage";
import Step2_SelectDateTime from "../components/services/Step2_SelectDateTime";
import BookingModal from "../components/services/BookingModal";

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
    waktu_durasi: 0,
  });

  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [modalCurrentPackage, setModalCurrentPackage] = useState(null);
  const [selectedModalPackage, setSelectedModalPackage] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

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

  const fetchPackages = async (studioName) => {
    setLoadingPackages(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/packages?studio_name=${encodeURIComponent(studioName)}`);
      const formattedPackages = response.data.map((pkg) => ({
        ...pkg,
        id: parseInt(pkg.id, 10),
        waktu_durasi: pkg.waktu_durasi || 10, // Default 10 jika null
      }));
      setPackages(formattedPackages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      setPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    if (selectedStudio) {
      fetchPackages(selectedStudio.name);
    } else {
      setPackages([]);
    }
  }, [selectedStudio]);

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
    setFormData({ 
      ...formData, 
      waktu_mulai: time, 
      waktu_selesai: "",
    });
  };

  const handleOpenDetailModal = (categoryName) => {
    const relatedPackages = packages.filter(pkg => pkg.nama_paket.startsWith(categoryName));
    if (relatedPackages.length > 0) {
      setModalCurrentPackage(relatedPackages);
      setSelectedModalPackage(relatedPackages[0]);
      setShowModal(true);
    }
  };

  const handleAddToCart = () => {
    if (!selectedModalPackage) return;
    
    const newItem = { ...selectedModalPackage, quantity };
    
    const existingItemIndex = cart.findIndex(item => item.id === newItem.id);

    if (existingItemIndex > -1) {
      const updatedCart = cart.map((item, index) =>
        index === existingItemIndex ? { ...item, quantity: item.quantity + newItem.quantity } : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, newItem]);
    }
    
    setSelectedPackage(selectedModalPackage);

    setShowModal(false);
    setModalCurrentPackage(null);
    setSelectedModalPackage(null);
  };

  const handleContinueFromCart = () => {
    if (cart.length > 0) {
      const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
      const firstPackage = cart[0];
      
      setFormData({
        ...formData,
        package_id: firstPackage.id,
        studio_name: selectedStudio.name,
        jumlah_orang: totalQuantity,
        waktu_durasi: firstPackage.waktu_durasi
      });

      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRemoveFromCart = (packageId) => {
    setCart(cart.filter(item => item.id !== packageId));
  };
  
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
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
    const endHour = startHour + Math.floor(formData.waktu_durasi / 60);
    const endMinute = startMinute + (formData.waktu_durasi % 60);

    const bookingData = {
      nama: formData.nama,
      email: formData.email,
      nomor_whatsapp: formData.nomor_whatsapp,
      catatan: formData.catatan,
      tanggal: selectedDate.toISOString().split("T")[0],
      waktu_mulai: formData.waktu_mulai,
      waktu_selesai: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
      package_id: formData.package_id,
      studio_name: selectedStudio.name,
      jumlah_orang: formData.jumlah_orang,
    };

    try {
      await axios.post("http://localhost:8080/api/services", bookingData);

      setMessage("Pemesanan berhasil!");
      setStep(0);
      setFormData({
        nama: "", email: "", nomor_whatsapp: "", catatan: "",
        waktu_mulai: "", waktu_selesai: "", package_id: null,
        studio_name: "", jumlah_orang: 1, waktu_durasi: 0
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

  const groupedPackages = packages.reduce((acc, pkg) => {
    const categoryName = pkg.nama_paket.split(' - ')[0];
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(pkg);
    return acc;
  }, {});

  const totalHarga = cart.reduce((sum, item) => sum + (item.harga * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-6 pb-20">
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
      {step === 0 && (
        <Step0_SelectStudio
          studios={studios} selectedStudio={selectedStudio} onSelectStudio={handleStudioSelect} onContinue={handleContinueToPackages}
        />
      )}
      {step === 1 && (
        <>
          <Step1_SelectPackage
            selectedStudio={selectedStudio} groupedPackages={groupedPackages} loadingPackages={loadingPackages} onOpenModal={handleOpenDetailModal} onBack={() => setStep(0)}
          />
          <BookingModal
            showModal={showModal} onClose={() => setShowModal(false)} modalCurrentPackage={modalCurrentPackage} selectedModalPackage={selectedModalPackage} onSelectModalPackage={setSelectedModalPackage} quantity={quantity} onSetQuantity={setQuantity} onAddToCart={handleAddToCart}
          />
          
          {/* Keranjang Mini - Muncul jika ada item di cart */}
          {cart.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-lg border-t md:w-1/3 md:mx-auto md:rounded-t-lg">
              {/* Ini adalah bagian ringkas yang selalu terlihat */}
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-lg font-semibold">{totalItems} item</p>
                  <p className="text-sm text-gray-600">Rp {totalHarga.toLocaleString("id-ID")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleCart}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-transform transform"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-6 w-6 transition-transform transform ${isCartOpen ? 'rotate-180' : 'rotate-0'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleContinueFromCart}
                    className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition-colors"
                  >
                    Lanjutkan
                  </button>
                </div>
              </div>
              
              {/* Bagian detail keranjang yang muncul/sembunyi */}
              {isCartOpen && (
                <div className="p-4 border-t">
                  <p className="text-sm font-semibold">Tanggal Appointment</p>
                  <p className="text-lg font-bold text-green-600">
                    {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  
                  <div className="mt-2 space-y-2">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-gray-700">
                        <p className="text-sm">{item.nama_paket} ({item.waktu_durasi}min)</p>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">({item.quantity}) {item.harga.toLocaleString('id-ID')}</span>
                          <button onClick={() => handleRemoveFromCart(item.id)} className="text-red-500 hover:text-red-700 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
      {step === 2 && (
        <Step2_SelectDateTime
          selectedStudio={selectedStudio} selectedDate={selectedDate} availableSlots={availableSlots} loadingSlots={loadingSlots} dateMode={dateMode} onBack={() => setStep(1)} onContinue={() => setStep(3)} onSelectDate={setSelectedDate} onSelectSlot={handleSlotClick} onSetDateMode={setDateMode} onPrevWeek={handlePrevWeek} onNextWeek={handleNextWeek} getWeekDays={getWeekDays} getDayName={getDayName} formData={formData} selectedPackage={selectedPackage}
        />
      )}
      {step === 3 && (
        <>
          <h1 className="text-2xl font-bold text-center mb-6">Konfirmasi Pemesanan</h1>
          <div className="max-w-6xl mx-auto">
            <button onClick={() => setStep(2)} className="mb-4 px-3 py-1 bg-gray-300 rounded">
              ← Kembali
            </button>
          </div>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <BookingSummary
                studio={selectedStudio.name} date={selectedDate} time={formData.waktu_mulai} cart={cart} formData={formData}
              />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <BookingForm
                formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} selectedTime={formData.waktu_mulai}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ServicesPage;