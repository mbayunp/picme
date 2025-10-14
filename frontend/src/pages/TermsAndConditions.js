import React from 'react';

const TermsAndConditions = () => {
    return (
        <div className="min-h-screen bg-white text-gray-800 font-sans pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#0d1a2c] leading-tight mb-8">
                    Syarat dan Ketentuan
                </h1>
                <p className="text-lg text-gray-700 mb-6">
                    Selamat datang di Picme Studio. Dengan mengakses atau menggunakan layanan kami, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini.
                </p>

                <h2 className="text-2xl font-bold text-[#0d1a2c] border-b-2 border-gray-300 pb-2 mt-8 mb-4">
                    1. Ketentuan Umum
                </h2>
                <p className="text-gray-700 mb-6">
                    Layanan kami disediakan untuk keperluan pemesanan sesi foto. Anda harus berusia minimal 18 tahun untuk menggunakan layanan ini. Kami berhak menolak layanan kepada siapa pun karena alasan apa pun setiap saat.
                </p>

                <h2 className="text-2xl font-bold text-[#0d1a2c] border-b-2 border-gray-300 pb-2 mt-8 mb-4">
                    2. Pemesanan dan Pembatalan
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                    <li><strong className="font-semibold">Pemesanan:</strong> Semua pemesanan harus dilakukan melalui website kami. Setelah pemesanan, kami akan mengirimkan konfirmasi melalui email atau WhatsApp.</li>
                    <li><strong className="font-semibold">Pembayaran:</strong> Pembayaran dapat dilakukan secara tunai atau melalui metode yang tersedia. Detail pembayaran akan diberikan setelah pemesanan.</li>
                    <li><strong className="font-semibold">Pembatalan:</strong> Pembatalan pemesanan harus dilakukan selambat-lambatnya 24 jam sebelum jadwal yang ditentukan. Kami berhak mengenakan biaya pembatalan jika pembatalan dilakukan kurang dari 24 jam.</li>
                </ul>

                <h2 className="text-2xl font-bold text-[#0d1a2c] border-b-2 border-gray-300 pb-2 mt-8 mb-4">
                    3. Hak Cipta dan Penggunaan Konten
                </h2>
                <p className="text-gray-700 mb-6">
                    Seluruh konten di website ini, termasuk foto, teks, dan logo, adalah milik Picme Studio. Penggunaan tanpa izin dilarang. Foto-foto hasil sesi Anda adalah hak milik Anda, tetapi Picme Studio berhak menggunakan beberapa foto untuk keperluan promosi, kecuali Anda meminta sebaliknya.
                </p>

                <h2 className="text-2xl font-bold text-[#0d1a2c] border-b-2 border-gray-300 pb-2 mt-8 mb-4">
                    4. Batasan Tanggung Jawab
                </h2>
                <p className="text-gray-700 mb-6">
                    Picme Studio tidak bertanggung jawab atas kerusakan atau kehilangan yang terjadi selama atau setelah sesi foto, kecuali jika disebabkan oleh kelalaian kami.
                </p>

                <h2 className="text-2xl font-bold text-[#0d1a2c] border-b-2 border-gray-300 pb-2 mt-8 mb-4">
                    5. Perubahan pada Syarat dan Ketentuan
                </h2>
                <p className="text-gray-700 mb-6">
                    Kami dapat memperbarui Syarat dan Ketentuan ini dari waktu ke waktu. Kami akan memberitahu Anda tentang perubahan signifikan dengan memposting Syarat dan Ketentuan yang telah direvisi di website kami.
                </p>
            </div>
        </div>
    );
};

export default TermsAndConditions;