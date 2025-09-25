// src/components/services/BookingSummary.js

import React from "react";

const BookingSummary = ({ studio, date, time, cart, formData }) => {
  // Ambil durasi dari formData yang sudah diperbarui
  const packageDuration = formData?.waktu_durasi || 0;
  
  // Hitung waktu selesai
  const [startHour, startMinute] = time.split(':').map(Number);
  const totalMinutes = (startHour * 60) + startMinute + packageDuration;
  const endHour = Math.floor(totalMinutes / 60);
  const endMinute = totalMinutes % 60;
  
  // Format waktu selesai agar selalu dua digit
  const formattedEndHour = String(endHour).padStart(2, '0');
  const formattedEndMinute = String(endMinute).padStart(2, '0');
  const endTime = `${formattedEndHour}:${formattedEndMinute}`;

  const studioAddress = "cluster pramuka Blok C.4, Sukamulya, Kec. Karangtengah, Kabupaten Cianjur";
  
  const selectedPackage = cart.length > 0 ? cart[0] : null;
  const totalHarga = cart.reduce((sum, item) => sum + (item.harga * item.quantity), 0);
  
  const displayImage = selectedPackage?.image_url 
    ? `http://localhost:8080/assets/images/${selectedPackage.image_url}` 
    : require("../../assets/images/PicmeLogo.png");

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <img 
            src={displayImage}
            alt={selectedPackage?.nama_paket || "Picme Logo"} 
            className="w-10 h-10 object-cover rounded-lg mr-2"
          />
          <div>
            <p className="font-bold text-lg">{studio}</p>
            <p className="text-sm text-gray-500">
              {time} - {endTime}
              <br/>
              {studioAddress}
            </p>
          </div>
        </div>
        <p className="text-sm font-semibold text-gray-500">
          {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      <div className="flex-1 border-b pb-4 mb-4">
        <p className="text-gray-800 font-semibold mb-2">Paket:</p>
        <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
          <p>{selectedPackage?.nama_paket} ({packageDuration}min)</p>
          <p>
            ({cart.length}) Rp {totalHarga.toLocaleString("id-ID")}
          </p>
        </div>
      </div>
      
      <div className="flex justify-between items-center font-bold text-lg">
        <p>Total:</p>
        <p>Rp {totalHarga.toLocaleString("id-ID")}</p>
      </div>
    </div>
  );
};

export default BookingSummary;