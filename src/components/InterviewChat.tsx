'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentInterview, type Candidate, type Answer } from '@/store';
import { generateInterviewQuestions, evaluateAnswer, handleInterviewFlow } from '@/services/gemini';
import { MessageCircle, Clock, CheckCircle, ArrowRight, Loader2, XCircle } from 'lucide-react';

interface InterviewChatProps {
    onStartInterview?: () => void;
}

export default function InterviewChat({ onStartInterview }: InterviewChatProps) {
    const dispatch = useDispatch();
    const interview = useSelector(selectCurrentInterview);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; timestamp: number; loading?: boolean }>>([]);
    const [isLoading, setIsLoading] = useState(false);
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
        addMessage('assistant', 'Thinking...', true);

        try {
            // Get current messages at the time of the call to avoid stale closure
            setMessages(currentMessages => {
                const conversationHistory = currentMessages.map(m => `${m.role}: ${m.text}`).slice(-10);

                // Process the flow asynchronously
                handleInterviewFlow(userMessage, interview.candidate, conversationHistory)
                    .then(result => {
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
                    })
                    .catch(error => {
                        console.error('Error with Gemini flow:', error);
                        updateLastMessage('I apologize, I encountered an error. Please try again.', false);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });

                return currentMessages;
            });
        } catch (error) {
            console.error('Error with Gemini flow:', error);
            updateLastMessage('I apologize, I encountered an error. Please try again.', false);
            setIsLoading(false);
        }
    }, [interview.candidate, dispatch, addMessage, updateLastMessage, startInterview]);

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
    }, [dispatch]);

    const pauseInterview = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        dispatch({ type: 'interview/pause' });
        addMessage('assistant', '⏸️ Interview paused. You can resume anytime.');
    }, [dispatch, addMessage]);

    const resumeInterview = useCallback(() => {
        dispatch({ type: 'interview/resume' });
        addMessage('assistant', '▶️ Resuming interview.');
    }, [dispatch, addMessage]);

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
    }, [interview.timeRemaining, interview.status, handleAutoSubmit]);

    const handleSubmit = async () => {
        if (!input.trim() || isLoading) return;

        const userInput = input.trim();
        setInput('');

        if (interview.status === 'in_progress') {
            const currentQuestion = interview.questions[interview.currentIndex];

            addMessage('user', userInput);
            setIsLoading(true);
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
            }
        } else {
            await handleGeminiFlow(userInput);
        }
    };

    // Old handleInfoSubmit removed - now handled by Gemini flow

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQuestion = interview.questions[interview.currentIndex];

    return (
        <div className="space-y-3">
            {/* Add Resume Button - Always Visible (Top/Sticky) */}
            <div className="sticky top-0 z-40 pt-1 pb-2 bg-gradient-to-b from-white/90 to-transparent backdrop-blur supports-[backdrop-filter]:backdrop-blur">
                <div className="flex justify-end">
                    <button
                        onClick={handleAddResumeClick}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-slate-800 hover:bg-white bg-white/95 shadow-sm hover:shadow transition-all duration-200 text-sm font-bold"
                        title="Upload new resume"
                    >
                        <span className="text-base">📄</span>
                        <span>Add New Resume</span>
                    </button>
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

            {/* Interview Status */}
            {interview.status === 'in_progress' && (
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl p-3 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-md">
                                <MessageCircle className="w-3 h-3 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Interview in Progress</h3>
                                <p className="text-xs text-slate-600">Question {interview.currentIndex + 1} of {interview.questions.length}</p>
                                {currentQuestion && (
                                    <p className="text-xs text-slate-900 mt-0.5 max-w-xl truncate"><span className="font-bold">{currentQuestion.prompt}</span></p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {interview.timeRemaining && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-md">
                                    <Clock className="w-3 h-3 text-red-600" />
                                    <span className="text-xs text-red-700 font-semibold">{formatTime(interview.timeRemaining)}</span>
                                </div>
                            )}
                            {!interview.paused ? (
                                <button
                                    onClick={pauseInterview}
                                    className="flex items-center gap-1 px-2 py-1 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
                                    title="Pause interview"
                                >
                                    <span className="text-xs font-semibold">Pause</span>
                                </button>
                            ) : (
                                <button
                                    onClick={resumeInterview}
                                    className="flex items-center gap-1 px-2 py-1 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
                                    title="Resume interview"
                                >
                                    <span className="text-xs font-semibold">Resume</span>
                                </button>
                            )}
                            <button
                                onClick={cancelInterview}
                                className="flex items-center gap-1 px-2 py-1 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
                                title="Cancel current interview"
                            >
                                <XCircle className="w-3 h-3" />
                                <span className="text-xs font-semibold">Cancel</span>
                            </button>
                        </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1">
                        <div
                            className="bg-gradient-to-r from-slate-800 to-slate-900 h-1 rounded-full transition-all duration-1000"
                            style={{ width: `${((interview.currentIndex) / interview.questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Welcome Back Modal */}
            {interview.paused && interview.status === 'in_progress' && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-4 w-full max-w-sm shadow-xl border border-slate-200">
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">Welcome back!</h4>
                        <p className="text-sm text-slate-600 mb-3">You paused your interview. Would you like to resume where you left off?</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={cancelInterview} className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 text-sm">Cancel Interview</button>
                            <button onClick={resumeInterview} className="px-3 py-1.5 bg-slate-900 text-white rounded-md hover:opacity-90 text-sm">Resume</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="space-y-2 mb-4 max-h-80 overflow-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                        <div className={`relative group ${m.role === 'user'
                            ? 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 text-white shadow-xl shadow-slate-900/20'
                            : 'bg-white/95 backdrop-blur-sm text-slate-800 border border-slate-200/60 shadow-lg shadow-slate-900/5'
                            } rounded-2xl px-4 py-3 max-w-[85%] transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/10`}>
                            {m.role === 'assistant' && (
                                <div className="absolute -left-2 top-3 w-6 h-6 bg-gradient-to-br from-slate-800 to-slate-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                    <MessageCircle className="w-3 h-3 text-white" />
                                </div>
                            )}
                            {m.loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin text-slate-600" />
                                    <span className="text-slate-600 text-xs font-medium">{m.text}</span>
                                </div>
                            ) : (
                                <div>
                                    <p className="leading-relaxed text-sm font-medium">{m.text}</p>
                                    {/* Quick action buttons for specific messages */}
                                    {m.role === 'assistant' && m.text.includes('Ready to begin?') && (
                                        <div className="mt-2 flex gap-2">
                                            <button
                                                onClick={() => handleGeminiFlow('Start interview process')}
                                                className="px-3 py-1.5 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg text-sm"
                                            >
                                                🚀 Start Interview
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {interview.status === 'collecting_info' && (
                <div className="relative">
                    <div className="flex gap-2 p-2 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-900/10">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Please provide the requested information..."
                            className="flex-1 p-2 bg-transparent text-slate-900 placeholder-slate-500 focus:outline-none transition-all duration-200 text-sm font-medium"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!input.trim() || isLoading}
                            className="group relative px-3 py-2 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-900/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-1"
                        >
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            <span className="hidden sm:inline text-sm">Submit</span>
                        </button>
                    </div>
                </div>
            )}

            {interview.status === 'in_progress' && (
                <div className="relative">
                    <div className="flex gap-2 p-2 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-900/10">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Type your answer here..."
                            className="flex-1 p-2 bg-transparent text-slate-900 placeholder-slate-500 focus:outline-none transition-all duration-200 text-sm font-medium"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !input.trim()}
                            className="group relative px-3 py-2 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-900/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-1"
                        >
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />}
                            <span className="hidden sm:inline text-sm">Submit</span>
                        </button>
                    </div>
                </div>
            )}

            {interview.status === 'completed' && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 text-center">
                    <div className="inline-flex p-3 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl mb-3">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Interview Completed!</h3>
                    <p className="text-sm text-slate-600 mb-3">Your interview has been successfully completed and saved.</p>
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={restartInterview}
                            className="px-4 py-2 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-lg font-semibold hover:scale-105 transition-all duration-300 text-sm"
                        >
                            Start New Interview
                        </button>
                        <button
                            onClick={handleAddResumeClick}
                            className="px-4 py-2 border border-slate-300 text-slate-800 rounded-lg font-semibold hover:bg-white transition-all duration-300 text-sm"
                        >
                            Add New Resume
                        </button>
                    </div>
                    <input ref={fileInputRef} onChange={handleResumeSelected} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" />
                </div>
            )}
        </div>
    );
}
