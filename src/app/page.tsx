'use client'
import React, { useState } from 'react';
import { MessageCircle, BarChart3, Brain, Sparkles, ArrowRight, Users, Target, Zap, Star, TrendingUp, Award } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentInterview } from '@/store';
import ResumeUpload from '@/components/ResumeUpload';
import InterviewChat from '@/components/InterviewChat';
import InterviewerDashboard from '@/components/InterviewerDashboard';


export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const dispatch = useDispatch();
  const interview = useSelector(selectCurrentInterview);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze your responses in real-time and provide intelligent feedback",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Personalized Coaching",
      description: "Get tailored insights and recommendations to improve your interview performance",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-time Feedback",
      description: "Instant suggestions, tips, and guidance during your practice sessions",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Industry-Specific",
      description: "Customized questions and scenarios for your target role and industry",
      color: "from-green-500 to-teal-600"
    }
  ];

  const stats = [
    { label: "Success Rate", value: "94%", change: "+12%", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Practice Sessions", value: "2.4K", change: "+23%", icon: <Star className="w-5 h-5" /> },
    { label: "Avg. Improvement", value: "78%", change: "+8%", icon: <Award className="w-5 h-5" /> }
  ];

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
            <div className="space-y-8">
              {/* Professional Hero Section */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full border border-slate-300 mb-6 shadow-md shadow-slate-900/5">
                  <Star className="w-4 h-4 text-slate-700" />
                  <span className="text-slate-800 font-semibold text-sm">Trusted by 10,000+ job seekers</span>
                </div>
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 bg-clip-text text-transparent leading-tight tracking-tight">
                  Ace Your Next Interview
                </h2>
                <p className="text-lg text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
                  Experience the future of interview preparation with our AI-powered assistant that adapts to your unique needs and provides personalized coaching.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 hover:cursor-pointer hover:scale-105 duration-300 text-white rounded-xl text-base font-semibold transition-all hover:shadow-xl hover:shadow-slate-900/30"
                  >
                    Start Practicing Now
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-md border-2 border-slate-200 hover:cursor-pointer hover:scale-105 duration-300 text-slate-700 rounded-xl text-base font-semibold transition-all hover:shadow-lg hover:border-slate-300 shadow-md shadow-slate-900/5"
                  >
                    View Dashboard
                    <BarChart3 className="w-4 h-4 transition-transform group-hover:scale-110" />
                  </button>
                </div>
              </div>

              {/* Professional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                {stats.map((stat, index) => (
                  <div key={index} className="p-10 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-slate-900/10 hover:border-slate-300 transition-all duration-500 group hover:scale-105">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-lg">
                        <div className="text-slate-700">{stat.icon}</div>
                      </div>
                      <div className="text-slate-600 text-sm font-semibold bg-slate-100 px-4 py-2 rounded-full shadow-sm">
                        {stat.change}
                      </div>
                    </div>
                    <div className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">{stat.value}</div>
                    <div className="text-slate-600 text-xl font-semibold">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Professional Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {features.map((feature: { icon: React.ReactNode; title: string; description: string; color: string }, index: number) => (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredFeature(index)}
                    onMouseLeave={() => setHoveredFeature(null)}
                    className={`p-12 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-3xl transition-all duration-500 cursor-pointer group shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-slate-900/10 ${hoveredFeature === index ? 'scale-105 border-slate-300' : ''
                      }`}
                  >
                    <div className={`inline-flex p-5 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 text-white mb-8 transition-all duration-300 ${hoveredFeature === index ? 'scale-110 rotate-6 shadow-2xl shadow-slate-900/20' : 'shadow-lg shadow-slate-900/10'
                      }`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-6">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-xl font-medium">{feature.description}</p>
                  </div>
                ))}
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
    </div>
  );
}