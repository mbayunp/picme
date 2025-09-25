import React from 'react';

const Step2_SelectDateTime = ({ selectedStudio, selectedDate, availableSlots, loadingSlots, dateMode, onBack, onContinue, onSelectDate, onSelectSlot, onSetDateMode, onPrevWeek, onNextWeek, getWeekDays, getDayName, formData, selectedPackage }) => {
  // Ambil durasi paket dari selectedPackage
  const packageDuration = selectedPackage?.waktu_durasi || 10;

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-3xl font-bold text-center mb-4">
        Pilih Tanggal & Waktu
      </h1>
      <div className="w-full max-w-3xl mb-6 flex justify-start">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
        >
          ← Kembali
        </button>
      </div>
      <p className="text-center text-lg font-semibold mb-6">
        Studio terpilih: <span className="text-blue-600">{selectedStudio.name}</span>
      </p>

      <p className="text-center text-lg font-semibold text-gray-700 mb-2">
        {selectedDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}
      </p>

      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={() => onSetDateMode("week")}
          className={`px-4 py-2 rounded-full font-medium ${
            dateMode === "week" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Mingguan
        </button>
        <button
          onClick={() => onSetDateMode("calendar")}
          className={`px-4 py-2 rounded-full font-medium ${
            dateMode === "calendar" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Kalender
        </button>
      </div>

      <div className="w-full max-w-3xl">
        {dateMode === "week" && (
          <div className="flex items-center justify-center gap-3 mb-6 overflow-x-auto pb-2">
            <button
              onClick={onPrevWeek}
              className="flex-shrink-0 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 shadow-sm"
            >
              ←
            </button>
            {getWeekDays().map((day) => (
              <button
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl shadow-sm text-sm transition-colors duration-200 ${
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
              onClick={onNextWeek}
              className="flex-shrink-0 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 shadow-sm"
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
              onChange={(e) => onSelectDate(new Date(e.target.value))}
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
              {availableSlots.pagi.length > 0 ? (
                availableSlots.pagi.map((slotObj, index) => (
                  <div key={index} className="relative">
                    {formData.waktu_mulai === slotObj.time && selectedPackage && (
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        {packageDuration}m
                      </span>
                    )}
                    <button
                      disabled={!slotObj.isAvailable}
                      onClick={() => onSelectSlot(slotObj.time)}
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
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Tidak ada slot tersedia.</p>
              )}
            </div>

            <h3 className="text-center mt-8 mb-3 text-lg font-semibold border-b pb-1">
              Sore
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {availableSlots.sore.length > 0 ? (
                availableSlots.sore.map((slotObj, index) => (
                  <div key={index} className="relative">
                    {formData.waktu_mulai === slotObj.time && selectedPackage && (
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        {packageDuration}m
                      </span>
                    )}
                    <button
                      disabled={!slotObj.isAvailable}
                      onClick={() => onSelectSlot(slotObj.time)}
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
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Tidak ada slot tersedia.</p>
              )}
            </div>
          </>
        )}

        <div className="flex justify-center mt-10">
          <button
            onClick={onContinue}
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
      </div>
    </div>
  );
};

export default Step2_SelectDateTime;