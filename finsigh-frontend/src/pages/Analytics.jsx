// src/pages/Analytics.jsx
import React, { useState, useEffect } from 'react';
import {
  ArrowDownTrayIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('7');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total_volume: 0,
    avg_sentiment: 0,
    critical_issues: 0,
    resolution_rate: 0,
    volume_change: 0,
    sentiment_change: 0,
    critical_change: 0,
    resolution_change: 0
  });
  const [trends, setTrends] = useState([]);
  const [categoryTrends, setCategoryTrends] = useState([]);
  const [peakTimes, setPeakTimes] = useState({});
  const [channels, setChannels] = useState({});

  // Fetch all analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch summary
      const summaryRes = await fetch(`http://localhost:8000/api/analytics/summary?date_range=${dateRange}`);
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      // Fetch trends
      const trendsRes = await fetch(`http://localhost:8000/api/analytics/trends?date_range=${dateRange}`);
      const trendsData = await trendsRes.json();
      setTrends(trendsData);

      // Fetch categories
      const categoriesRes = await fetch('http://localhost:8000/api/analytics/categories');
      const categoriesData = await categoriesRes.json();
      setCategoryTrends(categoriesData);

      // Fetch peak times
      const peakRes = await fetch('http://localhost:8000/api/analytics/peak-times');
      const peakData = await peakRes.json();
      setPeakTimes(peakData);

      // Fetch channels
      const channelsRes = await fetch('http://localhost:8000/api/analytics/channels');
      const channelsData = await channelsRes.json();
      setChannels(channelsData);

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export analytics
  const handleExport = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/analytics/export?date_range=${dateRange}&format=csv`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Failed to export data');
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const getMaxValue = () => {
    const maxTotal = Math.max(...trends.map(t => t.total), 100);
    return maxTotal;
  };

  const maxTotal = getMaxValue();

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-2">Deep dive into feedback trends and patterns</p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Custom Range
            </button>
            
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-sm text-gray-500 mb-1">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_volume}</p>
                <p className={`text-xs mt-2 ${summary.volume_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.volume_change >= 0 ? '↑' : '↓'} {Math.abs(summary.volume_change)}% from last period
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-sm text-gray-500 mb-1">Avg Sentiment</p>
                <p className="text-2xl font-bold text-gray-900">{summary.avg_sentiment}</p>
                <p className={`text-xs mt-2 ${summary.sentiment_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.sentiment_change >= 0 ? '↑' : '↓'} {Math.abs(summary.sentiment_change)}% from last period
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-sm text-gray-500 mb-1">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{summary.critical_issues}</p>
                <p className={`text-xs mt-2 ${summary.critical_change <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.critical_change <= 0 ? '↓' : '↑'} {Math.abs(summary.critical_change)}% from last period
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-sm text-gray-500 mb-1">Resolution Rate</p>
                <p className="text-2xl font-bold text-gray-900">{summary.resolution_rate}%</p>
                <p className="text-xs text-green-600 mt-2">↑ {Math.abs(summary.resolution_change)}% from last period</p>
              </div>
            </div>

            {/* Trend Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Volume Trends</h2>
              {trends.length > 0 ? (
                <div className="h-64 flex items-end justify-between gap-2">
                  {trends.map((day, index) => {
                    const height = maxTotal > 0 ? (day.total / maxTotal) * 200 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex justify-center gap-1 mb-2">
                          <div 
                            className="w-2 bg-green-500 rounded-t"
                            style={{ height: `${Math.max(2, (day.positive / maxTotal) * 200)}px` }}
                          ></div>
                          <div 
                            className="w-2 bg-yellow-500 rounded-t"
                            style={{ height: `${Math.max(2, (day.neutral / maxTotal) * 200)}px` }}
                          ></div>
                          <div 
                            className="w-2 bg-red-500 rounded-t"
                            style={{ height: `${Math.max(2, (day.negative / maxTotal) * 200)}px` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No data available for the selected period
                </div>
              )}
            </div>

            {/* Category Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h2>
                <div className="space-y-4">
                  {categoryTrends.slice(0, 6).map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{category.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-gray-900">{category.count}</span>
                        <span className={`text-sm ${
                          category.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {category.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Peak Times</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Morning (6AM-12PM)</span>
                      <span className="font-medium text-gray-900">{peakTimes.morning || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${peakTimes.morning || 0}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Afternoon (12PM-6PM)</span>
                      <span className="font-medium text-gray-900">{peakTimes.afternoon || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${peakTimes.afternoon || 0}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Evening (6PM-12AM)</span>
                      <span className="font-medium text-gray-900">{peakTimes.evening || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${peakTimes.evening || 0}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Night (12AM-6AM)</span>
                      <span className="font-medium text-gray-900">{peakTimes.night || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${peakTimes.night || 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Distribution */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Feedback Channels</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{channels.mobile || 0}%</p>
                  <p className="text-sm text-gray-600">Mobile App</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{channels.web || 0}%</p>
                  <p className="text-sm text-gray-600">Web</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{channels.email || 0}%</p>
                  <p className="text-sm text-gray-600">Email</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">{channels.chat || 0}%</p>
                  <p className="text-sm text-gray-600">Chat</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;