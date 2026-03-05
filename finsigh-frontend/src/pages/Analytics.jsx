// src/pages/Analytics.jsx
import React, { useState } from 'react';
import {
  ArrowDownTrayIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('7');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const trends = [
    { date: '2024-03-10', total: 145, positive: 78, negative: 32, neutral: 35 },
    { date: '2024-03-11', total: 162, positive: 85, negative: 41, neutral: 36 },
    { date: '2024-03-12', total: 158, positive: 82, negative: 38, neutral: 38 },
    { date: '2024-03-13', total: 179, positive: 95, negative: 44, neutral: 40 },
    { date: '2024-03-14', total: 191, positive: 102, negative: 48, neutral: 41 },
    { date: '2024-03-15', total: 188, positive: 98, negative: 47, neutral: 43 },
    { date: '2024-03-16', total: 224, positive: 118, negative: 56, neutral: 50 },
  ];

  const categoryTrends = [
    { name: 'Transaction Failure', count: 245, change: '+12%' },
    { name: 'KYC Issue', count: 189, change: '+5%' },
    { name: 'App Crash', count: 156, change: '-3%' },
    { name: 'UI Problem', count: 312, change: '+8%' },
    { name: 'Feature Request', count: 198, change: '+15%' },
    { name: 'Fraud Alert', count: 45, change: '-2%' },
  ];

  return (
    <div className="min-h-screen mt-25 bg-gray-50 py-8">
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
            
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center">
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">Total Volume</p>
            <p className="text-2xl font-bold text-gray-900">1,247</p>
            <p className="text-xs text-green-600 mt-2">↑ 12% from last period</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">Avg Sentiment</p>
            <p className="text-2xl font-bold text-gray-900">0.64</p>
            <p className="text-xs text-green-600 mt-2">↑ 0.05 from last period</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">Critical Issues</p>
            <p className="text-2xl font-bold text-red-600">45</p>
            <p className="text-xs text-red-600 mt-2">↑ 8% from last period</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">Resolution Rate</p>
            <p className="text-2xl font-bold text-gray-900">78%</p>
            <p className="text-xs text-green-600 mt-2">↑ 5% from last period</p>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Volume Trends</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {trends.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex justify-center gap-1 mb-2">
                  <div 
                    className="w-2 bg-green-500 rounded-t"
                    style={{ height: `${(day.positive / 150) * 100}px` }}
                  ></div>
                  <div 
                    className="w-2 bg-yellow-500 rounded-t"
                    style={{ height: `${(day.neutral / 150) * 100}px` }}
                  ></div>
                  <div 
                    className="w-2 bg-red-500 rounded-t"
                    style={{ height: `${(day.negative / 150) * 100}px` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h2>
            <div className="space-y-4">
              {categoryTrends.map((category, index) => (
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
                  <span className="font-medium text-gray-900">35%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Afternoon (12PM-6PM)</span>
                  <span className="font-medium text-gray-900">42%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Evening (6PM-12AM)</span>
                  <span className="font-medium text-gray-900">18%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '18%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Night (12AM-6AM)</span>
                  <span className="font-medium text-gray-900">5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '5%' }}></div>
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
              <p className="text-2xl font-bold text-blue-600">58%</p>
              <p className="text-sm text-gray-600">Mobile App</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">24%</p>
              <p className="text-sm text-gray-600">Web</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">12%</p>
              <p className="text-sm text-gray-600">Email</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">6%</p>
              <p className="text-sm text-gray-600">Chat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;