# 🎬 Stremio Studio — Open Web Player & Forensic Architecture Workbench

> A reverse-engineered, open reconstruction of **Stremio Desktop 5** (`com.westbridge.stremio5-mac`), deconstructed from macOS Apple Silicon ARM64 binaries and bundle resources. Features an integrated HLS video player, live Cinemeta Addon Protocol v3 catalog browsing, simulated `libmpv` Apple VideoToolbox hardware decoding telemetry, and custom addon installation.

Architected by **Balaji Palani** (Senior Scrum Master / Technical Agile Delivery Lead, CSM®, SAFe® 6 SSM).  
**Live Cloud URL:** [https://stremiostudio.onrender.com](https://stremiostudio.onrender.com)  

---

## 🌟 Key Capabilities

- 🍿 **Live Cinemeta Addon Protocol v3 Integration:** Directly queries official Stremio metadata microservices (`https://v3-cinemeta.strem.io`) with genre filtering and instant search debouncing.
- 🎥 **Integrated HLS / MP4 Media Player:** Stream 4K 60fps adaptive multi-bitrate HLS (.m3u8) streams via `hls.js` with full playback controls, scrubber timestamp previews, volume memory, and stream switcher.
- 📊 **Forensic MPV & VideoToolbox Telemetry HUD:** Interactive diagnostic overlay simulating Stremio's native `libmpv.2.dylib` stats (resolution, frame rate, buffer health, codec bitrate, frame drops, and Apple VideoToolbox hardware decode status).
- 🧩 **Stremio Addon Manager:** Manage installed microservices and install/test any custom Stremio Addon Protocol v3 manifest URL.
- 🔬 **Reverse-Engineered Architecture Explainer:** Interactive drawer deconstructing Stremio's Rust shell (`wry` / `tao` / WebKit), streaming daemon (`server.js` on port 11470), and the `*.local.strem.io:12470` wildcard SSL loopback bypass.

---

## 🚀 Quick Start

### 1. Install & Build
```bash
git clone https://github.com/layyzee/StremioStudio.git
cd StremioStudio
npm install
npm run build
```

### 2. Run Locally
```bash
npm start
```
Open **`http://localhost:5185`** in your browser.

---

## 🛠️ Tech Stack & Zero-Cost Architecture

- **Frontend:** React 18, Vite 5, Tailwind CSS 3, Lucide Icons, Hls.js, Canvas Confetti.
- **Backend:** Node.js / Express proxy and static server.
- **Protocol:** Stremio Addon Protocol v3 (JSON-RPC over HTTP).
- **Cost:** **$0.00** (Zero subscription fees, 100% open source).
