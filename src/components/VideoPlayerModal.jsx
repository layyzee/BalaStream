import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  RotateCw, 
  X, 
  Cpu, 
  Sparkles, 
  Star, 
  Layers, 
  SlidersHorizontal,
  Check
} from 'lucide-react';
import TelemetryHUD from './TelemetryHUD.jsx';

export default function VideoPlayerModal({ item, onClose }) {
  if (!item) return null;

  const [streamData, setStreamData] = useState(null);
  const [activeStreamIndex, setActiveStreamIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isHudOpen, setIsHudOpen] = useState(true); // Default to open so user sees the reverse-engineering telemetry!
  const [bufferHealth, setBufferHealth] = useState(0);
  const [videoStats, setVideoStats] = useState({
    resolution: '1920x1080',
    fps: '60.00 fps',
    bufferHealth: 0
  });

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Fetch available stream sources for this title
  useEffect(() => {
    fetch(`/api/streams/${item.id || item.imdb_id}`)
      .then(r => r.json())
      .then(data => {
        setStreamData(data);
        setActiveStreamIndex(0);
      })
      .catch(err => console.error('Failed to resolve streams:', err));
  }, [item]);

  const activeStream = streamData?.streams?.[activeStreamIndex] || {
    name: 'Default HLS Stream',
    type: 'hls',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    codec: 'H.264 / AAC',
    bitrate: '5,200 kbps'
  };

  // Setup HLS.js or native playback when activeStream changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeStream?.url) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = activeStream.url;
    const isHlsStream = activeStream.type === 'hls' || streamUrl.includes('.m3u8');

    if (isHlsStream && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        video.play().catch(() => {});
        setIsPlaying(true);
        if (data.levels?.[0]) {
          const lvl = data.levels[0];
          setVideoStats(prev => ({
            ...prev,
            resolution: `${lvl.width || 1920}x${lvl.height || 1080}`,
            fps: `${lvl.frameRate?.toFixed(2) || '60.00'} fps`
          }));
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Apple WebKit HLS (Safari)
      video.src = streamUrl;
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      // Standard MP4 stream
      video.src = streamUrl;
      video.play().catch(() => {});
      setIsPlaying(true);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeStream]);

  // Video event handlers
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);

    // Calculate buffer health
    if (video.buffered.length > 0) {
      const end = video.buffered.end(video.buffered.length - 1);
      const ahead = Math.max(0, end - video.currentTime);
      setBufferHealth(ahead);
      setVideoStats(prev => ({ ...prev, bufferHealth: ahead }));
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const target = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleSkip = (seconds) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const next = !isMuted;
      videoRef.current.muted = next;
      setIsMuted(next);
      if (!next && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Auto-hide controls on mouse idle
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="w-full max-w-5xl bg-[#090b12] border border-white/[0.15] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] relative group select-none"
      >
        
        {/* Top Header Ribbon */}
        <div className={`absolute top-0 inset-x-0 z-20 px-6 py-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">🎬</span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{item.name}</span>
                {item.year && <span className="text-xs text-purple-300 font-mono">({item.year})</span>}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {activeStream?.name} • {activeStream?.quality}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Telemetry HUD */}
            <button
              onClick={() => setIsHudOpen(!isHudOpen)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all flex items-center gap-1.5 ${
                isHudOpen
                  ? 'bg-purple-600/30 text-purple-300 border-purple-500/50 shadow-md shadow-purple-600/20 font-bold'
                  : 'bg-black/40 text-slate-400 border-white/[0.1] hover:text-white'
              }`}
              title="Toggle MPV / Apple VideoToolbox Diagnostic Telemetry Overlay"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>MPV HUD {isHudOpen ? 'ON' : 'OFF'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/40 hover:bg-white/[0.1] text-slate-400 hover:text-white border border-white/[0.1] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Layer */}
        <div 
          onClick={togglePlay}
          className="relative aspect-video w-full bg-black flex items-center justify-center cursor-pointer overflow-hidden"
        >
          <video
            ref={videoRef}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            className="w-full h-full object-contain"
          />

          {/* Forensic MPV Telemetry HUD Overlay */}
          <TelemetryHUD
            stream={activeStream}
            videoStats={videoStats}
            isOpen={isHudOpen}
          />

          {/* Central Play/Pause Splash Icon */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-2xl animate-pulse">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Custom Video Controls Bar */}
        <div className={`px-6 py-4 bg-[#0d101a] border-t border-white/[0.08] flex flex-col gap-3 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          
          {/* Timeline Scrubber */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400 w-12 text-right">
              {formatTime(currentTime)}
            </span>

            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 accent-purple-500 cursor-pointer"
            />

            <span className="text-[11px] font-mono text-slate-400 w-12">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Left Controls: Play, Skip, Volume */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              <button
                onClick={() => handleSkip(-10)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Rewind 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleSkip(10)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Fast Forward 10s"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 accent-purple-500"
                />
              </div>
            </div>

            {/* Right Controls: Stream Switcher & Fullscreen */}
            <div className="flex items-center gap-3">
              {/* Stream Quality Selector */}
              {streamData?.streams && streamData.streams.length > 1 && (
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/[0.08]">
                  {streamData.streams.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveStreamIndex(idx)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                        activeStreamIndex === idx
                          ? 'bg-purple-600 text-white font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s.quality || `Stream ${idx + 1}`}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

          </div>

        </div>

        {/* Media Synopsis Drawer (Below Player) */}
        <div className="p-6 bg-[#0a0c14] border-t border-white/[0.08] overflow-y-auto max-h-48 text-xs text-slate-300 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{item.name}</span>
              {item.imdbRating && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-300" />
                  <span>IMDb {item.imdbRating}</span>
                </span>
              )}
            </div>

            {item.genres && (
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                {item.genres.map(g => (
                  <span key={g} className="px-2 py-0.5 rounded bg-white/[0.05] text-slate-300">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="text-slate-400 leading-relaxed font-light">
            {item.description || 'No synopsis available for this title.'}
          </p>

          {(item.director || item.cast) && (
            <div className="pt-2 border-t border-white/[0.06] text-[11px] text-slate-400 font-mono flex flex-wrap gap-x-6 gap-y-1">
              {item.director && (
                <div><span className="text-purple-300">Director:</span> {item.director.join(', ')}</div>
              )}
              {item.cast && (
                <div><span className="text-purple-300">Cast:</span> {item.cast.slice(0, 3).join(', ')}</div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
