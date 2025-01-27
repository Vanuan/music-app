# Music App

A music composition and playback application built with Next.js, React, and the Web Audio API. This app allows users to create, edit, and play musical notes in a timeline-based interface. The project is an exploration of turning the theory of music into actionable notes, leveraging the multi-modal capabilities of LLMs (Large Language Models) to bridge the gap between abstract musical concepts and concrete, playable compositions.

## Vision

The Music App aims to democratize music composition by providing an intuitive, interactive, and extensible platform for both beginners and experienced musicians. By decoupling the core logic from the UI and audio synthesis, the app is designed to be flexible and adaptable, enabling future integration with advanced tools like LLMs and support for multiple platforms (web, mobile, desktop).

The ultimate goal is to create a tool that not only simplifies music creation but also serves as an educational platform, helping users understand music theory through hands-on experimentation and real-time feedback.

## Implementation Status

| Feature                          | Status        | Notes                                                                 |
|----------------------------------|---------------|-----------------------------------------------------------------------|
| Playback Control                 | ✅ Completed  | Play, pause, stop, and seek functionality implemented.                |
| Note Management                  | 🚧 In Progress| Add notes is done; remove and edit notes are in progress.             |
| - Add Notes                      | ✅ Completed  | Users can add notes by clicking on the canvas.                        |
| - Remove Notes                   | 🚧 In Progress| Basic removal is in progress.                                         |
| - Edit Notes                     | 🚧 In Progress| Editing functionality is under development.                           |
| Audio Synthesis                  | ✅ Completed  | Uses Web Audio API with ADSR envelopes.                               |
| - Velocity Support               | 🚧 In Progress| Higher-level abstractions for velocity are planned.                   |
| Real-Time Visualization          | ✅ Completed  | Canvas-based UI with timeline, notes, and playback progress.          |
| Interactive UI                   | ✅ Completed  | Add notes via canvas and control playback with buttons.               |
| JSON Editing                     | 🚧 In Progress| Basic JSON editing is implemented; improvements planned.              |
| LLM Integration                  | ⏳ Primary    | Use LLMs to generate musical ideas and transform theory into notes.   |
| Multi-Platform Support           | ⏳ Maybe      | Explore mobile (React Native) and desktop (Electron/Tauri) support.   |
| Advanced Audio Features          | ⏳ Primary    | Add effects (reverb, delay) and support for multiple waveforms.       |
| Educational Features             | ⏳ Unlikely   | Tutorials, scales, chords, and intervals visualization.               |
| Collaboration Tools              | ⏳ Unlikely   | Real-time collaboration and cloud storage for compositions.           |

**Legend**:
- ✅ Completed
- 🚧 In Progress
- ⏳ Planned

## Architecture

The app is designed with Clean Architecture in mind, separating concerns into distinct layers:

### 1. Core Use Cases (`playback/core`)
- Contains the business logic for playback, note management, and timeline control.
- **`PlaybackUseCase.ts`**: Implements the core algorithms for scheduling notes, handling playback states, and managing the timeline. It adheres to the `PlaybackGateway` interface, ensuring that the core logic is decoupled from external systems.
- **`gateway.ts`**:
  - **`PlaybackGateway`**: Defines the interface that `PlaybackUseCase` implements. It abstracts the core playback functionality, such as play, pause, stop, seek, and note management.
  - **`PlaybackDependencies`**: Defines the interface for injecting dependencies into `PlaybackUseCase`, such as the synthesizer (`SynthGateway`) and timeline duration. This ensures that the core logic remains independent of specific implementations.

### 2. Interface Adapters (`playback/react`)
- Bridges the core logic with the UI and external systems.
- **`context.tsx`**: Provides a React context (`PlaybackContext`) to share playback state and controls across components. It acts as the glue between the core logic and the React UI implementation.

### 3. Frameworks and Drivers (`synth/core`, `shared/hooks`)
- Implements the details of external systems like the Web Audio API and React hooks.
- **`WebAudioSynth.ts`**: Implements the `SynthGateway` interface using the Web Audio API. It handles audio synthesis, including note scheduling and ADSR envelopes.
- **`useAnimationFrame.ts`**: A custom hook for running animations at ~60fps.

### 4. React UI Implementation (`ui/components`)
- Contains the React components that render the user interface.
- **`MusicUI.tsx`**: The main UI component for interacting with the timeline.
- **`MusicCompositionUI.tsx`**: An alternative UI for editing notes as JSON.
- This layer is framework-specific and depends on React for rendering.

### 5. Shared Utilities (`shared/types`, `shared/constants`)
- Contains shared types, constants, and utilities used across layers.
- **`types.ts`**: Defines shared types like `Note`, `PlaybackStatus`, and `PlaybackTime`.
- **`constants.ts`**: Contains constants like `TIMELINE_DURATION_SECONDS`.

## Why Clean Architecture?

The Clean Architecture approach was chosen to ensure that the app remains flexible and maintainable. By decoupling the core logic from the UI and audio synthesis, the app can easily adapt to new environments or technologies. For example:

- **Replace React**: The core logic is independent of React, so the UI could be rebuilt with raw JavaScript, Vue, Svelte, or even a mobile framework like React Native.
- **Replace Web Audio API**: The synthesizer implementation is abstracted behind the `SynthGateway` interface, making it easy to swap out the Web Audio API for another audio synthesis library or API.
- **Extend to LLM Integration**: The core logic can be extended to integrate with LLMs for generating musical ideas or transforming theoretical concepts into playable notes.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Vanuan/music-app.git
   cd music-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.


## Acknowledgments

- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Next.js Documentation](https://nextjs.org/docs)

