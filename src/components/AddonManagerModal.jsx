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
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AddonManagerModal({
  isOpen,
  onClose,
  addons = [],
  onAddAddon
}) {
  if (!isOpen) return null;

  const [manifestUrl, setManifestUrl] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installError, setInstallError] = useState(null);
  const [activeTab, setActiveTab] = useState('installed'); // 'installed' | 'protocol'

  const handleInstall = async (e) => {
    e.preventDefault();
    if (!manifestUrl.trim() || isInstalling) return;

    setIsInstalling(true);
    setInstallError(null);

    try {
      const res = await fetch('/api/addons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manifestUrl: manifestUrl.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to install addon');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
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
                <h3 className="text-base font-bold text-white tracking-tight">Addon Manager</h3>
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
            onClick={() => setActiveTab('protocol')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'protocol'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Protocol v3 Architecture
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-200">
          
          {activeTab === 'installed' && (
            <>
              {/* Install New Addon Box */}
              <form onSubmit={handleInstall} className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3">
                <label className="block text-[11px] font-mono uppercase text-purple-300 font-bold tracking-wider">
                  Install Community Addon
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={manifestUrl}
                    onChange={(e) => setManifestUrl(e.target.value)}
                    placeholder="Enter manifest URL (e.g. https://v3-cinemeta.strem.io/manifest.json)"
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
                  Active Addon Microservices
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
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{addon.name}</h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-400">
                              v{addon.version}
                            </span>
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

                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 shrink-0 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

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
                    <span>Returns playable HTTP, HLS, or torrent stream descriptors.</span>
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
