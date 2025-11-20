import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import moment from "moment";

import BookingSummary from "../components/services/BookingSummary";
import BookingForm from "../components/services/BookingForm";
import Step0SelectStudio from "../components/services/Step0_SelectStudio";
import Step1SelectPackage from "../components/services/Step1_SelectPackage";
import Step2SelectDateTime from "../components/services/Step2_SelectDateTime";
import BookingModal from "../components/services/BookingModal";

import { FaCheckCircle } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

function ServicesPage() {
    const getMonday = (d) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        date.setDate(diff);
        date.setHours(0, 0, 0, 0);
        return date;
    };

    // --- STATE ---
    const [step, setStep] = useState(0);
    const [selectedDate, setSelectedDate] = useState(null);
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

    // ✅ STATE POPUP
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [, setSuccessMessage] = useState("");

    const studios = [
        { id: 1, name: "Picme Photo Studio 1", address: "Cluster Pramuka Blok C.4, Cianjur" },
        { id: 2, name: "Picme Photo Studio 2", address: "Cluster Pramuka Blok C.4, Cianjur" },
        { id: 3, name: "Picme Photo Studio 3", address: "Cluster Pramuka Blok C.4, Cianjur" },
        { id: 4, name: "Picme Photo Studio 4", address: "Cluster Pramuka Blok C.4, Cianjur" },
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

    // --- Fetch Packages ---
    const fetchPackages = async (studioName) => {
        setLoadingPackages(true);
        try {
            const response = await axios.get(`${API_URL}/api/packages?studio_name=${encodeURIComponent(studioName)}`);
            const formattedPackages = response.data.map((pkg) => ({
                ...pkg,
                id: parseInt(pkg.id, 10),
                waktu_durasi: pkg.waktu_durasi || 10,
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

    // --- Fetch Slots ---
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

    // ✅ PERBAIKAN 1: Membungkus fetchAvailableSlots dengan useCallback
    const fetchAvailableSlots = useCallback(async (date, studio) => {
        setLoadingSlots(true);
        try {
            const formattedDate = moment(date).format('YYYY-MM-DD');
            const response = await axios.get(
                `${API_URL}/api/services/slots?date=${formattedDate}&studio=${studio}`
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
    }, [setAvailableSlots, setLoadingSlots]); // Dependensi ditambahkan

    // useEffect yang bergantung pada fetchAvailableSlots
    useEffect(() => {
        if (selectedDate && selectedStudio) {
            fetchAvailableSlots(selectedDate, selectedStudio.name);
        }
    }, [selectedDate, selectedStudio, fetchAvailableSlots]); 

    // --- Handlers ---
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
        const relatedPackages = packages.filter(pkg => 
            pkg.nama_paket.startsWith(categoryName) && 
            (pkg.is_active === 1 || pkg.is_active === true) 
        );
        
        if (relatedPackages.length > 0) {
            setModalCurrentPackage(relatedPackages);
            setSelectedModalPackage(relatedPackages[0]);
            setQuantity(1);
            setShowModal(true);
        }
    };

    const handleAddToCart = () => {
        if (!selectedModalPackage) return;

        const newItem = { ...selectedModalPackage, quantity };
        const existingItemIndex = cart.findIndex(item => item.id === newItem.id);

        let updatedCart;
        if (existingItemIndex > -1) {
            updatedCart = cart.map((item, index) =>
                index === existingItemIndex ? { ...item, quantity: item.quantity + newItem.quantity } : item
            );
        } else {
            updatedCart = [...cart, newItem];
        }

        setCart(updatedCart);
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

            if (!selectedDate) {
                setSelectedDate(new Date());
            }

            setStep(2);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            setMessage("Keranjang masih kosong, pilih paket dulu!");
        }
    };

    const handleRemoveFromCart = (packageId) => {
        setCart(cart.filter(item => item.id !== packageId));
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    // --- SUBMIT BOOKING ---
    const handleSubmit = async (data) => {
        setMessage("");

        if (!data.package_id) return setMessage("Pilih paket terlebih dahulu!");
        if (!selectedDate || !data.waktu_mulai) return setMessage("Pilih tanggal dan slot waktu!");

        const [startHour, startMinute] = data.waktu_mulai.split(':').map(Number);
        const endHour = startHour + Math.floor(data.waktu_durasi / 60);
        const endMinute = startMinute + (data.waktu_durasi % 60);
        const formattedDate = moment(selectedDate).format('YYYY-MM-DD');

        const bookingData = {
            nama: data.nama,
            email: data.email,
            nomor_whatsapp: data.nomor_whatsapp,
            catatan: data.catatan,
            tanggal: formattedDate,
            waktu_mulai: data.waktu_mulai,
            waktu_selesai: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
            package_id: data.package_id,
            studio_name: selectedStudio.name,
            jumlah_orang: data.jumlah_orang,
        };

        try {
            await axios.post(`${API_URL}/api/services`, bookingData);
            
            setShowSuccessPopup(true);
            setSuccessMessage("Pemesanan berhasil dibuat!"); 

        } catch (error) {
            console.error("Error submitting booking:", error);
            setMessage("Terjadi kesalahan saat memesan. Silakan coba lagi.");
        }
    };

    const handleCloseSuccessPopup = () => {
        setShowSuccessPopup(false);
        setSuccessMessage("");
        
        // Reset Semua State ke Awal
        setStep(0);
        setFormData({
            nama: "", email: "", nomor_whatsapp: "", catatan: "",
            waktu_mulai: "", waktu_selesai: "", package_id: null,
            studio_name: "", jumlah_orang: 1, waktu_durasi: 0
        });
        setSelectedDate(null);
        setSelectedStudio(null);
        setCart([]);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Navigation Handlers
    const handleStudioSelect = (studio) => setSelectedStudio(studio);
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

    // Grouping Packages
    const groupedPackages = packages.reduce((acc, pkg) => {
        if (pkg.is_active === 1 || pkg.is_active === true) {
            const categoryName = pkg.nama_paket.split(' - ')[0]; 
            if (!acc[categoryName]) acc[categoryName] = [];
            acc[categoryName].push(pkg);
        }
        return acc;
    }, {});

    const totalHarga = cart.reduce((sum, item) => sum + (item.harga * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-gray-50 pt-24 px-6 pb-20 font-sans text-gray-800">
            
            {/* --- Error Alert --- */}
            {message && (
                <div className="max-w-3xl mx-auto bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm" role="alert">
                    <p className="font-bold">Perhatian</p>
                    <p>{message}</p>
                </div>
            )}

            {/* --- STEP 0: STUDIO --- */}
            {step === 0 && (
                <Step0SelectStudio
                    studios={studios} 
                    selectedStudio={selectedStudio} 
                    onSelectStudio={handleStudioSelect} 
                    onContinue={handleContinueToPackages}
                />
            )}

            {/* --- STEP 1: PAKET --- */}
            {step === 1 && (
                <>
                    <Step1SelectPackage
                        selectedStudio={selectedStudio} 
                        groupedPackages={groupedPackages} 
                        loadingPackages={loadingPackages} 
                        onOpenModal={handleOpenDetailModal} 
                        onBack={() => setStep(0)}
                    />
                    
                    <BookingModal
                        showModal={showModal} 
                        onClose={() => setShowModal(false)} 
                        modalCurrentPackage={modalCurrentPackage} 
                        selectedModalPackage={selectedModalPackage} 
                        onSelectModalPackage={setSelectedModalPackage} 
                        quantity={quantity} 
                        onSetQuantity={setQuantity} 
                        onAddToCart={handleAddToCart}
                    />

                    {/* FLOATING CART */}
                    {cart.length > 0 && (
                        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t md:w-1/3 md:mx-auto md:rounded-t-xl">
                            <div className="flex items-center justify-between p-4">
                                <div>
                                    <p className="text-lg font-bold text-gray-800">{totalItems} Item</p>
                                    <p className="text-sm text-green-600 font-medium">Rp {totalHarga.toLocaleString("id-ID")}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={toggleCart}
                                        className="p-2 text-gray-500 hover:text-gray-900 transition-transform transform"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform ${isCartOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={handleContinueFromCart}
                                        className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-gray-800 transition shadow-lg"
                                    >
                                        Lanjut
                                    </button>
                                </div>
                            </div>
                            {/* Detail Cart (Slide Up) */}
                            {isCartOpen && (
                                <div className="p-4 border-t bg-gray-50 max-h-60 overflow-y-auto">
                                    <div className="space-y-3">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{item.nama_paket}</p>
                                                    <p className="text-xs text-gray-500">{item.waktu_durasi} menit</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-gray-900 text-sm">x{item.quantity}</span>
                                                    <button onClick={() => handleRemoveFromCart(item.id)} className="text-red-500 hover:text-red-700">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 000-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
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

            {/* --- STEP 2: TANGGAL & WAKTU --- */}
            {step === 2 && (
                <Step2SelectDateTime
                    selectedStudio={selectedStudio} 
                    selectedDate={selectedDate} 
                    availableSlots={availableSlots} 
                    loadingSlots={loadingSlots} 
                    dateMode={dateMode} 
                    onBack={() => setStep(1)} 
                    onContinue={() => setStep(3)} 
                    onSelectDate={setSelectedDate} 
                    onSelectSlot={handleSlotClick} 
                    onSetDateMode={setDateMode} 
                    onPrevWeek={handlePrevWeek} 
                    onNextWeek={handleNextWeek} 
                    getWeekDays={getWeekDays} 
                    getDayName={getDayName} 
                    formData={formData} 
                    selectedPackage={selectedPackage || (cart.length > 0 ? cart[0] : null)}
                />
            )}

            {/* --- STEP 3: FORM & SUMMARY --- */}
            {step === 3 && (
                <div className="max-w-6xl mx-auto pt-8">
                    <button onClick={() => setStep(2)} className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition font-medium">
                        <span className="mr-2">←</span> Kembali ke Jadwal
                    </button>
                    
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Form Kiri */}
                        <div className="w-full lg:w-2/3 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                            <BookingForm
                                formData={formData} 
                                handleChange={handleChange} 
                                handleSubmit={handleSubmit} 
                                selectedTime={formData.waktu_mulai}
                            />
                        </div>

                        {/* Summary Kanan */}
                        <div className="w-full lg:w-1/3">
                            <BookingSummary
                                studio={selectedStudio.name} 
                                date={selectedDate} 
                                time={formData.waktu_mulai} 
                                cart={cart} 
                                formData={formData}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- POPUP SUKSES (MODAL) --- */}
            {showSuccessPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all scale-100">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <FaCheckCircle className="text-5xl" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Pesanan Berhasil!</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Terima kasih telah memesan di Picme Studio. Mohon tunggu, admin kami akan segera menghubungi Anda via WhatsApp.
                        </p>
                        <button 
                            onClick={handleCloseSuccessPopup}
                            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition transform active:scale-95 shadow-lg"
                        >
                            Selesai
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ServicesPage;