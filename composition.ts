import { WebAudioSynth } from "./features/synth/core/WebAudioSynth";
import { PlaybackUseCase } from "./features/playback/core/PlaybackUseCase";
import { TIMELINE_DURATION_SECONDS } from "./features/shared/constants";

export function bootstrapApp() {
  const synth = new WebAudioSynth();
  const playback = new PlaybackUseCase({
    synth,
    timelineDuration: TIMELINE_DURATION_SECONDS,
  });
  console.log("Bootstrapped");
  return { playback, synth };
}
