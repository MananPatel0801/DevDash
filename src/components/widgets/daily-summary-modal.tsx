
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Award, Target, CheckSquare, CalendarClock } from 'lucide-react';

interface DailySummaryProps {
  commitStreak?: number; 
  focusBlocksToday: number; 
  tasksCompletedToday: number; 
}

export function DailySummaryModal({ commitStreak = 0, focusBlocksToday, tasksCompletedToday }: DailySummaryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
    setCurrentDate(new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);
  
  // For commit streak, since it's not implemented, we'll keep a placeholder.
  // For others, we will rely on the props.
  const placeholderCommitStreak = 5;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CalendarClock className="mr-2 h-4 w-4" />
          View Daily Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Daily Summary</DialogTitle>
          <DialogDescription>
            {isClientMounted ? `Your progress for ${currentDate}.` : 'Loading summary...'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center p-3 bg-accent/20 rounded-lg">
            <Award className="h-6 w-6 mr-3 text-primary" />
            <div>
              <p className="font-semibold">Commit Streak</p>
              <p className="text-sm text-muted-foreground">
                {commitStreak > 0 ? `${commitStreak} days` : `${placeholderCommitStreak} days (sample)`}
              </p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-accent/20 rounded-lg">
            <Target className="h-6 w-6 mr-3 text-primary" />
            <div>
              <p className="font-semibold">Focus Blocks Completed</p>
              <p className="text-sm text-muted-foreground">
                {isClientMounted ? `${focusBlocksToday} blocks` : `0 blocks`}
              </p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-accent/20 rounded-lg">
            <CheckSquare className="h-6 w-6 mr-3 text-primary" />
            <div>
              <p className="font-semibold">Tasks Completed</p>
              <p className="text-sm text-muted-foreground">
                 {isClientMounted ? `${tasksCompletedToday} tasks` : `0 tasks`}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
