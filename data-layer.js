const WalkerData = (() => {
  const STORAGE_KEY = 'walkerAnimeData_v1';
  const UNIQUE_KEY = 'walkerAnimeUniqueVisitor';

  const MEDIA_PREFIX = 'walker-media:';
  const MEDIA_DB_NAME = 'walkerAnimeMedia_v1';
  const MEDIA_STORE = 'blobs';

  const isMediaRef = (value) => typeof value === 'string' && value.startsWith(MEDIA_PREFIX);
  const makeMediaRef = (type, id) => `${MEDIA_PREFIX}${type}:${id}`;

  const openMediaDb = () => new Promise((resolve, reject) => {
    try {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB unavailable'));
        return;
      }
      const req = indexedDB.open(MEDIA_DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(MEDIA_STORE)) {
          db.createObjectStore(MEDIA_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('IndexedDB open failed'));
    } catch (err) {
      reject(err);
    }
  });

  const withMediaDb = async (fn) => {
    const db = await openMediaDb();
    try {
      return await fn(db);
    } finally {
      try { db.close(); } catch {}
    }
  };

  const saveMediaBlob = async (key, blob) => withMediaDb((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readwrite');
    const store = tx.objectStore(MEDIA_STORE);
    tx.oncomplete = () => resolve(key);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
    store.put(blob, key);
  }));

  const getMediaBlob = async (key) => withMediaDb((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readonly');
    const store = tx.objectStore(MEDIA_STORE);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  }));

  const deleteMediaBlob = async (key) => withMediaDb((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readwrite');
    const store = tx.objectStore(MEDIA_STORE);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
    store.delete(key);
  }));

  const DEFAULT_ITEMS = [
    {
      id: 0,
      title: "Solo Leveling",
      season: "Season 2",
      desc: "Sung Jin-Woo, once the world's weakest hunter, now commands an army of shadows. But a new catastrophe looms — one that could shatter dimensions themselves.",
      rating: "9.8",
      year: 2025,
      genre: "Action / Fantasy",
      episodes: 12,
      status: "Ongoing",
      studio: "A-1 Pictures",
      thumb: "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?w=1920&q=90",
      tags: ["Action", "Fantasy", "Isekai", "Power Fantasy"],
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      type: "anime",
      viewCount: 0
    },
    {
      id: 1,
      title: "Jujutsu Kaisen",
      season: "Hidden Inventory",
      desc: "The untold story of Gojo Satoru and Geto Suguru during their youth, revealing the tragic origin of their eternal rivalry and the birth of the strongest.",
      rating: "9.6",
      year: 2024,
      genre: "Dark Fantasy",
      episodes: 24,
      status: "Completed",
      studio: "MAPPA",
      thumb: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=90",
      tags: ["Dark Fantasy", "Supernatural", "Action", "Shounen"],
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      type: "anime",
      viewCount: 0
    },
    {
      id: 2,
      title: "Demon Slayer",
      season: "Infinity Castle",
      desc: "The final arc begins. Tanjiro and the remaining Hashira must storm Muzan's fortress — an ever-shifting labyrinth — in humanity's most desperate hour.",
      rating: "9.9",
      year: 2024,
      genre: "Action / Supernatural",
      episodes: 11,
      status: "Ongoing",
      studio: "ufotable",
      thumb: "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1920&q=90",
      tags: ["Action", "Supernatural", "Historical", "Shounen"],
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      type: "anime",
      viewCount: 0
    },
    {
      id: 3,
      title: "One Piece",
      season: "Egghead Arc",
      desc: "The Straw Hats land on Egghead Island, home of Dr. Vegapunk — and stumble into a confrontation that could shake the entire world order.",
      rating: "9.4",
      year: 2025,
      genre: "Adventure / Comedy",
      episodes: 1120,
      status: "Ongoing",
      studio: "Toei Animation",
      thumb: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=1920&q=90",
      tags: ["Adventure", "Comedy", "Shounen", "Long-running"],
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
      type: "anime",
      viewCount: 0
    },
    {
      id: 4,
      title: "Chainsaw Man",
      season: "Season 2",
      desc: "Denji — a boy turned chainsaw devil — navigates a world of violence, hunger, and impossible dreams in this visceral and emotionally raw thriller.",
      rating: "9.1",
      year: 2024,
      genre: "Dark / Horror",
      episodes: 12,
      status: "Ongoing",
      studio: "MAPPA",
      thumb: "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=1920&q=90",
      tags: ["Dark", "Horror", "Action", "Supernatural"],
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      type: "anime",
      viewCount: 0
    },
    {
      id: 5,
      title: "Spy × Family",
      season: "Season 3",
      desc: "Agent Twilight must build a fake family for a top-secret mission. But his fake wife is an assassin, and his fake daughter can read minds.",
      rating: "9.2",
      year: 2025,
      genre: "Comedy / Action",
      episodes: 25,
      status: "Ongoing",
      studio: "WIT Studio",
      thumb: "https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1920&q=90",
      tags: ["Comedy", "Action", "Family", "Slice of Life"],
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      type: "anime",
      viewCount: 0
    },
    {
      id: 6,
      title: "Attack on Titan",
      season: "Final",
      desc: "The war for Paradis reaches its devastating conclusion as Eren Yeager unleashes the Rumbling upon the world beyond the walls.",
      rating: "9.9",
      year: 2023,
      genre: "Dark Fantasy / War",
      episodes: 16,
      status: "Completed",
      studio: "MAPPA",
      thumb: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920&q=90",
      tags: ["Dark Fantasy", "War", "Drama", "Psychological"],
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      type: "anime",
      viewCount: 0
    },
    {
      id: 7,
      title: "Bleach",
      season: "Thousand-Year Blood War",
      desc: "Ichigo Kurosaki faces the Quincy army led by Yhwach in the most epic arc in Bleach's history — fully animated with stunning production.",
      rating: "9.3",
      year: 2024,
      genre: "Action / Supernatural",
      episodes: 52,
      status: "Ongoing",
      studio: "Pierrot",
      thumb: "https://images.unsplash.com/photo-1549078642-b2ba4bda0cdb?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=90",
      tags: ["Action", "Supernatural", "Shounen", "Long-running"],
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      type: "anime",
      viewCount: 0
    },
    {
      id: 8,
      title: "Vinland Saga",
      season: "Season 3",
      desc: "Thorfinn's journey from vengeance to peace continues as he sails toward a new land — a saga of war, redemption and the meaning of strength.",
      rating: "9.7",
      year: 2025,
      genre: "Historical / Drama",
      episodes: 24,
      status: "Ongoing",
      studio: "MAPPA",
      thumb: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1920&q=90",
      tags: ["Historical", "Drama", "Action", "Seinen"],
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      type: "anime",
      viewCount: 0
    },
    {
      id: 9,
      title: "Fullmetal Alchemist",
      season: "Brotherhood",
      desc: "Two brothers sacrifice everything in pursuit of the philosopher's stone — an alchemical masterpiece exploring the cost of human ambition.",
      rating: "9.9",
      year: 2009,
      genre: "Adventure / Drama",
      episodes: 64,
      status: "Completed",
      studio: "Bones",
      thumb: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=90",
      tags: ["Adventure", "Drama", "Action", "Classic"],
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      type: "anime",
      viewCount: 0
    },
    {
      id: 10,
      title: "Naruto Shippuden",
      season: "Complete",
      desc: "Naruto Uzumaki's final battles unfold as the Fourth Great Ninja War engulfs the world, and he faces his destiny as the child of prophecy.",
      rating: "9.2",
      year: 2007,
      genre: "Action / Adventure",
      episodes: 500,
      status: "Completed",
      studio: "Pierrot",
      thumb: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=90",
      tags: ["Action", "Adventure", "Shounen", "Classic"],
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      type: "anime",
      viewCount: 0
    },
    {
      id: 11,
      title: "Tokyo Revengers",
      season: "Final Arc",
      desc: "Takemichi makes one final leap into the past to save everyone he loves — but the future refuses to be rewritten without a price.",
      rating: "8.8",
      year: 2024,
      genre: "Action / Time Travel",
      episodes: 13,
      status: "Completed",
      studio: "Liden Films",
      thumb: "https://images.unsplash.com/photo-1502820573032-4f1e9e57a1e3?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=90",
      tags: ["Action", "Time Travel", "Drama", "Delinquents"],
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      type: "anime",
      viewCount: 0
    }
  ];

  const SECTION_KEYS = ['hero', 'trending', 'newReleases', 'topPicks', 'classics'];

  const cloneDefaults = () => DEFAULT_ITEMS.map(item => ({ ...item }));

  const generateNextId = (items) =>
    items.reduce((max, item) => Math.max(max, typeof item.id === 'number' ? item.id : max), -1) + 1;

  const computeDefaultSections = (items) => {
    const hero = items.slice(0, 4).map(item => item.id);
    const trending = items.slice(0, 8).map(item => item.id);
    const newReleases = [...items].sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 8).map(item => item.id);
    const topPicks = items.slice(0, 6).map(item => item.id);
    const classics = items
      .filter(item => (item.year || 0) < 2020 || parseFloat(item.rating || 0) >= 9.7)
      .slice(0, 8)
      .map(item => item.id);

    return { hero, trending, newReleases, topPicks, classics };
  };

  const ensureItemShape = (item) => ({
    ...item,
    type: item.type || 'anime',
    tags: Array.isArray(item.tags) ? item.tags : (item.tags ? String(item.tags).split(',').map(t => t.trim()).filter(Boolean) : []),
    viewCount: typeof item.viewCount === 'number' ? item.viewCount : 0
  });

  const ensureAnalyticsShape = (analytics = {}) => ({
    totalVisits: analytics.totalVisits || 0,
    uniqueVisitors: analytics.uniqueVisitors || 0,
    playEvents: analytics.playEvents || 0,
    lastVisit: analytics.lastVisit || null,
    lastPlay: analytics.lastPlay || null
  });

  const ensureSectionsShape = (sections, items) => {
    const defaults = computeDefaultSections(items);
    const map = new Map(items.map(item => [item.id, true]));
    const normalize = (key) => (Array.isArray(sections?.[key]) ? sections[key] : defaults[key])
      .map(Number)
      .filter(id => map.has(id));

    return SECTION_KEYS.reduce((acc, key) => {
      acc[key] = normalize(key);
      return acc;
    }, {});
  };

  const createDefaultData = () => {
    const items = cloneDefaults().map(ensureItemShape);
    return {
      version: 1,
      createdAt: Date.now(),
      items,
      meta: { nextId: generateNextId(items) },
      sections: computeDefaultSections(items),
      analytics: ensureAnalyticsShape()
    };
  };

  const migrateData = (data) => {
    if (!data || typeof data !== 'object') {
      return createDefaultData();
    }

    const items = Array.isArray(data.items) && data.items.length
      ? data.items.map(ensureItemShape)
      : cloneDefaults().map(ensureItemShape);

    const migrated = {
      version: typeof data.version === 'number' ? data.version : 1,
      createdAt: data.createdAt || Date.now(),
      items,
      meta: {
        nextId: data.meta?.nextId && data.meta.nextId > 0
          ? data.meta.nextId
          : generateNextId(items)
      },
      sections: ensureSectionsShape(data.sections, items),
      analytics: ensureAnalyticsShape(data.analytics)
    };

    return migrated;
  };

  const loadFromStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const defaults = createDefaultData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        return defaults;
      }
      const parsed = JSON.parse(raw);
      return migrateData(parsed);
    } catch (err) {
      console.warn('[WalkerData] Failed to load data, resetting.', err);
      const defaults = createDefaultData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
  };

  let cache = null;

  const getData = () => {
    if (!cache) {
      cache = loadFromStorage();
    }
    return cache;
  };

  const persist = () => {
    if (cache) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    }
  };

  const recordVisit = () => {
    const data = getData();
    data.analytics.totalVisits = (data.analytics.totalVisits || 0) + 1;
    if (!localStorage.getItem(UNIQUE_KEY)) {
      localStorage.setItem(UNIQUE_KEY, Date.now().toString());
      data.analytics.uniqueVisitors = (data.analytics.uniqueVisitors || 0) + 1;
    }
    data.analytics.lastVisit = Date.now();
    persist();
  };

  const recordPlay = (itemId) => {
    const data = getData();
    const target = data.items.find(item => item.id === itemId);
    if (!target) return;
    target.viewCount = (target.viewCount || 0) + 1;
    data.analytics.playEvents = (data.analytics.playEvents || 0) + 1;
    data.analytics.lastPlay = { itemId, timestamp: Date.now() };
    persist();
  };

  const addItem = (payload) => {
    const data = getData();
    const newItem = ensureItemShape({
      ...payload,
      id: data.meta.nextId++,
      createdAt: Date.now()
    });
    data.items.push(newItem);
    persist();
    return newItem;
  };

  const updateItem = (payload) => {
    const data = getData();
    const index = data.items.findIndex(item => item.id === payload.id);
    if (index === -1) return null;
    data.items[index] = ensureItemShape({
      ...data.items[index],
      ...payload
    });
    persist();
    return data.items[index];
  };

  const deleteItem = (id) => {
    const data = getData();
    const index = data.items.findIndex(item => item.id === id);
    if (index === -1) return false;

    const removed = data.items[index];
    if (removed) {
      [removed.thumb, removed.banner, removed.video].forEach((val) => {
        if (isMediaRef(val)) {
          deleteMediaBlob(val).catch(() => {});
        }
      });
    }
    data.items.splice(index, 1);

    SECTION_KEYS.forEach((key) => {
      data.sections[key] = data.sections[key].filter(entry => entry !== id);
    });

    persist();
    return true;
  };

  const setSections = (sections) => {
    const data = getData();
    data.sections = ensureSectionsShape({
      ...data.sections,
      ...sections
    }, data.items);
    persist();
    return data.sections;
  };

  const resetToDefault = () => {
    cache = createDefaultData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    localStorage.removeItem(UNIQUE_KEY);
    return cache;
  };

  const reload = () => {
    cache = null;
    return getData();
  };

  const getSectionIds = (section) => {
    const data = getData();
    return Array.isArray(data.sections?.[section])
      ? [...data.sections[section]]
      : [];
  };

  return {
    getData,
    recordVisit,
    recordPlay,
    addItem,
    updateItem,
    deleteItem,
    setSections,
    resetToDefault,
    reload,
    getSectionIds,
    isMediaRef,
    makeMediaRef,
    saveMediaBlob,
    getMediaBlob,
    deleteMediaBlob,
    save: persist,
    createDefaultData,
    storageKey: STORAGE_KEY
  };
})();
