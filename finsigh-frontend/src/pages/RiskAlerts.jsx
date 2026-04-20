// src/pages/RiskAlerts.jsx
import {
  ArrowPathIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FlagIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ShieldExclamationIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

const RiskAlerts = () => {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    resolved: 0
  })
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState(null)
  const [resolvingId, setResolvingId] = useState(null)

  // Fetch risk alerts from backend
  const fetchRiskAlerts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:8000/api/risk-alerts')
      const data = await response.json()

      if (response.ok) {
        setAlerts(data.alerts || [])

        // Calculate stats from real data
        const newStats = {
          critical:
            data.alerts?.filter(a => a.severity === 'Critical').length || 0,
          high: data.alerts?.filter(a => a.severity === 'High').length || 0,
          medium: data.alerts?.filter(a => a.severity === 'Medium').length || 0,
          resolved:
            data.alerts?.filter(a => a.status === 'resolved').length || 0
        }
        setStats(newStats)
      } else {
        setError('Failed to fetch risk alerts')
      }
    } catch (error) {
      console.error('Failed to fetch risk alerts:', error)
      setError('Network error - please check if backend is running')
    } finally {
      setLoading(false)
    }
  }

  // Mark alert as resolved
  const markAsResolved = async alertId => {
    setResolvingId(alertId)
    setError(null)

    try {
      const response = await fetch(
        `http://localhost:8000/api/risk-alerts/${alertId}/resolve`,
        {
          method: 'POST'
        }
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to resolve alert')
      }

      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, status: 'resolved' } : alert
        )
      )

      if (selectedAlert?.id === alertId) {
        setSelectedAlert(prev =>
          prev ? { ...prev, status: 'resolved' } : prev
        )
      }

      await fetchRiskAlerts()
    } catch (err) {
      console.error('Failed to mark alert resolved:', err)
      setError(err.message || 'Failed to mark alert resolved')
    } finally {
      setResolvingId(null)
    }
  }

  // View alert details
  const viewDetails = alert => {
    setSelectedAlert(alert)
    setShowModal(true)
  }

  // Refresh data
  const handleRefresh = () => {
    fetchRiskAlerts()
  }

  // Load data on component mount
  useEffect(() => {
    fetchRiskAlerts()

    // Refresh every 30 seconds
    const interval = setInterval(fetchRiskAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  // Filter alerts based on search and filter
  const filteredAlerts = alerts.filter(alert => {
    // Search filter
    const matchesSearch =
      searchTerm === '' ||
      alert.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.feedback?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.type?.toLowerCase().includes(searchTerm.toLowerCase())

    // Category filter
    let matchesFilter = true
    if (filter !== 'all') {
      if (filter === 'critical') matchesFilter = alert.severity === 'Critical'
      else if (filter === 'high') matchesFilter = alert.severity === 'High'
      else if (filter === 'medium') matchesFilter = alert.severity === 'Medium'
      else if (filter === 'fraud') matchesFilter = alert.type === 'Fraud'
      else if (filter === 'security') matchesFilter = alert.type === 'Security'
      else if (filter === 'compliance')
        matchesFilter = alert.type === 'Compliance'
      else if (filter === 'new') matchesFilter = alert.status === 'new'
      else if (filter === 'resolved')
        matchesFilter = alert.status === 'resolved'
    }

    return matchesSearch && matchesFilter
  })

  const getSeverityColor = severity => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case 'new':
        return 'bg-purple-100 text-purple-800'
      case 'investigating':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = type => {
    switch (type) {
      case 'Fraud':
        return <FlagIcon className='h-5 w-5' />
      case 'Security':
        return <ShieldExclamationIcon className='h-5 w-5' />
      case 'Compliance':
        return <ExclamationTriangleIcon className='h-5 w-5' />
      default:
        return <ExclamationTriangleIcon className='h-5 w-5' />
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8 pt-24'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Risk Alerts</h1>
            <p className='text-gray-600 mt-2'>
              Monitor and manage security risks in real-time
            </p>
          </div>

          <div className='flex gap-3 mt-4 md:mt-0'>
            <button
              onClick={handleRefresh}
              className='px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center'
            >
              <ShieldExclamationIcon className='h-4 w-4 mr-2' />
              Take Actions
            </button>
            <button
              onClick={handleRefresh}
              className='px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center'
              disabled={loading}
            >
              <ArrowPathIcon
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-red-50 rounded-2xl p-6 border-l-4 border-red-500'>
            <p className='text-sm text-red-600 mb-1'>Critical</p>
            <p className='text-3xl font-bold text-red-700'>{stats.critical}</p>
            <p className='text-xs text-red-500 mt-2'>
              Requires immediate action
            </p>
          </div>
          <div className='bg-orange-50 rounded-2xl p-6 border-l-4 border-orange-500'>
            <p className='text-sm text-orange-600 mb-1'>High</p>
            <p className='text-3xl font-bold text-orange-700'>{stats.high}</p>
            <p className='text-xs text-orange-500 mt-2'>Needs attention soon</p>
          </div>
          <div className='bg-yellow-50 rounded-2xl p-6 border-l-4 border-yellow-500'>
            <p className='text-sm text-yellow-600 mb-1'>Medium</p>
            <p className='text-3xl font-bold text-yellow-700'>{stats.medium}</p>
            <p className='text-xs text-yellow-500 mt-2'>Monitor regularly</p>
          </div>
          <div className='bg-green-50 rounded-2xl p-6 border-l-4 border-green-500'>
            <p className='text-sm text-green-600 mb-1'>Resolved</p>
            <p className='text-3xl font-bold text-green-700'>
              {stats.resolved}
            </p>
            <p className='text-xs text-green-500 mt-2'>Successfully handled</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-6 p-4 bg-red-50 rounded-lg border border-red-200'>
            <p className='text-red-700'>{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className='bg-white rounded-2xl shadow-sm p-4 mb-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1 relative'>
              <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <input
                type='text'
                placeholder='Search alerts by message, feedback, or type...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
            </div>

            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
            >
              <option value='all'>All Alerts</option>
              <option value='critical'>Critical Only</option>
              <option value='high'>High Only</option>
              <option value='medium'>Medium Only</option>
              <option value='fraud'>Fraud</option>
              <option value='security'>Security</option>
              <option value='compliance'>Compliance</option>
              <option value='new'>New</option>
              <option value='resolved'>Resolved</option>
            </select>

            <button className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center'>
              <FunnelIcon className='h-4 w-4 mr-2' />
              More Filters
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
          {loading ? (
            <div className='p-12 text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
              <p className='mt-4 text-gray-500'>Loading risk alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className='p-12 text-center'>
              <ShieldExclamationIcon className='h-16 w-16 text-gray-300 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-700 mb-2'>
                No alerts found
              </h3>
              <p className='text-gray-500'>
                No risk alerts match your current filters
              </p>
            </div>
          ) : (
            <div className='divide-y divide-gray-200'>
              {filteredAlerts.map(alert => (
                <div key={alert.id} className='p-6 hover:bg-gray-50 transition'>
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex items-start gap-3'>
                      <div
                        className={`p-2 rounded-lg ${
                          alert.severity === 'Critical'
                            ? 'bg-red-100'
                            : alert.severity === 'High'
                            ? 'bg-orange-100'
                            : 'bg-yellow-100'
                        }`}
                      >
                        {getTypeIcon(alert.type)}
                      </div>
                      <div>
                        <h3 className='font-semibold text-gray-900'>
                          {alert.message}
                        </h3>
                        <p className='text-gray-600 text-sm mt-1'>
                          "{alert.feedback}"
                        </p>
                        {alert.category && (
                          <p className='text-xs text-gray-400 mt-1'>
                            Category: {alert.category}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        alert.status
                      )}`}
                    >
                      {alert.status?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className='flex flex-wrap items-center gap-4 text-sm'>
                    <span
                      className={`px-2 py-1 rounded-full border ${getSeverityColor(
                        alert.severity
                      )}`}
                    >
                      {alert.severity}
                    </span>
                    <span className='px-2 py-1 bg-gray-100 rounded-full text-gray-700'>
                      {alert.type}
                    </span>
                    <span className='text-gray-400 flex items-center'>
                      <ClockIcon className='h-4 w-4 mr-1' />
                      {alert.time}
                    </span>
                  </div>

                  <div className='mt-4 flex gap-2'>
                    <button
                      onClick={() => viewDetails(alert)}
                      className='px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center'
                    >
                      <EyeIcon className='h-4 w-4 mr-1' />
                      View Details
                    </button>
                    {alert.status !== 'resolved' && (
                      <button
                        onClick={() => markAsResolved(alert.id)}
                        disabled={resolvingId === alert.id}
                        className='px-3 py-1 text-green-600 text-sm hover:bg-green-50 rounded-lg disabled:opacity-50'
                      >
                        {resolvingId === alert.id
                          ? 'Resolving...'
                          : 'Mark Resolved'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedAlert && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-xl font-bold text-gray-900'>Alert Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className='text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg'
              >
                <XCircleIcon className='h-6 w-6' />
              </button>
            </div>

            <div className='space-y-4'>
              {/* Alert Header */}
              <div className='flex items-center gap-3'>
                <div
                  className={`p-3 rounded-lg ${
                    selectedAlert.severity === 'Critical'
                      ? 'bg-red-100'
                      : selectedAlert.severity === 'High'
                      ? 'bg-orange-100'
                      : 'bg-yellow-100'
                  }`}
                >
                  {getTypeIcon(selectedAlert.type)}
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900'>
                    {selectedAlert.message}
                  </h4>
                  <div className='flex gap-2 mt-1'>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                        selectedAlert.severity
                      )}`}
                    >
                      {selectedAlert.severity}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        selectedAlert.status
                      )}`}
                    >
                      {selectedAlert.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className='text-sm font-medium text-gray-500'>
                  Customer Feedback
                </label>
                <p className='mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200'>
                  "{selectedAlert.feedback}"
                </p>
              </div>

              {/* Metadata Grid */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Type
                  </label>
                  <p className='mt-1 font-medium text-gray-900'>
                    {selectedAlert.type}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Category
                  </label>
                  <p className='mt-1 font-medium text-gray-900'>
                    {selectedAlert.category}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Time
                  </label>
                  <p className='mt-1 font-medium text-gray-900'>
                    {selectedAlert.time}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3 mt-6'>
                <button className='flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700'>
                  {selectedAlert.action}
                </button>
                {selectedAlert.status !== 'resolved' && (
                  <button
                    onClick={() => {
                      markAsResolved(selectedAlert.id)
                      setShowModal(false)
                    }}
                    disabled={resolvingId === selectedAlert.id}
                    className='flex-1 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50'
                  >
                    {resolvingId === selectedAlert.id
                      ? 'Resolving...'
                      : 'Mark Resolved'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RiskAlerts
