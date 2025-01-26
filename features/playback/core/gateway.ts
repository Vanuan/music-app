import type { Note, PlaybackStatus, PlaybackTime } from "../../shared/types";
import type { SynthGateway } from "../../synth/core/gateway";

export interface PlaybackGateway {
  // Playback Control
  play(): Promise<void>; // Start or resume playback
  pause(): void; // Pause playback
  stop(): void; // Stop playback and reset state
  seek(time: PlaybackTime): void; // Seek to a specific time in the timeline

  // Note Management
  addNote(note: Note): void; // Add a new note to the timeline
  removeNote(noteId: string): void; // Remove a note by its ID
  getNotes(): Note[]; // Get the current list of notes

  // Playback State
  getStatus(): PlaybackStatus; // Get the current playback status (playing, paused, stopped)
  getCurrentTime(): PlaybackTime; // Get the current playback time in seconds
}

export interface PlaybackDependencies {
  synth: SynthGateway; // Dependency for audio scheduling
  timelineDuration: number; // Add timelineDuration as a dependency
}
