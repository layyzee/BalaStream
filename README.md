# 🎬 BalaStream — High-Performance Media Engine & Forensic Web Player

> A clean-room reconstructed media streaming architecture and forensic workbench, engineered as an architectural study of modern high-efficiency desktop media engines (Rust `wry`/`tao` native shell, `libmpv` C ABI FFI, and Addon Protocol v3). Features an adaptive HLS video player, live metadata catalog browsing, real-time Apple VideoToolbox hardware decoding telemetry, subtitle customization, and decentralized addon management.

Architected by **Balaji Palani** (Senior Scrum Master / Technical Agile Delivery Lead, CSM®, SAFe® 6 SSM).  
**Live Cloud URL:** [https://balastream.onrender.com](https://balastream.onrender.com)  
**GitHub Repository:** [https://github.com/layyzee/BalaStream](https://github.com/layyzee/BalaStream)  

---

## 🌟 Key Capabilities

- 🍿 **Decentralized Addon Protocol v3 Integration:** Directly queries official metadata microservices with genre filtering and instant search debouncing.
- 🎥 **Adaptive HLS / MP4 Media Player:** Stream 4K 60fps adaptive multi-bitrate HLS (.m3u8) streams via `hls.js` with full playback controls, scrubber timestamp previews, volume memory, and stream switcher.
- ⚙️ **Comprehensive Playback Customization:** Variable playback speeds (0.5x to 2x), aspect ratio modes (16:9, 21:9 UltraWide Cinema, Fit, Fill), Picture-in-Picture (PiP), synchronized subtitles with custom font sizing and colors, and audio boost equalization.
- 📊 **Forensic MPV & VideoToolbox Telemetry HUD:** Interactive diagnostic overlay simulating native `libmpv.2.dylib` stats (resolution, frame rate, buffer health, codec bitrate, zero frame drops, and Apple VideoToolbox hardware decode status).
- 🧩 **Decentralized Addon Hub:** Manage installed microservices and install/test any custom Addon Protocol v3 manifest URL.
- 🔬 **Reverse-Engineered Architecture Explainer:** Interactive drawer deconstructing the triple-tier architecture: Rust shell (`wry` / `tao` / native WebKit), streaming daemon (`server.js` on port 11470), and the `*.local` wildcard SSL loopback bypass.

---

## 🚀 Quick Start

### 1. Install & Build
```bash
git clone https://github.com/layyzee/BalaStream.git
cd BalaStream
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
- **Protocol:** Addon Protocol v3 (JSON-RPC over HTTP).
- **Cost:** **$0.00** (Zero subscription fees, 100% open source).
