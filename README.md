# 🔮 MonadTunnel

**MonadTunnel** is an immersive, 3D interactive explorer for the Monad Blockchain Ecosystem. It reimagines the traditional "list view" of ecosystem directories as a procedural hyper-tunnel, where decentralized applications (dApps) orbit as holographic nodes in a spatial interface.

The project blends high-performance 3D graphics, generative AI, and spatial audio to create a "Sci-Fi UI" experience for discovering Web3 projects.

---

## ✨ Key Features

### 🌌 **Immersive 3D Environment**
- **HyperTunnel**: A procedurally textured, infinite tunnel effect using custom shaders and geometry.
- **Orbiting Tiles**: Ecosystem projects are displayed as floating, interactive 3D cards that spiral through the tunnel.
- **Space Void Mode**: A "constellation view" utilized during search and filtering, arranging nodes in a spherical star map.

### 🧠 **AI Oracle (Powered by Gemini)**
- **Natural Language Search**: Users can query the ecosystem using natural language (e.g., *"Find me high yield farms"* or *"Where can I play games?"*).
- **Contextual Reasoning**: The AI analyzes the `MonEco.json` dataset and returns specific app recommendations with reasoning, powered by Google's **Gemini 2.5 Flash** model.

### 🔊 **Spatial Audio Engine**
- **Procedural Sound**: A custom `AudioEngine` class generates sci-fi sound effects (hover chirps, scroll thrusters) using the Web Audio API oscillators and filters.
- **Asset Streaming**: Seamlessly loops high-quality ambient tracks and warp sound effects.
- **Reactivity**: Audio reacts to user input speed (scroll velocity) and interaction state.

### 💻 **Holographic UI**
- **Glassmorphism**: UI panels feature dynamic tilt controls, real-time blurring, and neon aesthetic consistent with the Monad brand.
- **3D Interactive Logo**: A custom-built Three.js geometry representing the Monad logo that fills with fluid animations.

---

## 🛠 Tech Stack

- **Core**: React 19, TypeScript, Vite
- **3D Engine**: [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **AI**: [Google GenAI SDK](https://www.npmjs.com/package/@google/genai) (Gemini 2.5)
- **Styling**: CSS Modules, Custom Shaders (GLSL)
- **Audio**: Native Web Audio API (No external heavy audio libraries)

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/monadtunnel.git
cd monadtunnel
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory to configure the AI client. You must provide a valid Google Gemini API key.

```env
# .env
API_KEY=your_google_gemini_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🎮 Controls & Usage

| Action | Input | Description |
| :--- | :--- | :--- |
| **Move Forward** | `Scroll Down` / `Arrow Down` | Travel deeper into the tunnel. |
| **Move Backward** | `Scroll Up` / `Arrow Up` | Travel back towards the start. |
| **Inspect App** | `Right Click` (on Tile) | Opens the holographic details panel. |
| **Open Oracle** | `Click` (Monad Logo) | Opens the AI Search / Filter interface. |
| **Tilt Panel** | `Mouse Move` | UI panels tilt in 3D space based on mouse position. |
| **Volume** | `Hover` Speaker Icon | Reveals the volume slider. |

---

## 📂 Project Structure

```
/
├── components/
│   ├── Scene/           # 3D Components (Three.js)
│   │   ├── TunnelScene.tsx    # Main Scene entry
│   │   ├── HyperTunnel.tsx    # Cylinder mesh & texture logic
│   │   ├── OrbitingTiles.tsx  # Dapp cards logic & shaders
│   │   ├── SpaceVoid.tsx      # Search result view
│   │   └── ...
│   └── UI/              # 2D React Overlays
│       ├── SearchInterface.tsx # AI & Manual Filter UI
│       ├── DappPanel.tsx       # Details Modal
│       └── SoundControl.tsx    # Audio UI
├── data/
│   └── MonEco.json      # Ecosystem Database
├── services/
│   ├── aiClient.ts      # Gemini API Integration
│   ├── audioEngine.ts   # Web Audio API Singleton
│   └── monadClient.ts   # RPC Mock/Client
└── App.tsx              # Main Application Controller
```

---

## 🎵 Audio Assets

The application uses Monad Portal audio assets for immersion:
- **Ambience**: `sign-in-loop.mp3`
- **Warp Transition**: `enter-the-portal.mp3`

---

## 📜 License

This project is a conceptual showcase and is open-source.

*Built with 💜 by YOUZY for the Monad Community.*
