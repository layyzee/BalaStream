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
  SlidersHorizontal,
  Settings,
  Tv,
  Subtitles,
  Gauge,
  Film,
  HelpCircle,
  Activity,
  Check
} from 'lucide-react';
import TelemetryHUD from './TelemetryHUD.jsx';

// Dialogue cues for open media benchmarks
const DEMO_SUBTITLES = {
  'stream-tears-of-steel': [
    { start: 1, end: 6, text: "Amsterdam, 2012 — The robotic tentacle storm approaches the Oude Kerk." },
    { start: 7, end: 12, text: "Celia: 'Did you really think the backup memory core would hold?'" },
    { start: 13, end: 18, text: "Thom: 'Initialize the quantum magnetic dampeners on quadrant four!'" },
    { start: 19, end: 26, text: "[Distorted synthesized radio chatter]: Signal lock acquired on target." },
    { start: 27, end: 35, text: "Baruch: 'We only have forty seconds before the tracking beacon cycles.'" },
    { start: 36, end: 48, text: "Celia: 'I gave you my hand, Thom. And you turned it into a weapon.'" },
    { start: 49, end: 60, text: "Thom: 'Rerouting primary telemetry through Apple VideoToolbox hardware decode.'" }
  ],
  'stream-big-buck-bunny': [
    { start: 1, end: 6, text: "Blender Institute presents: Big Buck Bunny." },
    { start: 7, end: 14, text: "[Chirping birds and gentle morning woodland breeze]." },
    { start: 15, end: 24, text: "Bunny emerges from the burrow to greet the blooming wildflowers." },
    { start: 25, end: 35, text: "[Rustling bushes]: Frank, Rinky, and Gamera observe from the canopy." },
    { start: 36, end: 48, text: "The woodland creatures plot their mischievous acorn barrage." }
  ],
  'stream-sintel': [
    { start: 1, end: 7, text: "The Blender Foundation and Netherlands Film Fund present Sintel." },
    { start: 8, end: 16, text: "A lonely wanderer traverses the snow-covered peaks of the northern ridge." },
    { start: 17, end: 26, text: "Old Hunter: 'Few who seek the dragon ever return from the crags.'" },
    { start: 27, end: 38, text: "Sintel: 'Scales was not a beast. He was my companion.'" }
  ],
  'stream-elephants-dream': [
    { start: 1, end: 8, text: "Orange Open Movie Project: Elephants Dream." },
    { start: 9, end: 18, text: "Proog: 'Watch your step, Emo. The mechanical lattice shifts without warning.'" },
    { start: 19, end: 30, text: "Emo: 'Is this reality, or just an architectural manifestation of your mind?'" }
  ]
};

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9 Standard', class: 'aspect-video object-contain' },
  { id: '21:9', label: '21:9 Cinema UltraWide', class: 'aspect-[21/9] object-cover' },
  { id: 'fit', label: 'Fit Screen (Letterbox)', class: 'w-full h-full object-contain' },
  { id: 'fill', label: 'Fill / Zoom', class: 'w-full h-full object-cover' }
];

const HW_ENGINES = [
  { id: 'VideoToolbox HW', label: 'Apple VideoToolbox HW (ARM64 Core)', badge: 'M-Series HW' },
  { id: 'Metal Direct Blit', label: 'Metal Zero-Copy Direct Blit (0.2ms latency)', badge: 'Metal API' },
  { id: 'Software CPU', label: 'Software FFmpeg CPU Fallback', badge: 'CPU SW' }
];

const SUBTITLE_LANGS = [
  { id: 'Off', label: 'Disabled (Off)' },
  { id: 'English [CC]', label: 'English [Closed Captions]' },
  { id: 'Spanish', label: 'Español (Subtítulos)' },
  { id: 'French', label: 'Français (Sous-titres)' }
];

export default function VideoPlayerModal({ 
  item, 
  onClose,
  allItems = [],
  onSwitchItem
}) {
  if (!item) return null;

  // Stream & Playback state
  const [streamData, setStreamData] = useState(null);
  const [activeStreamIndex, setActiveStreamIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isHudOpen, setIsHudOpen] = useState(true);
  const queryParams = new URLSearchParams(window.location.search);
  const [isSettingsOpen, setIsSettingsOpen] = useState(queryParams.get('settings') === 'true');
  const [isHelpOpen, setIsHelpOpen] = useState(queryParams.get('help') === 'true');
  const [toastMessage, setToastMessage] = useState(null);

  // Playback Settings Customizations
  const [playbackRate, setPlaybackRate] = useState(1);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [hwEngine, setHwEngine] = useState('VideoToolbox HW');
  const [subtitleTrack, setSubtitleTrack] = useState('English [CC]');
  const [subtitleSize, setSubtitleSize] = useState('medium'); // small, medium, large
  const [subtitleColor, setSubtitleColor] = useState('yellow'); // yellow, white, cyan
  const [audioBoost, setAudioBoost] = useState('100%'); // 100%, 150%, 200%

  // Video stats
  const [videoStats, setVideoStats] = useState({
    resolution: '1920x1080',
    fps: '60.00 fps',
    bufferHealth: 0
  });

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Show temporary on-screen HUD toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 1800);
  };

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
    name: 'Adaptive HLS Stream',
    type: 'hls',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    codec: 'H.264 / AAC',
    bitrate: '5,200 kbps',
    quality: '4K Multi-Audio'
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
        video.playbackRate = playbackRate;
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
      video.playbackRate = playbackRate;
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      // Direct MP4 stream
      video.src = streamUrl;
      video.playbackRate = playbackRate;
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

  // Sync playback rate to video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Video time & buffer tracking
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);

    if (video.buffered.length > 0) {
      const end = video.buffered.end(video.buffered.length - 1);
      const ahead = Math.max(0, end - video.currentTime);
      setVideoStats(prev => ({ ...prev, bufferHealth: ahead }));
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      triggerToast('▶ Playing');
    } else {
      video.pause();
      setIsPlaying(false);
      triggerToast('⏸ Paused');
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
      const newTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
      video.currentTime = newTime;
      triggerToast(seconds > 0 ? `⏩ +${seconds}s` : `⏪ ${seconds}s`);
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
      triggerToast(next ? '🔇 Muted' : `🔊 Volume ${Math.round(volume * 100)}%`);
    }
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
      triggerToast('⛶ Fullscreen');
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
      triggerToast('Exit Fullscreen');
    }
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        triggerToast('Picture-in-Picture Closed');
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
        triggerToast('📺 Picture-in-Picture Active');
      }
    } catch (err) {
      console.warn('PiP not available:', err);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSkip(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSkip(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(v => {
            const nv = Math.min(1, v + 0.1);
            if (videoRef.current) videoRef.current.volume = nv;
            triggerToast(`🔊 Volume ${Math.round(nv * 100)}%`);
            return nv;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(v => {
            const nv = Math.max(0, v - 0.1);
            if (videoRef.current) videoRef.current.volume = nv;
            triggerToast(`🔉 Volume ${Math.round(nv * 100)}%`);
            return nv;
          });
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePictureInPicture();
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          setIsHudOpen(prev => {
            triggerToast(!prev ? '📊 MPV Telemetry HUD On' : 'MPV HUD Hidden');
            return !prev;
          });
          break;
        case 's':
        case 'S':
          e.preventDefault();
          setIsSettingsOpen(prev => !prev);
          break;
        case 'Escape':
          if (isSettingsOpen) {
            setIsSettingsOpen(false);
          } else if (isHelpOpen) {
            setIsHelpOpen(false);
          } else {
            onClose();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, isHelpOpen, isMuted, volume]);

  // Auto-hide controls on mouse idle
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isSettingsOpen && !isHelpOpen) {
        setShowControls(false);
      }
    }, 3200);
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Resolve active subtitle text
  const currentCues = DEMO_SUBTITLES[item.id] || DEMO_SUBTITLES['stream-tears-of-steel'] || [];
  const activeCue = subtitleTrack !== 'Off'
    ? currentCues.find(c => currentTime >= c.start && currentTime <= c.end)?.text
    : null;

  const activeAspectConfig = ASPECT_RATIOS.find(a => a.id === aspectRatio) || ASPECT_RATIOS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="w-full max-w-5xl bg-[#090b12] border border-white/[0.15] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[96vh] relative group select-none"
      >
        
        {/* Top Header Ribbon */}
        <div className={`absolute top-0 inset-x-0 z-30 px-6 py-4 bg-gradient-to-b from-black/95 via-black/60 to-transparent flex items-center justify-between transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">🎬</span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{item.name}</span>
                {item.year && <span className="text-xs text-purple-300 font-mono">({item.year})</span>}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                <span>{activeStream?.name}</span>
                <span>•</span>
                <span className="text-cyan-300">{activeStream?.quality}</span>
                <span>•</span>
                <span className="text-amber-300">{playbackRate}x</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Keyboard Shortcuts Help */}
            <button
              onClick={() => setIsHelpOpen(!isHelpOpen)}
              className="p-2 rounded-xl bg-black/40 hover:bg-white/[0.1] text-slate-400 hover:text-white border border-white/[0.1] transition-colors"
              title="Keyboard Shortcuts Cheat Sheet (?)"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Toggle Telemetry HUD */}
            <button
              onClick={() => {
                setIsHudOpen(!isHudOpen);
                triggerToast(!isHudOpen ? '📊 MPV HUD On' : 'MPV HUD Off');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all flex items-center gap-1.5 ${
                isHudOpen
                  ? 'bg-purple-600/30 text-purple-300 border-purple-500/50 shadow-md shadow-purple-600/20 font-bold'
                  : 'bg-black/40 text-slate-400 border-white/[0.1] hover:text-white'
              }`}
              title="Toggle MPV / Apple VideoToolbox Telemetry HUD (Press 'H')"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>MPV HUD {isHudOpen ? 'ON' : 'OFF'}</span>
            </button>

            {/* Playback Settings Modal Trigger */}
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-2 rounded-xl border transition-all ${
                isSettingsOpen
                  ? 'bg-purple-600 text-white border-purple-500 shadow-lg'
                  : 'bg-black/40 text-slate-400 hover:text-white border-white/[0.1]'
              }`}
              title="Playback Settings: Speed, Aspect Ratio, Subtitles & Audio Boost (Press 'S')"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/40 hover:bg-white/[0.1] text-slate-400 hover:text-white border border-white/[0.1] transition-colors"
              title="Exit Player (Esc)"
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
            className={activeAspectConfig.class}
          />

          {/* Forensic MPV Telemetry HUD Overlay */}
          <TelemetryHUD
            stream={activeStream}
            videoStats={videoStats}
            isOpen={isHudOpen}
            playbackRate={playbackRate}
            aspectRatio={aspectRatio}
            hwEngine={hwEngine}
            subtitleTrack={subtitleTrack}
            audioBoost={audioBoost}
          />

          {/* On-Screen Toast Alerts */}
          {toastMessage && (
            <div className="absolute top-16 right-6 z-40 bg-black/85 backdrop-blur-md border border-purple-500/50 px-4 py-2 rounded-2xl text-xs font-mono text-purple-200 shadow-xl flex items-center gap-2 animate-fade-in pointer-events-none">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Live Subtitles Overlay */}
          {activeCue && (
            <div className="absolute bottom-16 inset-x-8 z-30 flex justify-center pointer-events-none text-center animate-fade-in">
              <span className={`px-4 py-1.5 rounded-xl font-sans font-semibold tracking-wide shadow-2xl transition-all ${
                subtitleColor === 'yellow' ? 'text-amber-300' : subtitleColor === 'cyan' ? 'text-cyan-300' : 'text-white'
              } ${
                subtitleSize === 'small' ? 'text-xs' : subtitleSize === 'large' ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
              } bg-black/80 backdrop-blur-sm border border-white/[0.1]`}>
                {activeCue}
              </span>
            </div>
          )}

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
        <div className={`px-6 py-3.5 bg-[#0d101a] border-t border-white/[0.08] flex flex-col gap-2.5 transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          
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
              className="flex-1 accent-purple-500 cursor-pointer h-1.5 bg-white/[0.1] rounded-lg"
            />

            <span className="text-[11px] font-mono text-slate-400 w-12">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Left Controls: Play, Skip, Volume */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={togglePlay}
                className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all"
                title="Play / Pause (Space)"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              <button
                onClick={() => handleSkip(-10)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Rewind 10s (←)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleSkip(10)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Fast Forward 10s (→)"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Volume Slider & Mute Toggle */}
              <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                  title="Mute / Unmute (M)"
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
                  className="w-16 sm:w-20 accent-purple-500 h-1 bg-white/[0.1] rounded"
                />
              </div>

              {/* Quick Speed Switcher */}
              <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-white/[0.08]">
                {PLAYBACK_SPEEDS.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setPlaybackRate(rate);
                      triggerToast(`⚡ Speed: ${rate}x`);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                      playbackRate === rate
                        ? 'bg-purple-600/40 text-purple-300 font-bold border border-purple-500/50'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Right Controls: Stream Quality, PiP & Fullscreen */}
            <div className="flex items-center gap-2">
              {/* Stream Quality Selector */}
              {streamData?.streams && streamData.streams.length > 1 && (
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/40 border border-white/[0.08]">
                  {streamData.streams.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveStreamIndex(idx);
                        triggerToast(`Switched to ${s.quality || `Stream ${idx + 1}`}`);
                      }}
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

              {/* Picture-in-Picture Button */}
              <button
                onClick={togglePictureInPicture}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Picture-in-Picture (P)"
              >
                <Tv className="w-4 h-4" />
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Toggle Fullscreen (F)"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

          </div>

        </div>

        {/* Quick Demo Benchmark Film Switcher */}
        {allItems && allItems.length > 1 && (
          <div className="px-6 py-2.5 bg-[#080a11] border-t border-white/[0.06] flex items-center gap-3 overflow-x-auto scrollbar-none text-[11px] font-mono">
            <span className="text-slate-400 uppercase tracking-wider text-[9px] flex items-center gap-1 font-bold">
              <Film className="w-3 h-3 text-purple-400" />
              <span>Test Films:</span>
            </span>
            {allItems.map((film) => (
              <button
                key={film.id || film.imdb_id}
                onClick={() => {
                  if (onSwitchItem) onSwitchItem(film);
                  triggerToast(`Loading ${film.name}...`);
                }}
                className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  (film.id === item.id || film.imdb_id === item.imdb_id)
                    ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 font-bold'
                    : 'bg-white/[0.03] text-slate-400 border-white/[0.05] hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <span>{film.name}</span>
                <span className="text-[9px] text-slate-400">({film.year})</span>
              </button>
            ))}
          </div>
        )}

        {/* Media Synopsis Drawer (Below Player) */}
        <div className="p-6 bg-[#0a0c14] border-t border-white/[0.08] overflow-y-auto max-h-40 text-xs text-slate-300 space-y-2.5">
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

          <p className="text-slate-400 leading-relaxed font-light text-[11px]">
            {item.description || 'No synopsis available for this title.'}
          </p>
        </div>

        {/* ============================================================== */}
        {/* INTERACTIVE PLAYBACK SETTINGS DRAWER OVERLAY                   */}
        {/* ============================================================== */}
        {isSettingsOpen && (
          <div className="absolute inset-y-0 right-0 z-40 w-full sm:w-96 bg-[#0a0d17]/95 backdrop-blur-xl border-l border-white/[0.15] shadow-2xl p-6 flex flex-col justify-between animate-fade-in">
            <div className="space-y-5 overflow-y-auto pr-1">
              
              <div className="flex items-center justify-between border-b border-white/[0.1] pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-400" />
                  <h4 className="text-sm font-bold text-white">Playback Settings</h4>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/[0.1] text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Playback Speed */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-purple-300 font-semibold flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Playback Rate</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PLAYBACK_SPEEDS.map(rate => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate);
                        triggerToast(`⚡ Speed: ${rate}x`);
                      }}
                      className={`py-1.5 rounded-xl text-xs font-mono border transition-all ${
                        playbackRate === rate
                          ? 'bg-purple-600 text-white border-purple-500 font-bold shadow-md shadow-purple-600/30'
                          : 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08]'
                      }`}
                    >
                      {rate}x {rate === 1 && '(Normal)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Aspect Ratio */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-cyan-300 font-semibold flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Display Aspect Ratio</span>
                </label>
                <div className="space-y-1.5">
                  {ASPECT_RATIOS.map(ratio => (
                    <button
                      key={ratio.id}
                      onClick={() => {
                        setAspectRatio(ratio.id);
                        triggerToast(`Aspect Ratio: ${ratio.label}`);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-mono border flex items-center justify-between transition-all ${
                        aspectRatio === ratio.id
                          ? 'bg-cyan-600/20 text-cyan-200 border-cyan-500/40 font-bold'
                          : 'bg-white/[0.03] text-slate-300 border-white/[0.06] hover:bg-white/[0.06]'
                      }`}
                    >
                      <span>{ratio.label}</span>
                      {aspectRatio === ratio.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Hardware Video Engine (Reverse-Engineering Telemetry) */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-emerald-300 font-semibold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Decoder Acceleration Engine</span>
                </label>
                <div className="space-y-1.5">
                  {HW_ENGINES.map(engine => (
                    <button
                      key={engine.id}
                      onClick={() => {
                        setHwEngine(engine.id);
                        triggerToast(`Engine: ${engine.label}`);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-mono border flex items-center justify-between transition-all ${
                        hwEngine === engine.id
                          ? 'bg-emerald-600/20 text-emerald-200 border-emerald-500/40 font-bold'
                          : 'bg-white/[0.03] text-slate-300 border-white/[0.06] hover:bg-white/[0.06]'
                      }`}
                    >
                      <span>{engine.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {engine.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Subtitles Customizer */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-amber-300 font-semibold flex items-center gap-1.5">
                  <Subtitles className="w-3.5 h-3.5" />
                  <span>Closed Captions & Subtitles</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {SUBTITLE_LANGS.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setSubtitleTrack(lang.id);
                        triggerToast(`Subtitles: ${lang.id}`);
                      }}
                      className={`p-2 rounded-xl text-left text-xs font-mono border transition-all ${
                        subtitleTrack === lang.id
                          ? 'bg-amber-600/20 text-amber-200 border-amber-500/40 font-bold'
                          : 'bg-white/[0.03] text-slate-300 border-white/[0.06] hover:bg-white/[0.06]'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                {/* Subtitle Styling */}
                {subtitleTrack !== 'Off' && (
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span>Size:</span>
                      {['small', 'medium', 'large'].map(s => (
                        <button
                          key={s}
                          onClick={() => setSubtitleSize(s)}
                          className={`px-1.5 py-0.5 rounded capitalize ${subtitleSize === s ? 'bg-amber-500/30 text-amber-300 font-bold' : 'hover:text-white'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span>Color:</span>
                      {['yellow', 'white', 'cyan'].map(c => (
                        <button
                          key={c}
                          onClick={() => setSubtitleColor(c)}
                          className={`px-1.5 py-0.5 rounded capitalize ${subtitleColor === c ? 'bg-amber-500/30 text-amber-300 font-bold' : 'hover:text-white'}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Audio Gain Boost */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-rose-300 font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Audio Gain Equalizer</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['100%', '150%', '200%'].map(boost => (
                    <button
                      key={boost}
                      onClick={() => {
                        setAudioBoost(boost);
                        triggerToast(`Audio Boost: ${boost}`);
                      }}
                      className={`py-1.5 rounded-xl text-xs font-mono border transition-all ${
                        audioBoost === boost
                          ? 'bg-rose-600/30 text-rose-200 border-rose-500/50 font-bold'
                          : 'bg-white/[0.03] text-slate-300 border-white/[0.06] hover:bg-white/[0.06]'
                      }`}
                    >
                      {boost}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg"
            >
              Done & Return to Video
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* KEYBOARD SHORTCUTS CHEAT SHEET MODAL OVERLAY                   */}
        {/* ============================================================== */}
        {isHelpOpen && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
            <div className="max-w-md w-full bg-[#0d101a] border border-white/[0.15] rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.1] pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-400" />
                  <h4 className="text-sm font-bold text-white">Keyboard Shortcuts</h4>
                </div>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/[0.1] text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-between">
                  <span className="text-slate-400">Play / Pause</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/[0.1] text-purple-300 font-bold">Space</kbd>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-between">
                  <span className="text-slate-400">Seek ±5 sec</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/[0.1] text-purple-300 font-bold">← / →</kbd>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-between">
                  <span className="text-slate-400">Volume Up/Down</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/[0.1] text-purple-300 font-bold">↑ / ↓</kbd>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-between">
                  <span className="text-slate-400">Fullscreen</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/[0.1] text-purple-300 font-bold">F</kbd>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-between">
                  <span className="text-slate-400">Mute / Unmute</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/[0.1] text-purple-300 font-bold">M</kbd>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-between">
                  <span className="text-slate-400">Picture-in-Pic</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/[0.1] text-purple-300 font-bold">P</kbd>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-between">
                  <span className="text-slate-400">Toggle MPV HUD</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/[0.1] text-purple-300 font-bold">H</kbd>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-between">
                  <span className="text-slate-400">Playback Settings</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/[0.1] text-purple-300 font-bold">S</kbd>
                </div>
              </div>

              <button
                onClick={() => setIsHelpOpen(false)}
                className="w-full py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-mono transition-colors"
              >
                Close (Esc)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
