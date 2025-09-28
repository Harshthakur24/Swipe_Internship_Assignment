"use client";

import React, { useState, useEffect } from 'react';
import { Lightbulb, Target, TrendingUp, Clock, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

interface CoachingTip {
    id: string;
    type: 'improvement' | 'praise' | 'suggestion' | 'warning';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: 'communication' | 'technical' | 'structure' | 'confidence' | 'time';
}

interface AICoachingProps {
    currentAnswer: string;
    timeRemaining: number;
    questionIndex: number;
    totalQuestions: number;
    isActive: boolean;
}

export default function AICoaching({
    currentAnswer,
    timeRemaining,
    questionIndex,
    totalQuestions,
    isActive
}: AICoachingProps) {
    const [coachingTips, setCoachingTips] = useState<CoachingTip[]>([]);
    const [performanceScore, setPerformanceScore] = useState(0);
    const [strengths, setStrengths] = useState<string[]>([]);
    const [improvements, setImprovements] = useState<string[]>([]);

    useEffect(() => {
        if (currentAnswer && currentAnswer.length > 20) {
            generateCoachingTips(currentAnswer);
        }
    }, [currentAnswer]);

    useEffect(() => {
        if (timeRemaining <= 10 && timeRemaining > 0) {
            generateTimeBasedTips();
        }
    }, [timeRemaining]);

    const generateCoachingTips = (answer: string) => {
        const tips: CoachingTip[] = [];

        // Analyze answer length
        if (answer.length < 50) {
            tips.push({
                id: 'length-1',
                type: 'suggestion',
                title: 'Expand Your Answer',
                description: 'Your answer is quite brief. Try to provide more detail and examples to demonstrate your knowledge.',
                priority: 'medium',
                category: 'structure'
            });
        } else if (answer.length > 500) {
            tips.push({
                id: 'length-2',
                type: 'warning',
                title: 'Keep It Concise',
                description: 'Your answer is quite long. Consider being more concise while maintaining key points.',
                priority: 'low',
                category: 'communication'
            });
        }

        // Analyze technical terms
        const technicalTerms = ['algorithm', 'database', 'API', 'framework', 'architecture', 'optimization', 'scalability'];
        const hasTechnicalTerms = technicalTerms.some(term =>
            answer.toLowerCase().includes(term)
        );

        if (hasTechnicalTerms) {
            tips.push({
                id: 'technical-1',
                type: 'praise',
                title: 'Great Technical Detail',
                description: 'Excellent use of technical terminology. This shows strong domain knowledge.',
                priority: 'low',
                category: 'technical'
            });
        }

        // Analyze structure
        const hasStructure = answer.includes('first') || answer.includes('second') ||
            answer.includes('then') || answer.includes('finally') ||
            answer.includes('1.') || answer.includes('2.');

        if (!hasStructure && answer.length > 100) {
            tips.push({
                id: 'structure-1',
                type: 'improvement',
                title: 'Improve Structure',
                description: 'Consider organizing your answer with clear points or steps for better clarity.',
                priority: 'high',
                category: 'structure'
            });
        }

        // Analyze confidence indicators
        const confidenceWords = ['definitely', 'certainly', 'confident', 'sure', 'know'];
        const uncertaintyWords = ['maybe', 'perhaps', 'might', 'could be', 'not sure'];

        const confidenceCount = confidenceWords.filter(word =>
            answer.toLowerCase().includes(word)
        ).length;
        const uncertaintyCount = uncertaintyWords.filter(word =>
            answer.toLowerCase().includes(word)
        ).length;

        if (uncertaintyCount > confidenceCount) {
            tips.push({
                id: 'confidence-1',
                type: 'improvement',
                title: 'Show More Confidence',
                description: 'Try to express your knowledge with more confidence. Use definitive statements when appropriate.',
                priority: 'medium',
                category: 'confidence'
            });
        }

        setCoachingTips(tips.slice(0, 3)); // Show max 3 tips
        updatePerformanceMetrics(answer);
    };

    const generateTimeBasedTips = () => {
        const timeTips: CoachingTip[] = [];

        if (timeRemaining <= 5) {
            timeTips.push({
                id: 'time-critical',
                type: 'warning',
                title: 'Time Almost Up!',
                description: 'You have less than 5 seconds. Quickly summarize your main point.',
                priority: 'high',
                category: 'time'
            });
        } else if (timeRemaining <= 10) {
            timeTips.push({
                id: 'time-warning',
                type: 'suggestion',
                title: 'Time Running Low',
                description: 'Consider wrapping up your answer soon. Focus on your key points.',
                priority: 'medium',
                category: 'time'
            });
        }

        setCoachingTips(prev => [...timeTips, ...prev.slice(0, 2)]);
    };

    const updatePerformanceMetrics = (answer: string) => {
        let score = 50; // Base score

        // Length scoring
        if (answer.length >= 100 && answer.length <= 400) score += 20;
        else if (answer.length < 50) score -= 15;
        else if (answer.length > 500) score -= 10;

        // Technical content
        const technicalTerms = ['algorithm', 'database', 'API', 'framework', 'architecture', 'optimization'];
        const techCount = technicalTerms.filter(term => answer.toLowerCase().includes(term)).length;
        score += techCount * 5;

        // Structure
        const structureWords = ['first', 'second', 'then', 'finally', '1.', '2.', '3.'];
        const hasStructure = structureWords.some(word => answer.toLowerCase().includes(word));
        if (hasStructure) score += 15;

        // Confidence
        const confidenceWords = ['definitely', 'certainly', 'confident', 'sure', 'know'];
        const confidenceCount = confidenceWords.filter(word => answer.toLowerCase().includes(word)).length;
        score += confidenceCount * 3;

        setPerformanceScore(Math.min(100, Math.max(0, score)));

        // Update strengths and improvements
        const newStrengths: string[] = [];
        const newImprovements: string[] = [];

        if (answer.length >= 100) newStrengths.push('Detailed responses');
        if (techCount > 0) newStrengths.push('Technical knowledge');
        if (hasStructure) newStrengths.push('Well-structured answers');
        if (confidenceCount > 0) newStrengths.push('Confident communication');

        if (answer.length < 50) newImprovements.push('Provide more detail');
        if (!hasStructure && answer.length > 100) newImprovements.push('Better organization');
        if (techCount === 0) newImprovements.push('Include technical examples');

        setStrengths(newStrengths);
        setImprovements(newImprovements);
    };

    const getTipIcon = (type: string) => {
        switch (type) {
            case 'improvement': return <TrendingUp className="h-4 w-4 text-blue-600" />;
            case 'praise': return <Star className="h-4 w-4 text-green-600" />;
            case 'suggestion': return <Lightbulb className="h-4 w-4 text-yellow-600" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-red-600" />;
            default: return <Target className="h-4 w-4 text-primary" />;
        }
    };

    const getTipColor = (type: string) => {
        switch (type) {
            case 'improvement': return 'border-blue-200 bg-blue-50';
            case 'praise': return 'border-green-200 bg-green-50';
            case 'suggestion': return 'border-yellow-200 bg-yellow-50';
            case 'warning': return 'border-red-200 bg-red-50';
            default: return 'border-gray-200 bg-gray-50';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (!isActive) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Performance Overview */}
            <Card className="p-4 border-border bg-card">
                <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">AI Coaching</h3>
                    <Badge variant="outline" className="ml-auto">
                        Question {questionIndex + 1}/{totalQuestions}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Performance Score */}
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">{performanceScore}</div>
                        <div className="text-xs text-muted-foreground">Performance Score</div>
                    </div>

                    {/* Strengths */}
                    <div>
                        <div className="text-sm font-medium text-foreground mb-2">Strengths</div>
                        <div className="space-y-1">
                            {strengths.slice(0, 2).map((strength, index) => (
                                <div key={index} className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                    <span className="text-xs text-foreground">{strength}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Improvements */}
                    <div>
                        <div className="text-sm font-medium text-foreground mb-2">Focus Areas</div>
                        <div className="space-y-1">
                            {improvements.slice(0, 2).map((improvement, index) => (
                                <div key={index} className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-blue-600" />
                                    <span className="text-xs text-foreground">{improvement}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Coaching Tips */}
            {coachingTips.length > 0 && (
                <Card className="p-4 border-border bg-card">
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Real-time Tips</h3>
                    </div>

                    <div className="space-y-3">
                        {coachingTips.map((tip) => (
                            <div
                                key={tip.id}
                                className={`p-3 rounded-lg border ${getTipColor(tip.type)}`}
                            >
                                <div className="flex items-start gap-2">
                                    {getTipIcon(tip.type)}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-sm font-medium text-foreground">{tip.title}</h4>
                                            <Badge className={`text-xs ${getPriorityColor(tip.priority)}`}>
                                                {tip.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{tip.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-4 border-border bg-card">
                <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success('Remember: Structure your answer with clear points')}
                        className="gap-1"
                    >
                        <Target className="h-3 w-3" />
                        Structure Tip
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success('Include specific examples to strengthen your answer')}
                        className="gap-1"
                    >
                        <Lightbulb className="h-3 w-3" />
                        Example Tip
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success('Speak with confidence - you know your stuff!')}
                        className="gap-1"
                    >
                        <Star className="h-3 w-3" />
                        Confidence Tip
                    </Button>
                </div>
            </Card>
        </div>
    );
}