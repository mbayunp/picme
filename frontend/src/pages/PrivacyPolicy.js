import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-white text-gray-800 font-sans pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#0d1a2c] leading-tight mb-8">
                    Kebijakan Privasi
                </h1>
                <p className="text-lg text-gray-700 mb-6">
                    Di Picme Studio, privasi pengunjung kami sangat penting. Dokumen Kebijakan Privasi ini menjelaskan jenis informasi pribadi yang kami kumpulkan dan bagaimana kami menggunakannya.
                </p>

                <h2 className="text-2xl font-bold text-[#0d1a2c] border-b-2 border-gray-300 pb-2 mt-8 mb-4">
                    1. Informasi yang Kami Kumpulkan
                </h2>
                <p className="text-gray-700 mb-4">
                    Kami mengumpulkan informasi pribadi yang Anda berikan secara sukarela saat menggunakan layanan kami, termasuk:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                    <li><strong className="font-semibold">Data Kontak:</strong> Nama, alamat email, dan nomor telepon/WhatsApp saat Anda melakukan pemesanan.</li>
                    <li><strong className="font-semibold">Informasi Pemesanan:</strong> Detail pemesanan Anda, seperti tanggal, waktu, jenis paket, dan catatan khusus.</li>
                    <li><strong className="font-semibold">Informasi Teknis:</strong> Data non-pribadi seperti alamat IP, jenis browser, waktu kunjungan, dan halaman yang Anda lihat.</li>
                </ul>

                <h2 className="text-2xl font-bold text-[#0d1a2c] border-b-2 border-gray-300 pb-2 mt-8 mb-4">
                    2. Bagaimana Kami Menggunakan Informasi Anda
                </h2>
                <p className="text-gray-700 mb-4">
                    Informasi yang kami kumpulkan digunakan untuk tujuan berikut:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                    <li>Memproses dan mengelola pemesanan Anda.</li>
                    <li>Berkomunikasi dengan Anda terkait pemesanan dan layanan kami.</li>
                    <li>Meningkatkan kualitas layanan dan pengalaman pengguna di website kami.</li>
                    <li>Melakukan analisis internal dan riset pasar.</li>
                </ul>

                <h2 className="text-2xl font-bold text-[#0d1a2c] border-b-2 border-gray-300 pb-2 mt-8 mb-4">
                    3. Pengungkapan Informasi kepada Pihak Ketiga
                </h2>
                <p className="text-gray-700 mb-6">
                    Kami tidak menjual, menyewakan, atau menukar informasi pribadi Anda dengan pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum atau untuk melindungi hak dan keamanan Picme Studio.
                </p>

                <h2 className="text-2xl font-bold text-[#0d1a2c] border-b-2 border-gray-300 pb-2 mt-8 mb-4">
                    4. Keamanan Data Anda
                </h2>
                <p className="text-gray-700 mb-6">
                    Kami berkomitmen untuk melindungi informasi Anda. Kami menggunakan langkah-langkah keamanan teknis dan administratif untuk melindungi data pribadi Anda dari akses yang tidak sah.
                </p>

                <h2 className="text-2xl font-bold text-[#0d1a2c] border-b-2 border-gray-300 pb-2 mt-8 mb-4">
                    5. Perubahan pada Kebijakan Privasi
                </h2>
                <p className="text-gray-700 mb-6">
                    Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami akan memberitahu Anda tentang perubahan signifikan dengan memposting kebijakan yang telah direvisi di website kami.
                </p>

                <p className="text-gray-700">
                    Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui halaman Kontak.
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;