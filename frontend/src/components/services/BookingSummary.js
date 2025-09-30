import React from "react";
import PicmeLogo from "../../assets/images/PicmeLogo.png";

const BookingSummary = ({ studio, date, time, cart, formData }) => {
    // Ambil durasi dari formData yang sudah diperbarui
    const packageDuration = formData?.waktu_durasi || 0;

    // Hitung waktu selesai
    const [startHour, startMinute] = time.split(":").map(Number);
    const totalMinutes = startHour * 60 + startMinute + packageDuration;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;

    // Format waktu selesai agar selalu dua digit
    const formattedEndHour = String(endHour).padStart(2, "0");
    const formattedEndMinute = String(endMinute).padStart(2, "0");
    const endTime = `${formattedEndHour}:${formattedEndMinute}`;

    const studioAddress = "cluster pramuka Blok C.4, Sukamulya, Kec. Karangtengah, Kabupaten Cianjur";

    const selectedPackage = cart.length > 0 ? cart[0] : null;
    const totalHarga = cart.reduce((sum, item) => sum + item.harga * item.quantity, 0);
    
    // ✅ PERBAIKI: Hapus duplikasi path
    const displayImage = selectedPackage?.image_url 
        ? `http://localhost:8080/${selectedPackage.image_url}` 
        : PicmeLogo;

    return (
        <div className="flex h-full flex-col">
            <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center">
                    <img
                        src={displayImage}
                        alt={selectedPackage?.nama_paket || "Picme Logo"}
                        className="mr-2 h-10 w-10 rounded-lg object-cover"
                    />
                    <div>
                        <p className="text-lg font-bold">{studio}</p>
                        <p className="text-sm text-gray-500">
                            {time} - {endTime}
                            <br />
                            {studioAddress}
                        </p>
                    </div>
                </div>
                <p className="text-sm font-semibold text-gray-500">
                    {date.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })}
                </p>
            </div>

            <div className="mb-4 flex-1 border-b pb-4">
                <p className="mb-2 font-semibold text-gray-800">Paket:</p>
                <div className="mb-1 flex items-center justify-between text-sm text-gray-600">
                    <p>
                        {selectedPackage?.nama_paket} ({packageDuration}min)
                    </p>
                    <p>
                        ({cart.length}) Rp {totalHarga.toLocaleString("id-ID")}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between text-lg font-bold">
                <p>Total:</p>
                <p>Rp {totalHarga.toLocaleString("id-ID")}</p>
            </div>
        </div>
    );
};

export default BookingSummary;