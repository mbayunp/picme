import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import moment from 'moment';
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

// Mendaftarkan komponen Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ✅ Tambahkan variabel lingkungan
const API_URL = process.env.REACT_APP_API_URL;

const FinancialReport = ({ packages, studios }) => {
  const [rawReportData, setRawReportData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterMonth, setFilterMonth] = useState(moment().month() + 1);
  const [filterYear, setFilterYear] = useState(moment().year());
  const [filterStudio, setFilterStudio] = useState('');
  const [viewType, setViewType] = useState('daily');

  const fetchFinancialData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('admin-token');
      const config = { headers: { 'x-access-token': token } };

      console.log('🔎 Fetching financial data with params:', {
        month: filterMonth,
        year: filterYear,
        studio_name: filterStudio,
      });

      // ✅ PERBAIKAN: Menggunakan variabel lingkungan
      const response = await axios.get(
        `${API_URL}/api/services/financial-report`,
        {
          params: {
            month: filterMonth,
            year: filterYear,
            studio_name: filterStudio,
          },
          headers: {
            ...config.headers,
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            'If-None-Match': '',
          },
        }
      );

      const data = response.data || [];
      setRawReportData(data);

      const total = data.reduce(
        (sum, item) => sum + (parseInt(item.package_price, 10) || 0),
        0
      );
      setTotalRevenue(total);
    } catch (err) {
      console.error('❌ Error fetching financial report:', err);
      setError(
        'Gagal memuat laporan keuangan. Pastikan backend berjalan dan endpoint sudah benar.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [filterMonth, filterYear, filterStudio]);

  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  };

  const formatShortDate = (dateString) => {
    return moment(dateString).format('DD/MM/YYYY');
  };

  const filteredData = useMemo(() => {
    return rawReportData;
  }, [rawReportData]);

  const aggregatedChartData = useMemo(() => {
    let revenueData = {};

    (filteredData || []).forEach((item) => {
      const price = parseInt(item.package_price, 10) || 0;
      let key;

      if (viewType === 'daily') {
        key = moment(item.tanggal).format('DD MMM');
      } else if (viewType === 'weekly') {
        const weekStart = moment(item.tanggal).startOf('week').format('DD MMM');
        const weekEnd = moment(item.tanggal).endOf('week').format('DD MMM');
        key = `${weekStart} - ${weekEnd}`;
      } else if (viewType === 'monthly') {
        key = moment(item.tanggal).format('MMMM');
      }

      revenueData[key] = (revenueData[key] || 0) + price;
    });

    const sortedKeys = Object.keys(revenueData).sort((a, b) => {
      if (viewType === 'daily') {
        return moment(a, 'DD MMM').diff(moment(b, 'DD MMM'));
      } else if (viewType === 'weekly') {
        return moment(a.split(' ')[0], 'DD MMM').diff(
          moment(b.split(' ')[0], 'DD MMM')
        );
      } else if (viewType === 'monthly') {
        return moment(a, 'MMMM').diff(moment(b, 'MMMM'));
      }
      return 0;
    });

    const labels = sortedKeys;
    const revenues = labels.map((key) => revenueData[key]);

    return {
      labels,
      datasets: [
        {
          label: `Pendapatan (${viewType})`,
          data: revenues,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [filteredData, viewType]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Laporan Keuangan ${
          viewType.charAt(0).toUpperCase() + viewType.slice(1)
        }`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Pendapatan (Rp)',
        },
      },
    },
  };

  const getMonths = () => {
    return moment.months().map((month, index) => ({
      value: index + 1,
      label: month,
    }));
  };

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };

  if (loading)
    return <div className="text-center mt-8">Memuat laporan keuangan...</div>;
  if (error)
    return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col">
      <h3 className="text-2xl font-bold mb-4">Rekapan Keuangan</h3>

      <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-4">
        <select
          value={filterStudio}
          onChange={(e) => setFilterStudio(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="">Semua Studio</option>
          {(studios || []).map((studio) => (
            <option key={studio.name} value={studio.name}>
              {studio.name}
            </option>
          ))}
        </select>
        <div className="flex items-center space-x-2">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="p-2 border rounded-md"
          >
            {getMonths().map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="p-2 border rounded-md"
          >
            {getYears().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewType('daily')}
            className={`p-2 rounded-md ${
              viewType === 'daily'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Harian
          </button>
          <button
            onClick={() => setViewType('weekly')}
            className={`p-2 rounded-md ${
              viewType === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Mingguan
          </button>
          <button
            onClick={() => setViewType('monthly')}
            className={`p-2 rounded-md ${
              viewType === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Bulanan
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <Bar data={aggregatedChartData} options={chartOptions} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-semibold">
            Total Pendapatan dari Booking Selesai:
          </p>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tanggal
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nama Pelanggan
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nama Paket
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Studio
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right"
              >
                Harga
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatShortDate(item.tanggal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.customer_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.package_name || 'Tanpa Paket'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.studio_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(item.package_price)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Tidak ada data booking dengan status 'selesai' di bulan ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialReport;