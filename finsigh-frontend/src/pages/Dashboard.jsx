// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 1247,
    positive: 412,
    neutral: 568,
    negative: 270,
    critical: 45,
    high: 89,
    medium: 234,
    low: 467
  });

  const [recentFeedbacks, setRecentFeedbacks] = useState([
    {
      id: 1,
      text: "My transaction failed twice and money was deducted",
      category: "Transaction Failure",
      sentiment: "Negative",
      priority: "Critical",
      time: "2 min ago"
    },
    {
      id: 2,
      text: "App crashes when uploading KYC documents",
      category: "App Crash",
      sentiment: "Negative",
      priority: "High",
      time: "15 min ago"
    },
    {
      id: 3,
      text: "Love the new UI, very intuitive",
      category: "UI Problem",
      sentiment: "Positive",
      priority: "Low",
      time: "1 hour ago"
    },
    {
      id: 4,
      text: "Someone accessed my account without authorization",
      category: "Fraud Alert",
      sentiment: "Negative",
      priority: "Critical",
      time: "2 hours ago"
    }
  ]);

  const [categoryData, setCategoryData] = useState([
    { name: 'Transaction Failure', count: 245, color: 'bg-red-500' },
    { name: 'KYC Issue', count: 189, color: 'bg-orange-500' },
    { name: 'App Crash', count: 156, color: 'bg-yellow-500' },
    { name: 'UI Problem', count: 312, color: 'bg-blue-500' },
    { name: 'Feature Request', count: 198, color: 'bg-green-500' },
    { name: 'Fraud Alert', count: 45, color: 'bg-purple-500' }
  ]);

  return (
    <div className="min-h-screen mt-25  bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of customer feedback analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Feedback</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Last 30 days</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Positive</p>
                <p className="text-3xl font-bold text-green-600">{stats.positive}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaceSmileIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{Math.round(stats.positive/stats.total*100)}% of total</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Neutral</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.neutral}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <UserIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{Math.round(stats.neutral/stats.total*100)}% of total</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Negative</p>
                <p className="text-3xl font-bold text-red-600">{stats.negative}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FaceFrownIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{Math.round(stats.negative/stats.total*100)}% of total</p>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-600 font-medium">Critical</span>
                  <span className="text-gray-600">{stats.critical}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: `${(stats.critical/stats.total)*100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-orange-600 font-medium">High</span>
                  <span className="text-gray-600">{stats.high}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(stats.high/stats.total)*100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-yellow-600 font-medium">Medium</span>
                  <span className="text-gray-600">{stats.medium}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(stats.medium/stats.total)*100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-600 font-medium">Low</span>
                  <span className="text-gray-600">{stats.low}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(stats.low/stats.total)*100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Overview</h2>
            <div className="flex items-center justify-center h-48">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="transform -rotate-90 w-40 h-40">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="12"
                    strokeDasharray={`${(stats.positive/stats.total)*251.2} 251.2`}
                    strokeDashoffset="0"
                    className="transition-all duration-500"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="12"
                    strokeDasharray={`${(stats.neutral/stats.total)*251.2} 251.2`}
                    strokeDashoffset={`-${(stats.positive/stats.total)*251.2}`}
                    className="transition-all duration-500"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="12"
                    strokeDasharray={`${(stats.negative/stats.total)*251.2} 251.2`}
                    strokeDashoffset={`-${((stats.positive+stats.neutral)/stats.total)*251.2}`}
                    className="transition-all duration-500"
                  />
                </svg>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Positive</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Neutral</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Negative</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution and Recent Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Issues</h2>
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{category.name}</span>
                    <span className="text-gray-600 font-medium">{category.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${category.color} h-2 rounded-full transition-all`}
                      style={{ width: `${(category.count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Feedback</h2>
            <div className="space-y-4">
              {recentFeedbacks.map((feedback) => (
                <div key={feedback.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <p className="text-gray-800 mb-2">{feedback.text}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`px-2 py-1 rounded-full font-medium
                      ${feedback.category === 'Transaction Failure' ? 'bg-red-100 text-red-700' :
                        feedback.category === 'App Crash' ? 'bg-orange-100 text-orange-700' :
                        feedback.category === 'Fraud Alert' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'}`}>
                      {feedback.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full font-medium
                      ${feedback.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                        feedback.sentiment === 'Negative' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'}`}>
                      {feedback.sentiment}
                    </span>
                    <span className={`px-2 py-1 rounded-full font-medium
                      ${feedback.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                        feedback.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'}`}>
                      {feedback.priority}
                    </span>
                    <span className="text-gray-400 flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {feedback.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;