'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentInterview, type Candidate, type Answer } from '@/store';
import { generateInterviewQuestions, evaluateAnswer, handleInterviewFlow } from '@/services/gemini';
import { MessageCircle, CheckCircle, ArrowRight, Loader2, Upload, Bot, User, Mic, MicOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import toast from 'react-hot-toast';
import SentimentAnalysis from './SentimentAnalysis';
import InterviewAnalytics from './InterviewAnalytics';
import LanguageSelector from './LanguageSelector';
import InterviewTemplateSelector from './InterviewTemplateSelector';

// Type declarations for speech recognition
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
}

declare global {
    interface Window {
        webkitSpeechRecognition: new () => SpeechRecognition;
        SpeechRecognition: new () => SpeechRecognition;
    }
}

interface InterviewChatProps {
    onStartInterview?: () => void;
    onResume?: () => void;
    onCancel?: () => void;
}

export default function InterviewChat({ onStartInterview, onResume, onCancel }: InterviewChatProps) {
    const dispatch = useDispatch();
    const interview = useSelector(selectCurrentInterview);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; timestamp: number; loading?: boolean }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasShown10SecondWarning, setHasShown10SecondWarning] = useState(false);

    // New feature states
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const initializedRef = useRef(false);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const addMessage = useCallback((role: 'user' | 'assistant', text: string, loading = false) => {
        setMessages(prev => [...prev, { role, text, timestamp: Date.now(), loading }]);
    }, []);

    const updateLastMessage = useCallback((text: string, loading = false) => {
        setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages.length > 0) {
                newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], text, loading };
            }
            return newMessages;
        });
    }, []);

    // Keep interview feedback concise (single short sentence or ~180 chars)
    const getShortFeedback = useCallback((text: string) => {
        const cleaned = (text || '').replace(/\s+/g, ' ').trim();
        if (cleaned.length <= 180) return cleaned;
        const firstSentence = cleaned.split(/(?<=[.!?])\s/)[0] || cleaned;
        if (firstSentence.length <= 180) return firstSentence;
        return cleaned.slice(0, 180) + '…';
    }, []);


    // Check if voice features are supported
    const isVoiceSupported = typeof window !== 'undefined' &&
        ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) &&
        'speechSynthesis' in window;

    // Voice recognition setup
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (isVoiceSupported && typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();

            if (recognitionRef.current) {
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript;
                        }
                    }
                    if (finalTranscript) {
                        setInput(finalTranscript);
                    }
                };

                recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
                    console.error('Speech recognition error:', event.error);
                    toast.error(`Voice recognition error: ${event.error}`);
                    setIsListening(false);
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };
            }
        }
    }, [isVoiceSupported]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                toast.success('Voice recognition started');
            } catch (error) {
                console.error('Error starting speech recognition:', error);
                toast.error('Failed to start voice recognition');
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
            toast.success('Voice recognition stopped');
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (interview.status === 'in_progress' && !interview.paused && interview.timeRemaining && interview.timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                dispatch({ type: 'interview/timer_tick', payload: interview.timeRemaining! - 1 });
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [interview.timeRemaining, interview.status, interview.paused, dispatch]);

    const startInterview = useCallback(async () => {
        if (!interview.candidate) return;

        setIsLoading(true);
        setHasShown10SecondWarning(false); // Reset warning state for new interview
        addMessage('assistant', 'Generating personalized interview questions...', true);

        try {
            const interviewData = await generateInterviewQuestions();
            const questions = interviewData.questions;

            dispatch({
                type: 'interview/start',
                payload: { candidate: interview.candidate, questions }
            });

            updateLastMessage(`Perfect! I've generated ${questions.length} questions for your interview. You'll have ${questions[0].seconds} seconds to answer each question. Here's your first question:`, false);
            addMessage('assistant', `Question 1: ${questions[0].prompt}`);

            dispatch({ type: 'interview/timer_tick', payload: questions[0].seconds });
        } catch (error) {
            console.error('Error generating questions:', error);
            updateLastMessage('I encountered an error generating questions. Please try again.', false);
        } finally {
            setIsLoading(false);
        }
    }, [interview.candidate, dispatch, addMessage, updateLastMessage]);

    const handleGeminiFlow = useCallback(async (userMessage: string) => {
        if (!userMessage.trim()) return;

        setIsLoading(true);
        addMessage('user', userMessage);
        addMessage('assistant', 'Generating personalized interview questions...', true);

        try {
            // Get current messages directly to avoid stale closure issues
            const currentMessages = messages;
            const conversationHistory = currentMessages.map(m => `${m.role}: ${m.text}`).slice(-10);

            // Process the flow asynchronously
            const result = await handleInterviewFlow(userMessage, interview.candidate, conversationHistory);

            updateLastMessage(result.response, false);

            if (result.action === 'start_interview') {
                setTimeout(() => {
                    startInterview();
                }, 1500);
            } else if (result.action === 'info_received') {
                // Extract info from user message and update candidate
                const updates: Partial<Candidate> = {};
                const lowerMessage = userMessage.toLowerCase();

                if (lowerMessage.includes('@') && !interview.candidate?.email) {
                    updates.email = userMessage;
                } else if (lowerMessage.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) && !interview.candidate?.phone) {
                    updates.phone = userMessage;
                } else if (!interview.candidate?.name || interview.candidate.name === 'Unknown Candidate') {
                    updates.name = userMessage;
                }

                if (Object.keys(updates).length > 0) {
                    dispatch({ type: 'interview/collect_info', payload: updates });
                }
            }
        } catch (error) {
            console.error('Error with Gemini flow:', error);
            updateLastMessage('I apologize, I encountered an error. Please try again.', false);
        } finally {
            setIsLoading(false);
        }
    }, [interview.candidate, dispatch, addMessage, updateLastMessage, startInterview, messages]);

    const initializeChat = useCallback(() => {
        if (interview.status === 'collecting_info' && messages.length === 0 && !initializedRef.current) {
            initializedRef.current = true;
            addMessage('assistant', 'Welcome! I see your resume has been uploaded. Let me help you get started with the interview process.');

            // Add a quick action button instead of auto-triggering
            setTimeout(() => {
                addMessage('assistant', 'Ready to begin? Click the button below to start your interview setup.');
            }, 1500);
        }
    }, [interview.status, messages.length, addMessage]);

    useEffect(() => {
        initializeChat();
    }, [initializeChat]);

    const cancelInterview = useCallback(() => {
        const confirmed = window.confirm('Are you sure you want to cancel the current interview? Progress will be lost.');
        if (!confirmed) return;

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setInput('');
        setMessages([]);
        setIsLoading(false);
        initializedRef.current = false;

        dispatch({ type: 'interview/reset' });
        onCancel?.();
    }, [dispatch, onCancel]);


    const restartInterview = useCallback(async () => {
        const existingCandidate = interview.candidate;

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setInput('');
        setMessages([]);
        setIsLoading(false);
        initializedRef.current = false;

        dispatch({ type: 'interview/reset' });

        if (existingCandidate) {
            dispatch({ type: 'interview/start_candidate', payload: { candidate: existingCandidate } });
        } else {
            dispatch({ type: 'interview/update_status', payload: 'collecting_info' });
        }

        setTimeout(() => {
            handleGeminiFlow('Start interview process');
        }, 300);
    }, [dispatch, interview.candidate, handleGeminiFlow]);

    const handleAddResumeClick = () => {
        fileInputRef.current?.click();
    };

    const handleResumeSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setIsLoading(true);
            const form = new FormData();
            form.append('file', file);
            const res = await fetch('/api/parse-resume', { method: 'POST', body: form });
            if (!res.ok) throw new Error(`Parse failed (${res.status})`);
            const json = await res.json();

            const extracted = json.extracted || {};
            const newCandidate: Candidate = {
                id: crypto.randomUUID(),
                name: extracted.name || 'Unknown Candidate',
                email: extracted.email || 'unknown@example.com',
                phone: extracted.phone || '',
                score: 0,
                status: 'not_started',
            };

            dispatch({ type: 'candidates/add', payload: newCandidate });
            dispatch({ type: 'interview/reset' });
            dispatch({ type: 'interview/start_candidate', payload: { candidate: newCandidate } });

            setMessages([]);
            initializedRef.current = false;
            addMessage('assistant', 'Resume uploaded successfully. I\'ll guide you through the setup.');
            setTimeout(() => handleGeminiFlow('Start interview process'), 600);
        } catch (err) {
            console.error('Resume parse failed', err);
            addMessage('assistant', 'I could not read that resume. Please try another file.');
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const completeInterview = useCallback(async () => {
        // Calculate total score
        const totalScore = interview.answers.reduce((sum: number, answer: Answer) => sum + (answer.score || 0), 0);

        const summary = {
            totalScore,
            perQuestion: interview.answers.map((answer: Answer) => ({
                questionId: answer.questionId,
                score: answer.score || 0,
                feedback: answer.feedback || ''
            })),
            notes: `Interview completed with ${totalScore}/60 total score. ${totalScore >= 45 ? 'Strong performance!' : totalScore >= 30 ? 'Good performance with room for improvement.' : 'Consider reviewing fundamental concepts.'}`
        };

        dispatch({ type: 'interview/complete', payload: { summary } });

        addMessage('assistant', `🎉 Interview completed! Your total score: ${totalScore}/60`);
        addMessage('assistant', summary.notes);

        onStartInterview?.(); // Trigger callback to update parent
    }, [interview.answers, dispatch, onStartInterview, addMessage]);

    const handleAutoSubmit = useCallback(async () => {
        if (interview.currentIndex >= interview.questions.length) return;

        const currentQuestion = interview.questions[interview.currentIndex];
        const answer = input.trim() || 'No answer provided (time expired)';

        dispatch({
            type: 'interview/submit_answer',
            payload: {
                questionId: currentQuestion.id,
                content: answer,
                autoSubmitted: true
            }
        });

        setInput('');

        // Evaluate the answer
        const evaluation = await evaluateAnswer(currentQuestion, answer);

        addMessage('assistant', `⏰ Time's up! Your answer: "${answer}"`);
        addMessage('assistant', `📊 Score: ${evaluation.score}/10\n${getShortFeedback(evaluation.feedback)}`);

        // Move to next question or complete interview
        if (interview.currentIndex + 1 < interview.questions.length) {
            const nextQuestion = interview.questions[interview.currentIndex + 1];
            addMessage('assistant', `\n📝 Question ${interview.currentIndex + 2}/${interview.questions.length} (${nextQuestion.difficulty.toUpperCase()}) - ${nextQuestion.seconds}s:\n${nextQuestion.prompt}`);
            dispatch({ type: 'interview/timer_tick', payload: nextQuestion.seconds });
        } else {
            completeInterview();
        }
    }, [interview.currentIndex, interview.questions, input, dispatch, addMessage, completeInterview, getShortFeedback]);

    // Remove the old checkMissingInfo logic - now handled by Gemini

    useEffect(() => {
        if (interview.timeRemaining === 0 && interview.status === 'in_progress') {
            // Auto-submit when time runs out
            handleAutoSubmit();
        }

        // Show toast notifications for time warnings
        if (interview.status === 'in_progress' && typeof interview.timeRemaining === 'number') {
            if (interview.timeRemaining === 10 && !hasShown10SecondWarning) {
                toast('⏰ 10 seconds left!', {
                    duration: 3000,
                    style: {
                        background: '#fbbf24',
                        color: '#000',
                        fontWeight: 'bold',
                    },
                });
                setHasShown10SecondWarning(true);
            }

            if (interview.timeRemaining === 5) {
                toast('🚨 5 seconds left!', {
                    duration: 2000,
                    style: {
                        background: '#ef4444',
                        color: '#fff',
                        fontWeight: 'bold',
                    },
                });
            }
        }
    }, [interview.timeRemaining, interview.status, handleAutoSubmit, hasShown10SecondWarning]);

    const handleSubmit = async () => {
        if (!input.trim() || isLoading) return;

        const userInput = input.trim();
        setInput('');

        if (interview.status === 'in_progress') {
            const currentQuestion = interview.questions[interview.currentIndex];

            addMessage('user', userInput);
            setCurrentAnswer(userInput); // Track current answer for analysis
            setIsLoading(true);
            setIsAnalyzing(true);
            addMessage('assistant', 'Evaluating your answer...', true);

            try {
                const evaluation = await evaluateAnswer(currentQuestion, userInput);

                dispatch({
                    type: 'interview/submit_answer',
                    payload: { questionId: currentQuestion.id, content: userInput, autoSubmitted: false }
                });

                updateLastMessage(`✅ Answer submitted! Score: ${evaluation.score}/10`, false);
                addMessage('assistant', getShortFeedback(evaluation.feedback));

                if (interview.currentIndex + 1 < interview.questions.length) {
                    const nextQuestion = interview.questions[interview.currentIndex + 1];
                    setTimeout(() => {
                        addMessage('assistant', `\n📝 Question ${interview.currentIndex + 2}/${interview.questions.length} (${nextQuestion.difficulty.toUpperCase()}) - ${nextQuestion.seconds}s:\n${nextQuestion.prompt}`);
                        dispatch({ type: 'interview/timer_tick', payload: nextQuestion.seconds });
                    }, 2000);
                } else {
                    setTimeout(() => completeInterview(), 2000);
                }
            } catch (error) {
                console.error('Error evaluating answer:', error);
                updateLastMessage('I encountered an error evaluating your answer. Please try again.', false);
            } finally {
                setIsLoading(false);
                setIsAnalyzing(false);
            }
        } else {
            await handleGeminiFlow(userInput);
        }
    };

    // Old handleInfoSubmit removed - now handled by Gemini flow


    const currentQuestion = interview.questions[interview.currentIndex];

    return (
        <div className="space-y-4">
            {/* Add top padding when timer is visible to prevent content overlap */}
            {interview.status === 'in_progress' && typeof interview.timeRemaining === "number" && (
                <div className="h-20"></div>
            )}
            {/* Sticky action bar */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur py-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <LanguageSelector
                            selectedLanguage={selectedLanguage}
                            onLanguageChange={setSelectedLanguage}
                        />
                        {interview.status === 'collecting_info' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                                className="gap-2"
                            >
                                <Bot className="h-4 w-4" />
                                <span>Choose Template</span>
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleAddResumeClick}
                            className="gap-2 bg-transparent"
                            aria-label="Upload new resume"
                        >
                            <Upload className="h-4 w-4" />
                            <span>Add New Resume</span>
                        </Button>
                    </div>
                </div>
            </div>
            {/* Hidden input to handle resume uploads globally */}
            <input
                ref={fileInputRef}
                onChange={handleResumeSelected}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
            />

            {/* Template Selector */}
            {showTemplateSelector && (
                <InterviewTemplateSelector
                    onTemplateSelect={(template) => {
                        setShowTemplateSelector(false);
                        // TODO: Apply template to interview
                        toast.success(`Selected ${template.name} template`);
                    }}
                    userSkills={['JavaScript', 'React', 'Node.js']}
                    experienceLevel="mid"
                />
            )}



            {/* Sentiment Analysis */}
            {interview.status === 'in_progress' && (
                <SentimentAnalysis
                    currentAnswer={currentAnswer}
                    isAnalyzing={isAnalyzing}
                />
            )}


            {/* Current Question - Always visible during interview */}
            {interview.status === 'in_progress' && currentQuestion && (
                <Card className="border border-border rounded-xl p-4 bg-card">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-md bg-primary text-primary-foreground">
                            <MessageCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-foreground mb-2">Current Question</h3>
                            <p className="text-sm text-foreground leading-relaxed">
                                <span className="font-medium">{currentQuestion.prompt}</span>
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-muted">
                        <div
                            className="h-1.5 rounded-full bg-primary transition-all"
                            style={{ width: `${(interview.currentIndex / interview.questions.length) * 100}%` }}
                        />
                    </div>
                </Card>
            )}

            {/* Paused modal */}
            {interview.paused && interview.status === 'in_progress' && (
                <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <Card className="w-full max-w-sm p-4 border border-border bg-card">
                        <h4 className="text-base font-semibold text-foreground mb-2">Welcome back</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            You paused your interview. Would you like to resume where you left off?
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={cancelInterview} className="cursor-pointer">
                                Cancel Interview
                            </Button>
                            <Button size="sm" onClick={() => {
                                dispatch({ type: 'interview/resume' });
                                addMessage('assistant', '▶️ Resuming interview.');
                                onResume?.();
                            }} className="cursor-pointer">
                                Resume
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Messages */}
            <Card className="border border-border rounded-xl p-3 bg-card">
                <div className="max-h-96 overflow-auto pr-1">
                    <div className="space-y-3">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                {/* Profile Icon */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                    }`}>
                                    {m.role === "user" ? (
                                        <User className="h-4 w-4" />
                                    ) : (
                                        <Bot className="h-4 w-4" />
                                    )}
                                </div>

                                {/* Message Content */}
                                <div
                                    className={[
                                        "rounded-2xl px-4 py-3 max-w-[85%] transition-all",
                                        m.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-background border border-border text-foreground",
                                    ].join(" ")}
                                >
                                    {m.loading ? (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            <span className="text-xs">{m.text}</span>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-sm leading-relaxed">{m.text}</p>
                                            {/* Quick action buttons for specific messages */}
                                            {m.role === 'assistant' && m.text.includes('Ready to begin?') && (
                                                <div className="mt-2 flex gap-2">
                                                    <Button
                                                        onClick={() => handleGeminiFlow('Start interview process')}
                                                        size="sm"
                                                        className="gap-1"
                                                    >
                                                        🚀 Start Interview
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </Card>

            {/* Inputs */}
            {interview.status === 'collecting_info' && (
                <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            placeholder="Please provide the requested information..."
                            className="bg-transparent text-base py-4 h-14 min-h-[3.5rem]"
                            aria-label="Interview info input"
                        />
                        {isVoiceSupported && (
                            <Button
                                onClick={isListening ? stopListening : startListening}
                                variant={isListening ? "destructive" : "outline"}
                                size="sm"
                                className="gap-2 h-14 px-4 cursor-pointer"
                            >
                                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                <span className="hidden sm:inline">{isListening ? 'Stop' : 'Voice'}</span>
                            </Button>
                        )}
                        <Button onClick={handleSubmit} disabled={!input.trim() || isLoading} className="gap-2 h-14 px-6 cursor-pointer">
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                            <span className="hidden sm:inline">Submit</span>
                        </Button>
                    </div>
                    {/* Voice indicator */}
                    {isListening && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span>Listening... Speak your response</span>
                        </div>
                    )}
                </div>
            )}

            {interview.status === 'in_progress' && (
                <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            placeholder="Type your answer here..."
                            className="bg-transparent text-base py-4 h-14 min-h-[3.5rem]"
                            aria-label="Answer input"
                        />
                        {isVoiceSupported && (
                            <Button
                                onClick={isListening ? stopListening : startListening}
                                variant={isListening ? "destructive" : "outline"}
                                size="sm"
                                className="gap-2 h-14 px-4 cursor-pointer"
                            >
                                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                <span className="hidden sm:inline">{isListening ? 'Stop' : 'Voice'}</span>
                            </Button>
                        )}
                        <Button onClick={handleSubmit} disabled={!input.trim() || isLoading} className="gap-2 h-14 px-6 cursor-pointer">
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                            <span className="hidden sm:inline">Submit</span>
                        </Button>
                    </div>
                    {/* Voice indicator */}
                    {isListening && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span>Listening... Speak your answer</span>
                        </div>
                    )}
                </div>
            )}

            {interview.status === 'completed' && (
                <Card className="border border-border rounded-2xl p-5 bg-card text-center">
                    <div className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground p-3 mb-3">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Interview Completed</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Your interview has been successfully completed and saved.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            onClick={restartInterview}
                            className="cursor-pointer"
                        >
                            Start New Interview
                        </Button>
                        <Button variant="outline" onClick={handleAddResumeClick} className="cursor-pointer">
                            Add New Resume
                        </Button>
                    </div>
                    <input ref={fileInputRef} onChange={handleResumeSelected} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" />
                </Card>
            )}

            {/* Interview Analytics */}
            {interview.status === 'completed' && (
                <InterviewAnalytics
                    interviewData={interview}
                    isCompleted={true}
                />
            )}
        </div>
    );
}
