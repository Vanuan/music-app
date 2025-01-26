import type React from "react";
import { createContext, useContext, useState, useCallback } from "react";
import type { PlaybackGateway } from "../core/gateway";
import type { Note, PlaybackStatus, PlaybackTime } from "../../shared/types";
import { useAnimationFrame } from "../../shared/hooks/useAnimationFrame";

function areNotesEqual(a: Note[], b: Note[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (note, index) =>
      note.id === b[index].id &&
      note.time === b[index].time &&
      note.duration === b[index].duration &&
      note.frequency === b[index].frequency &&
      note.velocity === b[index].velocity,
  );
}

type PlaybackContextType = {
  status: PlaybackStatus;
  currentTime: PlaybackTime;
  notes: Note[];
  play: (notes: Note[]) => Promise<void>;
  pause: () => void;
  stop: () => void;
  seek: (time: PlaybackTime) => void;
  addNote: (note: Note) => void;
  removeNote: (noteId: string) => void;
};

const PlaybackContext = createContext<PlaybackContextType | null>(null);

export const PlaybackProvider: React.FC<{
  children: React.ReactNode;
  playback: PlaybackGateway;
}> = ({ children, playback }) => {
  console.log("PlaybackProvider initialized");
  const [status, setStatus] = useState<PlaybackStatus>(() =>
    playback.getStatus(),
  );
  const [notes, setNotes] = useState<Note[]>(() => playback.getNotes());
  const [currentTime, setCurrentTime] = useState<PlaybackTime>(() =>
    playback.getCurrentTime(),
  );

  const updateState = useCallback(() => {
    const newStatus = playback.getStatus();
    const newNotes = playback.getNotes();
    const newCurrentTime = playback.getCurrentTime();

    setStatus(newStatus);
    setNotes(newNotes);
    setCurrentTime(newCurrentTime);
  }, [playback]);

  useAnimationFrame(updateState);

  const contextValue: PlaybackContextType = {
    status,
    currentTime,
    notes,
    play: async () => {
      await playback.play();
      updateState();
    },
    pause: () => {
      playback.pause();
      updateState();
    },
    stop: () => {
      playback.stop();
      updateState();
    },
    seek: (time: PlaybackTime) => {
      playback.seek(time);
      updateState();
    },
    addNote: (note: Note) => {
      playback.addNote(note);
      updateState();
    },
    removeNote: (noteId: string) => {
      playback.removeNote(noteId);
      updateState();
    },
  };

  return (
    <PlaybackContext.Provider value={contextValue}>
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = () => {
  const context = useContext(PlaybackContext);
  if (!context)
    throw new Error("usePlayback must be used within a PlaybackProvider");
  return context;
};
