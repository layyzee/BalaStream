import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import MediaGrid from './components/MediaGrid.jsx';
import VideoPlayerModal from './components/VideoPlayerModal.jsx';
import AddonManagerModal from './components/AddonManagerModal.jsx';
import ArchitectureModal from './components/ArchitectureModal.jsx';

const DEFAULT_ITEMS = [
  {
    id: 'stream-tears-of-steel',
    imdb_id: 'tt2285752',
    name: 'Tears of Steel',
    year: '2012',
    type: 'movie',
    poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Tears_of_Steel_poster.jpg/800px-Tears_of_Steel_poster.jpg',
    description: 'Set in a dystopian future Amsterdam, a group of scientists and warriors stage a desperate attempt to rescue the earth from destructive robotic tentacles.',
    genres: ['Sci-Fi', 'Action', 'Short'],
    imdbRating: '7.0',
    isOpenDemo: true
  },
  {
    id: 'stream-big-buck-bunny',
    imdb_id: 'tt1254207',
    name: 'Big Buck Bunny',
    year: '2008',
    type: 'movie',
    poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg',
    description: 'A large and lovable rabbit deals with bullying forest creatures in this groundbreaking open-source animation classic produced by the Blender Institute.',
    genres: ['Animation', 'Comedy', 'Family'],
    imdbRating: '7.8',
    isOpenDemo: true
  },
  {
    id: 'stream-sintel',
    imdb_id: 'tt1727587',
    name: 'Sintel',
    year: '2010',
    type: 'movie',
    poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Sintel_poster.jpg/800px-Sintel_poster.jpg',
    description: 'A lonely young woman searches the world for a baby dragon she nurtured back to health, only to discover a heartbreaking truth.',
    genres: ['Animation', 'Fantasy', 'Adventure'],
    imdbRating: '7.4',
    isOpenDemo: true
  },
  {
    id: 'stream-elephants-dream',
    imdb_id: 'tt0829094',
    name: "Elephants Dream",
    year: '2006',
    type: 'movie',
    poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_poster.jpg/800px-Elephants_Dream_poster.jpg',
    description: 'Proog and Emo explore the bizarre, surreal mechanical labyrinth of a giant organic machine whose purpose is shrouded in mystery.',
    genres: ['Animation', 'Sci-Fi', 'Short'],
    imdbRating: '6.8',
    isOpenDemo: true
  }
];

const DEFAULT_ADDONS = [
  {
    id: 'com.linvo.cinemeta',
    name: 'Cinemeta (Official)',
    version: '3.0.14',
    description: 'Official metadata provider for movies and series catalogs via IMDb & TheMovieDB.',
    manifestUrl: 'https://v3-cinemeta.strem.io/manifest.json',
    icon: '🎬',
    official: true
  },
  {
    id: 'org.stremio.opensubtitles',
    name: 'OpenSubtitles v3',
    version: '1.0.0',
    description: 'Official subtitle provider matching film audio tracks across 60+ languages.',
    manifestUrl: 'https://opensubtitles-v3.strem.io/manifest.json',
    icon: '💬',
    official: true
  },
  {
    id: 'org.stremio.publicdomain',
    name: 'Public Domain Movies & Demos',
    version: '1.2.0',
    description: 'Open-access cinematic masterpieces and 4K 60fps Blender Institute media.',
    manifestUrl: 'https://v3-public.strem.io/manifest.json',
    icon: '🏛️',
    official: true
  }
];

export default function App() {
  const queryParams = new URLSearchParams(window.location.search);
  
  const [activeType, setActiveType] = useState('movie');
  const [activeGenre, setActiveGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modals state
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(queryParams.get('addons') === 'true');
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(queryParams.get('arch') === 'true');
  const [addons, setAddons] = useState(DEFAULT_ADDONS);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch installed addons
  useEffect(() => {
    fetch('/api/addons')
      .then(r => r.json())
      .then(data => setAddons(data))
      .catch(() => console.log('Using local fallback addons'));
  }, []);

  // Fetch catalog items from backend (Cinemeta proxy)
  const fetchCatalog = () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set('type', activeType);
    if (activeGenre && activeGenre !== 'All') {
      params.set('genre', activeGenre);
    }
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    }

    fetch(`/api/catalog?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        setItems(data.metas || []);
        setIsLoading(false);

        // Auto-open player if query param ?play=id is passed
        const playId = queryParams.get('play');
        if (playId) {
          const match = data.metas?.find(m => m.id === playId || m.imdb_id === playId);
          if (match) setSelectedItem(match);
        }
      })
      .catch(err => {
        console.error('Catalog fetch error:', err);
        setError('Failed to connect to Cinemeta catalog. Showing fallback open media.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCatalog();
  }, [activeType, activeGenre, debouncedSearch]);

  const handleAddAddon = (newAddon) => {
    setAddons(prev => [...prev, newAddon]);
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] text-slate-100 flex flex-col font-sans selection:bg-purple-600/40">
      
      {/* 1. Top Navigation Bar */}
      <Navbar
        activeType={activeType}
        setActiveType={(type) => {
          setActiveType(type);
          setActiveGenre('All');
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAddons={() => setIsAddonModalOpen(true)}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        addonCount={addons.length}
      />

      {/* 2. Main Media Catalog Grid */}
      <main className="flex-1 flex flex-col">
        <MediaGrid
          items={items}
          activeGenre={activeGenre}
          setActiveGenre={setActiveGenre}
          onSelectItem={(item) => setSelectedItem(item)}
          isLoading={isLoading}
          error={error}
          onRetry={fetchCatalog}
        />
      </main>

      {/* 3. Footer Banner with Recruiter Credentials */}
      <footer className="px-6 py-4 border-t border-white/[0.06] bg-[#07080d] text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>BalaStream Engine: Rust Wry 0.51.2 • libmpv.2 C ABI • Apple VideoToolbox</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Curated by <strong className="text-white">Balaji Palani</strong> (Senior Scrum Master / SAFe® 6 SSM)</span>
          <span>•</span>
          <span className="text-purple-400">100% Free & Open Source ($0.00)</span>
        </div>
      </footer>

      {/* 4. Interactive Video Player Modal */}
      {selectedItem && (
        <VideoPlayerModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          allItems={items}
          onSwitchItem={(item) => setSelectedItem(item)}
        />
      )}

      {/* 5. Addon Protocol v3 Manager Modal */}
      <AddonManagerModal
        isOpen={isAddonModalOpen}
        onClose={() => setIsAddonModalOpen(false)}
        addons={addons}
        onAddAddon={handleAddAddon}
      />

      {/* 6. Forensic Architecture Deconstruction Modal */}
      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

    </div>
  );
}
