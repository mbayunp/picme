import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
moment.locale('id');

const API_URL = process.env.REACT_APP_API_URL;

const calculateTotalPrice = (item) => {
  const price = parseInt(item.package_price, 10) || 0;
  const quantity = parseInt(item.jumlah_orang, 10) || 1;
  return price * quantity;
};

const FinancialReport = ({ packages, studios }) => {
  const [rawReportData, setRawReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State untuk filter utama
  const [filterType, setFilterType] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [filterMonth, setFilterMonth] = useState(moment().month() + 1);
  const [filterYear, setFilterYear] = useState(moment().year());
  const [filterStudio, setFilterStudio] = useState('');

  const [chartViewType, setChartViewType] = useState('daily');

  const apiParams = useMemo(() => {
    const baseParams = { studio_name: filterStudio };

    if (filterType === 'monthly') {
      return {
        ...baseParams,
        month: filterMonth,
        year: filterYear,
      };
    }

    const date = moment(selectedDate);
    return {
      ...baseParams,
      month: date.month() + 1,
      year: date.year(),
    };
  }, [filterType, filterMonth, filterYear, selectedDate, filterStudio]);

  const fetchFinancialData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('admin-token');
      const config = { headers: { 'x-access-token': token } };

      console.log('🔎 Fetching financial data with params:', apiParams);

      const response = await axios.get(
        `${API_URL}/api/services/financial-report`,
        {
          params: apiParams,
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

    } catch (err) {
      console.error('❌ Error fetching financial report:', err);
      setError(
        'Gagal memuat laporan keuangan. Pastikan backend berjalan dan endpoint sudah benar.'
      );
    } finally {
      setLoading(false);
    }
  }, [apiParams]);
  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

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
    let data = rawReportData;

    if (filterType === 'daily') {
      data = rawReportData.filter((item) =>
        moment(item.tanggal).isSame(selectedDate, 'day')
      );
    } else if (filterType === 'weekly') {
      data = rawReportData.filter((item) =>
        moment(item.tanggal).isSame(selectedDate, 'week')
      );
    }
    

    return data;
  }, [rawReportData, filterType, selectedDate]);

  const filteredTotalRevenue = useMemo(() => {
      return filteredData.reduce(
        (sum, item) => sum + calculateTotalPrice(item),
        0
      );
  }, [filteredData]);


  const aggregatedChartData = useMemo(() => {
    let revenueData = {};

    (filteredData || []).forEach((item) => {
      const price = calculateTotalPrice(item);
      let key;

      if (chartViewType === 'daily') {
        key = moment(item.tanggal).format('DD MMM');
      } else if (chartViewType === 'weekly') {
        const weekStart = moment(item.tanggal).startOf('week').format('DD MMM');
        const weekEnd = moment(item.tanggal).endOf('week').format('DD MMM');
        key = `${weekStart} - ${weekEnd}`;
      } else if (chartViewType === 'monthly') {
        key = moment(item.tanggal).format('MMMM');
      }

      revenueData[key] = (revenueData[key] || 0) + price;
    });

    const sortedKeys = Object.keys(revenueData).sort((a, b) => {
      if (chartViewType === 'daily') {
        return moment(a, 'DD MMM').diff(moment(b, 'DD MMM'));
      } else if (chartViewType === 'weekly') {
        return moment(a.split(' ')[0], 'DD MMM').diff(
          moment(b.split(' ')[0], 'DD MMM')
        );
      } else if (chartViewType === 'monthly') {
        return moment(a, 'MMMM', 'id').month() - moment(b, 'MMMM', 'id').month();
      }
      return 0;
    });

    const labels = sortedKeys;
    const revenues = labels.map((key) => revenueData[key]);

    return {
      labels,
      datasets: [
        {
          label: `Pendapatan (${chartViewType})`,
          data: revenues,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [filteredData, chartViewType]);
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Laporan Keuangan ${
          chartViewType.charAt(0).toUpperCase() + chartViewType.slice(1)
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
      label: month.charAt(0).toUpperCase() + month.slice(1),
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

  if (loading)
    return <div className="text-center mt-8">Memuat laporan keuangan...</div>;
  if (error)
    return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col">
      <h3 className="text-2xl font-bold mb-4">Rekapan Keuangan</h3>

      {/* --- Filter controls --- */}
      <div className="flex flex-col space-y-4 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">Tipe Filter:</span>
          <button
            onClick={() => setFilterType('daily')}
            className={`p-2 rounded-md text-sm ${
              filterType === 'daily'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Harian
          </button>
          <button
            onClick={() => setFilterType('weekly')}
            className={`p-2 rounded-md text-sm ${
              filterType === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Mingguan
          </button>
          <button
            onClick={() => setFilterType('monthly')}
            className={`p-2 rounded-md text-sm ${
              filterType === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Bulanan
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {filterType === 'monthly' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bulan
                </label>
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tahun
                </label>
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
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pilih Tanggal
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-2 border rounded-md"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Studio
            </label>
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
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          <span className="font-semibold">Tampilan Chart:</span>
          <button
            onClick={() => setChartViewType('daily')}
            className={`p-2 rounded-md text-sm ${
              chartViewType === 'daily'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Harian
          </button>
          <button
            onClick={() => setChartViewType('weekly')}
            className={`p-2 rounded-md text-sm ${
              chartViewType === 'weekly'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Mingguan
          </button>
          <button
            onClick={() => setChartViewType('monthly')}
            className={`p-2 rounded-md text-sm ${
              chartViewType === 'monthly'
                ? 'bg-green-600 text-white'
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
            Total Pendapatan ({getFilterLabel()}):
          </p>
          {/* filteredTotalRevenue*/}
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(filteredTotalRevenue)}
          </p>
        </div>
      </div>

      {/* --- Tabel Data --- */}
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
                    {formatCurrency(calculateTotalPrice(item))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Tidak ada data booking dengan status 'selesai' untuk filter
                  ini.
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