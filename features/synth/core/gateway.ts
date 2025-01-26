import type { Note } from "../../shared/types";

export interface SynthGateway {
  start(): Promise<void>;
  resume(): Promise<void>;
  suspend(): Promise<void>;
  playNotes(notes: Note[], startTime: number): void;
  stopAll(): void;
  getCurrentTimeSeconds(): number;
}
