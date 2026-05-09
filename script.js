let animeData = [];
let currentHero = 0;
let currentAnime = null;
let favorites = new Set();
let heroTimer;
const mediaUrlCache = new Map();

async function resolveMediaUrl(value) {
  if (!value) return value;
  if (!WalkerData || typeof WalkerData.isMediaRef !== 'function' || !WalkerData.isMediaRef(value)) return value;
  if (mediaUrlCache.has(value)) return mediaUrlCache.get(value);
  const blob = await WalkerData.getMediaBlob(value);
  if (!blob) throw new Error('Missing media blob');
  const url = URL.createObjectURL(blob);
  mediaUrlCache.set(value, url);
  return url;
}

function setImgFromMedia(imgEl, value) {
  if (!imgEl) return;
  resolveMediaUrl(value)
    .then((url) => { imgEl.src = url || ''; })
    .catch(() => {
      imgEl.src = (WalkerData && typeof WalkerData.isMediaRef === 'function' && WalkerData.isMediaRef(value))
        ? ''
        : ((typeof value === 'string' ? value : '') || '');
    });
}

function setBgFromMedia(el, value) {
  if (!el) return;
  resolveMediaUrl(value)
    .then((url) => { el.style.backgroundImage = url ? `url('${url}')` : ''; })
    .catch(() => {
      el.style.backgroundImage = (WalkerData && typeof WalkerData.isMediaRef === 'function' && WalkerData.isMediaRef(value))
        ? ''
        : (value ? `url('${value}')` : '');
    });
}

// ---- DATA MANAGEMENT ----
function refreshData() {
  const store = WalkerData.getData();
  animeData = store.items;
  updateStats(store);
}

function updateStats(data) {
  document.querySelector('[data-stat="titles"]').textContent = data.items.length;
  document.querySelector('[data-stat="visits"]').textContent = data.analytics.totalVisits;
  document.querySelector('[data-stat="plays"]').textContent = data.analytics.playEvents;
  
  const topItem = data.items.length > 0 
    ? data.items.reduce((prev, curr) => (prev.viewCount > curr.viewCount) ? prev : curr)
    : null;
  document.querySelector('[data-stat="top-title"]').textContent = topItem ? topItem.title : '—';
}

// ---- HERO ----
function initHero() {
  const heroIds = WalkerData.getSectionIds('hero');
  const heroItems = animeData.filter(a => heroIds.includes(a.id));
  
  const thumbsEl = document.getElementById('heroThumbs');
  thumbsEl.innerHTML = '';
  
  if (heroItems.length === 0) {
      document.getElementById('heroTitle').textContent = "Welcome to Walker Anime";
      return;
  }

  heroItems.slice(0, 4).forEach((a, i) => {
    const t = document.createElement('div');
    t.className = 'hero-thumb' + (i === 0 ? ' active' : '');
    t.innerHTML = `<img alt="${a.title}" loading="lazy">`;
    setImgFromMedia(t.querySelector('img'), a.thumb);
    t.onclick = () => setHero(i, heroItems);
    thumbsEl.appendChild(t);
  });
  setHero(0, heroItems);
  startHeroTimer(heroItems);
}

function setHero(idx, items) {
  if (!items[idx]) return;
  currentHero = idx;
  const a = items[idx];

  setBgFromMedia(document.getElementById('heroBg'), a.banner);
  document.getElementById('heroTitle').innerHTML = `${a.title}<br><span style="color:var(--red)">${a.season}</span>`;
  document.getElementById('heroRating').innerHTML = `★ ${a.rating}`;
  document.getElementById('heroYear').textContent = a.year;
  document.getElementById('heroGenre').textContent = a.genre;
  document.getElementById('heroEps').textContent = `${a.episodes} Eps`;
  document.getElementById('heroDesc').textContent = a.desc;

  document.getElementById('heroPlayBtn').onclick = () => playVideo(a);
  document.getElementById('heroInfoBtn').onclick = () => openModal(a.id);

  document.querySelectorAll('.hero-thumb').forEach((t, i) => {
    t.classList.toggle('active', i === idx);
  });
}

function startHeroTimer(items) {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => {
    setHero((currentHero + 1) % Math.min(items.length, 4), items);
  }, 7000);
}

// ---- ROWS ----
function makeCard(anime, rank) {
  const d = document.createElement('div');
  d.className = 'anime-card';
  d.innerHTML = `
    <div class="card-img-wrap">
      <img class="card-img" src="" alt="${anime.title}" loading="lazy">
      ${rank !== undefined ? `<div class="card-rank">${rank}</div>` : ''}
      ${anime.status === 'Ongoing' ? `<div class="card-badge">Ongoing</div>` : ''}
      <div class="card-overlay">
        <div class="card-overlay-title">${anime.title}</div>
        <div class="card-overlay-meta">
          <span class="star">★ ${anime.rating}</span>
          <span>${anime.year}</span>
        </div>
        <div class="card-play"><i class="fa-solid fa-play"></i></div>
      </div>
    </div>
    <div class="card-info">
      <div class="card-info-title">${anime.title}</div>
      <div class="card-info-sub"><span class="star">★ ${anime.rating}</span> <span>${anime.genre.split(' / ')[0]}</span></div>
    </div>`;
  setImgFromMedia(d.querySelector('.card-img'), anime.thumb);
  d.onclick = () => openModal(anime.id);
  d.querySelector('.card-play').onclick = (e) => { e.stopPropagation(); playVideo(anime); };
  return d;
}

function makeWideCard(anime) {
  const d = document.createElement('div');
  d.className = 'wide-card';
  d.innerHTML = `
    <div class="wide-card-img"><img src="" alt="${anime.title}" loading="lazy"></div>
    <div class="wide-card-body">
      <div class="wide-card-title">${anime.title}: ${anime.season}</div>
      <div class="wide-card-meta">
        <span class="star">★ ${anime.rating}</span>
        <span>${anime.year}</span>
        <span>${anime.episodes} eps</span>
      </div>
      <div class="wide-card-genres">
        ${anime.tags.slice(0,3).map(t => `<span class="genre-tag">${t}</span>`).join('')}
      </div>
    </div>`;
  setImgFromMedia(d.querySelector('.wide-card-img img'), anime.thumb);
  d.onclick = () => openModal(anime.id);
  return d;
}

function initRows() {
  const trending = document.getElementById('trendingRow');
  const newRow = document.getElementById('newRow');
  const topGrid = document.getElementById('topPicksGrid');
  const classics = document.getElementById('classicsRow');

  // Trending
  WalkerData.getSectionIds('trending').forEach((id, i) => {
      const a = animeData.find(x => x.id === id);
      if(a) trending.appendChild(makeCard(a, i + 1));
  });
  
  // New Releases
  WalkerData.getSectionIds('newReleases').forEach(id => {
      const a = animeData.find(x => x.id === id);
      if(a) newRow.appendChild(makeCard(a));
  });
  
  // Top Picks
  WalkerData.getSectionIds('topPicks').forEach(id => {
      const a = animeData.find(x => x.id === id);
      if(a) topGrid.appendChild(makeWideCard(a));
  });
  
  // Classics
  WalkerData.getSectionIds('classics').forEach((id, i) => {
      const a = animeData.find(x => x.id === id);
      if(a) classics.appendChild(makeCard(a, i + 1));
  });
}

// ---- MODAL ----
function openModal(id) {
  const a = animeData.find(x => x.id === id);
  if (!a) return;
  currentAnime = a;
  setDeepLink(a.id);

  setBgFromMedia(document.getElementById('modalBanner'), a.banner);
  setImgFromMedia(document.getElementById('modalThumb'), a.thumb);
  document.getElementById('modalTitle').textContent = a.title;
  document.getElementById('modalRating').innerHTML = `★ ${a.rating}`;
  document.getElementById('modalYear2').textContent = a.year;
  document.getElementById('modalStatus').textContent = a.status;
  document.getElementById('modalEps2').textContent = `${a.episodes} Episodes`;
  document.getElementById('modalDesc').textContent = a.desc;
  document.getElementById('modalStudio').textContent = a.studio;
  document.getElementById('modalEpisodes').textContent = a.episodes;
  document.getElementById('modalSeason').textContent = a.season;

  const genresEl = document.getElementById('modalGenres');
  genresEl.innerHTML = a.tags.map(t => `<span class="genre-tag">${t}</span>`).join('');

  const favBtn = document.getElementById('favBtn');
  favBtn.classList.toggle('active', favorites.has(a.id));

  document.getElementById('modalPlayBtn').onclick = () => { closeModal(); playVideo(a); };

  document.getElementById('detailModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('detailModal').classList.remove('show');
  document.body.style.overflow = '';
  clearDeepLink();
}

function closeModalCheck(e) {
  if (e.target === document.getElementById('detailModal')) closeModal();
}

function setDeepLink(id) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('id', String(id));
    history.replaceState({ id }, '', url.toString());
  } catch {}
}

function clearDeepLink() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('id');
    history.replaceState({}, '', url.toString());
  } catch {}
}

function getShareUrlForId(id) {
  const url = new URL(window.location.href);
  url.searchParams.set('id', String(id));
  url.hash = '';
  return url.toString();
}

async function shareCurrentAnime() {
  if (!currentAnime) return;
  const shareUrl = getShareUrlForId(currentAnime.id);
  const shareData = {
    title: `${currentAnime.title} - Walker Anime`,
    text: `${currentAnime.title}: ${currentAnime.season}`,
    url: shareUrl
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
  } catch (err) {
    if (err && err.name === 'AbortError') return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Link copied!');
      return;
    }
  } catch {}

  window.prompt('Copy this link:', shareUrl);
}

function openDeepLinkedTitle() {
  try {
    const url = new URL(window.location.href);
    const id = parseInt(url.searchParams.get('id') || '', 10);
    if (!Number.isNaN(id)) openModal(id);
  } catch {}
}

// ---- PLAYER ----
async function playVideo(anime) {
  WalkerData.recordPlay(anime.id);
  document.getElementById('playerTitle').innerHTML = `
    <span style="color:var(--red);font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px">WALKER</span>
    <span style="color:var(--muted);font-weight:400"> — ${anime.title}: ${anime.season} · EP 01</span>`;
  const vid = document.getElementById('playerVideo');
  try {
    if (vid.dataset.objectUrl) {
      URL.revokeObjectURL(vid.dataset.objectUrl);
      vid.dataset.objectUrl = '';
    }
  } catch {}

  vid.pause();
  vid.removeAttribute('src');
  vid.load();

  let src = anime.video;
  if (WalkerData && typeof WalkerData.isMediaRef === 'function' && WalkerData.isMediaRef(anime.video)) {
    showToast('Loading video...');
    const blob = await WalkerData.getMediaBlob(anime.video).catch(() => null);
    if (!blob) {
      showToast('Video not available on this device.');
      return;
    }
    const objUrl = URL.createObjectURL(blob);
    vid.dataset.objectUrl = objUrl;
    src = objUrl;
  }

  vid.src = src;
  document.getElementById('playerOverlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closePlayer() {
  const vid = document.getElementById('playerVideo');
  vid.pause();
  try {
    if (vid.dataset.objectUrl) {
      URL.revokeObjectURL(vid.dataset.objectUrl);
      vid.dataset.objectUrl = '';
    }
  } catch {}
  vid.src = '';
  document.getElementById('playerOverlay').classList.remove('show');
  document.body.style.overflow = '';
  refreshData();
}

// ---- FAVORITES ----
function toggleFav() {
  if (!currentAnime) return;
  if (favorites.has(currentAnime.id)) {
    favorites.delete(currentAnime.id);
    document.getElementById('favBtn').classList.remove('active');
    showToast('💔 Removed from favorites');
  } else {
    favorites.add(currentAnime.id);
    document.getElementById('favBtn').classList.add('active');
    showToast('❤️ Added to favorites!');
  }
}

// ---- SEARCH ----
let searchTimeout;
function handleSearch(val) {
  clearTimeout(searchTimeout);
  const resultsEl = document.getElementById('searchResults');
  if (!val.trim()) { resultsEl.style.display = 'none'; return; }
  searchTimeout = setTimeout(() => {
    const matches = animeData.filter(a =>
      a.title.toLowerCase().includes(val.toLowerCase()) ||
      a.genre.toLowerCase().includes(val.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(val.toLowerCase()))
    ).slice(0, 5);
    if (!matches.length) { resultsEl.style.display = 'none'; return; }
    resultsEl.innerHTML = matches.map(a => `
      <div class="search-item" onclick="selectSearch(${a.id})">
        <img src="" data-thumb="${a.thumb}" alt="">
        <div class="search-item-info">
          <h4>${a.title}</h4>
          <span>★ ${a.rating} · ${a.genre}</span>
        </div>
      </div>`).join('');
    resultsEl.querySelectorAll('img[data-thumb]').forEach((img) => setImgFromMedia(img, img.dataset.thumb));
    resultsEl.style.display = 'block';
  }, 250);
}

function selectSearch(id) {
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').style.display = 'none';
  openModal(id);
}

function closeSearch() {
  setTimeout(() => { document.getElementById('searchResults').style.display = 'none'; }, 200);
}

// ---- TOAST ----
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ---- SCROLL NAV ----
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

function setActiveNav(sectionId) {
  document.querySelectorAll('.nav-links a[data-section], .mobile-nav a[data-section]').forEach((a) => {
    a.classList.toggle('active', a.dataset.section === sectionId);
  });
}

function initNavigation() {
  // Click-to-scroll (desktop + mobile tab bar)
  document.querySelectorAll('.nav-links a[href^="#"], .mobile-nav a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      const sectionId = href ? href.slice(1) : '';
      const target = sectionId ? document.getElementById(sectionId) : null;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveNav(sectionId);
    });
  });

  const ids = ['heroSection', 'trending', 'new-releases', 'top-picks']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window && ids.length) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));
      if (visible.length && visible[0] && visible[0].target && visible[0].target.id) {
        setActiveNav(visible[0].target.id);
      }
    }, { rootMargin: '-40% 0px -55% 0px', threshold: [0.15, 0.25, 0.4, 0.55] });

    ids.forEach(el => observer.observe(el));
  }

  setActiveNav('heroSection');
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setActiveNav('heroSection');
}

// ---- ESC KEY ----
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closePlayer(); }
});

window.addEventListener('beforeunload', () => {
  for (const url of mediaUrlCache.values()) {
    try { URL.revokeObjectURL(url); } catch {}
  }
});

// ---- INIT ----
window.onload = () => {
  WalkerData.recordVisit();
  refreshData();
  initHero();
  initRows();
  initNavigation();
  openDeepLinkedTitle();
};