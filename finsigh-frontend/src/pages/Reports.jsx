// src/pages/Reports.jsx
import React, { useState, useEffect } from 'react';
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  EyeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('executive');
  const [dateRange, setDateRange] = useState('week');
  const [reportFormat, setReportFormat] = useState('json');
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState([]);
  const [scheduledReports, setScheduledReports] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch reports on component mount
  useEffect(() => {
    fetchRecentReports();
    fetchScheduledReports();
  }, []);

  const fetchRecentReports = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/reports/recent');
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduledReports = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/reports/scheduled');
      const data = await response.json();
      setScheduledReports(data.scheduled_reports || []);
    } catch (error) {
      console.error('Failed to fetch scheduled reports:', error);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/reports/download/${selectedReport}?date_range=${dateRange}&format=${reportFormat}`
      );
      
      if (reportFormat === 'json') {
        const data = await response.json();
        setGeneratedReport(data);
        setShowReportModal(true);
      } else {
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.${reportFormat}`;
        a.click();
        window.URL.revokeObjectURL(url);
        alert('Report downloaded successfully!');
      }
      
      // Refresh recent reports
      await fetchRecentReports();
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async (reportId, format = 'json') => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/reports/download/${reportId}?date_range=week&format=${format}`
      );
      
      if (format === 'json') {
        const data = await response.json();
        setGeneratedReport(data);
        setShowReportModal(true);
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportId}_report_${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to download report');
    }
  };

  const getSentimentColor = (percentage) => {
    if (percentage >= 60) return 'text-green-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevelColor = (level) => {
    switch(level) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Generate and manage analytics reports from your feedback data</p>
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
              <select
                value={reportFormat}
                onChange={(e) => setReportFormat(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="json">JSON (Preview)</option>
                <option value="csv">CSV (Download)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className={`w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold flex items-center justify-center
              ${generating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-indigo-200 transition-all transform hover:-translate-y-0.5'}`}
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
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading reports...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-100 rounded-lg mr-4">
                      <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{report.name}</h3>
                      <p className="text-sm text-gray-500">{report.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Last generated: {report.lastGenerated} • {report.total_feedbacks || 0} feedbacks analyzed
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => downloadReport(report.id, 'json')}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                      title="View Report"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => downloadReport(report.id, 'csv')}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                      title="Download CSV"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition" title="Print">
                      <PrinterIcon className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition" title="Share">
                      <ShareIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Reports */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Reports</h2>
          
          <div className="space-y-4">
            {scheduledReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-indigo-200 transition-all">
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

          <button className="mt-6 px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 w-full transition-all">
            + Schedule New Report
          </button>
        </div>
      </div>

      {/* Report Preview Modal */}
      {showReportModal && generatedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                {generatedReport.report_type || 'Report Preview'}
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Report Metadata */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Period</p>
                    <p className="text-sm font-medium text-gray-900">{generatedReport.period || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Feedback</p>
                    <p className="text-sm font-medium text-gray-900">{generatedReport.total_feedback || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Generated</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(generatedReport.generated_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date Range</p>
                    <p className="text-sm font-medium text-gray-900">{generatedReport.date_range}</p>
                  </div>
                </div>
              </div>

              {/* Sentiment Section (for executive/detailed reports) */}
              {generatedReport.sentiment && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Sentiment Analysis</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">{generatedReport.sentiment.positive || 0}</p>
                      <p className="text-xs text-gray-600">Positive</p>
                      <p className="text-sm font-medium text-green-600">{generatedReport.sentiment.positive_percentage || 0}%</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-yellow-600">{generatedReport.sentiment.neutral || 0}</p>
                      <p className="text-xs text-gray-600">Neutral</p>
                      <p className="text-sm font-medium text-yellow-600">{generatedReport.sentiment.neutral_percentage || 0}%</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-red-600">{generatedReport.sentiment.negative || 0}</p>
                      <p className="text-xs text-gray-600">Negative</p>
                      <p className="text-sm font-medium text-red-600">{generatedReport.sentiment.negative_percentage || 0}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Priority Distribution */}
              {generatedReport.priorities && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Priority Distribution</h4>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-red-100 rounded-lg p-3">
                      <p className="text-2xl font-bold text-red-700">{generatedReport.priorities.High || 0}</p>
                      <p className="text-xs text-gray-700">High Priority</p>
                    </div>
                    <div className="flex-1 bg-yellow-100 rounded-lg p-3">
                      <p className="text-2xl font-bold text-yellow-700">{generatedReport.priorities.Medium || 0}</p>
                      <p className="text-xs text-gray-700">Medium Priority</p>
                    </div>
                    <div className="flex-1 bg-green-100 rounded-lg p-3">
                      <p className="text-2xl font-bold text-green-700">{generatedReport.priorities.Low || 0}</p>
                      <p className="text-xs text-gray-700">Low Priority</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Level (for risk report) */}
              {generatedReport.risk_level && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Risk Assessment</h4>
                  <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getRiskLevelColor(generatedReport.risk_level)}`}>
                    Risk Level: {generatedReport.risk_level}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4">
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-xl font-bold text-red-600">{generatedReport.risk_breakdown?.high_priority_issues || 0}</p>
                      <p className="text-xs text-gray-600">High Priority Issues</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xl font-bold text-purple-600">{generatedReport.risk_breakdown?.fraud_alerts || 0}</p>
                      <p className="text-xs text-gray-600">Fraud Alerts</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xl font-bold text-blue-600">{generatedReport.risk_breakdown?.security_concerns || 0}</p>
                      <p className="text-xs text-gray-600">Security Concerns</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Findings / Insights */}
              {(generatedReport.key_findings || generatedReport.insights) && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Key Findings</h4>
                  <ul className="space-y-2">
                    {(generatedReport.key_findings || generatedReport.insights || []).map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-indigo-600">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {generatedReport.recommendations && generatedReport.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {generatedReport.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-600">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Top Issues */}
              {generatedReport.top_issues && generatedReport.top_issues.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Top Issues</h4>
                  <div className="space-y-2">
                    {generatedReport.top_issues.map((issue, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{issue.category}</span>
                        <span className="text-sm font-medium text-indigo-600">{issue.count} occurrences</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Breakdown */}
              {generatedReport.category_breakdown && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Category Distribution</h4>
                  <div className="space-y-2">
                    {generatedReport.category_breakdown.map((cat, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{cat.category}</span>
                          <span className="text-gray-500">{cat.count} ({cat.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${cat.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={() => downloadReport(selectedReport, 'csv')}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Download as CSV
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;