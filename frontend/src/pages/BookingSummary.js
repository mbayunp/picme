// BookingSummary.js
import React from "react";

export default function BookingSummary({ studio, date, time, selectedPackage, quantity }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center border-b pb-3 mb-3">
        <div>
          <h3 className="font-bold text-gray-800">{studio}</h3>
          <p className="text-sm text-gray-500">08:00 - 18:00</p>
          <p className="text-sm text-gray-500">
            {date.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Mulai dari</p>
          <p className="text-lg font-bold text-green-600">{time}</p>
        </div>
      </div>
      {selectedPackage && (
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-gray-700">
            {selectedPackage.nama_paket} × {quantity}
          </p>
          <p className="font-semibold text-green-600">
            Rp {(selectedPackage.harga * quantity).toLocaleString("id-ID")}
          </p>
        </div>
      )}
    </div>
  );
}
