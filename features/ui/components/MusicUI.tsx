import type React from "react";
import { useRef, useCallback } from "react";
import { usePlayback } from "../../playback/react/context";
import type { Note } from "../../shared/types";
import { useAnimationFrame } from "../../shared/hooks/useAnimationFrame";
import { TIMELINE_DURATION_SECONDS } from "../../shared/constants";

const PIXELS_PER_SECOND = 60;

const MusicUI: React.FC = () => {
  const { status, currentTime, notes, play, pause, stop, seek, addNote } =
    usePlayback();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canvasWidth = TIMELINE_DURATION_SECONDS * PIXELS_PER_SECOND;
  const canvasHeight = canvasRef.current?.height;
  const seekerHeight = 10; // Height of the seeker (progress bar)

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the seeker (progress bar)
    ctx.fillStyle = "#e0e0e0"; // Background color of the seeker
    ctx.fillRect(0, 0, canvas.width, seekerHeight);

    // Draw the progress indicator
    const progressWidth =
      (currentTime.seconds / TIMELINE_DURATION_SECONDS) * canvas.width;
    ctx.fillStyle = "#2196F3"; // Progress bar color
    ctx.fillRect(0, 0, progressWidth, seekerHeight);

    // Draw grid lines
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= TIMELINE_DURATION_SECONDS; i++) {
      const x = i * PIXELS_PER_SECOND;
      ctx.beginPath();
      ctx.moveTo(x, seekerHeight); // Start below the seeker
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw notes
    ctx.fillStyle = "#2196F3";
    notes.forEach((note) => {
      const x = note.time * PIXELS_PER_SECOND;
      const y = canvas.height - (note.frequency / 1000) * canvas.height;
      const width = note.duration * PIXELS_PER_SECOND;
      ctx.fillRect(x, y, width, 10);
    });

    // Draw the playhead (vertical line)
    const playheadX =
      (currentTime.seconds / TIMELINE_DURATION_SECONDS) * canvas.width;
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, seekerHeight); // Start below the seeker
    ctx.lineTo(playheadX, canvas.height);
    ctx.stroke();
  }, [notes, currentTime]);

  useAnimationFrame(() => {
    renderCanvas();
  });

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if the click is on the seeker (top 10 pixels)
      if (y < seekerHeight) {
        const seekTime = (x / canvas.width) * TIMELINE_DURATION_SECONDS;
        seek({ seconds: seekTime });
      } else {
        // Handle note addition
        const time = (x / canvas.width) * TIMELINE_DURATION_SECONDS;
        const frequency = 1000 * (1 - y / canvas.height);

        const newNote: Note = {
          id: `note-${Date.now()}`,
          time,
          duration: 0.5,
          frequency,
          velocity: 0.5,
        };

        addNote(newNote);
      }
    },
    [addNote],
  );

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const timeline = e.currentTarget;
      const rect = timeline.getBoundingClientRect();
      const clickX = e.clientX - rect.left;

      const seekTime = (clickX / rect.width) * TIMELINE_DURATION_SECONDS;
      seek({ seconds: seekTime }); // Pass a PlaybackTime object
    },
    [seek],
  );

  console.log("MusicUI rerendering");

  return (
    <div className="p-4">
      <div className="mb-4 space-x-2">
        <button
          onClick={() => (status === "playing" ? pause() : play(notes))}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {status === "playing" ? "Pause" : "Play"}
        </button>
        <button
          onClick={stop}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Stop
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleCanvasClick}
        className="border border-gray-300 rounded"
        aria-label="Music timeline"
      />

      <p className="mt-2 text-sm text-gray-600">
        Click on the canvas to add notes. The vertical red line represents the
        current playback position.
      </p>
    </div>
  );
};

export default MusicUI;
