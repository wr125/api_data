'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ChartTypeRegistry
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { format, subYears, isAfter, isBefore, parseISO } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PolygonData {
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: Array<{
    v: number;  // volume
    vw: number; // volume weighted average price
    o: number;  // open price
    c: number;  // close price
    h: number;  // high price
    l: number;  // low price
    t: number;  // timestamp
    n: number;  // number of transactions
  }>;
  status: string;
  request_id: string;
  count: number;
}

interface MarketStatus {
  afterHours: boolean;
  currencies: {
    crypto: string;
    fx: string;
  };
  earlyHours: boolean;
  exchanges: {
    nasdaq: string;
    nyse: string;
    otc: string;
  };
  market: string;
  serverTime: string;
}

type ChartDataset = {
  type: keyof ChartTypeRegistry;
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string | string[];
  borderWidth: number;
  tension?: number;
  fill?: boolean;
  pointRadius?: number;
  yAxisID: string;
  borderDash?: number[];
};

export default function ApiDataPage() {
  const [data, setData] = useState<PolygonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticker, setTicker] = useState('AAPL');
  const [viewRawData, setViewRawData] = useState(false);
  const [startDate, setStartDate] = useState(format(subYears(new Date(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [timeframe, setTimeframe] = useState<'1' | '5' | '15' | '30' | '60'>('1');
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [marketStatusError, setMarketStatusError] = useState<string | null>(null);

  const validateDateRange = (start: string, end: string) => {
    const startDateTime = parseISO(start);
    const endDateTime = parseISO(end);
    const minDate = new Date('2023-01-01');
    const maxDate = new Date('2025-12-31');

    if (isAfter(startDateTime, endDateTime)) {
      return 'Start date must be before end date';
    }

    if (isBefore(startDateTime, minDate)) {
      return 'Start date cannot be before 2023';
    }

    if (isAfter(endDateTime, maxDate)) {
      return 'End date cannot be after 2025';
    }

    return null;
  };

  const fetchData = async (symbol: string, start: string, end: string) => {
    setLoading(true);
    setError(null);
    try {
      let apiUrl;
      if (timeframe === '60') {
        apiUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/60/minute/2023-02-18/2023-02-18?adjusted=true&sort=asc&apiKey=2xm6WhiUP8BVDxfs0pDBE9e9D1qInDhX`;
      } else if (timeframe === '30') {
        apiUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/30/minute/2023-02-18/2023-02-18?adjusted=true&sort=asc&apiKey=2xm6WhiUP8BVDxfs0pDBE9e9D1qInDhX`;
      } else if (timeframe === '15') {
        apiUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/15/minute/2023-02-18/2023-02-18?adjusted=true&sort=asc&apiKey=2xm6WhiUP8BVDxfs0pDBE9e9D1qInDhX`;
      } else if (timeframe === '5') {
        apiUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/5/minute/2023-02-18/2023-02-18?adjusted=true&sort=asc&apiKey=2xm6WhiUP8BVDxfs0pDBE9e9D1qInDhX`;
      } else {
        apiUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/minute/${start}/${end}?adjusted=true&sort=asc&apiKey=2xm6WhiUP8BVDxfs0pDBE9e9D1qInDhX`;
      }

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateDateRange(startDate, endDate);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (ticker.trim()) {
      fetchData(ticker.toUpperCase(), startDate, endDate);
    }
  };

  useEffect(() => {
    const validationError = validateDateRange(startDate, endDate);
    if (!validationError) {
      fetchData(ticker, startDate, endDate);
    }
  }, []);

  const formatChartData = (data: any) => {
    if (!data?.results) return null;
    
    const labels = data.results.map((result: any) => format(new Date(result.t), 'yyyy-MM-dd HH:mm'));
    
    return {
      labels,
      datasets: [
        {
          type: 'line' as const,
          label: 'Close Price',
          data: data.results.map((result: any) => result.c),
          borderColor: '#2196f3',
          borderWidth: 1,
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          yAxisID: 'price'
        },
        {
          type: 'line' as const,
          label: 'High Price',
          data: data.results.map((result: any) => result.h),
          borderColor: '#4caf50',
          borderWidth: 1,
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          yAxisID: 'price',
          borderDash: [5, 5]
        },
        {
          type: 'line' as const,
          label: 'Low Price',
          data: data.results.map((result: any) => result.l),
          borderColor: '#f44336',
          borderWidth: 1,
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          yAxisID: 'price',
          borderDash: [5, 5]
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            return format(new Date(data!.results[tooltipItems[0].dataIndex].t), 'yyyy-MM-dd HH:mm');
          }
        }
      }
    },
    scales: {
      price: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          drawOnChartArea: true,
          borderColor: 'rgba(0,0,0,0.1)',
          drawBorder: true,
        },
        title: {
          display: true,
          text: 'Price'
        }
      },
      x: {
        grid: {
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.1)',
          drawBorder: true,
          drawOnChartArea: true,
        },
        ticks: {
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 8,
          callback: function(val: any, index: number) {
            if (!data?.results) return '';
            return index % Math.ceil(data.results.length / 8) === 0 
              ? format(new Date(data.results[index].t), 'yyyy-MM-dd HH:mm') 
              : '';
          }
        }
      }
    },
  };

  const chartData = formatChartData(data);

  const fetchMarketStatus = async () => {
    try {
      const response = await fetch('https://api.polygon.io/v1/marketstatus/now?apiKey=S2MquGIR8_DxIF3zCj2VpBuOpfMQ6wxr');
      if (!response.ok) {
        throw new Error('Failed to fetch market status');
      }
      const data = await response.json();
      setMarketStatus(data);
      setMarketStatusError(null);
    } catch (err) {
      setMarketStatusError(err instanceof Error ? err.message : 'Failed to fetch market status');
    }
  };

  useEffect(() => {
    fetchMarketStatus();
    const interval = setInterval(fetchMarketStatus, 60000); // 60 seconds = once per minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Market Status</h2>
          {marketStatusError ? (
            <div className="text-red-600">{marketStatusError}</div>
          ) : marketStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Market:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    marketStatus.market === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {marketStatus.market.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">After Hours:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    marketStatus.afterHours
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {marketStatus.afterHours ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Early Hours:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    marketStatus.earlyHours
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {marketStatus.earlyHours ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">NYSE:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    marketStatus.exchanges.nyse === 'open'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {marketStatus.exchanges.nyse.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">NASDAQ:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    marketStatus.exchanges.nasdaq === 'open'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {marketStatus.exchanges.nasdaq.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">OTC:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    marketStatus.exchanges.otc === 'open'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {marketStatus.exchanges.otc.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Crypto:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    marketStatus.currencies.crypto === 'open'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {marketStatus.currencies.crypto.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Forex:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    marketStatus.currencies.fx === 'open'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {marketStatus.currencies.fx.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Server Time:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(marketStatus.serverTime).toLocaleTimeString('en-US', {
                      timeZone: 'GMT',
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })} GMT
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-600">Loading market status...</div>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-8 text-gray-800">
          {ticker} Stock Data
        </h1>
        
        <form onSubmit={handleSearch} className="mb-8">
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="Enter ticker symbol (e.g., AAPL)"
                className="flex-1 max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as '1' | '5' | '15' | '30' | '60')}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              >
                <option value="1">1 Minute</option>
                <option value="5">5 Minutes</option>
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
              </select>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 shadow-sm font-medium"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min="2023-01-01"
                  max="2025-12-31"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min="2023-01-01"
                  max="2025-12-31"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        ) : (
          data && chartData && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Price Chart</h2>
                <div style={{ height: '400px' }}>
                  <Chart 
                    type="line"
                    options={chartOptions}
                    data={{
                      labels: chartData?.labels,
                      datasets: chartData?.datasets as ChartDataset[]
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setViewRawData(!viewRawData)}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  {viewRawData ? 'Hide Raw Data' : 'View Raw Data'}
                </button>
              </div>

              {viewRawData && (
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Raw Data</h2>
                  <div className="overflow-auto max-h-[50vh]">
                    <pre className="text-sm text-gray-600">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
} 