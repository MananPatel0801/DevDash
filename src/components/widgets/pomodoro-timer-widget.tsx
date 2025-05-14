
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WidgetCard } from '@/components/widget-card';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import useLocalStorage from '@/hooks/use-local-storage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';

type SessionType = 'focus' | 'break';

interface PomodoroStats {
  date: string; // YYYY-MM-DD
  focusBlocksCompleted: number;
}

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;
const POMODORO_STATS_KEY = 'devdash-pomodoro-stats';

export function PomodoroTimerWidget() {
  const [customFocusMinutes, setCustomFocusMinutes] = useLocalStorage('pomodoro-focus-minutes', DEFAULT_FOCUS_MINUTES);
  const [customBreakMinutes, setCustomBreakMinutes] = useLocalStorage('pomodoro-break-minutes', DEFAULT_BREAK_MINUTES);
  const [pomodoroStats, setPomodoroStats] = useLocalStorage<PomodoroStats | null>(POMODORO_STATS_KEY, null);
  
  const FOCUS_DURATION = customFocusMinutes * 60;
  const BREAK_DURATION = customBreakMinutes * 60;

  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [isActive, setIsActive] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(() => 
    sessionType === 'focus' ? (DEFAULT_FOCUS_MINUTES * 60) : (DEFAULT_BREAK_MINUTES * 60)
  );
  
  const [isClientMounted, setIsClientMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClientMounted(true);
  }, []);
  
  useEffect(() => {
    if (isClientMounted && !isActive) {
      setTimeLeft(sessionType === 'focus' ? FOCUS_DURATION : BREAK_DURATION);
    }
  }, [isClientMounted, sessionType, FOCUS_DURATION, BREAK_DURATION, isActive, customFocusMinutes, customBreakMinutes]);

  useEffect(() => {
    if (!isClientMounted) return; 

    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) { 
      setIsActive(false);
      const newSessionType: SessionType = sessionType === 'focus' ? 'break' : 'focus';
      const newDuration = newSessionType === 'focus' ? FOCUS_DURATION : BREAK_DURATION;
      
      setSessionType(newSessionType);
      setTimeLeft(newDuration);
      
      toast({
        title: `Pomodoro: ${sessionType === 'focus' ? 'Focus' : 'Break'} session ended!`,
        description: `Starting ${newSessionType} session.`,
      });

      if (sessionType === 'focus') {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        setPomodoroStats(prevStats => {
          if (prevStats && prevStats.date === todayStr) {
            return { ...prevStats, focusBlocksCompleted: prevStats.focusBlocksCompleted + 1 };
          }
          return { date: todayStr, focusBlocksCompleted: 1 };
        });
      }

      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(e => console.warn("Audio play failed. Ensure /sounds/notification.mp3 exists in public.", e));
      } catch (e) {
        console.warn("Audio notification failed", e);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isClientMounted, isActive, timeLeft, sessionType, toast, FOCUS_DURATION, BREAK_DURATION, setPomodoroStats]);

  const toggleTimer = () => {
    if (!isClientMounted) return;
    if (!isActive && timeLeft === 0) {
       setTimeLeft(sessionType === 'focus' ? FOCUS_DURATION : BREAK_DURATION);
    }
    setIsActive(!isActive);
  };

  const resetTimer = useCallback(() => {
    if (!isClientMounted) return;
    setIsActive(false);
    setTimeLeft(sessionType === 'focus' ? FOCUS_DURATION : BREAK_DURATION);
  }, [isClientMounted, sessionType, FOCUS_DURATION, BREAK_DURATION]);
  
  const switchSession = useCallback((newSession: SessionType) => {
    if (!isClientMounted) return;
    setIsActive(false);
    setSessionType(newSession);
    setTimeLeft(newSession === 'focus' ? FOCUS_DURATION : BREAK_DURATION);
  }, [isClientMounted, FOCUS_DURATION, BREAK_DURATION]);

  const adjustDuration = (type: 'focus' | 'break', operation: 'increment' | 'decrement') => {
    if (!isClientMounted) return;
    const setter = type === 'focus' ? setCustomFocusMinutes : setCustomBreakMinutes;
    const currentValue = type === 'focus' ? customFocusMinutes : customBreakMinutes;
    
    let newValue = currentValue;
    if (operation === 'increment') {
      newValue = Math.min(currentValue + 1, 999);
    } else {
      newValue = Math.max(currentValue - 1, 1);
    }
    setter(newValue);

    if (!isActive) { // if timer not running, update timeLeft immediately for current session
      if (type === 'focus' && sessionType === 'focus') {
        setTimeLeft(newValue * 60);
      } else if (type === 'break' && sessionType === 'break') {
        setTimeLeft(newValue * 60);
      }
    }
  };


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const displayFocusMinutes = isClientMounted ? customFocusMinutes : DEFAULT_FOCUS_MINUTES;
  const displayBreakMinutes = isClientMounted ? customBreakMinutes : DEFAULT_BREAK_MINUTES;

  const timeToDisplayOnInitialRender = sessionType === 'focus' ? (DEFAULT_FOCUS_MINUTES * 60) : (DEFAULT_BREAK_MINUTES * 60);
  const finalTimeToDisplay = isClientMounted ? timeLeft : timeToDisplayOnInitialRender;

  const totalDurationForInitialRender = sessionType === 'focus' ? (DEFAULT_FOCUS_MINUTES * 60) : (DEFAULT_BREAK_MINUTES * 60);
  const currentTotalDuration = isClientMounted ? (sessionType === 'focus' ? FOCUS_DURATION : BREAK_DURATION) : totalDurationForInitialRender;
  
  const progressPercentage = currentTotalDuration > 0 ? ((currentTotalDuration - finalTimeToDisplay) / currentTotalDuration) * 100 : 0;


  return (
    <WidgetCard 
      title="Pomodoro Timer"
      description="Manage work intervals. Durations are in minutes."
      headerActions={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!isClientMounted}>
              <Settings className="h-5 w-5" />
              <span className="sr-only">Timer Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Session Durations (min)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent cursor-default">
              <div className="flex items-center justify-between w-full space-x-2 py-1">
                <Label htmlFor="focus-duration-display" className="text-sm whitespace-nowrap">Focus Duration:</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => adjustDuration('focus', 'decrement')}
                    disabled={!isClientMounted || customFocusMinutes <= 1}
                    aria-label="Decrease focus duration"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span id="focus-duration-display" className="text-sm w-8 text-center tabular-nums">{displayFocusMinutes}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => adjustDuration('focus', 'increment')}
                    disabled={!isClientMounted || customFocusMinutes >= 999}
                    aria-label="Increase focus duration"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent cursor-default">
              <div className="flex items-center justify-between w-full space-x-2 py-1">
                <Label htmlFor="break-duration-display" className="text-sm whitespace-nowrap">Break Duration:</Label>
                 <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => adjustDuration('break', 'decrement')}
                    disabled={!isClientMounted || customBreakMinutes <= 1}
                    aria-label="Decrease break duration"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span id="break-duration-display" className="text-sm w-8 text-center tabular-nums">{displayBreakMinutes}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => adjustDuration('break', 'increment')}
                    disabled={!isClientMounted || customBreakMinutes >= 999}
                    aria-label="Increase break duration"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <div className="flex flex-col items-center justify-center h-full space-y-6 pt-4">
        <div className="text-center">
           <Badge variant={sessionType === 'focus' ? 'default' : 'secondary'} className="text-lg px-3 py-1 mb-2">
            {sessionType === 'focus' ? (
              <Brain className="w-4 h-4 mr-2" />
            ) : (
              <Coffee className="w-4 h-4 mr-2" />
            )}
            {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)}
          </Badge>
          <div className="text-6xl font-mono font-semibold tabular-nums">
            {formatTime(finalTimeToDisplay)}
          </div>
        </div>
        
        <Progress value={progressPercentage} className="w-full h-3" />

        <div className="flex space-x-3">
          <Button onClick={toggleTimer} variant="default" size="lg" className="w-28" disabled={!isClientMounted}>
            {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="lg" disabled={!isClientMounted}>
            <RotateCcw className="mr-2 h-5 w-5" />
            Reset
          </Button>
        </div>
         <div className="flex space-x-2">
          <Button 
            onClick={() => switchSession('focus')} 
            variant={sessionType === 'focus' ? 'secondary' : 'ghost'} 
            size="sm"
            disabled={!isClientMounted || (sessionType === 'focus' && isActive)}
          >
            Focus Session
          </Button>
          <Button 
            onClick={() => switchSession('break')} 
            variant={sessionType === 'break' ? 'secondary' : 'ghost'} 
            size="sm"
            disabled={!isClientMounted || (sessionType === 'break' && isActive)}
          >
            Break Session
          </Button>
        </div>
      </div>
    </WidgetCard>
  );
}
