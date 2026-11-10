import React from 'react';
import { Play, Star, Sparkles, AlertCircle, Film, RefreshCw } from 'lucide-react';

const GENRES = [
  'All',
  'Action',
  'Sci-Fi',
  'Animation',
  'Comedy',
  'Drama',
  'Horror',
  'Adventure',
  'Fantasy',
  'Documentary'
];

export default function MediaGrid({
  items = [],
  activeGenre,
  setActiveGenre,
  onSelectItem,
  isLoading = false,
  error = null,
  onRetry
}) {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6">
      
      {/* Genre Filter Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all border ${
              activeGenre === genre
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30 font-bold'
                : 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="aspect-[2/3] rounded-2xl bg-white/[0.03] animate-pulse border border-white/[0.05]" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && items.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Titles Found</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Try adjusting your search query or selecting a different genre from the filter bar above.
          </p>
        </div>
      )}

      {/* Media Posters Grid */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {items.map((item) => {
            const rawPoster = item.poster && !item.poster.includes('null') ? item.poster : '';
            const posterUrl = rawPoster.replace('/poster/small/', '/poster/medium/');

            return (
              <div
                key={item.id || item.imdb_id || item.name}
                onClick={() => onSelectItem(item)}
                className="group relative cursor-pointer flex flex-col rounded-2xl overflow-hidden bg-[#111422] border border-white/[0.08] hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-900/20"
              >
                {/* Poster Image Container */}
                <div className="aspect-[2/3] w-full overflow-hidden relative bg-[#090b12]">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}

                  {/* Fallback Poster Card if image fails */}
                  <div 
                    className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-[#161a2e] to-[#0c0e18]"
                    style={{ display: posterUrl ? 'none' : 'flex' }}
                  >
                    <Film className="w-8 h-8 text-purple-400 mb-2" />
                    <span className="text-xs font-bold text-white leading-tight line-clamp-3">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1">
                      {item.year || 'Movie'}
                    </span>
                  </div>

                  {/* Open Demo HLS Badge */}
                  {item.isOpenDemo && (
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/90 text-white font-bold shadow-md shadow-emerald-900/40 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Open Stream</span>
                      </span>
                    </div>
                  )}

                  {/* Rating Badge */}
                  {item.imdbRating && (
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-amber-300 border border-amber-400/30 font-bold flex items-center gap-1 shadow-md">
                        <Star className="w-2.5 h-2.5 fill-amber-300" />
                        <span>{item.imdbRating}</span>
                      </span>
                    </div>
                  )}

                  {/* Play Button Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/50 transform translate-y-3 group-hover:translate-y-0 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Card Meta Footer */}
                <div className="p-3 flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight truncate group-hover:text-purple-300 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {item.year || item.type || 'Movie'}
                    </p>
                  </div>

                  {item.genres && item.genres.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 overflow-hidden">
                      <span className="text-[9px] font-mono text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded truncate">
                        {item.genres[0]}
                      </span>
                      {item.genres[1] && (
                        <span className="text-[9px] font-mono text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded truncate">
                          {item.genres[1]}
                        </span>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
