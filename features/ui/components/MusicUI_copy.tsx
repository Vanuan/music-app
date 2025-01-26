import React, { useState, useCallback, useRef, useMemo } from "react";
import { usePlayback } from "../../playback/react/context";
import type { Note } from "../../shared/types";
import { useAnimationFrame } from "../../shared/hooks/useAnimationFrame";
import { TIMELINE_DURATION_SECONDS } from "../../shared/constants";

const PIXELS_PER_SECOND = 60;

const MusicCompositionUI: React.FC = () => {
  const {
    status,
    currentTime,
    notes,
    play,
    pause,
    stop,
    seek,
    addNote,
    updateNotes,
  } = usePlayback();
  const [editableNotes, setEditableNotes] = useState<string>(
    JSON.stringify(notes, null, 2),
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const seekerHeight = 10;
    ctx.fillStyle = "#e0e0e0";
    ctx.fillRect(0, 0, canvas.width, seekerHeight);

    const progressWidth =
      (currentTime.seconds / TIMELINE_DURATION_SECONDS) * canvas.width;
    ctx.fillStyle = "#2196F3";
    ctx.fillRect(0, 0, progressWidth, seekerHeight);

    notes.forEach((note) => {
      const x = note.time * PIXELS_PER_SECOND;
      const y = canvas.height - (note.frequency / 1000) * canvas.height;
      const width = note.duration * PIXELS_PER_SECOND;
      ctx.fillStyle = "#2196F3";
      ctx.fillRect(x, y, width, 10);
    });

    const playheadX =
      (currentTime.seconds / TIMELINE_DURATION_SECONDS) * canvas.width;
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, seekerHeight);
    ctx.lineTo(playheadX, canvas.height);
    ctx.stroke();
  }, [notes, currentTime]);

  useAnimationFrame(renderCanvas);

  const handleUpdateNotes = () => {
    try {
      const parsedNotes: Note[] = JSON.parse(editableNotes);
      updateNotes(parsedNotes);
    } catch (error) {
      console.error("Invalid JSON", error);
      alert("Invalid JSON format. Please check your notes.");
    }
  };

  const canvasWidth = TIMELINE_DURATION_SECONDS * PIXELS_PER_SECOND;
  const canvasHeight = 300;

  return (
    <div className="p-4 space-y-4">
      <div className="flex space-x-2">
        <button
          onClick={() => (status === "playing" ? pause() : play(notes))}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {status === "playing" ? "Pause" : "Play"}
        </button>
        <button
          onClick={stop}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Stop
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border border-gray-300"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-bold mb-2">Notes JSON</h3>
          <textarea
            value={editableNotes}
            onChange={(e) => setEditableNotes(e.target.value)}
            className="w-full h-64 p-2 border rounded"
            placeholder="Edit notes as JSON"
          />
        </div>
        <div>
          <h3 className="font-bold mb-2">Live Preview</h3>
          <pre className="w-full h-64 p-2 border rounded overflow-auto bg-gray-50">
            {JSON.stringify(notes, null, 2)}
          </pre>
        </div>
      </div>

      <button
        onClick={handleUpdateNotes}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Update Composition
      </button>
    </div>
  );
};

export default MusicCompositionUI;
