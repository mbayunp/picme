import React from "react";
import moment from "moment";

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
  const packageDuration = selectedPackage?.waktu_durasi || 10;

  const isPastSlot = (slotTimeString) => {
    const now = new Date();
    const slotDate = new Date(selectedDate);
    const [hour, minute] = slotTimeString.split(":").map(Number);
    slotDate.setHours(hour, minute, 0, 0);
    return selectedDate.toDateString() === now.toDateString() && slotDate < now;
  };

  const isPastDate = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return day < today;
  };

  return (
    <div className="w-full flex flex-col items-center">
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

      <p className="text-lg font-semibold text-center mb-6">
        Studio terpilih:{" "}
        <span className="text-blue-600">{selectedStudio.name}</span>
      </p>

      <p className="text-lg font-semibold text-gray-700 text-center mb-2">
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
        {/* Pilih tanggal */}
        {dateMode === "week" && (
          <div className="flex items-center justify-center gap-3 mb-6 overflow-x-auto pb-2">
            <button
              onClick={onPrevWeek}
              className="flex-shrink-0 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 shadow-sm"
            >
              ←
            </button>
            {getWeekDays().map((day) => {
              const past = isPastDate(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => !past && onSelectDate(day)}
                  disabled={past}
                  className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl shadow-sm text-sm transition-colors duration-200 ${
                    past
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : selectedDate.toDateString() === day.toDateString()
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-200 hover:bg-blue-50"
                  }`}
                >
                  <span className="text-xs">{getDayName(day)}</span>
                  <span className="text-lg font-semibold">{day.getDate()}</span>
                </button>
              );
            })}
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
              onChange={(e) =>
                onSelectDate(moment(e.target.value, "YYYY-MM-DD").toDate())
              }
              min={moment().format("YYYY-MM-DD")}
            />
          </div>
        )}

        {/* Slot waktu */}
        {loadingSlots ? (
          <p className="text-center text-gray-500">Memuat jadwal...</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium text-center mb-3">
              Kapan kamu ingin memulai?
            </p>

            {/* Slot Pagi */}
            <h3 className="text-lg font-semibold text-center mb-3 border-b pb-1">
              Pagi
            </h3>
            <div className="grid grid-cols-4 gap-2 justify-center">
              {availableSlots.pagi.length > 0 ? (
                availableSlots.pagi.map((slotObj, index) => {
                  const past = isPastSlot(slotObj.time);
                  const disabled = !slotObj.isAvailable || past;

                  return (
                    <div key={index} className="relative w-full">
                      {formData.waktu_mulai === slotObj.time && selectedPackage && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                          {packageDuration}m
                        </span>
                      )}
                      <button
                        disabled={disabled}
                        onClick={() => !disabled && onSelectSlot(slotObj.time)}
                        className={`w-full px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-colors duration-200 ${
                          disabled
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : formData.waktu_mulai === slotObj.time
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-blue-50"
                        }`}
                      >
                        {slotObj.time}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="col-span-4 text-center text-gray-500">
                  Tidak ada slot tersedia.
                </p>
              )}
            </div>

            {/* Slot Sore */}
            <h3 className="text-lg font-semibold text-center mt-8 mb-3 border-b pb-1">
              Sore
            </h3>
            <div className="grid grid-cols-4 gap-2 justify-center">
              {availableSlots.sore.length > 0 ? (
                availableSlots.sore.map((slotObj, index) => {
                  const past = isPastSlot(slotObj.time);
                  const disabled = !slotObj.isAvailable || past;

                  return (
                    <div key={index} className="relative w-full">
                      {formData.waktu_mulai === slotObj.time && selectedPackage && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                          {packageDuration}m
                        </span>
                      )}
                      <button
                        disabled={disabled}
                        onClick={() => !disabled && onSelectSlot(slotObj.time)}
                        className={`w-full px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-colors duration-200 ${
                          disabled
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : formData.waktu_mulai === slotObj.time
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-blue-50"
                        }`}
                      >
                        {slotObj.time}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="col-span-4 text-center text-gray-500">
                  Tidak ada slot tersedia.
                </p>
              )}
            </div>
          </>
        )}

        {/* Tombol lanjut */}
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
