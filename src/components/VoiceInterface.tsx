"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

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

interface VoiceInterfaceProps {
    onTranscript: (text: string) => void;
    onSpeak?: (text: string) => void;
    isListening: boolean;
    isSpeaking?: boolean;
    transcript: string;
    isSupported: boolean;
}

export default function VoiceInterface({
    onTranscript,
    onSpeak,
    isListening,
    isSpeaking = false,
    transcript,
    isSupported
}: VoiceInterfaceProps) {
    // Note: Function props are intentionally non-serializable for client components
    // Use onSpeak to avoid unused variable warning
    const handleSpeak = onSpeak || (() => { });
    const [isMuted, setIsMuted] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();

            if (recognitionRef.current) {
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
                    let finalTranscript = '';
                    // let interimTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript;
                        } else {
                            // interimTranscript += transcript;
                        }
                    }

                    if (finalTranscript) {
                        onTranscript(finalTranscript);
                    }
                };

                recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
                    console.error('Speech recognition error:', event.error);
                    toast.error(`Voice recognition error: ${event.error}`);
                };

                recognitionRef.current.onend = () => {
                    // Auto-restart if we were listening
                    if (isListening) {
                        setTimeout(() => {
                            if (recognitionRef.current && isListening) {
                                recognitionRef.current.start();
                            }
                        }, 100);
                    }
                };
            }
        }
    }, [isListening, onTranscript]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
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
            toast.success('Voice recognition stopped');
        }
    };

    const speakText = (text: string) => {
        if (!voiceEnabled || isMuted) return;

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;

            utterance.onstart = () => {
                toast.success('Speaking...');
            };

            utterance.onend = () => {
                toast.success('Finished speaking');
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                toast.error('Speech synthesis failed');
            };

            speechSynthesis.speak(utterance);
        }

        // Call the onSpeak prop if provided
        handleSpeak(text);
    };

    if (!isSupported) {
        return (
            <Card className="p-4 border-destructive/20 bg-destructive/5">
                <div className="flex items-center gap-2 text-destructive">
                    <VolumeX className="h-4 w-4" />
                    <span className="text-sm">Voice features not supported in this browser</span>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-4 border-border bg-card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Voice Interface</h3>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className={`cursor-pointer ${voiceEnabled ? "bg-green-500/10 border-green-500/20" : ""}`}
                    >
                        {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsMuted(!isMuted)}
                        className={`cursor-pointer ${isMuted ? "bg-red-500/10 border-red-500/20" : ""}`}
                    >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {/* Voice Recognition Controls */}
                <div className="flex items-center gap-3">
                    <Button
                        onClick={isListening ? stopListening : startListening}
                        variant={isListening ? "destructive" : "default"}
                        size="sm"
                        className="gap-2 cursor-pointer"
                    >
                        {isListening ? (
                            <>
                                <MicOff className="h-4 w-4" />
                                Stop Listening
                            </>
                        ) : (
                            <>
                                <Mic className="h-4 w-4" />
                                Start Voice Input
                            </>
                        )}
                    </Button>

                    {isListening && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span>Listening...</span>
                        </div>
                    )}

                    {isSpeaking && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span>Speaking...</span>
                        </div>
                    )}
                </div>

                {/* Live Transcript */}
                {transcript && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-foreground">
                            <span className="font-medium">Live transcript:</span> {transcript}
                        </p>
                    </div>
                )}

                {/* Text-to-Speech Controls */}
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => speakText("Hello! I'm ready to conduct your interview. Please speak clearly and take your time with each answer.")}
                        variant="outline"
                        size="sm"
                        className="gap-2 cursor-pointer"
                        disabled={isMuted || !voiceEnabled}
                    >
                        <Volume2 className="h-4 w-4" />
                        Test Voice Output
                    </Button>
                </div>

                {/* Voice Settings */}
                <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Click &quot;Start Voice Input&quot; to speak your answers</p>
                    <p>• Use voice controls to enable/disable speech features</p>
                    <p>• AI will speak questions and feedback when enabled</p>
                </div>
            </div>
        </Card>
    );
}
