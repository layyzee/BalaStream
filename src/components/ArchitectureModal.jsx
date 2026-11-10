import React, { useState } from 'react';
import { 
  Cpu, 
  X, 
  Layers, 
  Code, 
  ShieldCheck, 
  Zap, 
  FileCode, 
  ExternalLink,
  Award
} from 'lucide-react';

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-3xl border border-white/[0.18] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ backgroundColor: '#0c0f18' }}
      >
        
        {/* Header */}
        <div 
          className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between shrink-0"
          style={{ backgroundColor: '#131826' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center justify-center shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Stremio Desktop 5 — Forensic Architecture
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  ARM64 Reverse-Engineered
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Clean-room architectural deconstruction by Balaji Palani
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-200">
          
          {/* Executive Overview Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-400" />
                The Triple-Tier Advantage (Why Stremio Crushes Electron)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                85 MB vs 800 MB RAM
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Unlike Slack, Discord, or Spotify which bundle a multi-gigabyte Chromium browser per window, Stremio 5 is architected as a **native Rust binary** (`wry` + `tao`) that hosts macOS **`WKWebView`** (Apple WebKit) while offloading high-bitrate video decoding directly to **`libmpv.2.dylib`** with Apple **VideoToolbox** hardware acceleration.
            </p>
          </div>

          {/* Triple-Tier Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">
                Tier 1: Desktop Shell
              </span>
              <h4 className="text-sm font-bold text-white">Pure Rust + Wry</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Uses Tauri's `wry` (v0.51.2) and `tao` event loop to create lightweight macOS AppKit windows without Chromium bloat.
              </p>
              <div className="text-[10px] font-mono text-purple-300 pt-1 border-t border-white/[0.05]">
                Binary: 8.2 MB Mach-O
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">
                Tier 2: Streaming Daemon
              </span>
              <h4 className="text-sm font-bold text-white">Embedded Node.js</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Runs `server.js` on `127.0.0.1:11470`. Converts torrent chunks into adaptive HLS streams with on-the-fly subtitle burning.
              </p>
              <div className="text-[10px] font-mono text-purple-300 pt-1 border-t border-white/[0.05]">
                Port: 11470 / 12470 HTTPS
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">
                Tier 3: Video Engine
              </span>
              <h4 className="text-sm font-bold text-white">libmpv + VideoToolbox</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                C ABI FFI bridge blits 4K 60fps frames straight to the GPU with Apple VideoToolbox. CPU usage stays under 5%.
              </p>
              <div className="text-[10px] font-mono text-purple-300 pt-1 border-t border-white/[0.05]">
                Dylib: libmpv.2.dylib
              </div>
            </div>

          </div>

          {/* Forensic Bridge Code Block */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] space-y-2 font-mono">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">
              Disassembled WebKit IPC Bridge (Extracted from Stremio Binary)
            </span>
            <pre className="text-[11px] text-purple-300 overflow-x-auto p-3 rounded-xl bg-black/70 border border-white/[0.04]">
{`Object.defineProperty(window, 'ipc', {
  value: Object.freeze({
    postMessage: function(s) {
      window.webkit.messageHandlers.ipc.postMessage(s);
    }
  })
});

// Example Playback Trigger:
window.ipc.postMessage(["mpv-command", ["loadfile", streamUrl]]);`}
            </pre>
          </div>

          {/* Recruiter & Agile Leadership Takeaways */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              Agile System Design & Leadership Talking Points
            </span>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              <li><strong className="text-white">Fault Domain Isolation:</strong> Decoupling the UI presentation layer (WebKit) from the I/O-intensive network daemon (`server.js`) ensures network stalls never freeze the 60fps user interface.</li>
              <li><strong className="text-white">Mixed-Content Security Bypass:</strong> Resolving browser security restrictions through public wildcard DNS (`*.local.strem.io` → `127.0.0.1`) showcases advanced grasp of web security protocols.</li>
              <li><strong className="text-white">Cost & Resource Optimization:</strong> Delivering native 4K media playback at zero cloud server cost using client-side peer orchestration and on-device hardware decoding.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
