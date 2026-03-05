// src/pages/Settings.jsx
import React, { useState } from 'react';
import {
  Cog6ToothIcon,
  ComputerDesktopIcon,
  CloudIcon,
  BellIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ServerIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Settings state
  const [settings, setSettings] = useState({
    // Ollama Settings
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'deepseek-r1:7b',
    ollamaTimeout: '30',
    maxConcurrent: '3',
    
    // Processing Settings
    batchSize: '100',
    maxFileSize: '50',
    autoProcess: true,
    
    // Notification Settings
    emailAlerts: true,
    criticalAlerts: true,
    dailySummary: false,
    
    // Display Settings
    darkMode: false,
    compactView: true,
    refreshInterval: '5',
    
    // Data Settings
    retentionDays: '30',
    autoExport: false,
    exportFormat: 'pdf'
  });

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'ollama', name: 'Ollama AI', icon: CpuChipIcon },
    { id: 'processing', name: 'Processing', icon: ArrowPathIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
    { id: 'data', name: 'Data Management', icon: DocumentTextIcon },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // In real app, save to backend/localStorage
    localStorage.setItem('finsight-settings', JSON.stringify(settings));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    // Simulate testing connection
    setTimeout(() => {
      setTesting(false);
      setTestResult({
        success: true,
        message: 'Successfully connected to Ollama',
        details: {
          model: settings.ollamaModel,
          responseTime: '234ms',
          status: 'active'
        }
      });
    }, 2000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to default?')) {
      setSettings({
        ollamaUrl: 'http://localhost:11434',
        ollamaModel: 'deepseek-r1:7b',
        ollamaTimeout: '30',
        maxConcurrent: '3',
        batchSize: '100',
        maxFileSize: '50',
        autoProcess: true,
        emailAlerts: true,
        criticalAlerts: true,
        dailySummary: false,
        darkMode: false,
        compactView: true,
        refreshInterval: '5',
        retentionDays: '30',
        autoExport: false,
        exportFormat: 'pdf'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure your FinSight AI platform</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                        ${activeTab === tab.id
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Save Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all flex items-center justify-center"
                >
                  {saved ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Saved!
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="w-full mt-2 px-4 py-2 text-gray-500 hover:text-red-600 text-sm transition-all"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              
              {/* General Settings */}
              {activeTab === 'general' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">General Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application Name
                      </label>
                      <input
                        type="text"
                        value="FinSight AI"
                        readOnly
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Zone
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>UTC (Coordinated Universal Time)</option>
                        <option>America/New York</option>
                        <option>America/Chicago</option>
                        <option>America/Denver</option>
                        <option>America/Los Angeles</option>
                        <option>Europe/London</option>
                        <option>Asia/Tokyo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Format
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>MM/DD/YYYY</option>
                        <option>DD/MM/YYYY</option>
                        <option>YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>English (US)</option>
                        <option>English (UK)</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">Debug Mode</h3>
                        <p className="text-sm text-gray-500">Enable detailed logging for troubleshooting</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">Auto Save</h3>
                        <p className="text-sm text-gray-500">Automatically save settings changes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Ollama AI Settings */}
              {activeTab === 'ollama' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Ollama AI Configuration</h2>
                  
                  <div className="space-y-6">
                    {/* Connection Status */}
                    <div className={`p-4 rounded-xl flex items-center justify-between ${
                      testResult?.success ? 'bg-green-50' : 'bg-yellow-50'
                    }`}>
                      <div className="flex items-center">
                        {testResult?.success ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                        ) : (
                          <ServerIcon className="h-5 w-5 text-yellow-600 mr-3" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {testResult?.success ? 'Connected' : 'Not Tested'}
                          </p>
                          {testResult?.details && (
                            <p className="text-sm text-gray-600">
                              Response time: {testResult.details.responseTime}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={handleTestConnection}
                        disabled={testing}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${testing 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                      >
                        {testing ? (
                          <>
                            <ArrowPathIcon className="h-4 w-4 animate-spin inline mr-2" />
                            Testing...
                          </>
                        ) : (
                          'Test Connection'
                        )}
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ollama API URL
                      </label>
                      <input
                        type="text"
                        value={settings.ollamaUrl}
                        onChange={(e) => setSettings({...settings, ollamaUrl: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="http://localhost:11434"
                      />
                      <p className="text-xs text-gray-500 mt-1">Default: http://localhost:11434</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model
                      </label>
                      <select
                        value={settings.ollamaModel}
                        onChange={(e) => setSettings({...settings, ollamaModel: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="deepseek-r1:1.5b">DeepSeek R1 1.5B (Fast, 4GB RAM)</option>
                        <option value="deepseek-r1:7b">DeepSeek R1 7B (Balanced, 8GB RAM)</option>
                        <option value="deepseek-r1:14b">DeepSeek R1 14B (Accurate, 16GB RAM)</option>
                        <option value="llama2:7b">Llama 2 7B</option>
                        <option value="mistral:7b">Mistral 7B</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timeout (seconds)
                        </label>
                        <input
                          type="number"
                          value={settings.ollamaTimeout}
                          onChange={(e) => setSettings({...settings, ollamaTimeout: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="10"
                          max="120"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Concurrent Requests
                        </label>
                        <input
                          type="number"
                          value={settings.maxConcurrent}
                          onChange={(e) => setSettings({...settings, maxConcurrent: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl">
                      <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                        <InformationCircleIcon className="h-5 w-5 mr-2" />
                        Model Information
                      </h3>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• DeepSeek R1 1.5B: ~1.1GB RAM, fastest processing</li>
                        <li>• DeepSeek R1 7B: ~4.7GB RAM, recommended for most users</li>
                        <li>• DeepSeek R1 14B: ~9GB RAM, best accuracy</li>
                        <li>• Make sure Ollama is running: <code className="bg-blue-100 px-2 py-1 rounded">ollama serve</code></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Settings */}
              {activeTab === 'processing' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Processing Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Batch Size
                        </label>
                        <input
                          type="number"
                          value={settings.batchSize}
                          onChange={(e) => setSettings({...settings, batchSize: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="10"
                          max="500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Number of feedbacks to process at once</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max File Size (MB)
                        </label>
                        <input
                          type="number"
                          value={settings.maxFileSize}
                          onChange={(e) => setSettings({...settings, maxFileSize: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="1"
                          max="500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">Auto Process</h3>
                        <p className="text-sm text-gray-500">Automatically process uploaded files</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.autoProcess}
                          onChange={(e) => setSettings({...settings, autoProcess: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Processing Priority
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>Balanced (Default)</option>
                        <option>Speed (Process faster, less accurate)</option>
                        <option>Accuracy (Slower, more detailed)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">Email Alerts</h3>
                        <p className="text-sm text-gray-500">Receive email notifications for important events</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.emailAlerts}
                          onChange={(e) => setSettings({...settings, emailAlerts: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">Critical Alerts</h3>
                        <p className="text-sm text-gray-500">Immediate notifications for critical risks</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.criticalAlerts}
                          onChange={(e) => setSettings({...settings, criticalAlerts: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">Daily Summary</h3>
                        <p className="text-sm text-gray-500">Receive daily digest of platform activity</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.dailySummary}
                          onChange={(e) => setSettings({...settings, dailySummary: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Email
                      </label>
                      <input
                        type="email"
                        placeholder="admin@company.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Appearance</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">Dark Mode</h3>
                        <p className="text-sm text-gray-500">Switch to dark theme</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.darkMode}
                          onChange={(e) => setSettings({...settings, darkMode: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">Compact View</h3>
                        <p className="text-sm text-gray-500">Show more content with reduced spacing</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.compactView}
                          onChange={(e) => setSettings({...settings, compactView: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Refresh Interval (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.refreshInterval}
                        onChange={(e) => setSettings({...settings, refreshInterval: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="1"
                        max="60"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chart Theme
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>Modern (Default)</option>
                        <option>Classic</option>
                        <option>Minimal</option>
                        <option>Colorful</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Management Settings */}
              {activeTab === 'data' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Data Management</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Retention (days)
                      </label>
                      <input
                        type="number"
                        value={settings.retentionDays}
                        onChange={(e) => setSettings({...settings, retentionDays: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="7"
                        max="365"
                      />
                      <p className="text-xs text-gray-500 mt-1">Auto-delete data older than this</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">Auto Export</h3>
                        <p className="text-sm text-gray-500">Automatically export reports</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.autoExport}
                          onChange={(e) => setSettings({...settings, autoExport: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Export Format
                      </label>
                      <select
                        value={settings.exportFormat}
                        onChange={(e) => setSettings({...settings, exportFormat: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-medium text-gray-900 mb-4">Danger Zone</h3>
                      <div className="space-y-3">
                        <button className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center">
                          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                          Clear All Data
                        </button>
                        <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
                          Export All Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;