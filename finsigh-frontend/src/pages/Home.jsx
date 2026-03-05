// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  ShieldCheckIcon, 
  CpuChipIcon,
  DocumentMagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const features = [
    {
      icon: CpuChipIcon,
      title: 'Local LLM Processing',
      description: '100% offline DeepSeek LLM ensures complete data privacy with no external API calls.',
      color: 'indigo'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Risk Detection',
      description: 'Automatically identify fraud, unauthorized transactions, and security concerns.',
      color: 'purple'
    },
    {
      icon: ChartBarIcon,
      title: 'Sentiment Analysis',
      description: 'Advanced sentiment detection with intensity scoring for customer feedback.',
      color: 'pink'
    },
    {
      icon: DocumentMagnifyingGlassIcon,
      title: 'Issue Classification',
      description: '8+ predefined categories for accurate feedback routing and analysis.',
      color: 'blue'
    },
    {
      icon: ArrowTrendingUpIcon,
      title: 'Trend Analytics',
      description: 'Track recurring issues and sentiment trends over time.',
      color: 'green'
    },
    {
      icon: UserGroupIcon,
      title: 'Executive Summaries',
      description: 'Auto-generated insights for quick decision making.',
      color: 'orange'
    }
  ];

  const stats = [
    { value: '100%', label: 'Offline Processing', icon: ShieldCheckIcon },
    { value: '8+', label: 'Issue Categories', icon: CheckCircleIcon },
    { value: '99.9%', label: 'Data Privacy', icon: ShieldCheckIcon },
    { value: '< 2s', label: 'Processing Time', icon: CpuChipIcon }
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload CSV',
      description: 'Upload your customer feedback data in CSV format. Support for bulk uploads.',
      icon: DocumentMagnifyingGlassIcon
    },
    {
      step: '02',
      title: 'AI Analysis',
      description: 'Local LLM processes each feedback for sentiment, issues, and risks.',
      icon: CpuChipIcon
    },
    {
      step: '03',
      title: 'View Insights',
      description: 'Access comprehensive dashboards with actionable insights and alerts.',
      icon: ChartBarIcon
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
        <div className="absolute top-20 -left-20 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -right-20 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-indigo-50 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse mr-2"></span>
              <span className="text-indigo-700 font-medium">AI-Powered Financial Intelligence</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Transform Customer Feedback into
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Actionable Insights</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              FinSight AI analyzes unstructured customer feedback using local LLMs to detect risks, 
              classify issues, and generate executive summaries—all while keeping your financial 
              data completely private and offline.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-indigo-200 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                View Dashboard
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/upload"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition-all duration-200"
              >
                Try Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-2xl text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Financial Intelligence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to analyze customer feedback and make data-driven decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
                purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
                pink: 'bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white',
                blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
                green: 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white',
                orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white'
              };
              
              return (
                <div 
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 transition-all duration-300 ${colorClasses[feature.color]}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to transform your customer feedback into actionable insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-24 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200"></div>
                  )}
                  <div className="relative flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-2xl mb-6 relative z-10">
                      {step.step}
                    </div>
                    <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-6">
                Beautiful, Intuitive Dashboard
              </h2>
              <p className="text-xl text-indigo-100 mb-8">
                Get a complete overview of your customer feedback with real-time analytics, 
                sentiment tracking, and risk alerts.
              </p>
              <ul className="space-y-4">
                {[
                  'Sentiment distribution visualization',
                  'Top recurring issues tracking',
                  'Critical alerts in real-time',
                  'Weekly trend analysis'
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-6 h-6 text-indigo-200" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/dashboard"
                className="inline-flex items-center mt-10 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:shadow-xl transition-all duration-200"
              >
                Explore Dashboard
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl">
                <div className="bg-white rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-500">Positive</div>
                      <div className="text-2xl font-bold text-green-600">64%</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-500">Critical</div>
                      <div className="text-2xl font-bold text-red-600">12</div>
                    </div>
                  </div>
                  <div className="h-40 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-end justify-around p-4">
                    {[45, 30, 60, 35, 50, 40, 55].map((height, i) => (
                      <div key={i} className="w-8 bg-gradient-to-t from-indigo-600 to-purple-600 rounded-t-lg transition-all hover:opacity-80" style={{ height: `${height}px` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Feedback Analysis?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join leading fintech companies using FinSight AI to understand their customers better.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-indigo-200 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Get Started Now
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <svg className="w-8 h-8 text-indigo-600" viewBox="0 0 40 40" fill="none">
                <path d="M20 5L35 12.5V27.5L20 35L5 27.5V12.5L20 5Z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="20" cy="20" r="5" fill="currentColor"/>
              </svg>
              <span className="text-xl font-bold text-gray-900">FinSightAI</span>
            </div>
            <div className="text-gray-500 text-sm">
              © 2024 FinSight AI. All rights reserved. College Project.
            </div>
          </div>
        </div>
      </footer>

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Home;