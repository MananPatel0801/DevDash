
"use client";

import { useState, useEffect } from 'react';
import { PomodoroTimerWidget } from "@/components/widgets/pomodoro-timer-widget";
import { StickyNotesWidget } from "@/components/widgets/sticky-notes-widget";
import { TaskListWidget } from "@/components/widgets/task-list-widget";
import { GitHubWidget } from "@/components/widgets/github-widget";
import { DailySummaryModal } from "@/components/widgets/daily-summary-modal";
import useLocalStorage from '@/hooks/use-local-storage';
import { format } from 'date-fns';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface PomodoroStats {
  date: string; // YYYY-MM-DD
  focusBlocksCompleted: number;
}

const TASKS_KEY = 'devdash-tasks';
const POMODORO_STATS_KEY = 'devdash-pomodoro-stats';

export default function DevDashPage() {
  const [tasks] = useLocalStorage<Task[]>(TASKS_KEY, []);
  const [pomodoroStats] = useLocalStorage<PomodoroStats | null>(POMODORO_STATS_KEY, null);
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  const tasksCompletedToday = isClientMounted 
    ? tasks.filter(task => task.completed).length 
    : 0;

  const focusBlocksToday = isClientMounted && pomodoroStats && pomodoroStats.date === format(new Date(), 'yyyy-MM-dd')
    ? pomodoroStats.focusBlocksCompleted
    : 0;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-end mb-6">
        <DailySummaryModal 
          tasksCompletedToday={tasksCompletedToday} 
          focusBlocksToday={focusBlocksToday} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="md:col-span-2 xl:col-span-1">
         <GitHubWidget />
        </div>
        
        <div>
          <PomodoroTimerWidget />
        </div>
        
        <div>
          <TaskListWidget />
        </div>

        <div className="md:col-span-2 xl:col-span-3">
          <StickyNotesWidget />
        </div>
      </div>
    </div>
  );
}
