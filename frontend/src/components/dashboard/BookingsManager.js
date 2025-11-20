    // src/components/dashboard/BookingsManager.js

    import React, { useState } from 'react';
    import { FaCalendarAlt, FaList, FaClock } from 'react-icons/fa'; // Ikon
    import BookingsCalendar from './BookingsCalendar';
    import BookingsData from './BookingsData';

    const BookingsManager = (props) => {
    // State untuk tab aktif: 'calendar' atau 'data'
    const [activeSubTab, setActiveSubTab] = useState('calendar');

    // Fungsi helper untuk styling tombol sub-menu (Persis seperti FinancialReport)
    const getButtonClass = (tabName) => {
        const baseClass = "flex justify-between items-center w-full p-4 text-left font-medium text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out";
        const activeClass = "bg-blue-50 border-l-4 border-blue-600 text-blue-700";
        const inactiveClass = "border-l-4 border-transparent";
        return `${baseClass} ${activeSubTab === tabName ? activeClass : inactiveClass}`;
    };

    return (
        <div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col lg:flex-row lg:items-start gap-6">
        
        {/* --- SIDEBAR KIRI (Menu) --- */}
        <aside className="w-full lg:w-1/4 xl:w-1/5 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            
            {/* Header Sidebar */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <span className="text-gray-700"><FaClock size={28} /></span>
                <h2 className="text-2xl font-bold text-gray-800">Booking</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
                Kelola jadwal pemesanan studio, lihat kalender, atau atur data pemesanan secara detail.
            </p>
            
            {/* Navigasi Tombol */}
            <nav className="space-y-2">
                <button onClick={() => setActiveSubTab('calendar')} className={getButtonClass('calendar')}>
                    <div className="flex items-center gap-3">
                        <FaCalendarAlt /> <span>Jadwal Kalender</span>
                    </div>
                    <span className="text-gray-400 text-lg">&rsaquo;</span>
                </button>

                <button onClick={() => setActiveSubTab('data')} className={getButtonClass('data')}>
                    <div className="flex items-center gap-3">
                        <FaList /> <span>Data Booking</span>
                    </div>
                    <span className="text-gray-400 text-lg">&rsaquo;</span>
                </button>
            </nav>
            </div>
        </aside>
        
        {/* --- KONTEN KANAN (Render Dinamis) --- */}
        <main className="flex-1 w-full lg:w-3/4 xl:w-4/5">
            {activeSubTab === 'calendar' ? (
                // Render Kalender dengan meneruskan SEMUA props
                <BookingsCalendar {...props} />
            ) : (
                // Render Data Tabel dengan meneruskan SEMUA props
                <BookingsData {...props} />
            )}
        </main>
        </div>
    );
    };

    export default BookingsManager;