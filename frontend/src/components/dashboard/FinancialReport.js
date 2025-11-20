import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance'; 
import moment from 'moment';
import 'moment/locale/id';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { FaClock, FaMoneyBillWave, FaChartLine, FaCalendarAlt } from 'react-icons/fa'; 

// Registrasi ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);
moment.locale('id');

// --- Helper Functions ---
const calculateTotalPrice = (item) => {
  const price = parseInt(item.package_price, 10) || 0;
  const quantity = parseInt(item.jumlah_orang, 10) || 1;
  return price * quantity;
};

const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(numericAmount);
};

// --- Komponen Kartu Statistik Kecil ---
const StatCard = ({ title, value, icon, color, subtext }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-full ${color} text-white text-lg`}>
            {icon}
        </div>
    </div>
);

// ====================================================================
// 1. KOMPONEN FINANCIAL SUMMARY (LOGIKA UTAMA)
// ====================================================================
const FinancialSummary = ({ packages, studios }) => { 
  const [rawReportData, setRawReportData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [filterType, setFilterType] = useState('monthly'); // daily, weekly, monthly
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [filterMonth, setFilterMonth] = useState(moment().month() + 1);
  const [filterYear, setFilterYear] = useState(moment().year());
  const [filterStudio, setFilterStudio] = useState(''); // Kosong = Semua Studio
  const [chartViewType, setChartViewType] = useState('daily');

  // 🛠️ PERBAIKAN 1: Logika Params untuk "Semua Studio"
  const apiParams = useMemo(() => {
    const params = {};

    // Hanya tambahkan studio_name jika TIDAK kosong. 
    // Jika kosong, backend akan menganggapnya "Semua Studio".
    if (filterStudio && filterStudio !== '') {
        params.studio_name = filterStudio;
    }

    if (filterType === 'monthly') {
      params.month = filterMonth;
      params.year = filterYear;
    } else {
      // Untuk harian/mingguan, kita tetap ambil data bulanan dari tanggal yang dipilih
      // agar user bisa switch view tanpa fetch ulang terus menerus
      const date = moment(selectedDate);
      params.month = date.month() + 1;
      params.year = date.year();
    }
    
    return params;
  }, [filterType, filterMonth, filterYear, selectedDate, filterStudio]);

  // Fetch Data
  const fetchFinancialData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/api/services/financial-report', { 
        params: apiParams,
        headers: { 'Cache-Control': 'no-cache' } 
      });
      setRawReportData(response.data || []);
    } catch (err) {
       if (err.response?.status !== 401) {
          console.error('❌ Error fetching financial report:', err);
          setError('Gagal memuat laporan keuangan.');
       }
    } finally {
      setLoading(false);
    }
  }, [apiParams]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  // --- Filtering Data di Frontend (Untuk Tabel & Total) ---
  const filteredData = useMemo(() => {
      const dataToFilter = rawReportData || [];
      
      if (filterType === 'daily') {
        return dataToFilter.filter((item) => moment(item.tanggal).isSame(selectedDate, 'day'));
      } else if (filterType === 'weekly') {
        return dataToFilter.filter((item) => moment(item.tanggal).isSame(selectedDate, 'week'));
      }
      // Monthly (default) - return semua data yang di-fetch (karena fetch per bulan)
      return dataToFilter;
  }, [rawReportData, filterType, selectedDate]);

  // --- Kalkulasi Total (Berdasarkan Filter yang Dipilih) ---
  const currentViewRevenue = useMemo(() => {
      return filteredData.reduce((sum, item) => sum + calculateTotalPrice(item), 0);
  }, [filteredData]);

  // 🛠️ PERBAIKAN 2: Statistik 7 Hari Terakhir (Global dari data yang ada)
  // Note: Ini menghitung dari rawReportData. Jika rawReportData hanya memuat bulan ini,
  // maka 7 hari terakhir yang lintas bulan mungkin terpotong. 
  // (Idealnya fetch endpoint khusus statistik dashboard, tapi ini solusi cepat frontend).
  const last7DaysRevenue = useMemo(() => {
      const sevenDaysAgo = moment().subtract(6, 'days').startOf('day');
      const today = moment().endOf('day');

      return (rawReportData || [])
          .filter(item => {
              const itemDate = moment(item.tanggal);
              return itemDate.isBetween(sevenDaysAgo, today, undefined, '[]');
          })
          .reduce((sum, item) => sum + calculateTotalPrice(item), 0);
  }, [rawReportData]);

  // --- Chart Data Preparation ---
  const chartData = useMemo(() => {
      let revenueData = {};
      
      filteredData.forEach((item) => { 
        const price = calculateTotalPrice(item);
        let key;
        
        if (chartViewType === 'daily') {
            key = moment(item.tanggal).format('DD MMM');
        } else if (chartViewType === 'weekly') {
            const start = moment(item.tanggal).startOf('week').format('DD MMM');
            const end = moment(item.tanggal).endOf('week').format('DD MMM');
            key = `${start} - ${end}`;
        } else {
            key = moment(item.tanggal).format('MMMM');
        }
        
        if(key) revenueData[key] = (revenueData[key] || 0) + price;
      });
      
      // Sorting Keys (Chronological)
      const sortedKeys = Object.keys(revenueData).sort((a, b) => {
          if (chartViewType === 'daily') return moment(a, 'DD MMM').toDate() - moment(b, 'DD MMM').toDate();
          return 0; 
      });

      return {
        labels: sortedKeys,
        datasets: [{ 
            label: 'Pendapatan', 
            data: sortedKeys.map(k => revenueData[k]), 
            backgroundColor: 'rgba(16, 185, 129, 0.2)', // Green-500 transparent
            borderColor: 'rgba(16, 185, 129, 1)',       // Green-500 solid
            borderWidth: 2,
            tension: 0.3, // Garis melengkung sedikit
            fill: true
        }],
      };
  }, [filteredData, chartViewType]);

  const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
          legend: { display: false }, 
          tooltip: { callbacks: { label: (ctx) => ` ${formatCurrency(ctx.parsed.y)}` } }
      },
      scales: { 
          y: { beginAtZero: true, grid: { borderDash: [2, 4] }, ticks: { callback: (val) => val >= 1000 ? `${val/1000}k` : val } },
          x: { grid: { display: false } }
      }
  };

  // --- Helpers untuk Dropdown ---
  const getFilterLabel = () => {
      if (filterType === 'monthly') return `Bulan ${moment.months(filterMonth - 1)} ${filterYear}`;
      if (filterType === 'weekly') return `Minggu ${moment(selectedDate).startOf('week').format('DD MMM')} - ${moment(selectedDate).endOf('week').format('DD MMM')}`;
      return `Tanggal ${moment(selectedDate).format('DD MMM YYYY')}`;
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat laporan keuangan...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="flex-grow flex flex-col space-y-6">
      
      {/* --- Bagian Filter --- */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-end justify-between">
        <div className="flex flex-col gap-4 w-full md:w-auto">
            {/* Tipe Filter */}
            <div className="flex bg-gray-100 p-1 rounded-lg self-start">
                {['daily', 'weekly', 'monthly'].map(type => (
                    <button 
                        key={type}
                        onClick={() => setFilterType(type)} 
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {type === 'daily' ? 'Harian' : type === 'weekly' ? 'Mingguan' : 'Bulanan'}
                    </button>
                ))}
            </div>
            
            {/* Input Tanggal/Bulan */}
            <div className="flex gap-2">
                {filterType === 'monthly' ? (
                    <>
                        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="p-2 border rounded-md text-sm bg-gray-50">
                            {moment.months().map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="p-2 border rounded-md text-sm bg-gray-50">
                            {Array.from({length: 5}, (_, i) => moment().year() - 2 + i).map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </>
                ) : (
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-2 border rounded-md text-sm bg-gray-50"/>
                )}
            </div>
        </div>

        {/* Filter Studio */}
        <div className="w-full md:w-64">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Filter Studio</label>
            <select value={filterStudio} onChange={(e) => setFilterStudio(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50 text-sm font-medium">
                <option value="">Semua Studio</option>
                {(studios || []).map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
        </div>
      </div>

      {/* --- Statistik Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Pendapatan Sesuai Filter */}
          <StatCard 
             title={`Pendapatan (${filterType === 'daily' ? 'Hari Ini' : filterType === 'weekly' ? 'Minggu Ini' : 'Bulan Ini'})`}
             value={formatCurrency(currentViewRevenue)}
             icon={<FaMoneyBillWave />}
             color="bg-blue-500"
             subtext={getFilterLabel()}
          />

          {/* Card 2: Pendapatan 7 Hari Terakhir (Fixed) */}
          <StatCard 
             title="Pendapatan 7 Hari Terakhir"
             value={formatCurrency(last7DaysRevenue)}
             icon={<FaChartLine />}
             color="bg-green-500"
             subtext="Rolling 7 days"
          />

          {/* Card 3: Total Transaksi (Filter View) */}
          <StatCard 
             title="Total Transaksi"
             value={`${filteredData.length} Booking`}
             icon={<FaCalendarAlt />}
             color="bg-purple-500"
             subtext="Sesuai filter aktif"
          />
      </div>

      {/* --- Grafik --- */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Grafik Pendapatan</h3>
            <div className="flex gap-2">
                {['daily', 'weekly'].map(view => (
                    <button 
                        key={view}
                        onClick={() => setChartViewType(view)} 
                        className={`text-xs px-3 py-1 rounded-full border ${chartViewType === view ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                        View {view === 'daily' ? 'Harian' : 'Mingguan'}
                    </button>
                ))}
            </div>
        </div>
        <div className="h-80">
            <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* --- Tabel Data Rinci --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-700">Rincian Transaksi</h3>
        </div>
        <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50 sticky top-0 z-10">
                 <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Pelanggan</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Paket</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Studio</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Total</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {filteredData.length > 0 ? (
                   filteredData.map((item) => (
                     <tr key={item.id} className="hover:bg-gray-50">
                       <td className="px-6 py-3 text-sm text-gray-500">{moment(item.tanggal).format('DD/MM/YYYY')}</td>
                       <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.customer_name || item.nama || '-'}</td>
                       <td className="px-6 py-3 text-sm text-gray-500">{item.package_name || 'Tanpa Paket'}</td>
                       <td className="px-6 py-3 text-sm text-gray-500">{item.studio_name}</td>
                       <td className="px-6 py-3 text-sm text-green-600 font-bold text-right">{formatCurrency(calculateTotalPrice(item))}</td>
                     </tr>
                   ))
                 ) : (
                   <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Tidak ada data transaksi.</td></tr>
                 )}
               </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

// ... (Kode PaymentSummary & PaymentLog placeholder tetap sama) ...
const PaymentSummary = () => (<div className="p-6 bg-white rounded-lg shadow-md"><h3 className="text-xl font-bold">Ringkasan Pembayaran</h3><p>Coming soon.</p></div>);
const PaymentLog = () => (<div className="p-6 bg-white rounded-lg shadow-md"><h3 className="text-xl font-bold">Log Pembayaran</h3><p>Coming soon.</p></div>);

// ====================================================================
// 3. KOMPONEN KONTAINER UTAMA
// ====================================================================
const FinancialReport = ({ packages, studios }) => {
  const [activeSubTab, setActiveSubTab] = useState('summary');

  const getButtonClass = (tabName) => {
    const base = "flex justify-between items-center w-full p-3 text-left font-medium rounded-lg transition duration-150 mb-1";
    return activeSubTab === tabName 
        ? `${base} bg-blue-50 text-blue-700` 
        : `${base} text-gray-600 hover:bg-gray-100`;
  };

  return (
    <div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col lg:flex-row gap-6 min-h-[80vh]">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-24">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FaClock size={20} /></div>
             <h2 className="text-xl font-bold text-gray-800">Keuangan</h2>
          </div>
          
          <nav>
               <button onClick={() => setActiveSubTab('summary')} className={getButtonClass('summary')}>
                   Ringkasan Keuangan
               </button>
               <button onClick={() => setActiveSubTab('payment')} className={getButtonClass('payment')}>
                   Ringkasan Pembayaran
               </button>
               <button onClick={() => setActiveSubTab('log')} className={getButtonClass('log')}>
                   Log Pembayaran
               </button>
          </nav>
        </div>
      </aside>
      
      {/* Content */}
      <main className="flex-1 min-w-0">
          {activeSubTab === 'summary' && <FinancialSummary packages={packages} studios={studios} />}
          {activeSubTab === 'payment' && <PaymentSummary />}
          {activeSubTab === 'log' && <PaymentLog />}
      </main>
    </div>
  );
};

export default FinancialReport;