// src/components/dashboard/FinancialReport.js

import React, { useState, useEffect, useMemo, useCallback } from 'react';
// 1. Ganti axios dengan axiosInstance
import axiosInstance from '../../api/axiosInstance'; // <-- Pastikan path ini benar
import moment from 'moment';
import 'moment/locale/id';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FaClock } from 'react-icons/fa'; // Impor ikon

// Registrasi ChartJS dan set lokal Moment
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
moment.locale('id');

const API_URL = process.env.REACT_APP_API_URL;

// Fungsi helper (tidak berubah)
const calculateTotalPrice = (item) => {
  const price = parseInt(item.package_price, 10) || 0;
  const quantity = parseInt(item.jumlah_orang, 10) || 1;
  return price * quantity;
};

// ====================================================================
// 1. KOMPONEN FINANCIALSUMMARY (Ini adalah kode lama Anda)
// ====================================================================
const FinancialSummary = ({ packages, studios }) => { // Terima props
  // State (Inisialisasi rawReportData sebagai array kosong)
  const [rawReportData, setRawReportData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [filterMonth, setFilterMonth] = useState(moment().month() + 1);
  const [filterYear, setFilterYear] = useState(moment().year());
  const [filterStudio, setFilterStudio] = useState('');
  const [chartViewType, setChartViewType] = useState('daily');

  // apiParams (tidak berubah)
  const apiParams = useMemo(() => {
    const baseParams = { studio_name: filterStudio };
    if (filterType === 'monthly') {
      return { ...baseParams, month: filterMonth, year: filterYear };
    }
    const date = moment(selectedDate);
    return { ...baseParams, month: date.month() + 1, year: date.year() };
  }, [filterType, filterMonth, filterYear, selectedDate, filterStudio]);

  // fetchFinancialData (DIPERBARUI: Gunakan axiosInstance)
  const fetchFinancialData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔎 Fetching financial data with params:', apiParams);
      
      // Ganti axios.get dengan axiosInstance.get dan hapus config token
      const response = await axiosInstance.get(
        `/api/services/financial-report`, // Gunakan path relatif
        { 
          params: apiParams,
          headers: { 'Cache-Control': 'no-cache' } // Header cache
        }
      );
      setRawReportData(response.data || []);
    } catch (err) {
       // Interceptor akan menangani 401 (redirect)
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

  // --- Fungsi Helper (tidak berubah) ---
  const formatCurrency = (amount) => {
     const numericAmount = parseFloat(amount) || 0;
     return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(numericAmount);
  };
  const formatShortDate = (dateString) => {
     return moment(dateString).format('DD/MM/YYYY');
  };
  const getMonths = () => {
     return moment.months().map((month, index) => ({ value: index + 1, label: month.charAt(0).toUpperCase() + month.slice(1) }));
  };
  const getYears = () => {
     const currentYear = new Date().getFullYear();
     const years = [];
     for (let i = currentYear - 5; i <= currentYear + 1; i++) { years.push(i); }
     return years;
  };
  const getFilterLabel = () => {
     if (filterType === 'monthly') {
         const monthName = moment.months(filterMonth - 1);
         return `Bulan: ${monthName} ${filterYear}`;
     }
     if (filterType === 'weekly') {
         const start = moment(selectedDate).startOf('week').format('DD MMM');
         const end = moment(selectedDate).endOf('week').format('DD MMM YYYY');
         return `Minggu: ${start} - ${end}`;
     }
     if (filterType === 'daily') {
         return `Tanggal: ${moment(selectedDate).format('DD MMMM YYYY')}`;
     }
     return 'Laporan Keuangan';
  };
  // ---------------------------------

  // --- useMemo (DIPERBARUI: Tambah penjagaan/fallback || []) ---
  const filteredData = useMemo(() => {
     const dataToFilter = rawReportData || []; // Penjagaan
     let data = dataToFilter;
     if (filterType === 'daily') {
       data = dataToFilter.filter((item) => moment(item.tanggal).isSame(selectedDate, 'day'));
     } else if (filterType === 'weekly') {
       data = dataToFilter.filter((item) => moment(item.tanggal).isSame(selectedDate, 'week'));
     }
     return data;
  }, [rawReportData, filterType, selectedDate]);

  const filteredTotalRevenue = useMemo(() => {
     return (filteredData || []).reduce((sum, item) => sum + calculateTotalPrice(item), 0); // Penjagaan
  }, [filteredData]);

  const aggregatedChartData = useMemo(() => {
     let revenueData = {};
     (filteredData || []).forEach((item) => { // Penjagaan
       const price = calculateTotalPrice(item);
       let key;
       if (chartViewType === 'daily') key = moment(item.tanggal).format('DD MMM');
       else if (chartViewType === 'weekly') key = `${moment(item.tanggal).startOf('week').format('DD MMM')} - ${moment(item.tanggal).endOf('week').format('DD MMM')}`;
       else if (chartViewType === 'monthly') key = moment(item.tanggal).format('MMMM');
       
       if(key) revenueData[key] = (revenueData[key] || 0) + price;
     });
     
     const sortedKeys = Object.keys(revenueData).sort((a, b) => {
         if (chartViewType === 'daily') return moment(a, 'DD MMM').diff(moment(b, 'DD MMM'));
         if (chartViewType === 'weekly') return moment(a.split(' ')[0], 'DD MMM').diff(moment(b.split(' ')[0], 'DD MMM'));
         if (chartViewType === 'monthly') return moment(a, 'MMMM', 'id').month() - moment(b, 'MMMM', 'id').month();
         return 0;
     });
     const labels = sortedKeys;
     const revenues = labels.map((key) => revenueData[key]);
     return {
       labels,
       datasets: [{ label: `Pendapatan (${chartViewType})`, data: revenues, backgroundColor: 'rgba(54, 162, 235, 0.6)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 }],
     };
  }, [filteredData, chartViewType]);

  const chartOptions = {
      responsive: true,
      plugins: { legend: { position: 'top' }, title: { display: true, text: `Laporan Keuangan ${chartViewType.charAt(0).toUpperCase() + chartViewType.slice(1)}` } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'Pendapatan (Rp)' } } }
  };
  // ---------------------------------

  if (loading) return <div className="text-center mt-8">Memuat laporan keuangan...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    // Ini adalah konten untuk "Ringkasan keuangan"
    <div className="flex-grow flex flex-col space-y-6">
      {/* --- Filter controls (dimasukkan ke card) --- */}
      <div className="flex flex-col space-y-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">Tipe Filter:</span>
          <button onClick={() => setFilterType('daily')} className={`p-2 rounded-md text-sm ${filterType === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>Harian</button>
          <button onClick={() => setFilterType('weekly')} className={`p-2 rounded-md text-sm ${filterType === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>Mingguan</button>
          <button onClick={() => setFilterType('monthly')} className={`p-2 rounded-md text-sm ${filterType === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>Bulanan</button>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {filterType === 'monthly' ? (
            <>
              <div><label className="block text-sm font-medium text-gray-700">Bulan</label><select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="p-2 border rounded-md">{getMonths().map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}</select></div>
              <div><label className="block text-sm font-medium text-gray-700">Tahun</label><select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="p-2 border rounded-md">{getYears().map((y) => (<option key={y} value={y}>{y}</option>))}</select></div>
            </>
          ) : (
            <div><label className="block text-sm font-medium text-gray-700">Pilih Tanggal</label><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-2 border rounded-md"/></div>
          )}
          
          {/* PERBAIKAN MAP STUDIOS */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Studio</label>
            <select value={filterStudio} onChange={(e) => setFilterStudio(e.target.value)} className="p-2 border rounded-md bg-white">
              <option value="">Semua Studio</option>
              {/* Tambahkan fallback || [] untuk 'studios' prop */}
              {(studios || []).map((studio) => (
                <option key={studio.id || studio.name} value={studio.name}>{studio.name}</option> 
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          <span className="font-semibold">Tampilan Chart:</span>
          <button onClick={() => setChartViewType('daily')} className={`p-2 rounded-md text-sm ${chartViewType === 'daily' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}>Harian</button>
          <button onClick={() => setChartViewType('weekly')} className={`p-2 rounded-md text-sm ${chartViewType === 'weekly' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}>Mingguan</button>
          <button onClick={() => setChartViewType('monthly')} className={`p-2 rounded-md text-sm ${chartViewType === 'monthly' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}>Bulanan</button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Bar data={aggregatedChartData} options={chartOptions} />
      </div>

      {/* Total Revenue */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold">Total Pendapatan ({getFilterLabel()}):</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(filteredTotalRevenue)}</p>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm" style={{ minHeight: '400px' }}>
        <table className="min-w-full divide-y divide-gray-200">
           <thead className="bg-gray-50 sticky top-0">
             <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Pelanggan</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Paket</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Studio</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Harga</th></tr>
           </thead>
           <tbody className="bg-white divide-y divide-gray-200">
             {/* PERBAIKAN MAP filteredData */}
             {(filteredData || []).length > 0 ? ( 
               (filteredData || []).map((item) => ( 
                 <tr key={item.id}>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatShortDate(item.tanggal)}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.customer_name || '-'}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.package_name || 'Tanpa Paket'}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.studio_name}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(calculateTotalPrice(item))}</td>
                 </tr>
               ))
             ) : (
               <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada data booking dengan status 'selesai' untuk filter ini.</td></tr>
             )}
           </tbody>
        </table>
      </div>
    </div>
  );
};

// ====================================================================
// 2. KOMPONEN STUB (Placeholder untuk sub-menu lain)
// ====================================================================
const PaymentSummary = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Ringkasan Pembayaran</h3>
      <p className="text-gray-600">Fitur ini sedang dalam pengembangan.</p>
    </div>
  );
};

const PaymentLog = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Log Pembayaran</h3>
      <p className="text-gray-600">Fitur ini sedang dalam pengembangan.</p>
    </div>
  );
};


// ====================================================================
// 3. KOMPONEN KONTAINER BARU (Yang akan diekspor)
// ====================================================================
const FinancialReport = ({ packages, studios }) => {
  // State untuk mengelola sub-tab yang aktif
  const [activeSubTab, setActiveSubTab] = useState('summary'); // 'summary', 'payment', 'log'

  // Fungsi untuk merender konten sub-menu yang sesuai
  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'summary':
        // Kirim props 'packages' dan 'studios' ke komponen ringkasan
        return <FinancialSummary packages={packages} studios={studios} />;
      case 'payment':
        return <PaymentSummary />;
      case 'log':
        return <PaymentLog />;
      default:
        return <FinancialSummary packages={packages} studios={studios} />;
    }
  };

  // Fungsi helper untuk styling tombol sub-menu
  const getButtonClass = (tabName) => {
    const baseClass = "flex justify-between items-center w-full p-4 text-left font-medium text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out";
    const activeClass = "bg-blue-50 border-l-4 border-blue-600 text-blue-700";
    const inactiveClass = "border-l-4 border-transparent";
    return `${baseClass} ${activeSubTab === tabName ? activeClass : inactiveClass}`;
  };

  return (
    // Layout utama: Sidebar sub-menu di kiri dan Konten di kanan
<div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col lg:flex-row lg:items-start gap-6">      
      {/* Sidebar Sub-menu (Kiri) */}
      <aside className="w-full lg:w-1/4 xl:w-1/5 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24"> {/* Dibuat sticky */}
          {/* Header dari gambar */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b">
             <span className="text-gray-700"><FaClock size={28} /></span>
             <h2 className="text-3xl font-bold text-gray-800">Keuangan</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
              Pantau keseluruhan keuangan Anda termasuk penjualan, pembayaran, dan lainnya.
          </p>
          
          {/* Navigasi Sub-menu */}
          <nav className="space-y-2">
               <button onClick={() => setActiveSubTab('summary')} className={getButtonClass('summary')}>
                   Ringkasan keuangan
                   <span className="text-gray-400 text-lg">&rsaquo;</span>
               </button>
               <button onClick={() => setActiveSubTab('payment')} className={getButtonClass('payment')}>
                   Ringkasan pembayaran
                   <span className="text-gray-400 text-lg">&rsaquo;</span>
               </button>
               <button onClick={() => setActiveSubTab('log')} className={getButtonClass('log')}>
                   Log pembayaran
                   <span className="text-gray-400 text-lg">&rsaquo;</span>
               </button>
          </nav>
        </div>
      </aside>
      
      {/* Area Konten Utama (Kanan) */}
      <main className="flex-1 w-full lg:w-3/4 xl:w-4/5">
          {renderSubContent()}
      </main>
    </div>
  );
};

export default FinancialReport; // Ekspor komponen kontainer baru