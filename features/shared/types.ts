export interface Note {
  id: string;
  time: number;
  duration: number;
  frequency: number;
  velocity?: number;
}

export type PlaybackStatus = "stopped" | "playing" | "paused";

export interface PlaybackTime {
  seconds: number; // Playback time in seconds
}

export interface TimelineTime {
  seconds: number; // Time in the audio context's timeline
}

export interface ChronologicalTime {
  milliseconds: number; // Real-world time in milliseconds (e.g., performance.now())
}
