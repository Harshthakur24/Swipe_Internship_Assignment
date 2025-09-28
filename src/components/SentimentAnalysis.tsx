"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Brain, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SentimentData {
    confidence: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    keywords: string[];
    emotionalTone: string;
    clarity: number;
    completeness: number;
}

interface SentimentAnalysisProps {
    currentAnswer: string;
    isAnalyzing: boolean;
}

export default function SentimentAnalysis({ currentAnswer, isAnalyzing }: SentimentAnalysisProps) {
    const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
    const [analysisHistory, setAnalysisHistory] = useState<SentimentData[]>([]);

    useEffect(() => {
        if (currentAnswer && currentAnswer.length > 10) {
            analyzeSentiment(currentAnswer);
        }
    }, [currentAnswer]);

    const analyzeSentiment = async (text: string) => {
        // Simulate AI sentiment analysis
        const confidence = Math.random() * 40 + 60; // 60-100%
        const clarity = Math.random() * 30 + 70; // 70-100%
        const completeness = Math.random() * 25 + 75; // 75-100%

        const sentiments = ['positive', 'negative', 'neutral'] as const;
        const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];

        const emotionalTones = [
            'Confident and articulate',
            'Thoughtful and measured',
            'Enthusiastic and engaging',
            'Professional and clear',
            'Detailed and comprehensive',
            'Concise and focused'
        ];

        const keywords = extractKeywords(text);

        const newAnalysis: SentimentData = {
            confidence,
            sentiment,
            keywords,
            emotionalTone: emotionalTones[Math.floor(Math.random() * emotionalTones.length)],
            clarity,
            completeness
        };

        setSentimentData(newAnalysis);
        setAnalysisHistory(prev => [...prev.slice(-4), newAnalysis]); // Keep last 5 analyses
    };

    const extractKeywords = (text: string): string[] => {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3);

        const commonWords = new Set(['this', 'that', 'with', 'from', 'they', 'been', 'have', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'where', 'much', 'some', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'these', 'think', 'want', 'work', 'year', 'your', 'good', 'know', 'right', 'back', 'give', 'most', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'these', 'think', 'want', 'work', 'year', 'your', 'good', 'know', 'right', 'back', 'give', 'most']);

        const wordCount = words.reduce((acc, word) => {
            if (!commonWords.has(word)) {
                acc[word] = (acc[word] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(wordCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);
    };

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return <TrendingUp className="h-4 w-4 text-green-600" />;
            case 'negative': return <TrendingDown className="h-4 w-4 text-red-600" />;
            default: return <Minus className="h-4 w-4 text-yellow-600" />;
        }
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'text-green-600 bg-green-50 border-green-200';
            case 'negative': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return 'text-green-600';
        if (confidence >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (!sentimentData && !isAnalyzing) {
        return null;
    }

    return (
        <div className="space-y-3">
            {/* Real-time Analysis */}
            {sentimentData && (
                <Card className="p-4 border-border bg-card">
                    <div className="flex items-center gap-2 mb-3">
                        <Brain className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Real-time Analysis</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sentiment */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                {getSentimentIcon(sentimentData.sentiment)}
                                <span className="text-sm font-medium text-foreground">Sentiment</span>
                            </div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getSentimentColor(sentimentData.sentiment)}`}>
                                {sentimentData.sentiment.charAt(0).toUpperCase() + sentimentData.sentiment.slice(1)}
                            </div>
                        </div>

                        {/* Confidence */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-foreground">Confidence</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Progress value={sentimentData.confidence} className="flex-1" />
                                <span className={`text-sm font-medium ${getConfidenceColor(sentimentData.confidence)}`}>
                                    {Math.round(sentimentData.confidence)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Emotional Tone */}
                    <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-foreground">
                            <span className="font-medium">Tone:</span> {sentimentData.emotionalTone}
                        </p>
                    </div>

                    {/* Keywords */}
                    {sentimentData.keywords.length > 0 && (
                        <div className="mt-3">
                            <p className="text-sm font-medium text-foreground mb-2">Key Topics:</p>
                            <div className="flex flex-wrap gap-1">
                                {sentimentData.keywords.map((keyword, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quality Metrics */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Clarity</span>
                                <span>{Math.round(sentimentData.clarity)}%</span>
                            </div>
                            <Progress value={sentimentData.clarity} className="h-1" />
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Completeness</span>
                                <span>{Math.round(sentimentData.completeness)}%</span>
                            </div>
                            <Progress value={sentimentData.completeness} className="h-1" />
                        </div>
                    </div>
                </Card>
            )}

            {/* Analysis History */}
            {analysisHistory.length > 0 && (
                <Card className="p-4 border-border bg-card">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Performance Trend</h3>
                    <div className="space-y-2">
                        {analysisHistory.slice(-3).map((analysis, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    {getSentimentIcon(analysis.sentiment)}
                                    <span className="text-xs text-foreground">Answer {analysisHistory.length - 2 + index}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium ${getConfidenceColor(analysis.confidence)}`}>
                                        {Math.round(analysis.confidence)}%
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {Math.round(analysis.clarity)}% clarity
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Loading State */}
            {isAnalyzing && (
                <Card className="p-4 border-border bg-card">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-muted-foreground">Analyzing your response...</span>
                    </div>
                </Card>
            )}
        </div>
    );
}
