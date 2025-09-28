'use client'
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCandidates, type Candidate } from '@/store';
import { Users, Search, Star, Calendar, Phone, Mail, Eye, ArrowLeft, Trash2 } from 'lucide-react';

export default function InterviewerDashboard() {
    const candidates = useSelector(selectCandidates);
    const dispatch = useDispatch();
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'score' | 'name' | 'date'>('score');

    const filteredAndSortedCandidates = candidates
        .filter((candidate: Candidate) =>
            candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a: Candidate, b: Candidate) => {
            switch (sortBy) {
                case 'score':
                    return b.score - a.score;
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'date':
                    return 0; // Simplified for now - date sorting not implemented
                default:
                    return 0;
            }
        });

    const getScoreColor = (score: number) => {
        if (score >= 45) return 'text-green-600 bg-green-100';
        if (score >= 30) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 45) return 'Excellent';
        if (score >= 30) return 'Good';
        return 'Needs Improvement';
    };

    const clearAllCandidates = () => {
        const confirmed = window.confirm('Are you sure you want to clear all candidates? This action cannot be undone.');
        if (confirmed) {
            dispatch({ type: 'candidates/set', payload: [] });
        }
    };

    if (selectedCandidate) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => setSelectedCandidate(null)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to List
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900">Candidate Details</h2>
                </div>

                {/* Candidate Info */}
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-3xl p-8 shadow-xl shadow-slate-900/10">
                    <div className="flex items-start gap-6 mb-8">
                        <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-3xl font-bold text-slate-900 mb-2">{selectedCandidate.name}</h3>
                            <div className="flex items-center gap-4 text-slate-600">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {selectedCandidate.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {selectedCandidate.phone}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getScoreColor(selectedCandidate.score)}`}>
                                <Star className="w-4 h-4" />
                                {selectedCandidate.score}/60 - {getScoreLabel(selectedCandidate.score)}
                            </div>
                        </div>
                    </div>

                    {/* Interview Summary */}
                    {selectedCandidate.interviewSummary && (
                        <div className="mb-8">
                            <h4 className="text-xl font-bold text-slate-900 mb-4">Interview Summary</h4>
                            <div className="bg-slate-50 rounded-2xl p-6">
                                <p className="text-slate-700 leading-relaxed">{selectedCandidate.interviewSummary.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Question Details */}
                    {selectedCandidate.interviewSummary && (
                        <div>
                            <h4 className="text-xl font-bold text-slate-900 mb-4">Question-by-Question Breakdown</h4>
                            <div className="space-y-4">
                                {selectedCandidate.interviewSummary.perQuestion.map((question, index) => (
                                    <div key={question.questionId} className="bg-slate-50 rounded-2xl p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <h5 className="font-semibold text-slate-900">Question {index + 1}</h5>
                                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${(question.score || 0) >= 8 ? 'bg-green-100 text-green-700' :
                                                (question.score || 0) >= 6 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {question.score || 0}/10
                                            </div>
                                        </div>
                                        <p className="text-slate-600 mb-3">{question.feedback}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Interview Dashboard</h2>
                    <p className="text-slate-600">Review candidate performance and interview results</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-lg">
                        <Users className="w-5 h-5 text-slate-600" />
                        <span className="font-semibold text-slate-900">{candidates.length} Candidates</span>
                    </div>
                    {candidates.length > 0 && (
                        <button
                            onClick={clearAllCandidates}
                            className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title="Clear all candidates"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Clear All</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search candidates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all duration-200"
                    />
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'score' | 'name' | 'date')}
                    className="px-4 py-3 bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all duration-200"
                >
                    <option value="score">Sort by Score</option>
                    <option value="name">Sort by Name</option>
                    <option value="date">Sort by Date</option>
                </select>
            </div>

            {/* Candidates List */}
            {filteredAndSortedCandidates.length === 0 ? (
                <div className="text-center py-16">
                    <div className="inline-flex p-6 bg-slate-100 rounded-3xl mb-6">
                        <Users className="w-12 h-12 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No candidates found</h3>
                    <p className="text-slate-600">
                        {candidates.length === 0
                            ? "No interviews have been conducted yet."
                            : "Try adjusting your search criteria."
                        }
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredAndSortedCandidates.map((candidate: Candidate) => (
                        <div
                            key={candidate.id}
                            onClick={() => setSelectedCandidate(candidate)}
                            className="bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">{candidate.name}</h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-600">
                                            <span>{candidate.email}</span>
                                            <span>{candidate.phone}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(candidate.score)}`}>
                                            <Star className="w-4 h-4" />
                                            {candidate.score}/60
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{getScoreLabel(candidate.score)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                                        <Eye className="w-4 h-4 text-slate-600" />
                                        <span className="text-sm font-medium text-slate-700">View Details</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
