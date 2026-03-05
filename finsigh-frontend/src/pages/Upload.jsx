// src/pages/Upload.jsx - ADVANCED PRODUCTION VERSION
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { useCallback, useEffect, useState } from 'react'

const Upload = () => {
  // State management
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [result, setResult] = useState(null)
  const [recentUploads, setRecentUploads] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)

  // Sample data for preview
  const sampleData = [
    { feedback: 'My transaction failed 100 times today' },
    { feedback: 'App crashes when uploading KYC' },
    { feedback: 'Love the new UI, very intuitive' }
  ]

  // Fetch recent uploads on mount
  useEffect(() => {
    fetchRecentUploads()
  }, [])

  const fetchRecentUploads = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/recent-uploads')
      const data = await response.json()
      setRecentUploads(data.uploads || [])
    } catch (error) {
      console.error('Failed to fetch recent uploads:', error)
    }
  }

  // Drag and drop handlers
  const handleDrag = useCallback(e => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(e => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = file => {
    // Check file type
    if (!file.name.endsWith('.csv')) {
      alert('❌ Please upload a CSV file')
      return
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      alert('❌ File size exceeds 50MB limit')
      return
    }

    setFile(file)
    setUploadStatus(null)
    setResult(null)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadStatus('uploading')
    setUploadProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 300)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      const data = await response.json()
      console.log('Upload response:', data)

      if (response.ok) {
        setUploadProgress(100)
        setUploadStatus('success')
        setResult(data)
        await fetchRecentUploads()

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setUploadProgress(0)
        }, 5000)
      } else {
        throw new Error(data.detail || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
      setUploadProgress(0)
    } finally {
      setUploading(false)
      clearInterval(progressInterval)
    }
  }

  const handleReset = () => {
    setFile(null)
    setUploadStatus(null)
    setResult(null)
    setUploadProgress(0)
  }

  const downloadSample = () => {
    const csvContent =
      'feedback\n' + sampleData.map(row => row.feedback).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample_feedback.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadResults = () => {
    if (!result) return

    const jsonStr = JSON.stringify(result, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analysis_results_${new Date().toISOString()}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatDate = dateString => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString()
    } catch {
      return dateString
    }
  }

  const getCategoryColor = category => {
    const colors = {
      'Transaction Failure': 'bg-red-100 text-red-700 border-red-200',
      'App Crash': 'bg-orange-100 text-orange-700 border-orange-200',
      'Fraud Alert': 'bg-purple-100 text-purple-700 border-purple-200',
      'KYC Issue': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'UI Problem': 'bg-blue-100 text-blue-700 border-blue-200',
      'Positive Feedback': 'bg-green-100 text-green-700 border-green-200',
      'General Inquiry': 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getSentimentColor = sentiment => {
    switch (sentiment) {
      case 'Positive':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Negative':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }
  }

  const getPriorityColor = priority => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-green-100 text-green-700 border-green-200'
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8 pt-24'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header with Refresh */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Upload Feedback Data
            </h1>
            <p className='mt-2 text-gray-600'>
              Upload your customer feedback CSV file for AI-powered analysis
            </p>
          </div>
          <button
            onClick={fetchRecentUploads}
            className='p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-all'
            title='Refresh'
          >
            <ArrowPathIcon className='h-5 w-5' />
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Upload Area - Left Column */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Upload Card */}
            <div className='bg-white rounded-2xl shadow-sm p-6'>
              {/* File Upload Area with Drag & Drop */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : file
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type='file'
                  id='file-upload'
                  accept='.csv'
                  onChange={handleFileChange}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                  disabled={uploading}
                />

                <div className='text-center'>
                  {!file ? (
                    <>
                      <CloudArrowUpIcon className='mx-auto h-12 w-12 text-gray-400 mb-4' />
                      <p className='text-lg font-medium text-gray-700 mb-2'>
                        Drag & drop your CSV file here
                      </p>
                      <p className='text-sm text-gray-500 mb-4'>
                        or click to browse from your computer
                      </p>
                      <div className='inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium'>
                        Choose File
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className='mx-auto h-12 w-12 text-green-500 mb-4' />
                      <p className='text-lg font-medium text-gray-700 mb-2'>
                        {file.name}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {(file.size / 1024).toFixed(2)} KB • Ready to upload
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Upload Progress Bar */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className='mt-6'>
                  <div className='flex justify-between text-sm text-gray-600 mb-2'>
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-indigo-600 h-2 rounded-full transition-all duration-300'
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {uploadStatus === 'success' && result && (
                <div className='mt-6 p-4 bg-green-50 rounded-lg border border-green-200'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <CheckCircleIcon className='h-5 w-5 text-green-500 mr-2' />
                      <span className='text-green-700 font-medium'>
                        ✅ Success! Processed {result.total_processed} feedbacks
                      </span>
                    </div>
                    <button
                      onClick={downloadResults}
                      className='text-green-600 hover:text-green-800'
                      title='Download Results'
                    >
                      <ArrowDownTrayIcon className='h-5 w-5' />
                    </button>
                  </div>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className='mt-6 p-4 bg-red-50 rounded-lg border border-red-200'>
                  <div className='flex items-center'>
                    <XCircleIcon className='h-5 w-5 text-red-500 mr-2' />
                    <span className='text-red-700 font-medium'>
                      Upload failed. Please try again.
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className='mt-6 flex flex-wrap gap-3'>
                {file && !uploading && uploadStatus !== 'success' && (
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className='flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {uploading ? 'Uploading...' : 'Upload and Process'}
                  </button>
                )}

                {uploadStatus === 'success' && (
                  <button
                    onClick={handleReset}
                    className='flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all'
                  >
                    Upload New File
                  </button>
                )}

                <button
                  onClick={downloadSample}
                  className='px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-all'
                >
                  Download Sample CSV
                </button>
              </div>
            </div>

            {/* Results Section */}
            {uploadStatus === 'success' && result && (
              <div className='bg-white rounded-2xl shadow-sm p-6'>
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-xl font-bold text-gray-900'>
                    Analysis Results
                  </h2>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className='text-indigo-600 hover:text-indigo-800 text-sm font-medium'
                  >
                    {showPreview ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>

                {/* Summary Cards */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                  <div className='bg-indigo-50 rounded-xl p-4'>
                    <div className='text-2xl font-bold text-indigo-600'>
                      {result.total_processed}
                    </div>
                    <div className='text-sm text-gray-600'>Total Processed</div>
                  </div>
                  <div className='bg-green-50 rounded-xl p-4'>
                    <div className='text-2xl font-bold text-green-600'>
                      {result.summary?.sentiments?.Positive || 0}
                    </div>
                    <div className='text-sm text-gray-600'>Positive</div>
                  </div>
                  <div className='bg-yellow-50 rounded-xl p-4'>
                    <div className='text-2xl font-bold text-yellow-600'>
                      {result.summary?.sentiments?.Neutral || 0}
                    </div>
                    <div className='text-sm text-gray-600'>Neutral</div>
                  </div>
                  <div className='bg-red-50 rounded-xl p-4'>
                    <div className='text-2xl font-bold text-red-600'>
                      {result.summary?.sentiments?.Negative || 0}
                    </div>
                    <div className='text-sm text-gray-600'>Negative</div>
                  </div>
                </div>

                {/* Detailed Results */}
                {showPreview && (
                  <>
                    {/* Category Distribution */}
                    {result.summary?.categories && (
                      <div className='mb-6'>
                        <h3 className='font-semibold text-gray-700 mb-3'>
                          Category Distribution
                        </h3>
                        <div className='space-y-2'>
                          {Object.entries(result.summary.categories).map(
                            ([category, count]) => (
                              <div key={category} className='flex items-center'>
                                <span className='w-32 text-sm text-gray-600 truncate'>
                                  {category}:
                                </span>
                                <div className='flex-1 h-4 bg-gray-200 rounded-full overflow-hidden'>
                                  <div
                                    className='h-full bg-indigo-600 rounded-full'
                                    style={{
                                      width: `${
                                        (count / result.total_processed) * 100
                                      }%`
                                    }}
                                  ></div>
                                </div>
                                <span className='ml-3 text-sm font-medium text-gray-700'>
                                  {count}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sample Results */}
                    {result.results && result.results.length > 0 && (
                      <div>
                        <h3 className='font-semibold text-gray-700 mb-3'>
                          Sample Results
                        </h3>
                        <div className='space-y-3 max-h-96 overflow-y-auto pr-2'>
                          {result.results.map((item, idx) => (
                            <div
                              key={idx}
                              className='bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer'
                              onClick={() => setSelectedResult(item)}
                            >
                              <p className='text-gray-800 mb-2'>
                                "{item.text}"
                              </p>
                              <div className='flex flex-wrap gap-2'>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                                    item.category
                                  )}`}
                                >
                                  {item.category}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(
                                    item.sentiment
                                  )}`}
                                >
                                  {item.sentiment}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                                    item.priority
                                  )}`}
                                >
                                  {item.priority}
                                </span>
                                <span className='text-xs text-gray-400 ml-auto'>
                                  {new Date(
                                    item.timestamp
                                  ).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Info Panel */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Requirements Card */}
            <div className='bg-white rounded-2xl shadow-sm p-6 sticky top-24'>
              <h2 className='text-lg font-bold text-gray-900 mb-4 flex items-center'>
                <InformationCircleIcon className='h-5 w-5 text-indigo-600 mr-2' />
                File Requirements
              </h2>
              <ul className='space-y-3 text-sm text-gray-600'>
                <li className='flex items-start'>
                  <DocumentTextIcon className='h-4 w-4 text-indigo-600 mr-2 mt-0.5' />
                  <span>CSV format only</span>
                </li>
                <li className='flex items-start'>
                  <span className='w-4 h-4 text-indigo-600 mr-2 font-bold'>
                    •
                  </span>
                  <span>
                    Column header:{' '}
                    <code className='bg-gray-100 px-1 rounded'>feedback</code>{' '}
                    (required)
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='w-4 h-4 text-indigo-600 mr-2 font-bold'>
                    •
                  </span>
                  <span>
                    Max file size: <strong>50MB</strong>
                  </span>
                </li>
                <li className='flex items-start'>
                  <ClockIcon className='h-4 w-4 text-indigo-600 mr-2 mt-0.5' />
                  <span>Processing time: ~1 second per feedback</span>
                </li>
              </ul>

              {/* Sample Format */}
              <div className='mt-6 p-4 bg-indigo-50 rounded-lg'>
                <h3 className='font-semibold text-indigo-900 mb-2'>
                  Sample CSV Format
                </h3>
                <pre className='text-xs bg-white p-3 rounded border border-indigo-100 overflow-x-auto'>
                  feedback{'\n'}
                  "My transaction failed twice today"{'\n'}
                  "App crashes when uploading KYC"{'\n'}
                  "Love the new UI, very intuitive"
                </pre>
              </div>

              {/* Quick Stats */}
              <div className='mt-6'>
                <h3 className='font-semibold text-gray-700 mb-3'>
                  Platform Stats
                </h3>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Total Processed:</span>
                    <span className='font-medium text-indigo-600'>
                      {result?.total_processed || 0}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Recent Uploads:</span>
                    <span className='font-medium text-indigo-600'>
                      {recentUploads.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Uploads Section */}
        {recentUploads.length > 0 && (
          <div className='mt-8'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>
              Recent Uploads
            </h2>
            <div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      File Name
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Rows
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Uploaded
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {recentUploads.map((upload, idx) => (
                    <tr key={idx} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <DocumentTextIcon className='h-5 w-5 text-gray-400 mr-2' />
                          <span className='text-sm font-medium text-gray-900'>
                            {upload.filename}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {upload.total_rows || 0}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {formatDate(upload.uploaded_at)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800'>
                          {upload.status || 'completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedResult && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-2xl max-w-2xl w-full p-6'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-xl font-bold text-gray-900'>
                  Feedback Details
                </h3>
                <button
                  onClick={() => setSelectedResult(null)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <XCircleIcon className='h-6 w-6' />
                </button>
              </div>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Feedback Text
                  </label>
                  <p className='mt-1 p-3 bg-gray-50 rounded-lg'>
                    {selectedResult.text}
                  </p>
                </div>
                <div className='grid grid-cols-3 gap-4'>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Category
                    </label>
                    <div
                      className={`mt-1 px-3 py-2 rounded-lg text-sm font-medium ${getCategoryColor(
                        selectedResult.category
                      )}`}
                    >
                      {selectedResult.category}
                    </div>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Sentiment
                    </label>
                    <div
                      className={`mt-1 px-3 py-2 rounded-lg text-sm font-medium ${getSentimentColor(
                        selectedResult.sentiment
                      )}`}
                    >
                      {selectedResult.sentiment}
                    </div>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Priority
                    </label>
                    <div
                      className={`mt-1 px-3 py-2 rounded-lg text-sm font-medium ${getPriorityColor(
                        selectedResult.priority
                      )}`}
                    >
                      {selectedResult.priority}
                    </div>
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Timestamp
                  </label>
                  <p className='mt-1 text-gray-700'>
                    {new Date(selectedResult.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Upload
