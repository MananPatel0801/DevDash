
"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle, Pencil, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WidgetCard } from '@/components/widget-card';
import useLocalStorage from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export function TaskListWidget() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('devdash-tasks', []);
  const [newTaskText, setNewTaskText] = useState('');
  
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ).sort((a, b) => Number(a.completed) - Number(b.completed) || b.createdAt - a.createdAt)
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    if (editingTaskId === id) { // Cancel edit if deleting the task being edited
        setEditingTaskId(null);
        setEditingTaskText('');
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTaskText('');
  };

  const saveEditing = (id: string) => {
    if (editingTaskText.trim() === '') {
      deleteTask(id); // Delete if task text becomes empty
      return;
    }
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, text: editingTaskText.trim() } : task
      )
    );
    setEditingTaskId(null);
    setEditingTaskText('');
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTaskText(e.target.value);
  };
  
  const handleEditInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, taskId: string) => {
    if (e.key === 'Enter') {
      saveEditing(taskId);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed) || b.createdAt - a.createdAt);


  return (
    <WidgetCard 
      title="Today's Tasks" 
      description="Manage your daily to-do list."
    >
      <form onSubmit={addTask} className="flex gap-2 mb-4">
        <Input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a new task..."
          className="flex-grow"
          aria-label="New task input"
        />
        <Button type="submit" size="icon" aria-label="Add task">
          <Plus className="h-5 w-5" />
        </Button>
      </form>
      <ScrollArea className="flex-grow h-60 pr-3">
        {sortedTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ListChecksIcon className="w-12 h-12 mb-4" />
            <p>No tasks yet. Add some!</p>
          </div>
        )}
        <ul className="space-y-2">
          {sortedTasks.map(task => (
            <li
              key={task.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-md transition-colors group",
                task.completed ? "bg-muted/50 hover:bg-muted/70" : "bg-card hover:bg-accent/10"
              )}
            >
              {editingTaskId === task.id ? (
                <div className="flex-grow flex items-center gap-2">
                  <Input
                    type="text"
                    value={editingTaskText}
                    onChange={handleEditInputChange}
                    onKeyDown={(e) => handleEditInputKeyDown(e, task.id)}
                    className="flex-grow h-8 text-sm"
                    autoFocus
                    aria-label={`Edit task ${task.text}`}
                  />
                  <Button variant="ghost" size="icon" onClick={() => saveEditing(task.id)} className="h-7 w-7" aria-label="Save task edit">
                    <Save className="h-4 w-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={cancelEditing} className="h-7 w-7" aria-label="Cancel task edit">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 flex-grow overflow-hidden">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskCompletion(task.id)}
                      aria-label={task.completed ? `Mark ${task.text} as incomplete` : `Mark ${task.text} as complete`}
                      className="shrink-0"
                    />
                    <label 
                      htmlFor={`task-${task.id}`} 
                      className={cn(
                        "flex-grow cursor-pointer truncate",
                        task.completed && "line-through text-muted-foreground"
                      )}
                      title={task.text}
                    >
                      {task.text}
                    </label>
                  </div>
                  <div className="flex items-center shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(task)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 mr-1"
                      aria-label={`Edit task ${task.text}`}
                    >
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                      aria-label={`Delete task ${task.text}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </WidgetCard>
  );
}

// Fallback ListChecksIcon icon if not in lucide-react
function ListChecksIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
      <path d="M3 12h2" />
      <path d="M19 12h2" />
      <path d="M12 3v2" />
      <path d="M12 19v2" />
    </svg>
  )
}
