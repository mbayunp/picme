import React, { useMemo, useState } from 'react';
import moment from 'moment';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// ====================================================================
// Komponen Anak 1: Grafik Penjualan
// ====================================================================
const SalesChart = ({ bookings }) => {
    const chartData = useMemo(() => {
        const dataByDate = {};
        for (let i = 6; i >= 0; i--) {
            const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
            dataByDate[date] = 0;
        }

        bookings.forEach(booking => {
            if (booking.status === 'confirmed') {
                const date = moment(booking.tanggal).format('YYYY-MM-DD');
                if (dataByDate[date] !== undefined) {
                    dataByDate[date] += booking.package_price || 0;
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
    }, [bookings]);

    const totalSales = useMemo(() => 
        bookings
            .filter(b => b.status === 'confirmed' && moment(b.tanggal).isSameOrAfter(moment().subtract(6, 'days'), 'day'))
            .reduce((sum, b) => sum + (b.package_price || 0), 0),
    [bookings]);
    
    // ✅ PERBAIKAN: Tambahkan options untuk memformat angka Rupiah
    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            // Format angka di dalam tooltip
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
                    // Format angka di sumbu Y
                    callback: function(value) {
                        return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
                    }
                }
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-xl font-bold mb-4">Penjualan Terakhir</h4>
            <div className="mb-4">
                <p className="text-gray-500">Total Penjualan (7 hari)</p>
                <p className="text-3xl font-bold">Rp {totalSales.toLocaleString('id-ID')}</p>
            </div>
            <div className="h-64">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

// ====================================================================
// Komponen Anak 2: Grafik Agenda (Tidak ada perubahan)
// ====================================================================
const AgendaChart = ({ bookings }) => {
     const chartData = useMemo(() => {
        const data = { confirmed: {}, canceled: {} };
        for (let i = 6; i >= 0; i--) {
            const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
            data.confirmed[date] = 0;
            data.canceled[date] = 0;
        }

        bookings.forEach(booking => {
            const date = moment(booking.tanggal).format('YYYY-MM-DD');
            if (data.confirmed[date] !== undefined) {
                if (booking.status === 'confirmed') data.confirmed[date]++;
                if (booking.status === 'canceled') data.canceled[date]++;
            }
        });

        return {
            labels: Object.keys(data.confirmed),
            datasets: [
                {
                    label: 'Dikonfirmasi',
                    data: Object.values(data.confirmed),
                    backgroundColor: 'rgb(75, 192, 192)',
                },
                {
                    label: 'Dibatalkan',
                    data: Object.values(data.canceled),
                    backgroundColor: 'rgb(255, 99, 132)',
                }
            ],
        };
    }, [bookings]);

    const stats = useMemo(() => {
        const relevantBookings = bookings.filter(b => moment(b.tanggal).isSameOrAfter(moment().subtract(6, 'days'), 'day'));
        return {
            confirmed: relevantBookings.filter(b => b.status === 'confirmed').length,
            canceled: relevantBookings.filter(b => b.status === 'canceled').length,
        }
    }, [bookings]);
    
    const options = { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-xl font-bold mb-4">Agenda Yang Akan Datang</h4>
            <div className="mb-4">
                <p className="text-2xl font-bold">{stats.confirmed + stats.canceled} Agenda</p>
                <p className="text-sm text-gray-500">{stats.confirmed} Dikonfirmasi, {stats.canceled} Dibatalkan</p>
            </div>
            <div className="h-64">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};


// ====================================================================
// Komponen Anak 3: Aktivitas Terbaru (Tidak ada perubahan)
// ====================================================================
const RecentActivity = ({ bookings }) => {
    const recentBookings = useMemo(() => 
        [...bookings]
            .sort((a, b) => moment(b.tanggal).diff(moment(a.tanggal)))
            .slice(0, 5),
    [bookings]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-xl font-bold mb-4">Aktifitas Agenda</h4>
            <div className="space-y-4">
                {recentBookings.map(booking => (
                    <div key={booking.id} className={`p-4 rounded-lg flex justify-between items-center ${booking.status === 'confirmed' ? 'bg-green-50' : 'bg-gray-100'}`}>
                        <div>
                            <p className="font-semibold">{booking.package_name || 'Tanpa Paket'}</p>
                            <p className="text-sm text-gray-500">
                                {moment(booking.tanggal).format('DD MMM YYYY')} • {booking.studio_name}
                            </p>
                        </div>
                        <p className="font-semibold text-lg">
                            Rp {(booking.package_price || 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};


// ====================================================================
// Komponen Utama: Beranda (Tidak ada perubahan)
// ====================================================================
const Beranda = ({ bookings, studios }) => {
    const [studioFilter, setStudioFilter] = useState('');
    
    const filteredBookings = useMemo(() => {
        if (!studioFilter) return bookings;
        return bookings.filter(b => String(b.studio_id) === String(studioFilter));
    }, [bookings, studioFilter]);

    return (
        <div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col space-y-6">
            <div className="flex justify-end gap-4">
                <select 
                    value={studioFilter}
                    onChange={(e) => setStudioFilter(e.target.value)}
                    className="p-2 border rounded-md"
                >
                    <option value="">Semua Studio</option>
                    {studios.map(studio => (
                        <option key={studio.id} value={studio.id}>{studio.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesChart bookings={filteredBookings} />
                <AgendaChart bookings={filteredBookings} />
            </div>
            
            <RecentActivity bookings={filteredBookings} />
        </div>
    );
};

export default Beranda;