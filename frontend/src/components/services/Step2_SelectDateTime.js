import React from "react";
import moment from "moment";
import { FaArrowLeft, FaCalendarAlt, FaClock, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Step2_SelectDateTime = ({
  selectedStudio,
  selectedDate,
  availableSlots,
  loadingSlots,
  dateMode,
  onBack,
  onContinue,
  onSelectDate,
  onSelectSlot,
  onSetDateMode,
  onPrevWeek,
  onNextWeek,
  getWeekDays,
  getDayName,
  formData,
  selectedPackage,
}) => {

  const packageDurationText = selectedPackage?.waktu_durasi > 0
    ? `${selectedPackage.waktu_durasi} Menit`
    : '';

  const isPastSlot = (slotTimeString) => {
    const now = new Date();
    const currentSelectedDate = selectedDate instanceof Date ? selectedDate : new Date();
    const slotDate = new Date(currentSelectedDate);
    const [hour, minute] = slotTimeString.split(":").map(Number);
    slotDate.setHours(hour, minute, 0, 0);

    return currentSelectedDate.toDateString() === now.toDateString() && slotDate < now;
  };

  const isPastDate = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDay = day instanceof Date ? day : new Date();
    return checkDay < today;
  };

  const validSelectedDate = selectedDate instanceof Date ? selectedDate : new Date();

  return (
    <div className="flex flex-col items-center w-full pt-8 pb-16 px-4 bg-gray-50 min-h-[calc(100vh-64px)]">
      
      {/* --- HEADER --- */}
      <div className="w-full max-w-4xl mb-8 flex flex-col md:flex-row items-center justify-between relative">
        <button
          onClick={onBack}
          className="absolute left-0 top-0 md:static flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 hover:bg-gray-100"
        >
          <FaArrowLeft /> Kembali
        </button>
        
        <div className="text-center flex-grow mt-12 md:mt-0">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Pilih Jadwal</h1>
            <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-200">
                <span className="text-gray-500 text-sm">Lokasi:</span>
                <span className="font-bold text-green-600 text-sm">{selectedStudio?.name || 'Belum Dipilih'}</span>
            </div>
        </div>
        
        <div className="w-24 hidden md:block"></div>
      </div>

      <div className="w-full max-w-3xl">
        
        {/* --- TANGGAL & MODE --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FaCalendarAlt className="text-green-600" />
                    {validSelectedDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}
                </h2>

                {/* Segmented Control */}
                <div className="bg-gray-100 p-1 rounded-lg flex">
                    <button
                        onClick={() => onSetDateMode("week")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                            dateMode === "week" ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Mingguan
                    </button>
                    <button
                        onClick={() => onSetDateMode("calendar")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                            dateMode === "calendar" ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Kalender
                    </button>
                </div>
            </div>

            {/* Mode Mingguan */}
            {dateMode === "week" && (
                <div className="flex items-center justify-between gap-2">
                    <button onClick={onPrevWeek} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                        <FaChevronLeft />
                    </button>
                    
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full justify-center">
                        {getWeekDays().map((day) => {
                            const past = isPastDate(day);
                            const isSelected = validSelectedDate.toDateString() === day.toDateString();
                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => !past && onSelectDate(day)}
                                    disabled={past}
                                    className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-xl border-2 transition-all duration-200 ${
                                        past
                                            ? "bg-gray-50 border-transparent text-gray-300 cursor-not-allowed"
                                            : isSelected
                                            ? "bg-green-600 border-green-600 text-white shadow-md scale-105"
                                            : "bg-white border-gray-100 text-gray-600 hover:border-green-300 hover:bg-green-50"
                                    }`}
                                >
                                    <span className="text-[10px] uppercase font-bold tracking-wider">{getDayName(day)}</span>
                                    <span className="text-xl font-bold">{day.getDate()}</span>
                                </button>
                            );
                        })}
                    </div>

                    <button onClick={onNextWeek} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                        <FaChevronRight />
                    </button>
                </div>
            )}

            {/* Mode Kalender Full */}
            {dateMode === "calendar" && (
                <div className="flex justify-center">
                    <input
                        type="date"
                        value={moment(validSelectedDate).format("YYYY-MM-DD")}
                        onChange={(e) => onSelectDate(moment(e.target.value, "YYYY-MM-DD").toDate())}
                        min={moment().format("YYYY-MM-DD")}
                        className="w-full md:w-1/2 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                </div>
            )}
        </div>

        {/* --- SLOT WAKTU --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <FaClock className="text-green-600" /> Pilih Jam
            </h2>
            <p className="text-gray-500 text-sm mb-6">Durasi paket: <span className="font-semibold text-gray-700">{packageDurationText}</span></p>

            {loadingSlots ? (
                <div className="py-12 flex flex-col items-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                    <p>Mencari slot kosong...</p>
                </div>
            ) : (
                <>
                    {/* Slot Pagi */}
                    {availableSlots.pagi?.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">Pagi - Siang</h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {availableSlots.pagi.map((slotObj, index) => {
                                    const past = isPastSlot(slotObj.time);
                                    const disabled = !slotObj.isAvailable || past;
                                    const isSelected = formData.waktu_mulai === slotObj.time;
                                    return (
                                        <button
                                            key={`pagi-${index}`}
                                            disabled={disabled}
                                            onClick={() => !disabled && onSelectSlot(slotObj.time)}
                                            className={`py-2 px-1 rounded-lg text-sm font-semibold transition-all duration-200 border-2 ${
                                                disabled
                                                    ? "bg-gray-100 text-gray-300 border-transparent cursor-not-allowed"
                                                    : isSelected
                                                    ? "bg-green-600 text-white border-green-600 shadow-md transform scale-105"
                                                    : "bg-white text-gray-700 border-gray-100 hover:border-green-400 hover:bg-green-50 hover:text-green-700"
                                            }`}
                                        >
                                            {slotObj.time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Slot Sore */}
                    {availableSlots.sore?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">Sore - Malam</h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {availableSlots.sore.map((slotObj, index) => {
                                    const past = isPastSlot(slotObj.time);
                                    const disabled = !slotObj.isAvailable || past;
                                    const isSelected = formData.waktu_mulai === slotObj.time;
                                    return (
                                        <button
                                            key={`sore-${index}`}
                                            disabled={disabled}
                                            onClick={() => !disabled && onSelectSlot(slotObj.time)}
                                            className={`py-2 px-1 rounded-lg text-sm font-semibold transition-all duration-200 border-2 ${
                                                disabled
                                                    ? "bg-gray-100 text-gray-300 border-transparent cursor-not-allowed"
                                                    : isSelected
                                                    ? "bg-green-600 text-white border-green-600 shadow-md transform scale-105"
                                                    : "bg-white text-gray-700 border-gray-100 hover:border-green-400 hover:bg-green-50 hover:text-green-700"
                                            }`}
                                        >
                                            {slotObj.time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {(!availableSlots.pagi?.length && !availableSlots.sore?.length) && (
                        <div className="py-10 text-center bg-red-50 rounded-xl border border-red-100">
                            <p className="text-red-600 font-medium">Maaf, tidak ada jadwal tersedia pada tanggal ini.</p>
                            <p className="text-red-400 text-sm mt-1">Silakan pilih tanggal lain.</p>
                        </div>
                    )}
                </>
            )}
        </div>

        {/* --- ACTION BUTTON --- */}
        <div className="mt-10">
            <button
                onClick={onContinue}
                disabled={!formData.waktu_mulai}
                className={`w-full rounded-2xl py-4 px-8 font-bold text-lg shadow-lg transition-all transform duration-300 flex justify-center items-center gap-2 ${
                    formData.waktu_mulai
                        ? "bg-green-600 text-white hover:bg-green-700 hover:-translate-y-1 hover:shadow-green-500/40"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
                <span>Lanjutkan</span>
                {formData.waktu_mulai && <span className="text-xl">→</span>}
            </button>
        </div>

      </div>
    </div>
  );
};

export default Step2_SelectDateTime;