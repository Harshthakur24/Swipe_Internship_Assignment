"use client";

import React, { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Language {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
    supported: boolean;
}

interface LanguageSelectorProps {
    selectedLanguage: string;
    onLanguageChange: (language: string) => void;
    className?: string;
}

const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', supported: true },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', supported: true },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', supported: true },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', supported: true },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', supported: true },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', supported: true },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', supported: true },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', supported: true },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', supported: true },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', supported: true },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', supported: false },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', supported: false },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', supported: false },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', supported: false },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', supported: false }
];

export default function LanguageSelector({
    selectedLanguage,
    onLanguageChange,
    className = ""
}: LanguageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];
    const filteredLanguages = languages.filter(lang =>
        lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const supportedLanguages = filteredLanguages.filter(lang => lang.supported);
    const comingSoonLanguages = filteredLanguages.filter(lang => !lang.supported);

    const handleLanguageSelect = (languageCode: string) => {
        onLanguageChange(languageCode);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`relative ${className}`}>
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="gap-2 min-w-[140px] justify-between"
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">{selectedLang.flag}</span>
                    <span className="text-sm">{selectedLang.name}</span>
                </div>
                <ChevronDown className="h-4 w-4" />
            </Button>

            {isOpen && (
                <Card className="absolute top-full left-0 mt-2 w-80 z-50 border-border bg-card shadow-lg">
                    <div className="p-4">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-3">
                            <Globe className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold text-foreground">Select Language</h3>
                        </div>

                        {/* Search */}
                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder="Search languages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Supported Languages */}
                        {supportedLanguages.length > 0 && (
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs">
                                        Available
                                    </Badge>
                                </div>
                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {supportedLanguages.map((language) => (
                                        <button
                                            key={language.code}
                                            onClick={() => handleLanguageSelect(language.code)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors ${selectedLanguage === language.code ? 'bg-primary/10 text-primary' : 'text-foreground'
                                                }`}
                                        >
                                            <span className="text-lg">{language.flag}</span>
                                            <div className="flex-1 text-left">
                                                <div className="font-medium">{language.name}</div>
                                                <div className="text-xs text-muted-foreground">{language.nativeName}</div>
                                            </div>
                                            {selectedLanguage === language.code && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Coming Soon Languages */}
                        {comingSoonLanguages.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
                                        Coming Soon
                                    </Badge>
                                </div>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {comingSoonLanguages.map((language) => (
                                        <div
                                            key={language.code}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md opacity-50 cursor-not-allowed"
                                        >
                                            <span className="text-lg">{language.flag}</span>
                                            <div className="flex-1 text-left">
                                                <div className="font-medium text-muted-foreground">{language.name}</div>
                                                <div className="text-xs text-muted-foreground">{language.nativeName}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-4 pt-3 border-t border-border">
                            <p className="text-xs text-muted-foreground text-center">
                                Language affects AI responses and interface text
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
