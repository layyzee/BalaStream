import React, { useState } from 'react';
import { 
  Puzzle, 
  X, 
  Plus, 
  ExternalLink, 
  Check, 
  ShieldCheck, 
  Code, 
  Sparkles, 
  AlertCircle,
  Zap,
  Trash2,
  Tv,
  Film
} from 'lucide-react';
import confetti from 'canvas-confetti';

const POPULAR_HTTP_ADDONS = [
  {
    id: 'uk.pengu.play',
    name: 'PenguPlay',
    version: '2.1.0',
    description: 'Direct HTTP streaming for Movies, TV Shows, Anime, and Live TV. Free account creates a high-speed personal mirror link.',
    manifestUrl: 'https://pengu.uk/manifest.json',
    setupUrl: 'https://pengu.uk',
    icon: '⭐',
    badge: 'Free • Movies / TV / Anime / Live TV',
    cost: 'free'
  },
  {
    id: 'com.stremio.HdHub',
    name: 'HDHub',
    version: '1.0.7',
    description: 'Direct multi-quality HTTP & HLS video streams (4K / 1080p / 720p) for movies and series with instant playback.',
    manifestUrl: 'https://hdhub.thevolecitor.qzz.io/eyJ0b3Jib3giOiJ1bnNldCIsInF1YWxpdGllcyI6IjIxNjBwLDEwODBwLDcyMHAiLCJzb3J0IjoiZGVzYyJ9/manifest.json',
    setupUrl: 'https://hdhub.thevolecitor.qzz.io',
    icon: '⚡',
    badge: '1-Click Install • Fast Movies & Shows',
    cost: 'free'
  },
  {
    id: 'site.plavio.hd',
    name: 'HD Plavio',
    version: '1.0.4',
    description: 'Community HTTP scraper delivering direct links for Movies, TV Shows, and Live TV channels.',
    manifestUrl: 'https://hd.plavio.site/manifest.json',
    setupUrl: 'https://hd.plavio.site',
    icon: '📺',
    badge: 'Free • Movies / TV / Live TV',
    cost: 'free'
  },
  {
    id: 'org.dpdns.cncverse',
    name: 'CNCVerse Bridge',
    version: '1.2.0',
    description: 'Plugin-based addon bridging CloudStream multi-source scrapers to Stremio. Supports Anime, Live TV, and Drama.',
    manifestUrl: 'https://cncverse.dpdns.org/manifest.json',
    setupUrl: 'https://cncverse.dpdns.org',
    icon: '🌉',
    badge: 'Free • Plugin Based Addon',
    cost: 'free'
  },
  {
    id: 'com.elfhosted.1111477',
    name: '1111477',
    version: '1.0.1',
    description: 'ElfHosted community HTTP stream provider scraping direct video hosting servers for Movies and TV Shows.',
    manifestUrl: 'https://1111477.elfhosted.com/manifest.json',
    setupUrl: 'https://1111477.elfhosted.com',
    icon: '🚀',
    badge: 'Free • Movies / TV Shows',
    cost: 'free'
  },
  {
    id: 'club.babybeamup.webstreamrmbg',
    name: 'WebStreamrMBG',
    version: '1.3.2',
    description: 'Community-hosted fork of WebStreamr extracting high-speed direct HTTP streams for Movies and TV Shows.',
    manifestUrl: 'https://webstreamr.mbg.baby-beamup.club/manifest.json',
    setupUrl: 'https://webstreamr.mbg.baby-beamup.club',
    icon: '🌐',
    badge: 'Free • Movies / TV Shows',
    cost: 'free'
  },
  {
    id: 'app.flixnest.streams',
    name: 'FlixNest',
    version: '2.0.0',
    description: 'All-in-one entertainment suite for Movies, TV Shows, Anime, and Live TV. ⚠️ Note: Requires a registered account or subscription.',
    manifestUrl: 'https://flixnest.app/manifest.json',
    setupUrl: 'https://flixnest.app',
    icon: '💵',
    badge: '⚠️ Costs Money • Account Required',
    cost: 'paid'
  },
  {
    id: 'info.sooti.addon',
    name: 'Sooti',
    version: '2.4.1',
    description: 'High-speed cached search companion. ⚠️ Note: Requires a paid Debrid API token (Real-Debrid, TorBox, etc.) for instant playback.',
    manifestUrl: 'https://sooti.info/manifest.json',
    setupUrl: 'https://sooti.info',
    icon: '⚡⚡',
    badge: '⚠️ Costs Money • Requires Debrid Key',
    cost: 'paid'
  },
  {
    id: 'org.stremio.publicdomain',
    name: 'Public Domain Movies & Demos',
    version: '1.2.0',
    description: 'Verified 100% open-access films and 4K 60fps Blender Institute media with zero external dependencies.',
    manifestUrl: 'https://v3-public.strem.io/manifest.json',
    setupUrl: 'https://stremio.com',
    icon: '🏛️',
    badge: '100% Free & Open-Access',
    cost: 'free'
  }
];

export default function AddonManagerModal({
  isOpen,
  onClose,
  addons = [],
  onAddAddon,
  onRemoveAddon
}) {
  if (!isOpen) return null;

  const [manifestUrl, setManifestUrl] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installError, setInstallError] = useState(null);
  const [activeTab, setActiveTab] = useState('installed'); // 'installed' | 'presets' | 'protocol'

  const handleInstall = async (urlToInstall) => {
    const targetUrl = (typeof urlToInstall === 'string' ? urlToInstall : manifestUrl).trim();
    if (!targetUrl || isInstalling) return;

    setIsInstalling(true);
    setInstallError(null);

    try {
      const res = await fetch('/api/addons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manifestUrl: targetUrl })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to install addon manifest');
      }

      if (onAddAddon) {
        onAddAddon(data);
      }

      setManifestUrl('');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      setInstallError(err.message);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-2xl border border-white/[0.18] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ backgroundColor: '#0d101a' }}
      >
        
        {/* Header */}
        <div 
          className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between shrink-0"
          style={{ backgroundColor: '#131826' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center justify-center shadow-sm">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">BalaStream Addon Hub</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  Protocol v3
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Decentralized JSON-RPC Microservices Engine
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

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-2 flex items-center gap-2 border-b border-white/[0.06] text-xs font-mono">
          <button
            onClick={() => setActiveTab('installed')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'installed'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Installed Addons ({addons.length})
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>HTTP Streams Presets</span>
          </button>

          <button
            onClick={() => setActiveTab('protocol')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'protocol'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Protocol Architecture
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-200">
          
          {/* TAB 1: INSTALLED ADDONS */}
          {activeTab === 'installed' && (
            <>
              {/* Install New Addon Box */}
              <form onSubmit={(e) => { e.preventDefault(); handleInstall(); }} className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3">
                <label className="block text-[11px] font-mono uppercase text-purple-300 font-bold tracking-wider">
                  Install Custom Addon Protocol v3 Manifest
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={manifestUrl}
                    onChange={(e) => setManifestUrl(e.target.value)}
                    placeholder="Enter manifest URL (e.g. https://.../manifest.json)"
                    className="flex-1 bg-black/50 border border-white/[0.1] rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:border-purple-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isInstalling || !manifestUrl.trim()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs font-mono transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isInstalling ? 'Installing...' : 'Install'}</span>
                  </button>
                </div>
                {installError && (
                  <p className="text-rose-400 text-[11px] font-mono flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{installError}</span>
                  </p>
                )}
              </form>

              {/* Addons List */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                  Active Addon Microservices ({addons.length})
                </span>

                <div className="space-y-2.5">
                  {addons.map((addon) => (
                    <div
                      key={addon.id}
                      className="p-4 rounded-2xl bg-[#111522] border border-white/[0.06] flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{addon.icon || '🧩'}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white">{addon.name}</h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-400">
                              v{addon.version}
                            </span>
                            {addon.resources?.includes('stream') && (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5" />
                                <span>Stream Provider</span>
                              </span>
                            )}
                            {addon.official && (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                                Official
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {addon.description}
                          </p>
                          <a
                            href={addon.manifestUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-purple-400 hover:text-purple-300 mt-2"
                          >
                            <span>Inspect Manifest JSON</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </span>

                        {!addon.official && onRemoveAddon && (
                          <button
                            onClick={() => onRemoveAddon(addon.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Uninstall Addon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: POPULAR HTTP STREAMS PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/20 via-purple-950/20 to-indigo-950/20 border border-amber-500/30 space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Community HTTP Stream Microservices
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Unlike P2P torrent addons that require downloading entire chunks, **HTTP Stream addons** query public hosting CDNs to deliver immediate, adaptive HLS and MP4 streams directly to your browser with zero torrenting.
                </p>
              </div>

              <div className="space-y-3">
                {POPULAR_HTTP_ADDONS.map((preset) => {
                  const isInstalled = addons.some(a => a.id === preset.id || a.manifestUrl === preset.manifestUrl);
                  return (
                    <div
                      key={preset.id}
                      className="p-4 rounded-2xl bg-[#111522] border border-white/[0.08] flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{preset.icon}</span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white">{preset.name}</h4>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                              preset.cost === 'paid'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            }`}>
                              {preset.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {preset.description}
                          </p>
                          <div className="flex items-center gap-3 pt-1 flex-wrap">
                            {preset.setupUrl && (
                              <a
                                href={preset.setupUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300"
                              >
                                <span>Config Portal ({new URL(preset.setupUrl).hostname})</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setManifestUrl(preset.manifestUrl);
                                setActiveTab('installed');
                              }}
                              className="text-[10px] font-mono text-purple-400 hover:text-purple-300 underline underline-offset-2"
                            >
                              Copy to Custom Manifest Input
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isInstalled ? (
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-bold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Installed</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleInstall(preset.manifestUrl)}
                            disabled={isInstalling}
                            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shadow-md flex items-center gap-1 ${
                              preset.cost === 'paid'
                                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                            } disabled:opacity-50`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Install</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PROTOCOL ARCHITECTURE */}
          {activeTab === 'protocol' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-purple-200 space-y-2">
                <h4 className="font-bold text-sm text-purple-300 flex items-center gap-1.5">
                  <Code className="w-4 h-4" />
                  <span>How Addon Protocol v3 Works</span>
                </h4>
                <p className="text-xs leading-relaxed text-purple-200/90 font-light">
                  Unlike Kodi or Plex which execute arbitrary Python/C plugins locally on the user's computer, Addon Protocol v3 microservices are **decentralized HTTP endpoints**. The client only queries standard JSON endpoints, making it impossible for addons to compromise device security.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                  The 4 Universal Protocol Endpoints
                </span>
                <ul className="space-y-2 text-xs font-mono text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">1. GET /manifest.json:</span>
                    <span>Defines supported types (movie, series), catalogs, and ID prefixes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">2. GET /catalog/:type/:id.json:</span>
                    <span>Returns arrays of titles for browsing and search.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">3. GET /meta/:type/:id.json:</span>
                    <span>Returns detailed metadata, synopsis, cast, and backdrop artwork.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">4. GET /stream/:type/:id.json:</span>
                    <span>Returns playable HTTP, HLS, or direct stream descriptors.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
