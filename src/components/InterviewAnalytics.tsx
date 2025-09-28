"use client";

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Target, Award, Brain, Users, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AnalyticsData {
    overallScore: number;
    averageResponseTime: number;
    confidenceLevel: number;
    technicalAccuracy: number;
    communicationScore: number;
    improvementAreas: string[];
    strengths: string[];
    questionBreakdown: Array<{
        question: string;
        score: number;
        timeSpent: number;
        difficulty: string;
    }>;
    performanceTrend: Array<{
        question: number;
        score: number;
        timestamp: number;
    }>;
}

interface InterviewAnalyticsProps {
    interviewData: any;
    isCompleted: boolean;
}

export default function InterviewAnalytics({ interviewData, isCompleted }: InterviewAnalyticsProps) {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [selectedMetric, setSelectedMetric] = useState<string>('overall');

    useEffect(() => {
        if (isCompleted && interviewData) {
            generateAnalytics();
        }
    }, [isCompleted, interviewData]);

    const generateAnalytics = () => {
        // Simulate comprehensive analytics generation
        const mockAnalytics: AnalyticsData = {
            overallScore: Math.floor(Math.random() * 30) + 70, // 70-100
            averageResponseTime: Math.floor(Math.random() * 30) + 45, // 45-75 seconds
            confidenceLevel: Math.floor(Math.random() * 25) + 75, // 75-100%
            technicalAccuracy: Math.floor(Math.random() * 20) + 80, // 80-100%
            communicationScore: Math.floor(Math.random() * 25) + 75, // 75-100%
            improvementAreas: [
                'Provide more specific examples',
                'Structure answers better',
                'Show more confidence in technical areas'
            ],
            strengths: [
                'Strong technical knowledge',
                'Clear communication',
                'Good problem-solving approach'
            ],
            questionBreakdown: [
                { question: 'System Design', score: 85, timeSpent: 120, difficulty: 'Hard' },
                { question: 'Algorithm Optimization', score: 78, timeSpent: 90, difficulty: 'Medium' },
                { question: 'Database Design', score: 92, timeSpent: 75, difficulty: 'Easy' },
                { question: 'API Architecture', score: 88, timeSpent: 110, difficulty: 'Medium' },
                { question: 'Performance Tuning', score: 81, timeSpent: 95, difficulty: 'Hard' }
            ],
            performanceTrend: [
                { question: 1, score: 78, timestamp: Date.now() - 300000 },
                { question: 2, score: 82, timestamp: Date.now() - 240000 },
                { question: 3, score: 85, timestamp: Date.now() - 180000 },
                { question: 4, score: 88, timestamp: Date.now() - 120000 },
                { question: 5, score: 84, timestamp: Date.now() - 60000 }
            ]
        };

        setAnalytics(mockAnalytics);
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (!isCompleted || !analytics) {
        return (
            <Card className="p-6 border-border bg-card text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Unavailable</h3>
                <p className="text-sm text-muted-foreground">
                    Complete the interview to view detailed analytics and performance insights.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Interview Analytics</h2>
                    <p className="text-sm text-muted-foreground">Comprehensive performance analysis</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                    <Button variant="outline" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Share Results
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 border-border bg-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Award className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Overall Score</p>
                            <p className="text-2xl font-bold text-foreground">{analytics.overallScore}/100</p>
                        </div>
                    </div>
                    <Progress value={analytics.overallScore} className="mt-3" />
                </Card>

                <Card className="p-4 border-border bg-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Avg Response Time</p>
                            <p className="text-2xl font-bold text-foreground">{analytics.averageResponseTime}s</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border-border bg-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <Brain className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Technical Accuracy</p>
                            <p className="text-2xl font-bold text-foreground">{analytics.technicalAccuracy}%</p>
                        </div>
                    </div>
                    <Progress value={analytics.technicalAccuracy} className="mt-3" />
                </Card>

                <Card className="p-4 border-border bg-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <Target className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Communication</p>
                            <p className="text-2xl font-bold text-foreground">{analytics.communicationScore}%</p>
                        </div>
                    </div>
                    <Progress value={analytics.communicationScore} className="mt-3" />
                </Card>
            </div>

            {/* Performance Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Question Performance */}
                <Card className="p-6 border-border bg-card">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Question Performance</h3>
                    </div>

                    <div className="space-y-4">
                        {analytics.questionBreakdown.map((q, index) => (
                            <div key={index} className="p-4 border border-border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-medium text-foreground">{q.question}</h4>
                                    <div className="flex items-center gap-2">
                                        <Badge className={getDifficultyColor(q.difficulty)}>
                                            {q.difficulty}
                                        </Badge>
                                        <span className={`text-sm font-bold px-2 py-1 rounded ${getScoreColor(q.score)}`}>
                                            {q.score}/100
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Time: {q.timeSpent}s</span>
                                    <Progress value={q.score} className="w-24 h-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Performance Trend */}
                <Card className="p-6 border-border bg-card">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Performance Trend</h3>
                    </div>

                    <div className="space-y-3">
                        {analytics.performanceTrend.map((point, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-xs font-medium text-primary">{point.question}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-foreground">Question {point.question}</span>
                                        <span className="text-sm font-medium text-foreground">{point.score}/100</span>
                                    </div>
                                    <Progress value={point.score} className="h-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card className="p-6 border-border bg-card">
                    <div className="flex items-center gap-2 mb-4">
                        <Award className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-foreground">Strengths</h3>
                    </div>

                    <div className="space-y-3">
                        {analytics.strengths.map((strength, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-foreground">{strength}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Improvement Areas */}
                <Card className="p-6 border-border bg-card">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-foreground">Improvement Areas</h3>
                    </div>

                    <div className="space-y-3">
                        {analytics.improvementAreas.map((area, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-foreground">{area}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Recommendations */}
            <Card className="p-6 border-border bg-card">
                <div className="flex items-center gap-2 mb-4">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">AI Recommendations</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-border rounded-lg">
                        <h4 className="text-sm font-medium text-foreground mb-2">Technical Skills</h4>
                        <p className="text-xs text-muted-foreground mb-3">
                            Your technical knowledge is strong. Consider practicing system design scenarios.
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                            Practice More
                        </Button>
                    </div>

                    <div className="p-4 border border-border rounded-lg">
                        <h4 className="text-sm font-medium text-foreground mb-2">Communication</h4>
                        <p className="text-xs text-muted-foreground mb-3">
                            Good communication skills. Work on structuring answers more clearly.
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                            Improve Structure
                        </Button>
                    </div>

                    <div className="p-4 border border-border rounded-lg">
                        <h4 className="text-sm font-medium text-foreground mb-2">Time Management</h4>
                        <p className="text-xs text-muted-foreground mb-3">
                            Good pacing overall. Consider spending more time on complex questions.
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                            Time Tips
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}