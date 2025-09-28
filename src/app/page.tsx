'use client'
import React, { useState } from 'react';
import { MessageCircle, BarChart3, Brain, Sparkles, ArrowRight, Users, Target, Zap, Mail, Github, Linkedin, Twitter, Heart, Shield, Clock, Globe } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentInterview } from '@/store';
import ResumeUpload from '@/components/ResumeUpload';
import InterviewChat from '@/components/InterviewChat';
import InterviewerDashboard from '@/components/InterviewerDashboard';
import FixedTimer from '@/components/FixedTimer';


export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');
  const dispatch = useDispatch();
  const interview = useSelector(selectCurrentInterview);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-900 relative overflow-hidden">
      {/* Professional animated background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[32rem] h-[32rem] bg-gradient-to-r from-slate-300 to-slate-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-10"></div>
        <div className="absolute top-3/4 right-1/4 w-[28rem] h-[28rem] bg-gradient-to-r from-slate-400 to-slate-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 opacity-8"></div>
        <div className="absolute bottom-1/4 left-1/2 w-[24rem] h-[24rem] bg-gradient-to-r from-slate-500 to-slate-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-500 opacity-6"></div>
        <div className="absolute top-1/2 right-1/3 w-[20rem] h-[20rem] bg-gradient-to-r from-slate-400 to-slate-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700 opacity-5"></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Professional Header */}
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-8">
              <div className="relative group">
                <div className="p-5 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-3xl shadow-2xl shadow-slate-900/20 transition-all duration-300 group-hover:shadow-3xl group-hover:shadow-slate-900/30">
                  <Brain className="w-10 h-10 text-white transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 bg-clip-text text-transparent mb-2 tracking-tight">
                  AI Interview Assistant
                </h1>
                <p className="text-slate-600 text-base font-medium">Master your next interview with AI-powered coaching</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('chat')}
                className="group relative px-6 py-3 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-900/30 active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 transition-transform group-hover:rotate-12" />
                  <span className="text-sm">Start Chat</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="group px-6 py-3 bg-white/90 backdrop-blur-md border-2 border-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-300 hover:bg-white hover:border-slate-300 hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/5"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span className="text-sm">Dashboard</span>
                </div>
              </button>
            </div>
          </div>

          {/* Professional Navigation Tabs */}
          <div className="flex gap-2 mb-8 p-2 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-lg shadow-slate-900/5">
            {[
              { key: 'overview', label: 'Overview', icon: <Sparkles className="w-4 h-4" /> },
              { key: 'chat', label: 'Practice Chat', icon: <MessageCircle className="w-4 h-4" /> },
              { key: 'dashboard', label: 'Performance', icon: <BarChart3 className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === tab.key
                  ? 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50/80 hover:scale-105 hover:shadow-md hover:shadow-slate-900/5'
                  }`}
              >
                {tab.icon}
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[80vh]">
              {/* Left Side - Landing Page Content */}
              <div className="flex flex-col justify-center space-y-8 pr-8">
                {/* New Badge */}
                <div className="inline-flex items-center">
                  <div className="px-3 py-1 bg-slate-800 text-white text-xs font-semibold rounded-md">
                    New
                  </div>
                </div>

                {/* Main Headline */}
                <div>
                  <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-6">
                    Ace interviews with an elegant, focused practice experience
                  </h2>
                  <p className="text-lg text-slate-600 leading-relaxed font-medium">
                    Upload your resume, practice with timed questions, and receive concise, actionable feedback. A fast, accessible interface designed to help you improve with every session.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-base font-semibold transition-all hover:scale-105 duration-300 hover:shadow-xl hover:shadow-slate-900/30"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 rounded-xl text-base font-semibold transition-all hover:scale-105 duration-300"
                  >
                    Explore features
                    <BarChart3 className="w-4 h-4 transition-transform group-hover:scale-110" />
                  </button>
                </div>

                {/* Trusted By Section */}
                <div className="pt-8">
                  <p className="text-sm text-slate-500 mb-4 font-medium">Trusted by candidates from</p>
                  <div className="flex gap-3">
                    <div className="w-12 h-8 bg-purple-500 rounded"></div>
                    <div className="w-12 h-8 bg-blue-400 rounded"></div>
                    <div className="w-12 h-8 bg-green-500 rounded"></div>
                    <div className="w-12 h-8 bg-orange-500 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Right Side - Chat Interface */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="h-full flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <select className="text-sm font-medium text-slate-700 bg-transparent border-none outline-none">
                          <option>US English</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
                          <Brain className="w-4 h-4" />
                          Choose Template
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
                          <Users className="w-4 h-4" />
                          Add New Resume
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                        <Brain className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          Welcome! I see your resume has been uploaded. Let me help you get started with the interview process.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                        <Brain className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          Ready to begin? Click the button below to start your interview setup.
                        </p>
                        <button
                          onClick={() => setActiveTab('chat')}
                          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-all hover:scale-105 duration-300"
                        >
                          <Zap className="w-4 h-4" />
                          Start Interview
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Please provide the requested information..."
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      />
                      <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
                        <Target className="w-4 h-4" />
                        Voice
                      </button>
                      <button className="flex items-center gap-2 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
                        <ArrowRight className="w-4 h-4" />
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-3xl p-12 shadow-2xl shadow-slate-900/10">
                <div className="text-center mb-12">
                  <div className="inline-flex p-8 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-3xl mb-8 shadow-2xl shadow-slate-900/20">
                    <MessageCircle className="w-12 h-12" />
                  </div>
                  <h3 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">AI Interview Chat</h3>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">Start practicing with our AI interviewer. Get real-time feedback and personalized coaching to ace your next interview.</p>
                </div>

                {interview.status === 'not_started' && !interview.candidate && (
                  <div className="mb-8">
                    <ResumeUpload
                      onResumeProcessed={(candidate) => {
                        // Automatically start the interview flow after resume processing
                        dispatch({
                          type: 'interview/start_candidate',
                          payload: { candidate }
                        });
                      }}
                    />
                  </div>
                )}

                {(interview.status !== 'not_started' || interview.candidate) && (
                  <InterviewChat
                    onStartInterview={() => {
                      // Update candidates list when interview completes
                      if (interview.summary && interview.candidate) {
                        dispatch({
                          type: 'candidates/update',
                          payload: {
                            id: interview.candidate.id,
                            updates: {
                              score: interview.summary.totalScore,
                              status: 'completed',
                              interviewSummary: interview.summary,
                              answers: interview.answers
                            }
                          }
                        });
                      }
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <InterviewerDashboard />
          )}
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="relative z-10 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AI Interview Assistant</h3>
                  <p className="text-slate-400 text-sm">Master your next interview</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Empowering job seekers with AI-powered interview preparation, personalized coaching, and real-time feedback.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold">Product</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">AI Coaching</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Practice Sessions</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Analytics</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Templates</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-slate-800 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-2xl font-bold">10K+</span>
              </div>
              <p className="text-slate-400 text-sm">Active Users</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-400" />
                <span className="text-2xl font-bold">94%</span>
              </div>
              <p className="text-slate-400 text-sm">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-400" />
                <span className="text-2xl font-bold">2.4K</span>
              </div>
              <p className="text-slate-400 text-sm">Sessions</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-purple-400" />
                <span className="text-2xl font-bold">50+</span>
              </div>
              <p className="text-slate-400 text-sm">Countries</p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 border-t border-slate-800">
            <div className="flex items-center gap-4 text-slate-400 text-sm">
              <p>© 2024 AI Interview Assistant. All rights reserved.</p>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Secure & Private</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span>for job seekers worldwide</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Fixed Timer - Only show on chat page */}
      {(interview.status !== 'not_started' || interview.candidate) && (
        <FixedTimer
          onPause={() => {
            dispatch({ type: 'interview/pause' });
          }}
          onResume={() => {
            dispatch({ type: 'interview/resume' });
          }}
          onCancel={() => {
            const confirmed = window.confirm('Are you sure you want to cancel the current interview? Progress will be lost.');
            if (confirmed) {
              dispatch({ type: 'interview/reset' });
            }
          }}
        />
      )}
    </div>
  );
}