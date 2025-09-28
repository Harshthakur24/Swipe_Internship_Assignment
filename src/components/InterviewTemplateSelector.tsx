"use client";

import React, { useState } from 'react';
import { Briefcase, Clock, Users, Star, Search, Filter, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { interviewTemplates, InterviewTemplate, getRecommendedTemplates } from '@/services/interviewTemplates';

interface InterviewTemplateSelectorProps {
    onTemplateSelect: (template: InterviewTemplate) => void;
    userSkills?: string[];
    experienceLevel?: string;
    className?: string;
}

export default function InterviewTemplateSelector({
    onTemplateSelect,
    userSkills = [],
    experienceLevel = 'mid',
    className = ""
}: InterviewTemplateSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
    const [selectedLevel, setSelectedLevel] = useState<string>('all');
    const [showRecommended, setShowRecommended] = useState(false);

    const industries = ['all', ...Array.from(new Set(interviewTemplates.map(t => t.industry)))];
    const levels = ['all', 'entry', 'mid', 'senior', 'lead'];

    const filteredTemplates = React.useMemo(() => {
        let templates = interviewTemplates;

        // Apply search filter
        if (searchTerm) {
            templates = templates.filter(template =>
                template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                template.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply industry filter
        if (selectedIndustry !== 'all') {
            templates = templates.filter(template => template.industry === selectedIndustry);
        }

        // Apply level filter
        if (selectedLevel !== 'all') {
            templates = templates.filter(template => template.level === selectedLevel);
        }

        return templates;
    }, [searchTerm, selectedIndustry, selectedLevel]);

    const recommendedTemplates = React.useMemo(() => {
        if (userSkills.length === 0) return [];
        return getRecommendedTemplates(userSkills, experienceLevel);
    }, [userSkills, experienceLevel]);

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'entry': return 'bg-green-100 text-green-800';
            case 'mid': return 'bg-blue-100 text-blue-800';
            case 'senior': return 'bg-purple-100 text-purple-800';
            case 'lead': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'hard': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const TemplateCard = ({ template, isRecommended = false }: { template: InterviewTemplate; isRecommended?: boolean }) => (
        <Card
            className={`p-4 border-border bg-card hover:shadow-md transition-all cursor-pointer ${isRecommended ? 'ring-2 ring-primary/20' : ''
                }`}
            onClick={() => onTemplateSelect(template)}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
                        {isRecommended && (
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                <Star className="h-3 w-3 mr-1" />
                                Recommended
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                </div>
                <Badge className={getLevelColor(template.level)}>
                    {template.level.charAt(0).toUpperCase() + template.level.slice(1)}
                </Badge>
            </div>

            <div className="space-y-2">
                {/* Duration and Question Count */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{template.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{template.questions.length} questions</span>
                    </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                    {template.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                        </Badge>
                    ))}
                    {template.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{template.skills.length - 3} more
                        </Badge>
                    )}
                </div>

                {/* Difficulty Distribution */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Difficulty:</span>
                    <div className="flex gap-1">
                        {template.questions.map((q, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${q.difficulty === 'easy' ? 'bg-green-400' :
                                        q.difficulty === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                                    }`}
                                title={`${q.difficulty} - ${q.prompt.substring(0, 50)}...`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Choose Interview Template</h2>
                    <p className="text-sm text-muted-foreground">Select a template that matches your role and experience level</p>
                </div>
                {userSkills.length > 0 && (
                    <Button
                        variant={showRecommended ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowRecommended(!showRecommended)}
                        className="gap-2"
                    >
                        <Star className="h-4 w-4" />
                        {showRecommended ? 'Show All' : 'Show Recommended'}
                    </Button>
                )}
            </div>

            {/* Filters */}
            <Card className="p-4 border-border bg-card">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Filters</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Industry Filter */}
                    <select
                        value={selectedIndustry}
                        onChange={(e) => setSelectedIndustry(e.target.value)}
                        className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {industries.map(industry => (
                            <option key={industry} value={industry}>
                                {industry === 'all' ? 'All Industries' : industry}
                            </option>
                        ))}
                    </select>

                    {/* Level Filter */}
                    <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {levels.map(level => (
                            <option key={level} value={level}>
                                {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                            </option>
                        ))}
                    </select>

                    {/* Clear Filters */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedIndustry('all');
                            setSelectedLevel('all');
                        }}
                        className="gap-2"
                    >
                        Clear Filters
                    </Button>
                </div>
            </Card>

            {/* Recommended Templates */}
            {showRecommended && recommendedTemplates.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Star className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Recommended for You</h3>
                        <Badge variant="outline" className="text-xs">
                            Based on your skills
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recommendedTemplates.slice(0, 3).map((template) => (
                            <TemplateCard key={template.id} template={template} isRecommended={true} />
                        ))}
                    </div>
                </div>
            )}

            {/* All Templates */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">
                        {showRecommended ? 'All Templates' : 'Available Templates'}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                        {filteredTemplates.length} templates
                    </Badge>
                </div>

                {filteredTemplates.length === 0 ? (
                    <Card className="p-8 border-border bg-card text-center">
                        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No Templates Found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Try adjusting your search criteria or filters
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedIndustry('all');
                                setSelectedLevel('all');
                            }}
                        >
                            Clear All Filters
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTemplates.map((template) => (
                            <TemplateCard key={template.id} template={template} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
