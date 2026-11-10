import React from 'react';
import { 
  Play, 
  Search, 
  Film, 
  Tv, 
  Puzzle, 
  Cpu, 
  X, 
  ShieldCheck, 
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function Navbar({
  activeType,
  setActiveType,
  searchQuery,
  setSearchQuery,
  onOpenAddons,
  onOpenArchitecture,
  addonCount = 3
}) {
  return (
    <header className="sticky top-0 z-40 glass-header px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      
      {/* Brand & Category Tabs */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 cursor-pointer select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-sans">
                Stremio<span className="text-purple-400">Studio</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                v5.1.30 Web
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Native Rust & Wry WebKit Forensic Workbench
            </p>
          </div>
        </div>

        {/* Media Type Switcher */}
        <div className="hidden md:flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-medium">
          <button
            onClick={() => setActiveType('movie')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeType === 'movie'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Movies</span>
          </button>

          <button
            onClick={() => setActiveType('series')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeType === 'series'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Series</span>
          </button>
        </div>
      </div>

      {/* Center: Search Omnibar */}
      <div className="flex-1 max-w-md mx-auto order-3 sm:order-2 w-full sm:w-auto">
        <div className="relative flex items-center w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.1] hover:border-white/[0.2] focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all text-xs font-mono">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeType === 'movie' ? 'movies' : 'series'} in Cinemeta...`}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 outline-none text-xs font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-white ml-2 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls: Addons, Architecture & Recruiter Identity */}
      <div className="flex items-center gap-3 order-2 sm:order-3">
        <button
          onClick={onOpenAddons}
          className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-xs font-mono border border-white/[0.08] transition-all flex items-center gap-1.5"
          title="Manage Stremio Addon Protocol v3 Integrations"
        >
          <Puzzle className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden lg:inline">Addons</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
            {addonCount}
          </span>
        </button>

        <button
          onClick={onOpenArchitecture}
          className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm"
          title="Inspect Stremio Desktop 5 Reverse-Engineered Architecture"
        >
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Architecture Deep Dive</span>
        </button>

        {/* Balaji Palani Recruiter Badge */}
        <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-white/[0.08]">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            B
          </div>
          <div className="text-left text-[11px] leading-tight font-sans">
            <div className="text-white font-bold">Balaji Palani</div>
            <div className="text-[10px] text-purple-300 font-mono">Senior Scrum Master</div>
          </div>
        </div>
      </div>

    </header>
  );
}
