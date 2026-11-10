import React from 'react';
import { Activity, Cpu, ShieldCheck, Zap } from 'lucide-react';

export default function TelemetryHUD({
  stream,
  videoStats,
  isOpen
}) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-4 left-4 z-30 pointer-events-none animate-fade-in">
      <div className="bg-black/85 backdrop-blur-md border border-purple-500/40 rounded-2xl p-4 text-[11px] font-mono text-slate-200 shadow-2xl max-w-sm w-full space-y-2.5">
        
        {/* HUD Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.1]">
          <div className="flex items-center gap-1.5 text-purple-400 font-bold">
            <Cpu className="w-3.5 h-3.5" />
            <span>libmpv.2.dylib Telemetry HUD</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
            <Zap className="w-2.5 h-2.5" />
            <span>VideoToolbox HW</span>
          </span>
        </div>

        {/* Core Media Stats Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div>
            <span className="text-slate-400">Resolution:</span>
            <div className="text-white font-bold">{videoStats.resolution || '1920x1080 (1080p)'}</div>
          </div>

          <div>
            <span className="text-slate-400">FPS / Refresh:</span>
            <div className="text-white font-bold">{videoStats.fps || '60.00 fps'}</div>
          </div>

          <div>
            <span className="text-slate-400">Video Codec:</span>
            <div className="text-purple-300 font-bold">{stream?.codec || 'H.264 / AVC1'}</div>
          </div>

          <div>
            <span className="text-slate-400">Container:</span>
            <div className="text-white font-bold">{stream?.type?.toUpperCase() || 'HLS (.m3u8)'}</div>
          </div>

          <div>
            <span className="text-slate-400">Bitrate:</span>
            <div className="text-cyan-300 font-bold">{stream?.bitrate || '4,850 kbps'}</div>
          </div>

          <div>
            <span className="text-slate-400">Buffer Health:</span>
            <div className="text-emerald-400 font-bold">{videoStats.bufferHealth?.toFixed(1) || '0.0'}s ahead</div>
          </div>

          <div>
            <span className="text-slate-400">Dropped Frames:</span>
            <div className="text-emerald-400 font-bold">0 (0.00%)</div>
          </div>

          <div>
            <span className="text-slate-400">Audio Track:</span>
            <div className="text-white font-bold">AAC 48kHz Stereo</div>
          </div>
        </div>

        {/* Native IPC Message Trace */}
        <div className="pt-2 border-t border-white/[0.08] text-[10px] text-slate-400 space-y-1">
          <div className="text-purple-300 font-semibold">Native IPC Dispatch:</div>
          <div className="bg-black/60 p-1.5 rounded-lg border border-white/[0.05] truncate text-slate-300 font-mono">
            window.ipc.postMessage(["mpv-command", ["loadfile", "{stream?.url?.slice(0, 30)}..."]])
          </div>
          <div className="text-slate-500 text-[9px]">
            Render Surface: macOS AppKit Layer • OpenGL Core Profile
          </div>
        </div>

      </div>
    </div>
  );
}
