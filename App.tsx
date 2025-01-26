import type React from "react";
import { useEffect, useState } from "react";
import { PlaybackProvider } from "./features/playback/react/context";
import MusicUI from "./features/ui/components/MusicUI";
import { bootstrapApp } from "./composition";
import { PlaybackUseCase } from "./features/playback/core/PlaybackUseCase";

const App: React.FC = () => {
  const [playback, setPlayback] = useState<PlaybackUseCase | null>(null);

  useEffect(() => {
    const { playback } = bootstrapApp();
    setPlayback(playback);
  }, []);

  return (
    <div className="App">
      <h1 className="text-2xl font-bold mb-4">Music App</h1>
      {playback ? (
        <PlaybackProvider playback={playback}>
          <MusicUI />
        </PlaybackProvider>
      ) : (
        <div>Loading player...</div>
      )}
    </div>
  );
};

export default App;
