import React, { useMemo, useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/id';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { FaMoneyBillWave, FaCalendarCheck, FaUsers, FaChartPie, FaMapMarkerAlt } from 'react-icons/fa';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, ArcElement,
    Title, Tooltip, Legend, Filler
);
moment.locale('id');

const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

// --- UTILITAS BARU UNTUK DETEKSI STUDIO DARI BOOKING ---
// Mengasumsikan studio_id adalah string '1', '2', '3', '4'
const getStudioIdFromBooking = (booking) => {
    // Perhatikan: ini bergantung pada string 'studio X' di studio_name Anda
    const sName = (booking.studio_name || '').toLowerCase();
    if (sName.includes('studio 1')) return '1';
    if (sName.includes('studio 2')) return '2';
    if (sName.includes('studio 3')) return '3';
    if (sName.includes('studio 4')) return '4';
    return null; // Mengembalikan null jika tidak ada studio yang terdeteksi
};

// --- KOMPONEN KARTU ---
const StatCard = ({ title, value, icon, color, subtext }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-4 rounded-full ${color} text-white text-xl`}>
            {icon}
        </div>
    </div>
);

// --- CHART SECTIONS ---

const SalesChart = ({ bookings }) => {
    const chartData = useMemo(() => {
        const dataByDate = {};
        for (let i = 6; i >= 0; i--) {
            const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
            dataByDate[date] = 0;
        }
        // Sekarang menggunakan 'bookings' yang sudah difilter
        bookings.forEach(booking => {
            if (booking.status === 'confirmed' || booking.status === 'finished') {
                const date = moment(booking.tanggal).format('YYYY-MM-DD');
                if (dataByDate[date] !== undefined) {
                    const price = parseInt(booking.package_price, 10) || 0;
                    const qty = parseInt(booking.jumlah_orang, 10) || 1;
                    dataByDate[date] += (price * qty);
                }
            }
        });
        return {
            labels: Object.keys(dataByDate).map(d => moment(d).format('DD MMM')),
            datasets: [{
                label: 'Pendapatan',
                data: Object.values(dataByDate),
                borderColor: '#10B981', 
                backgroundColor: (ctx) => {
                    const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
                    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
                    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                    return gradient;
                },
                fill: true, tension: 0.4, pointRadius: 4,
            }],
        };
    }, [bookings]);
    
    const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Grafik Pendapatan (7 Hari)</h4>
            <div className="h-64"><Line data={chartData} options={options} /></div>
        </div>
    );
};

const StatusDistributionChart = ({ bookings }) => {
    const data = useMemo(() => {
        const counts = { confirmed: 0, pending: 0, canceled: 0 };
        // Sekarang menggunakan 'bookings' yang sudah difilter
        bookings.forEach(b => {
            const statusKey = b.status === 'finished' ? 'confirmed' : b.status;
            if (counts[statusKey] !== undefined) counts[statusKey]++;
        });
        return {
            labels: ['Selesai', 'Pending', 'Batal'],
            datasets: [{ data: [counts.confirmed, counts.pending, counts.canceled], backgroundColor: ['#10B981', '#F59E0B', '#EF4444'], borderWidth: 0 }]
        };
    }, [bookings]);

    const options = { cutout: '70%', plugins: { legend: { position: 'bottom' } } };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 flex flex-col">
            <h4 className="text-lg font-bold text-gray-800 mb-2">Status Pesanan</h4>
            <div className="flex-grow relative flex justify-center items-center">
                 <div className="w-48 h-48"><Doughnut data={data} options={options} /></div>
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                      <span className="text-2xl font-bold text-gray-700">{bookings.length}</span>
                 </div>
            </div>
        </div>
    );
};

const RecentActivity = ({ bookings }) => {
    // Sekarang menggunakan 'bookings' yang sudah difilter
    const recentBookings = useMemo(() => {
        if (!Array.isArray(bookings)) return [];
        return [...bookings].sort((a, b) => moment(b.created_at || b.tanggal).diff(moment(a.created_at || a.tanggal))).slice(0, 5);
    }, [bookings]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Aktivitas Terbaru</h4>
            <div className="space-y-0 divide-y divide-gray-100">
                {recentBookings.map(booking => (
                    <div key={booking.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between group hover:bg-gray-50 transition px-2 rounded-lg gap-2">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className={`flex-shrink-0 w-2 h-2 rounded-full ${booking.status === 'confirmed' || booking.status === 'finished' ? 'bg-green-500' : booking.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{booking.nama || 'Pelanggan'}</p>
                                <div className="text-xs text-gray-500 flex flex-wrap items-center gap-1 mt-0.5">
                                    <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-gray-600"><FaMapMarkerAlt size={10} /> {booking.studio_name || '?'}</span>
                                    <span>• {booking.package_name}</span>
                                    <span>• {moment(booking.tanggal).format('DD MMM')}</span>
                                    <span>• {booking.waktu_mulai} - {booking.waktu_selesai}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-auto gap-4 pl-5 sm:pl-0">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${booking.status === 'confirmed' || booking.status === 'finished' ? 'bg-green-100 text-green-700' : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{booking.status}</span>
                            <p className="text-sm font-medium text-gray-900 whitespace-nowrap">{formatRupiah((parseInt(booking.package_price)||0)*(parseInt(booking.jumlah_orang)||1))}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ====================================================================
// MAIN COMPONENT: BERANDA (LOGIKA FILTER STUDIO DIPERBAIKI)
// ====================================================================
const Beranda = ({ bookings, studios, onStudioChange }) => { 
    const [studioFilter, setStudioFilter] = useState(''); 

    useEffect(() => {
        if (typeof onStudioChange === 'function') onStudioChange(studioFilter);
    }, [studioFilter, onStudioChange]);

    const safeBookings = useMemo(() => Array.isArray(bookings) ? bookings : [], [bookings]);

    // 🌟 PERBAIKAN UTAMA: Filter booking yang valid (memiliki studio)
    const filteredBookings = useMemo(() => {
        if (!safeBookings.length) return [];

        return safeBookings.filter(b => {
            const detectedStudioId = getStudioIdFromBooking(b);
            
            if (studioFilter === '') {
                // Saat 'Semua Studio' dipilih, HANYA masukkan booking yang studionya terdeteksi
                return detectedStudioId !== null;
            } else {
                // Saat studio spesifik dipilih, hanya masukkan booking dengan studio yang cocok
                return detectedStudioId === studioFilter;
            }
        });
    }, [safeBookings, studioFilter]);


    // ✅ LOGIKA RINGKASAN: Sekarang menggunakan filteredBookings
    const summary = useMemo(() => {
        const today = moment().endOf('day');
        const sevenDaysAgo = moment().subtract(6, 'days').startOf('day');

        let totalRevenue = 0;
        let totalBookings = 0;
        let uniqueCustomersSet = new Set();
        
        // Variabel ini diperlukan untuk menghitung okupansi saat 'Semua Studio'
        let revenueS1 = 0, revenueS2 = 0, revenueS3 = 0, revenueS4 = 0;

        // Loop data filteredBookings (sudah dijamin hanya memiliki studio yang relevan/terdeteksi)
        filteredBookings.forEach(b => {
            const bDate = moment(b.tanggal);
            
            // 1. Cek Waktu (Harus dalam 7 hari terakhir)
            if (bDate.isBetween(sevenDaysAgo, today, undefined, '[]')) {
                
                const price = parseInt(b.package_price, 10) || 0;
                const qty = parseInt(b.jumlah_orang, 10) || 1;
                const total = price * qty;
                const isPaid = b.status === 'confirmed' || b.status === 'finished';
                const isActive = b.status !== 'canceled';

                const detectedStudioId = getStudioIdFromBooking(b);

                // Akumulasi total (final result)
                if (isPaid) totalRevenue += total;
                if (isActive) totalBookings++;

                // Akumulasi per Studio (Hanya untuk keperluan statistik okupansi)
                if (detectedStudioId === '1') {
                    if (isPaid) revenueS1 += total;
                } else if (detectedStudioId === '2') {
                    if (isPaid) revenueS2 += total;
                } else if (detectedStudioId === '3') {
                    if (isPaid) revenueS3 += total;
                } else if (detectedStudioId === '4') {
                    if (isPaid) revenueS4 += total;
                }

                // Masukkan pelanggan ke set (jika status confirmed/finished/pending)
                if (isActive) uniqueCustomersSet.add(b.nomor_whatsapp);
            }
        });

        // Tentukan jumlah studio aktif untuk perhitungan Okupansi
        const activeStudiosCount = studioFilter ? 1 : 
                                   (revenueS1 > 0 ? 1 : 0) + 
                                   (revenueS2 > 0 ? 1 : 0) + 
                                   (revenueS3 > 0 ? 1 : 0) + 
                                   (revenueS4 > 0 ? 1 : 0);
        
        // Kapasitas default: 10 slot per hari * 7 hari = 70. 
        // Okupansi dihitung berdasarkan studio yang benar-benar memiliki revenue dalam 7 hari (jika filter kosong)
        const capacity = 70 * Math.max(1, activeStudiosCount); 
        const occupancy = Math.round((totalBookings / capacity) * 100) || 0;

        return { 
            totalRevenue: totalRevenue, 
            totalBookings: totalBookings, 
            uniqueCustomers: uniqueCustomersSet.size,
            occupancy 
        };

    }, [filteredBookings, studioFilter]); // Recalculate jika data / filter berubah

    return (
        <div className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard Ringkasan</h2>
                    <p className="text-sm text-gray-500">
                        {studioFilter 
                            ? `Statistik untuk ${studios.find(s=>String(s.id)===String(studioFilter))?.name || 'Studio'}` 
                            : 'Statistik Total (Hanya pesanan yang memiliki studio)' // Deskripsi diperbarui
                        }
                    </p>
                </div>
                <select 
                    value={studioFilter} 
                    onChange={(e) => setStudioFilter(e.target.value)}
                    className="p-2.5 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">Semua Studio</option>
                    {(studios || []).map(studio => (
                        <option key={studio.id} value={studio.id}>{studio.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Pendapatan" value={formatRupiah(summary.totalRevenue)} icon={<FaMoneyBillWave />} color="bg-green-500" subtext="7 hari terakhir" />
                <StatCard title="Total Booking" value={summary.totalBookings} icon={<FaCalendarCheck />} color="bg-blue-500" subtext="7 hari terakhir (Aktif)" />
                <StatCard title="Pelanggan (Aktif)" value={summary.uniqueCustomers} icon={<FaUsers />} color="bg-purple-500" subtext="7 hari terakhir" />
                <StatCard title="Tingkat Okupansi" value={`${summary.occupancy}%`} icon={<FaChartPie />} color="bg-orange-500" subtext="Estimasi kapasitas mingguan" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Menggunakan filteredBookings */}
                <div className="lg:col-span-2"><SalesChart bookings={filteredBookings} /></div>
                <div><StatusDistributionChart bookings={filteredBookings} /></div>
            </div>
            
            {/* Menggunakan filteredBookings */}
            <RecentActivity bookings={filteredBookings} />
        </div>
    );
};

export default Beranda;