'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { Search, Clock, TrendingUp, Calendar, RefreshCcw, ChevronDown, Bot } from 'lucide-react';
import AIAssistant from '@/app/components/AIAssistant';

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
  const [isAIOpen, setIsAIOpen] = useState(false);

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

  const fetchData = useCallback(async (symbol: string, start: string, end: string) => {
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
  }, [timeframe]);

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
  }, [ticker, startDate, endDate, fetchData]);

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold">TradingAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsAIOpen(true)}
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Bot className="h-4 w-4" />
                <span>AI Assistant</span>
              </button>
              <div className="flex items-center px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="ml-2 text-sm text-slate-300">
                  {marketStatus && new Date(marketStatus.serverTime).toLocaleTimeString('en-US', {
                    timeZone: 'GMT',
                    hour12: false,
                  })} GMT
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Market Status Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">Market Status</span>
              <RefreshCcw className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-center">
              <div className={`h-2 w-2 rounded-full mr-2 ${
                marketStatus?.market === 'open' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-lg font-semibold">
                {marketStatus?.market === 'open' ? 'Market Open' : 'Market Closed'}
              </span>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
            <span className="text-sm font-medium text-slate-400">NYSE</span>
            <div className="mt-2 flex items-center">
              <div className={`h-2 w-2 rounded-full mr-2 ${
                marketStatus?.exchanges.nyse === 'open' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-lg font-semibold">
                {marketStatus?.exchanges.nyse.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
            <span className="text-sm font-medium text-slate-400">NASDAQ</span>
            <div className="mt-2 flex items-center">
              <div className={`h-2 w-2 rounded-full mr-2 ${
                marketStatus?.exchanges.nasdaq === 'open' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-lg font-semibold">
                {marketStatus?.exchanges.nasdaq.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
            <span className="text-sm font-medium text-slate-400">Trading Hours</span>
            <div className="mt-2 space-y-1">
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-2 ${
                  marketStatus?.earlyHours ? 'bg-purple-500' : 'bg-slate-500'
                }`} />
                <span className="text-sm">Pre-Market</span>
              </div>
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-2 ${
                  marketStatus?.afterHours ? 'bg-purple-500' : 'bg-slate-500'
                }`} />
                <span className="text-sm">After-Hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Chart Section */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Symbol</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value)}
                      placeholder="Enter ticker symbol (e.g., AAPL)"
                      className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-500"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-400 mb-1">Timeframe</label>
                    <div className="relative">
                      <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value as '1' | '5' | '15' | '30' | '60')}
                        className="w-full appearance-none pl-4 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      >
                        <option value="1">1 Minute</option>
                        <option value="5">5 Minutes</option>
                        <option value="15">15 Minutes</option>
                        <option value="30">30 Minutes</option>
                        <option value="60">1 Hour</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-400 mb-1">Date Range</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min="2023-01-01"
                        max="2025-12-31"
                        className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min="2023-01-01"
                        max="2025-12-31"
                        className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={loading}
                className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors duration-200"
              >
                {loading ? 'Loading...' : 'Analyze'}
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-lg text-slate-400">Loading...</div>
              </div>
            ) : data && chartData ? (
              <div>
                <div className="h-[400px]">
                  <Chart 
                    type="line"
                    options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        price: {
                          ...chartOptions.scales.price,
                          grid: {
                            ...chartOptions.scales.price.grid,
                            color: 'rgba(148, 163, 184, 0.1)',
                            display: true
                          },
                          ticks: {
                            color: '#94a3b8'
                          }
                        },
                        x: {
                          ...chartOptions.scales.x,
                          grid: {
                            ...chartOptions.scales.x.grid,
                            color: 'rgba(148, 163, 184, 0.1)',
                            display: true
                          },
                          ticks: {
                            ...chartOptions.scales.x.ticks,
                            color: '#94a3b8'
                          }
                        }
                      },
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          ...chartOptions.plugins.legend,
                          labels: {
                            color: '#94a3b8'
                          }
                        }
                      }
                    }}
                    data={{
                      labels: chartData?.labels,
                      datasets: chartData?.datasets as ChartDataset[]
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>

          {data && (
            <div className="flex justify-end">
              <button
                onClick={() => setViewRawData(!viewRawData)}
                className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
              >
                {viewRawData ? 'Hide Raw Data' : 'View Raw Data'}
              </button>
            </div>
          )}

          {viewRawData && data && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4 text-slate-200">Raw Data</h2>
              <div className="overflow-auto max-h-[50vh]">
                <pre className="text-sm text-slate-400">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </div>
  );
} 