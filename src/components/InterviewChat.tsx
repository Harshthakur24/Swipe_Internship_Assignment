'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentInterview, type Candidate, type Answer } from '@/store';
import { generateInterviewQuestions, evaluateAnswer, handleInterviewFlow } from '@/services/gemini';
import { MessageCircle, Clock, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

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

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (interview.status === 'in_progress' && interview.timeRemaining && interview.timeRemaining > 0) {
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
    }, [interview.timeRemaining, interview.status, dispatch]);

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
            const conversationHistory = messages.map(m => `${m.role}: ${m.text}`).slice(-10);
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
    }, [messages, interview.candidate, dispatch, addMessage, updateLastMessage, startInterview]);

    const initializeChat = useCallback(() => {
        if (interview.status === 'collecting_info' && messages.length === 0) {
            addMessage('assistant', 'Welcome! I see your resume has been uploaded. Let me help you get started with the interview process.');

            setTimeout(async () => {
                await handleGeminiFlow('Start interview process');
            }, 1000);
        }
    }, [interview.status, messages.length, addMessage, handleGeminiFlow]);

    useEffect(() => {
        initializeChat();
    }, [initializeChat]);

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

        addMessage('assistant', `Time's up! Your answer: "${answer}"`);
        addMessage('assistant', `Score: ${evaluation.score}/10 - ${evaluation.feedback}`);

        // Move to next question or complete interview
        if (interview.currentIndex + 1 < interview.questions.length) {
            const nextQuestion = interview.questions[interview.currentIndex + 1];
            addMessage('assistant', `Question ${interview.currentIndex + 2}: ${nextQuestion.prompt}`);
            dispatch({ type: 'interview/timer_tick', payload: nextQuestion.seconds });
        } else {
            completeInterview();
        }
    }, [interview.currentIndex, interview.questions, input, dispatch, addMessage, completeInterview]);

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

                updateLastMessage(`Great answer! Score: ${evaluation.score}/10`, false);
                addMessage('assistant', evaluation.feedback);

                if (interview.currentIndex + 1 < interview.questions.length) {
                    const nextQuestion = interview.questions[interview.currentIndex + 1];
                    setTimeout(() => {
                        addMessage('assistant', `Question ${interview.currentIndex + 2}: ${nextQuestion.prompt}`);
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

    return (
        <div className="space-y-6">
            {/* Interview Status */}
            {interview.status === 'in_progress' && (
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Interview in Progress</h3>
                                <p className="text-sm text-slate-600">Question {interview.currentIndex + 1} of {interview.questions.length}</p>
                            </div>
                        </div>
                        {interview.timeRemaining && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-lg">
                                <Clock className="w-4 h-4 text-red-600" />
                                <span className="text-red-700 font-semibold">{formatTime(interview.timeRemaining)}</span>
                            </div>
                        )}
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-slate-800 to-slate-900 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${((interview.currentIndex) / interview.questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="space-y-4 mb-6 max-h-96 overflow-auto pr-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                        <div className={`relative group ${m.role === 'user'
                            ? 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 text-white shadow-xl shadow-slate-900/20'
                            : 'bg-white/95 backdrop-blur-sm text-slate-800 border border-slate-200/60 shadow-lg shadow-slate-900/5'
                            } rounded-3xl px-6 py-5 max-w-[85%] transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/10`}>
                            {m.role === 'assistant' && (
                                <div className="absolute -left-3 top-4 w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                    <MessageCircle className="w-4 h-4 text-white" />
                                </div>
                            )}
                            {m.loading ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                                    <span className="text-slate-600 text-sm font-medium">{m.text}</span>
                                </div>
                            ) : (
                                <p className="leading-relaxed text-base font-medium">{m.text}</p>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {interview.status === 'collecting_info' && (
                <div className="relative">
                    <div className="flex gap-4 p-2 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-900/5">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Please provide the requested information..."
                            className="flex-1 p-5 bg-transparent text-slate-900 placeholder-slate-500 focus:outline-none transition-all duration-200 text-base font-medium"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!input.trim() || isLoading}
                            className="group relative px-8 py-5 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-900/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-3"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                            <span className="hidden sm:inline">Submit</span>
                        </button>
                    </div>
                </div>
            )}

            {interview.status === 'in_progress' && (
                <div className="relative">
                    <div className="flex gap-4 p-2 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-900/5">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Type your answer here..."
                            className="flex-1 p-5 bg-transparent text-slate-900 placeholder-slate-500 focus:outline-none transition-all duration-200 text-base font-medium"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !input.trim()}
                            className="group relative px-8 py-5 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-900/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-3"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
                            <span className="hidden sm:inline">Submit</span>
                        </button>
                    </div>
                </div>
            )}

            {interview.status === 'completed' && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-8 text-center">
                    <div className="inline-flex p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl mb-4">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Interview Completed!</h3>
                    <p className="text-slate-600 mb-4">Your interview has been successfully completed and saved.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300"
                    >
                        Start New Interview
                    </button>
                </div>
            )}
        </div>
    );
}
