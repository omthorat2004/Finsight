// src/pages/Reports.jsx
import React, { useState } from 'react';
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('executive');
  const [dateRange, setDateRange] = useState('week');
  const [generating, setGenerating] = useState(false);

  const reports = [
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level overview for management',
      icon: DocumentTextIcon,
      lastGenerated: '2024-03-16'
    },
    {
      id: 'detailed',
      name: 'Detailed Analysis',
      description: 'Complete feedback analysis with trends',
      icon: DocumentTextIcon,
      lastGenerated: '2024-03-15'
    },
    {
      id: 'risk',
      name: 'Risk Assessment',
      description: 'Security and fraud risk report',
      icon: DocumentTextIcon,
      lastGenerated: '2024-03-14'
    },
    {
      id: 'category',
      name: 'Category Breakdown',
      description: 'Issue category distribution analysis',
      icon: DocumentTextIcon,
      lastGenerated: '2024-03-13'
    }
  ];

  const scheduledReports = [
    {
      name: 'Weekly Executive Summary',
      frequency: 'Every Monday',
      recipients: 'management@company.com',
      nextRun: '2024-03-18'
    },
    {
      name: 'Daily Risk Alerts',
      frequency: 'Daily at 9 AM',
      recipients: 'security@company.com',
      nextRun: '2024-03-17'
    }
  ];

  const handleGenerateReport = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      alert('Report generated successfully!');
    }, 2000);
  };

  return (
    <div className="min-h-screen mt-25 bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Generate and manage analytics reports</p>
        </div>

        {/* Report Generator */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="executive">Executive Summary</option>
                <option value="detailed">Detailed Analysis</option>
                <option value="risk">Risk Assessment</option>
                <option value="category">Category Breakdown</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="day">Last 24 Hours</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className={`px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold flex items-center justify-center
              ${generating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
          >
            {generating ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Generate Report
              </>
            )}
          </button>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h2>
          
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg mr-4">
                    <report.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-500">{report.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Last generated: {report.lastGenerated}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition">
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition">
                    <PrinterIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition">
                    <ShareIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Reports */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Reports</h2>
          
          <div className="space-y-4">
            {scheduledReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">{report.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-gray-500 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {report.frequency}
                      </span>
                      <span className="text-gray-500 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Next: {report.nextRun}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Recipients: {report.recipients}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                    Pause
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-6 px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 w-full">
            + Schedule New Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;