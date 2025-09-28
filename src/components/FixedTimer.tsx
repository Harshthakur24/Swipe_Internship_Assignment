"use client";

import React from 'react';
import { Clock, XCircle, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSelector } from 'react-redux';
import { selectCurrentInterview } from '@/store';

interface FixedTimerProps {
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

export default function FixedTimer({ onPause, onResume, onCancel }: FixedTimerProps) {
  const interview = useSelector(selectCurrentInterview);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (timeRemaining: number) => {
    if (timeRemaining <= 5) {
      return {
        background: 'bg-red-500/30',
        border: 'border-red-500/50',
        text: 'text-red-700',
        icon: 'text-red-700',
        shadow: 'shadow-red-500/20'
      };
    } else if (timeRemaining <= 10) {
      return {
        background: 'bg-yellow-500/30',
        border: 'border-yellow-500/50',
        text: 'text-yellow-700',
        icon: 'text-yellow-700',
        shadow: 'shadow-yellow-500/20'
      };
    } else {
      return {
        background: 'bg-destructive/15',
        border: 'border-destructive/20',
        text: 'text-destructive',
        icon: 'text-destructive',
        shadow: 'shadow-destructive/10'
      };
    }
  };

  // Only render if interview is in progress and has time remaining
  if (interview.status !== 'in_progress' || typeof interview.timeRemaining !== "number") {
    return null;
  }

  const timerColors = getTimerColor(interview.timeRemaining);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999]">
      <Card className="border border-border rounded-xl p-3 bg-card shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary text-primary-foreground">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Time Remaining</h3>
              <p className="text-xs text-muted-foreground">
                Question {interview.currentIndex + 1} of {interview.questions.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 border shadow-lg transition-all duration-300 ${timerColors.background} ${timerColors.border} ${timerColors.shadow}`}>
              <Clock className={`h-4 w-4 ${timerColors.icon}`} />
              <span className={`text-lg font-bold ${timerColors.text}`}>{formatTime(interview.timeRemaining)}</span>
            </div>
            {!interview.paused ? (
              <Button variant="outline" size="sm" onClick={onPause} className="gap-1 cursor-pointer">
                <Pause className="h-3 w-3" />
                <span>Pause</span>
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onResume} className="gap-1 cursor-pointer">
                <Play className="h-3 w-3" />
                <span>Resume</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onCancel} className="gap-1 bg-transparent cursor-pointer">
              <XCircle className="h-3 w-3" />
              <span>Cancel</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
