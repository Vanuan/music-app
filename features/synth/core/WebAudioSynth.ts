"use client";
import type { Note } from "../../shared/types";
import type { SynthGateway } from "./gateway";

export class WebAudioSynth implements SynthGateway {
  private audioContext: AudioContext;
  private oscillators: Map<string, OscillatorNode>;
  private gains: Map<string, GainNode>;

  constructor() {
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    this.oscillators = new Map();
    this.gains = new Map();
  }

  // Ensure the audio context is running
  async start() {
    if (this.audioContext.state === "suspended") {
      await this.resume();
    }
  }

  async resume() {
    return await this.audioContext.resume();
    console.log("AudioContext resumed:", this.audioContext.state); // Debugging
  }

  async suspend() {
    return await this.audioContext.suspend();
    console.log("AudioContext suspended:", this.audioContext.state); // Debugging
  }

  // Play notes with proper timing and ADSR envelope
  playNotes(notes: Note[], playbackStartTime: number) {
    const ctx = this.audioContext;

    notes.forEach((note) => {
      // Validate frequency
      if (note.frequency <= 0 || isNaN(note.frequency)) {
        console.error("Invalid frequency:", note.frequency);
        return;
      }

      // Validate note time
      if (isNaN(note.time) || note.time < 0) {
        console.error("Invalid note time:", note.time);
        return;
      }

      // Validate playbackStartTime
      if (isNaN(playbackStartTime) || playbackStartTime < 0) {
        console.error("Invalid playbackStartTime:", playbackStartTime);
        return;
      }

      // Create oscillator and gain nodes
      const oscillator = ctx.createOscillator();
      if (!oscillator) {
        console.error("Failed to create oscillator");
        return;
      }

      const gain = ctx.createGain();
      if (!gain) {
        console.error("Failed to create gain node");
        return;
      }

      // Configure oscillator
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(note.frequency, ctx.currentTime);

      // Connect nodes
      oscillator.connect(gain).connect(ctx.destination);

      // Schedule note relative to playbackStartTime
      const noteStartTime = playbackStartTime + note.time;
      const noteStopTime = noteStartTime + note.duration;

      // Start and stop the oscillator
      oscillator.start(noteStartTime);
      oscillator.stop(noteStopTime);

      // ADSR envelope
      const attackTime = 0.01;
      const releaseTime = 0.05;
      gain.gain.setValueAtTime(0, noteStartTime);
      gain.gain.linearRampToValueAtTime(
        note.velocity || 0.5,
        noteStartTime + attackTime,
      );
      gain.gain.setValueAtTime(
        note.velocity || 0.5,
        noteStopTime - releaseTime,
      );
      gain.gain.linearRampToValueAtTime(0, noteStopTime);

      // Store nodes for cleanup
      this.oscillators.set(note.id, oscillator);
      this.gains.set(note.id, gain);
    });
  }

  // Stop all oscillators and clean up
  stopAll() {
    this.oscillators.forEach((oscillator) => {
      oscillator.stop();
      oscillator.disconnect();
    });
    this.gains.forEach((gain) => {
      gain.disconnect();
    });
    this.oscillators.clear();
    this.gains.clear();
  }

  // Get the audio context time
  getCurrentTimeSeconds() {
    return this.audioContext.currentTime;
  }
}
