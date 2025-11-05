import React, { useMemo, useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/id'; // Impor lokal Indonesia
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement,
    Title, Tooltip, Legend, Filler
);
moment.locale('id'); // Set lokal

// Fungsi pembantu untuk menghitung total harga
const calculateTotalPrice = (booking) => {
    const price = parseInt(booking.package_price, 10) || 0; 
    const quantity = parseInt(booking.jumlah_orang, 10) || 1;
    return price * quantity;
};

// ====================================================================
// Komponen Anak 1: Grafik Penjualan
// ====================================================================
const SalesChart = ({ bookings }) => {
    
    // ✅ PENJAGAAN: Pastikan 'bookings' adalah array sebelum diolah
    const validBookings = useMemo(() => Array.isArray(bookings) ? bookings : [], [bookings]);

    const chartData = useMemo(() => {
        const dataByDate = {};
        for (let i = 6; i >= 0; i--) {
            const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
            dataByDate[date] = 0;
        }

        // Gunakan 'validBookings' yang sudah aman
        validBookings.forEach(booking => {
            if (booking.status === 'confirmed') {
                const date = moment(booking.tanggal).format('YYYY-MM-DD');
                if (dataByDate[date] !== undefined) {
                    dataByDate[date] += calculateTotalPrice(booking);
                }
            }
        });

        return {
            labels: Object.keys(dataByDate),
            datasets: [{
                label: 'Penjualan',
                data: Object.values(dataByDate),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.4,
            }],
        };
    }, [validBookings]); // Dependensi diubah ke validBookings

    const totalSales = useMemo(() => 
        // Gunakan 'validBookings' yang sudah aman
        validBookings
            .filter(b => b.status === 'confirmed' && moment(b.tanggal).isSameOrAfter(moment().subtract(6, 'days'), 'day'))
            .reduce((sum, b) => sum + calculateTotalPrice(b), 0),
    [validBookings]); // Dependensi diubah ke validBookings
    
    const options = {
        responsive: true,
        maintainAspectRatio: false, // Agar chart mengisi tinggi div
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed.y !== null) {
                            label += `Rp ${new Intl.NumberFormat('id-ID').format(context.parsed.y)}`;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
                    }
                }
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md min-h-[350px] flex flex-col"> {/* Tambah min-h & flex */}
            <h4 className="text-xl font-bold mb-4">Penjualan Terakhir</h4>
            <div className="mb-4">
                <p className="text-gray-500 text-sm">Total Penjualan (7 hari)</p>
                <p className="text-3xl font-bold">Rp {totalSales.toLocaleString('id-ID')}</p>
            </div>
            {/* ✅ PENJAGAAN: Tampilkan loading jika data (prop 'bookings') belum siap */}
            <div className="flex-grow relative h-64">
                {!Array.isArray(bookings) ? (
                    <p className="text-center text-gray-500 pt-16">Memuat data penjualan...</p>
                ) : (
                    <Line data={chartData} options={options} />
                )}
            </div>
        </div>
    );
};

// ====================================================================
// Komponen Anak 2: Grafik Agenda
// ====================================================================
const AgendaChart = ({ bookings }) => {

    // ✅ PENJAGAAN: Pastikan 'bookings' adalah array sebelum diolah
    const validBookings = useMemo(() => Array.isArray(bookings) ? bookings : [], [bookings]);

    const chartData = useMemo(() => {
        const data = { confirmed: {}, canceled: {}, pending: {} }; // Tambah pending
        const labels = [];
        // Tampilkan 7 hari ke depan (termasuk hari ini)
        for (let i = 0; i <= 6; i++) {
            const date = moment().add(i, 'days').format('YYYY-MM-DD');
            const shortLabel = moment().add(i, 'days').format('DD MMM'); // Label pendek
            labels.push(shortLabel);
            data.confirmed[date] = 0;
            data.canceled[date] = 0; // Anda bisa hapus 'canceled' jika tidak perlu
            data.pending[date] = 0;
        }

        // Gunakan 'validBookings'
        validBookings.forEach(booking => {
            const date = moment(booking.tanggal).format('YYYY-MM-DD');
            if (data.confirmed[date] !== undefined) { // Cek jika tanggal ada di range
                if (booking.status === 'confirmed') data.confirmed[date]++;
                if (booking.status === 'canceled') data.canceled[date]++;
                if (booking.status === 'pending') data.pending[date]++; // Hitung pending
            }
        });

        return {
            labels: labels,
            datasets: [
                { label: 'Pending', data: Object.values(data.pending), backgroundColor: 'rgb(255, 159, 64)'},
                { label: 'Dikonfirmasi', data: Object.values(data.confirmed), backgroundColor: 'rgb(75, 192, 192)'},
                // { label: 'Dibatalkan', data: Object.values(data.canceled), backgroundColor: 'rgb(255, 99, 132)'}
            ],
        };
    }, [validBookings]); // Dependensi diubah ke validBookings

    const stats = useMemo(() => {
        // Gunakan 'validBookings'
        const upcomingBookings = validBookings.filter(b => 
            // Cek 7 hari ke depan (inklusif)
            moment(b.tanggal).isBetween(moment().startOf('day'), moment().add(6, 'days').endOf('day'), undefined, '[]')
        );
        return {
            confirmed: upcomingBookings.filter(b => b.status === 'confirmed').length,
            pending: upcomingBookings.filter(b => b.status === 'pending').length,
            canceled: upcomingBookings.filter(b => b.status === 'canceled').length,
        }
    }, [validBookings]); // Dependensi diubah ke validBookings
    
    const options = { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins:{ legend: { position: 'bottom', labels: { boxWidth: 12 } } },
        scales: { 
            x: { stacked: true }, 
            y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } } 
        } 
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md min-h-[350px] flex flex-col"> {/* Tambah min-h & flex */}
            <h4 className="text-xl font-bold mb-4">Agenda Mendatang (7 Hari)</h4>
            <div className="mb-4">
                <p className="text-2xl font-bold">{stats.confirmed + stats.pending} Agenda</p>
                <p className="text-sm text-gray-500">{stats.confirmed} Dikonfirmasi, {stats.pending} Pending</p>
            </div>
            {/* ✅ PENJAGAAN: Tampilkan loading jika data (prop 'bookings') belum siap */}
            <div className="flex-grow relative h-64">
                {!Array.isArray(bookings) ? (
                    <p className="text-center text-gray-500 pt-16">Memuat data agenda...</p>
                ) : (
                    <Bar data={chartData} options={options} />
                )}
            </div>
        </div>
    );
};


// ====================================================================
// Komponen Anak 3: Aktivitas Terbaru
// ====================================================================
const RecentActivity = ({ bookings }) => {
    const recentBookings = useMemo(() => {
        // ✅ PENJAGAAN: Cek jika 'bookings' adalah array
        if (!Array.isArray(bookings)) {
            return []; // Kembalikan array kosong jika tidak
        }
        return [...bookings]
            // Urutkan berdasarkan tanggal dibuat (created_at)
            .sort((a, b) => moment(b.created_at || b.tanggal).diff(moment(a.created_at || a.tanggal)))
            .slice(0, 5); // Ambil 5 terbaru
    }, [bookings]); // Dependensi tetap bookings

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-xl font-bold mb-4">Aktifitas Terbaru</h4>
            {/* ✅ PENJAGAAN: Tampilkan loading/empty state */}
            {!Array.isArray(bookings) ? (
                 <p className="text-center text-gray-500 py-4">Memuat aktivitas...</p>
            ) : recentBookings.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Belum ada aktivitas terbaru.</p>
            ) : (
                <div className="space-y-4">
                    {recentBookings.map(booking => (
                        <div key={booking.id} className={`p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${booking.status === 'confirmed' || booking.status === 'finished' ? 'bg-green-50' : booking.status === 'pending' ? 'bg-yellow-50' : 'bg-red-50'}`}>
                            <div>
                                <p className="font-semibold text-gray-800">{booking.package_name || 'Tanpa Paket'}</p>
                                <p className="text-sm text-gray-500">
                                    {moment(booking.tanggal).format('DD MMM YYYY')} • {booking.studio_name}
                                    {booking.nama && ` • ${booking.nama}`}
                                </p>
                            </div>
                            <p className="font-semibold text-base sm:text-lg text-gray-900 self-end sm:self-center">
                                Rp {(calculateTotalPrice(booking)).toLocaleString('id-ID')}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// ====================================================================
// Komponen Utama: Beranda
// ====================================================================
const Beranda = ({ bookings, studios, onStudioChange }) => { 
    const [studioFilter, setStudioFilter] = useState(''); 

    // Efek untuk memanggil onStudioChange (dari props) saat filter lokal berubah
    useEffect(() => {
        if (typeof onStudioChange === 'function') {
            onStudioChange(studioFilter); // Kirim ID studio ('1', '2', atau '')
        }
    }, [studioFilter, onStudioChange]);

    // ✅ PENJAGAAN: Buat variabel yang aman (selalu array)
    // Ini adalah data yang diterima dari parent (props.bookings), yang merupakan `sortedBookings`
    const safeBookings = useMemo(() => Array.isArray(bookings) ? bookings : [], [bookings]);
    
    // Asumsi: 'bookings' yang diterima SUDAH DIFILTER oleh useAdminData
    // jadi kita tidak perlu filter lagi di sini. Kita langsung teruskan 'safeBookings'.

    return (
        <div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col space-y-6">
            <div className="flex justify-end gap-4">
                 <label htmlFor="studio-filter-beranda" className="text-sm font-medium text-gray-700 self-center">Pilih Studio:</label>
                <select 
                    id="studio-filter-beranda"
                    value={studioFilter} // Terhubung ke state lokal
                    onChange={(e) => setStudioFilter(e.target.value)} // Update state lokal
                    className="p-2 border rounded-md bg-white text-sm"
                >
                    <option value="">Semua Studio</option>
                    {/* ✅ PENJAGAAN: Pastikan 'studios' adalah array */}
                    {(studios || []).map(studio => (
                        <option key={studio.id} value={studio.id}>{studio.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Kirim 'safeBookings' (data yang sudah difilter backend) */}
                <SalesChart bookings={safeBookings} />
                <AgendaChart bookings={safeBookings} />
            </div>
            
            <RecentActivity bookings={safeBookings} />
        </div>
    );
};

export default Beranda;