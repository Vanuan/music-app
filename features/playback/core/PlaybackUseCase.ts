import type {
  Note,
  PlaybackStatus,
  PlaybackTime,
  TimelineTime,
  ChronologicalTime,
} from "../../shared/types";
import type { PlaybackGateway, PlaybackDependencies } from "./gateway";

export class PlaybackUseCase implements PlaybackGateway {
  private isPlaying = false;
  private timelineStartTime: TimelineTime = { seconds: 0 }; // Audio context time when playback started
  private chronologicalStartTime: ChronologicalTime = { milliseconds: 0 }; // Real-world time when playback started
  private status: PlaybackStatus = "stopped";
  private playbackTime: PlaybackTime = { seconds: 0 }; // Current playback position in seconds
  private notes: Note[] = []; // Source of truth for notes
  private animationFrameId: number | null = null;
  constructor(private deps: PlaybackDependencies) {}

  async play() {
    if (this.isPlaying) return;

    await this.deps.synth.start();
    this.isPlaying = true;

    const currentTime = this.deps.synth.getCurrentTimeSeconds();
    // Validate audioContext.currentTime
    if (isNaN(currentTime)) {
      console.error("Invalid audioContext.currentTime:", currentTime);
      return;
    }

    if (this.status === "paused") {
      // Resume from paused position
      const currentTime = this.deps.synth.getCurrentTimeSeconds();
      this.timelineStartTime.seconds = currentTime - this.playbackTime.seconds;
      this.chronologicalStartTime.milliseconds =
        performance.now() - this.playbackTime.seconds * 1000;
      await this.deps.synth.resume();
    } else {
      // Fresh playback
      this.timelineStartTime.seconds = this.deps.synth.getCurrentTimeSeconds();
      this.chronologicalStartTime.milliseconds = performance.now();
    }

    this.status = "playing";

    // Schedule all notes
    this.deps.synth.playNotes(this.notes, this.timelineStartTime.seconds);
    this.updateLoop();
  }

  async pause() {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    this.status = "paused";

    // Store the current playback position
    this.playbackTime.seconds =
      this.deps.synth.getCurrentTimeSeconds() - this.timelineStartTime.seconds;
    await this.deps.synth.suspend();

    this.cancelUpdateLoop();
  }

  stop() {
    this.isPlaying = false;
    this.status = "stopped";
    this.playbackTime.seconds = 0;
    this.deps.synth.stopAll();
    this.cancelUpdateLoop();
  }

  seek(time: PlaybackTime) {
    // Validate time.seconds
    if (isNaN(time.seconds)) {
      console.error("Invalid seek time:", time.seconds);
      return;
    }

    // Wrap the seek time around timelineDuration
    this.playbackTime.seconds = time.seconds % this.deps.timelineDuration;

    if (this.isPlaying) {
      // Stop all notes and reschedule them from the seeked position
      this.deps.synth.stopAll();

      // Calculate the new audio context start time based on the seeked position
      this.timelineStartTime.seconds =
        this.deps.synth.getCurrentTimeSeconds() - this.playbackTime.seconds;

      // Reschedule all notes relative to the new audio context start time
      this.deps.synth.playNotes(this.notes, this.timelineStartTime.seconds);
    }
  }

  addNote(note: Note) {
    this.notes = [...this.notes, note];

    if (this.isPlaying || this.status === "paused") {
      // Validate timelineStartTime.seconds
      if (
        isNaN(this.timelineStartTime.seconds) ||
        this.timelineStartTime.seconds < 0
      ) {
        console.error(
          "Invalid timelineStartTime:",
          this.timelineStartTime.seconds,
        );
        return;
      }

      console.log("Adding note:", {
        timelineStartTime: this.timelineStartTime.seconds,
        noteTime: note.time,
      }); // Debugging

      // Schedule the new note using the timeline's start time and the note's timeline position
      this.deps.synth.playNotes([note], this.timelineStartTime.seconds);
    } else {
      // Playback is stopped; add the note to the list but don't schedule it yet
      console.log("Adding note while stopped:", { note }); // Debugging
    }
  }

  removeNote(noteId: string) {
    this.notes = this.notes.filter((note) => note.id !== noteId);

    if (this.isPlaying) {
      // Stop and reschedule all notes to reflect the removal
      this.deps.synth.stopAll();
      this.deps.synth.playNotes(this.notes, this.timelineStartTime.seconds);
    }
  }

  getNotes(): Note[] {
    return this.notes;
  }

  getStatus(): PlaybackStatus {
    return this.status;
  }

  getCurrentTime(): PlaybackTime {
    return this.playbackTime;
  }

  private updateLoop = () => {
    if (!this.isPlaying) return;

    const currentTime = this.deps.synth.getCurrentTimeSeconds();
    this.playbackTime.seconds = currentTime - this.timelineStartTime.seconds;

    // Handle timeline looping
    if (this.playbackTime.seconds >= this.deps.timelineDuration) {
      // Stop all currently playing notes
      this.deps.synth.stopAll();

      // Reset playback time and update timeline start time for the new loop cycle
      this.playbackTime.seconds = 0;
      this.timelineStartTime.seconds = currentTime;

      // Reschedule all notes for the new loop cycle
      this.deps.synth.playNotes(this.notes, this.timelineStartTime.seconds);
    }

    this.animationFrameId = requestAnimationFrame(this.updateLoop);
  };

  private cancelUpdateLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
