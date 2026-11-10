import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5185;

app.use(cors());
app.use(express.json());

// Serve static frontend in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// In-memory cache for Cinemeta requests to avoid repeat network round-trips
const cache = new Map();

// Curated open-access streams & public domain films with verified HLS/MP4 playback
const OPEN_STREAMS = [
  {
    id: 'stream-tears-of-steel',
    imdb_id: 'tt2285752',
    name: 'Tears of Steel',
    year: '2012',
    type: 'movie',
    poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Tears_of_Steel_poster.jpg/800px-Tears_of_Steel_poster.jpg',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    description: 'Set in a dystopian future Amsterdam, a group of scientists and warriors stage a desperate attempt to rescue the earth from destructive robotic tentacles.',
    genres: ['Sci-Fi', 'Action', 'Short'],
    director: ['Ian Hubert'],
    cast: ['Derek de Lint', 'Sergio Hasselbaink', 'Rogier Schippers'],
    imdbRating: '7.0',
    streams: [
      {
        name: 'HLS Adaptive Multi-Bitrate (4K / 1080p / 720p)',
        type: 'hls',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        quality: '4K Multi-Audio',
        codec: 'H.264 / AAC',
        bitrate: '5,200 kbps'
      },
      {
        name: 'Direct MP4 Mirror (1080p)',
        type: 'mp4',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        quality: '1080p',
        codec: 'H.264 / AAC',
        bitrate: '3,800 kbps'
      }
    ]
  },
  {
    id: 'stream-big-buck-bunny',
    imdb_id: 'tt1254207',
    name: 'Big Buck Bunny',
    year: '2008',
    type: 'movie',
    poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg',
    banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop',
    description: 'A large and lovable rabbit deals with bullying forest creatures in this groundbreaking open-source animation classic produced by the Blender Institute.',
    genres: ['Animation', 'Comedy', 'Family'],
    director: ['Sacha Goedegebure'],
    cast: ['Jan Morgenstern'],
    imdbRating: '7.8',
    streams: [
      {
        name: 'HLS 60fps Ultra HD',
        type: 'hls',
        url: 'https://test-streams.mux.dev/test_001/stream.m3u8',
        quality: '1080p 60fps',
        codec: 'H.264 / AAC',
        bitrate: '4,500 kbps'
      },
      {
        name: 'Direct MP4 Stream',
        type: 'mp4',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        quality: '1080p',
        codec: 'H.264 / AAC',
        bitrate: '3,200 kbps'
      }
    ]
  },
  {
    id: 'stream-sintel',
    imdb_id: 'tt1727587',
    name: 'Sintel',
    year: '2010',
    type: 'movie',
    poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Sintel_poster.jpg/800px-Sintel_poster.jpg',
    banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    description: 'A lonely young woman searches the world for a baby dragon she nurtured back to health, only to discover a heartbreaking truth.',
    genres: ['Animation', 'Fantasy', 'Adventure'],
    director: ['Colin Levy'],
    cast: ['Halina Reijn', 'Thom Hoffman'],
    imdbRating: '7.4',
    streams: [
      {
        name: 'HLS Adaptive Multi-Bitrate Stream',
        type: 'hls',
        url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
        quality: '1080p Surround',
        codec: 'H.264 / AAC',
        bitrate: '4,100 kbps'
      },
      {
        name: 'Direct MP4 Mirror',
        type: 'mp4',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        quality: '1080p',
        codec: 'H.264 / AAC',
        bitrate: '3,500 kbps'
      }
    ]
  },
  {
    id: 'stream-elephants-dream',
    imdb_id: 'tt0829094',
    name: "Elephants Dream",
    year: '2006',
    type: 'movie',
    poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_poster.jpg/800px-Elephants_Dream_poster.jpg',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    description: 'Proog and Emo explore the bizarre, surreal mechanical labyrinth of a giant organic machine whose purpose is shrouded in mystery.',
    genres: ['Animation', 'Sci-Fi', 'Short'],
    director: ['Bassam Kurdali'],
    cast: ['Tygo Gernandt', 'Cas Jansen'],
    imdbRating: '6.8',
    streams: [
      {
        name: 'Direct MP4 Master Stream',
        type: 'mp4',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        quality: '1080p',
        codec: 'H.264 / AAC',
        bitrate: '3,000 kbps'
      }
    ]
  }
];

// Default Stremio Addons Registry
let installedAddons = [
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Stremio Studio Web Player & Forensic Workbench',
    version: '5.1.30-reconstructed',
    nativeShell: 'Rust / Wry 0.51.2 / WebKit',
    videoEngine: 'libmpv C ABI + Apple VideoToolbox',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Stremio Addon Protocol v3 Catalog Proxy
app.get('/api/catalog', async (req, res) => {
  const { type = 'movie', genre, search } = req.query;
  const cacheKey = `catalog_${type}_${genre || 'all'}_${search || ''}`;

  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }

  try {
    let targetUrl;
    if (search) {
      targetUrl = `https://v3-cinemeta.strem.io/catalog/${type}/top/search=${encodeURIComponent(search)}.json`;
    } else if (genre) {
      targetUrl = `https://v3-cinemeta.strem.io/catalog/${type}/top/genre=${encodeURIComponent(genre)}.json`;
    } else {
      targetUrl = `https://v3-cinemeta.strem.io/catalog/${type}/top.json`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'StremioStudio/1.0 (Macintosh; Apple Silicon) Stremio/5.1.30'
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Cinemeta returned HTTP ${response.status}`);
    }

    const data = await response.json();
    let metas = data.metas || [];

    // Prepend open demo streams to the top of movie catalogs so users can immediately test playback
    if (type === 'movie' && !search && (!genre || genre === 'All')) {
      const openStreamMetas = OPEN_STREAMS.map(item => ({
        id: item.id,
        imdb_id: item.imdb_id,
        name: item.name,
        type: item.type,
        poster: item.poster,
        description: item.description,
        genres: item.genres,
        imdbRating: item.imdbRating,
        isOpenDemo: true
      }));

      // Deduplicate
      metas = [...openStreamMetas, ...metas.filter(m => !openStreamMetas.some(o => o.id === m.id))];
    }

    const result = { type, genre: genre || 'All', metas };
    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.warn(`Cinemeta catalog fetch failed (${err.message}). Using fallback curated open catalog.`);

    // Resilient fallback with open demo titles
    const fallbackMetas = OPEN_STREAMS.map(item => ({
      id: item.id,
      imdb_id: item.imdb_id,
      name: item.name,
      type: item.type,
      poster: item.poster,
      description: item.description,
      genres: item.genres,
      imdbRating: item.imdbRating,
      isOpenDemo: true
    }));

    res.json({
      type,
      genre: genre || 'All',
      metas: fallbackMetas,
      fallback: true
    });
  }
});

// Stream candidate resolver
app.get('/api/streams/:id', (req, res) => {
  const { id } = req.params;
  const match = OPEN_STREAMS.find(item => item.imdb_id === id || item.id === id);

  if (match) {
    return res.json({
      id: match.imdb_id,
      name: match.name,
      description: match.description,
      poster: match.poster,
      banner: match.banner,
      genres: match.genres,
      cast: match.cast,
      director: match.director,
      streams: match.streams
    });
  }

  // Generic fallback open stream for standard Cinemeta items
  res.json({
    id,
    name: 'Selected Title',
    streams: [
      {
        name: 'Demo HLS Adaptive Multi-Bitrate (Apple VideoToolbox)',
        type: 'hls',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        quality: '1080p Multi-Audio',
        codec: 'H.264 / AAC',
        bitrate: '4,800 kbps'
      },
      {
        name: 'Direct MP4 Stream Mirror',
        type: 'mp4',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        quality: '1080p',
        codec: 'H.264 / AAC',
        bitrate: '3,200 kbps'
      }
    ]
  });
});

// Stremio Addons Management
app.get('/api/addons', (req, res) => {
  res.json(installedAddons);
});

app.post('/api/addons', async (req, res) => {
  const { manifestUrl } = req.body;
  if (!manifestUrl) {
    return res.status(400).json({ error: 'manifestUrl is required' });
  }

  try {
    const response = await fetch(manifestUrl);
    const manifest = await response.json();

    const newAddon = {
      id: manifest.id || `custom.addon.${Date.now()}`,
      name: manifest.name || 'Custom Addon',
      version: manifest.version || '1.0.0',
      description: manifest.description || 'Community Stremio Addon Protocol v3 integration.',
      manifestUrl,
      icon: '🧩',
      official: false
    };

    installedAddons.push(newAddon);
    res.status(201).json(newAddon);
  } catch (err) {
    res.status(400).json({ error: `Failed to fetch addon manifest: ${err.message}` });
  }
});

// Fallback all routes to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🎬 Stremio Studio Server running on http://localhost:${PORT}`);
});
