
"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WidgetCard } from '@/components/widget-card';
import useLocalStorage from '@/hooks/use-local-storage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Note {
  id: string;
  content: string;
  createdAt: number;
}

export function StickyNotesWidget() {
  const [notes, setNotes] = useLocalStorage<Note[]>('devdash-sticky-notes', []);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [currentContent, setCurrentContent] = useState('');

  const addNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content: '',
      createdAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setEditingNoteId(newNote.id);
    setCurrentContent('');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (editingNoteId === id) {
      setEditingNoteId(null);
      setCurrentContent('');
    }
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setCurrentContent(note.content);
  };

  const saveNote = (id: string) => {
    setNotes(notes.map(note => note.id === id ? { ...note, content: currentContent } : note));
    setEditingNoteId(null);
    setCurrentContent('');
  };
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentContent(e.target.value);
  };

  return (
    <WidgetCard 
      title="Sticky Notes" 
      description="Jot down quick ideas and reminders."
      headerActions={
        <Button onClick={addNote} size="sm" variant="ghost">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Note
        </Button>
      }
    >
      <ScrollArea className="flex-grow h-72 pr-3"> {/* Approx height for 3-4 notes */}
        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <StickyNoteIcon className="w-12 h-12 mb-4" />
            <p>No notes yet. Click "Add Note" to start!</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="bg-accent/30 p-4 rounded-lg shadow relative group">
              {editingNoteId === note.id ? (
                <>
                  <Textarea
                    value={currentContent}
                    onChange={handleTextareaChange}
                    className="w-full h-24 mb-2 bg-background resize-none"
                    placeholder="Your note..."
                  />
                  <Button onClick={() => saveNote(note.id)} size="sm" className="w-full">
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                </>
              ) : (
                <>
                  <div 
                    className="prose prose-sm dark:prose-invert min-h-[6rem] whitespace-pre-wrap break-words cursor-pointer" 
                    onClick={() => startEditing(note)}
                  >
                    {note.content || <span className="text-muted-foreground italic">Empty note...</span>}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                        aria-label="Delete note"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your sticky note.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteNote(note.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </WidgetCard>
  );
}

// Fallback StickyNote icon if not in lucide-react
function StickyNoteIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
      <path d="M15 3v6h6" />
    </svg>
  )
}
