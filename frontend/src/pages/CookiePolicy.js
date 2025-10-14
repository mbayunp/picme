import React from 'react';

const CookiePolicy = () => {
    return (
        <div className="min-h-screen bg-white text-gray-800 font-sans pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#0d1a2c] leading-tight mb-8">
                    Kebijakan Cookie
                </h1>
                <p className="text-lg text-gray-700 mb-6">
                    Website Picme Studio menggunakan cookies untuk meningkatkan pengalaman pengguna. Halaman ini menjelaskan apa itu cookies, bagaimana kami menggunakannya, dan bagaimana Anda dapat mengelola preferensi cookie Anda.
                </p>

                <h2 className="text-2xl font-bold text-[#0d1a2c] border-b-2 border-gray-300 pb-2 mt-8 mb-4">
                    1. Apa Itu Cookie?
                </h2>
                <p className="text-gray-700 mb-6">
                    Cookie adalah file teks kecil yang disimpan di perangkat Anda (komputer, tablet, atau ponsel) saat Anda mengunjungi sebuah website. Cookies digunakan untuk menyimpan informasi dasar tentang sesi penjelajahan Anda.
                </p>

                <h2 className="text-2xl font-bold text-[#0d1a2c] border-b-2 border-gray-300 pb-2 mt-8 mb-4">
                    2. Bagaimana Kami Menggunakan Cookie?
                </h2>
                <p className="text-gray-700 mb-4">
                    Kami menggunakan cookies untuk beberapa tujuan, termasuk:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                    <li><strong className="font-semibold">Fungsionalitas Website:</strong> Cookies ini penting agar website berfungsi dengan baik, seperti menyimpan preferensi bahasa atau item di keranjang belanja.</li>
                    <li><strong className="font-semibold">Analisis:</strong> Kami menggunakan cookies untuk menganalisis bagaimana pengunjung menggunakan website kami, seperti halaman mana yang paling sering dikunjungi.</li>
                </ul>

                <h2 className="text-2xl font-bold text-[#0d1a2c] border-b-2 border-gray-300 pb-2 mt-8 mb-4">
                    3. Mengelola Cookie
                </h2>
                <p className="text-gray-700 mb-6">
                    Anda dapat mengontrol dan mengelola cookies melalui pengaturan browser Anda. Perlu diingat bahwa menonaktifkan cookies dapat memengaruhi fungsionalitas website ini dan website lain yang Anda kunjungi.
                </p>

                <h2 className="text-2xl font-bold text-[#0d1a2c] border-b-2 border-gray-300 pb-2 mt-8 mb-4">
                    4. Persetujuan Anda
                </h2>
                <p className="text-gray-700 mb-6">
                    Dengan menggunakan website kami, Anda menyetujui penggunaan cookies sesuai dengan Kebijakan Cookie ini.
                </p>
            </div>
        </div>
    );
};

export default CookiePolicy;