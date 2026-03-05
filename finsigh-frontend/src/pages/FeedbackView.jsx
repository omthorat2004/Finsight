// src/pages/FeedbackView.jsx
import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const FeedbackView = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');

  const feedbacks = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    text: [
      "My transaction failed and money was deducted",
      "App crashes when uploading KYC documents",
      "Love the new UI, very intuitive",
      "Someone accessed my account without authorization",
      "Refund not processed after 5 days",
      "Can't log in to my account",
      "Payment went through but order not confirmed",
      "Great customer support experience",
      "App is too slow during peak hours",
      "Fraudulent transaction detected"
    ][i % 10],
    category: ['Transaction Failure', 'App Crash', 'UI Problem', 'Fraud Alert', 'Refund Delay', 'KYC Issue', 'Transaction Failure', 'Feature Request', 'UI Problem', 'Fraud Alert'][i % 10],
    sentiment: ['Negative', 'Negative', 'Positive', 'Negative', 'Negative', 'Neutral', 'Negative', 'Positive', 'Negative', 'Critical'][i % 10],
    priority: ['High', 'Medium', 'Low', 'Critical', 'High', 'Medium', 'High', 'Low', 'Medium', 'Critical'][i % 10],
    date: new Date(Date.now() - i * 3600000).toLocaleString(),
    customer: `CUST${1000 + i}`,
    channel: ['App', 'Web', 'Mobile', 'Email', 'Chat'][i % 5]
  }));

  const itemsPerPage = 10;
  const totalPages = Math.ceil(feedbacks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFeedbacks = feedbacks.slice(startIndex, startIndex + itemsPerPage);

  const getCategoryColor = (category) => {
    const colors = {
      'Transaction Failure': 'bg-red-100 text-red-700',
      'App Crash': 'bg-orange-100 text-orange-700',
      'UI Problem': 'bg-blue-100 text-blue-700',
      'Fraud Alert': 'bg-purple-100 text-purple-700',
      'Refund Delay': 'bg-yellow-100 text-yellow-700',
      'KYC Issue': 'bg-indigo-100 text-indigo-700',
      'Feature Request': 'bg-green-100 text-green-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'Positive': return 'bg-green-100 text-green-700';
      case 'Negative': return 'bg-red-100 text-red-700';
      case 'Neutral': return 'bg-yellow-100 text-yellow-700';
      case 'Critical': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feedback Entries</h1>
            <p className="text-gray-600 mt-2">View and analyze individual feedback</p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center">
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center">
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="Transaction Failure">Transaction Failure</option>
              <option value="KYC Issue">KYC Issue</option>
              <option value="App Crash">App Crash</option>
              <option value="UI Problem">UI Problem</option>
              <option value="Fraud Alert">Fraud Alert</option>
              <option value="Refund Delay">Refund Delay</option>
            </select>

            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Sentiments</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
              <option value="Critical">Critical</option>
            </select>

            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center">
              <FunnelIcon className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Feedback Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedFeedbacks.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{feedback.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                      <p className="truncate">{feedback.text}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(feedback.category)}`}>
                        {feedback.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(feedback.sentiment)}`}>
                        {feedback.sentiment}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full
                        ${feedback.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                          feedback.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                          feedback.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'}`}>
                        {feedback.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{feedback.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{feedback.channel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{feedback.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-indigo-600 hover:text-indigo-900 flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(startIndex + itemsPerPage, feedbacks.length)}
                  </span>{' '}
                  of <span className="font-medium">{feedbacks.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">First</span>
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                          ${currentPage === pageNum
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Last</span>
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackView;