import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface RealtimeNote {
  id: string;
  title: string;
  subject: string;
  status: string;
  created_at: string;
  topper_id: string;
}

/**
 * Hook for real-time note updates in admin panel
 * Subscribes to INSERT, UPDATE, DELETE events on notes table
 */
export function useRealtimeNotes() {
  const [notes, setNotes] = useState<RealtimeNote[]>([]);
  const [newNoteNotification, setNewNoteNotification] = useState<RealtimeNote | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('🔴 Setting up Supabase Realtime subscription for notes...');

    // Subscribe to all changes in the notes table
    const subscription = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'notes',
        },
        (payload) => {
          console.log('📡 Realtime event received:', payload);

          if (payload.eventType === 'INSERT') {
            const newNote = payload.new as RealtimeNote;
            console.log('✅ New note uploaded:', newNote.title);
            
            // Show notification for new note
            setNewNoteNotification(newNote);
            
            // Clear notification after 5 seconds
            setTimeout(() => setNewNoteNotification(null), 5000);
            
            // Add to notes list
            setNotes(prev => [newNote, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedNote = payload.new as RealtimeNote;
            console.log('🔄 Note updated:', updatedNote.title);
            
            // Update in notes list
            setNotes(prev => 
              prev.map(note => 
                note.id === updatedNote.id ? updatedNote : note
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedNote = payload.old as RealtimeNote;
            console.log('🗑️ Note deleted:', deletedNote.id);
            
            // Remove from notes list
            setNotes(prev => prev.filter(note => note.id !== deletedNote.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Cleanup on unmount
    return () => {
      console.log('🔴 Unsubscribing from notes realtime...');
      subscription.unsubscribe();
    };
  }, []);

  return {
    notes,
    newNoteNotification,
    isConnected,
  };
}
