/* =========================================================
   assets/js/gallery.js  (purani gallery.js ki jagah poora paste karo)

   - Admin panel (gallery.php) se jo cards/photos/videos aate hain
     wo gallery API se load hote hain.
   - Aapki purani static photos (assets/gallery/<card>/...) bhi
     waise hi dikhti rehti hain.
   - Cloudinary photos (https links), YouTube unlisted videos aur
     local server par direct upload ki hui chhoti videos (mp4/webm/mov)
     teeno support hote hain.
   - Card, popup, fullscreen lightbox, prev/next sab pehle jaisa.
   ========================================================= */

/* ---- Paths (apni API file ka naam yahan match karo) ---- */
const API_URL     = '/College%20management%20system/backend/scr/gallery_api.php';
const BACKEND_URL = '/College%20management%20system/backend/scr/';
/* -------------------------------------------------------- */

function range(from, to, ext) {
  const arr = [];
  for (let i = from; i <= to; i++) arr.push(i + '.' + ext);
  return arr;
}

/* ---------------------------------------------------------
   PURANA STATIC DATA (jo already assets/gallery/ mein hai)
   Sirf wahi jo pehle se files hain; naya sab admin panel se.
   --------------------------------------------------------- */
const legacy = {
  'campus':           { name: 'Ramgarh College Campus',  category: 'campus',   cover: 'cover.jpg', photos: range(1, 8, 'jpg'),   videos: range(1, 8, 'mp4') },
  'college-building': { name: 'College Building',        category: 'campus',   cover: 'cover.jpg', photos: range(1, 5, 'jpg'),   videos: range(1, 8, 'mp4') },
  'independence-day': { name: 'Independence Day',        category: 'events',   cover: 'i.jpeg',    photos: range(1, 60, 'jpg'),  videos: range(1, 15, 'mp4') },
  'cultural-event':   { name: 'Cultural Event',          category: 'cultural', cover: 'cover.jpg', photos: range(1, 30, 'jpg'),  videos: range(1, 5, 'mp4') },
  'sports':           { name: 'College Sports Activity', category: 'sports',   cover: '1.jpeg',    photos: range(1, 20, 'jpeg'), videos: range(1, 3, 'mp4') },
  'academic':         { name: 'Academic Activity',       category: 'academic', cover: 'cover.jpg', photos: range(1, 10, 'jpg'),  videos: range(1, 8, 'mp4') },
  'college-function': { name: 'College Function',        category: 'events',   cover: 'cover.jpg', photos: range(1, 15, 'jpg'),  videos: range(1, 8, 'mp4') },
  'teachers-day':     { name: 'Teachers Day',            category: 'events',   cover: 'cover.jpg', photos: range(1, 70, 'jpg'),  videos: range(1, 20, 'mp4') },
  'freshers':         { name: 'Freshers Party',          category: 'cultural', cover: 'cover.jpg', photos: range(1, 25, 'jpg'),  videos: range(1, 8, 'mp4') },
  'farewell':         { name: 'Farewell',                category: 'cultural', cover: 'cover.jpg', photos: range(1, 25, 'jpg'),  videos: range(1, 8, 'mp4') }
};

/* ---------- helpers: Cloudinary / YouTube ---------- */
function resolveUrl(p) {
  if (/^https?:\/\//.test(p)) {
    // Cloudinary photo: auto format + quality
    return p.indexOf('res.cloudinary.com') > -1 ? p.replace('/upload/', '/upload/f_auto,q_auto/') : p;
  }
  return BACKEND_URL + p;
}
function ytId(u) {
  const m = /^https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})$/.exec(u || '');
  return m ? m[1] : null;
}

let galleryData = {};   // key -> { name, category, cover, photos[], videos[] }  (sab full URLs)
let cardOrder   = [];

/* ---------- data: API + purana static ko mila do ---------- */
async function loadApiEvents() {
  try {
    const res  = await fetch(API_URL, { cache: 'no-store' });
    const data = await res.json();
    return (data && data.ok && Array.isArray(data.events)) ? data.events : [];
  } catch (e) {
    console.error('Gallery API error:', e);
    return [];   // API na chale to bhi purani static gallery dikhegi
  }
}

function buildData(apiEvents) {
  galleryData = {};
  const legacyKeys = Object.keys(legacy);

  legacyKeys.forEach(function (k) {
    const l = legacy[k];
    const folder = 'assets/gallery/' + k + '/';
    galleryData[k] = {
      name: l.name,
      category: l.category,
      cover: folder + l.cover,
      photos: l.photos.map(function (f) { return folder + f; }),
      videos: l.videos.map(function (f) { return folder + f; })
    };
  });

  const newKeys = [];
  apiEvents.forEach(function (ev) {
    if (!galleryData[ev.slug]) {
      galleryData[ev.slug] = { name: ev.name, category: ev.category, cover: '', photos: [], videos: [] };
      newKeys.push(ev.slug);
    }
    const d = galleryData[ev.slug];
    d.name = ev.name;
    d.category = ev.category || d.category;
    if (ev.cover) d.cover = resolveUrl(ev.cover);
    // admin ki nayi files pehle, purani static baad mein
    d.photos = (ev.photos || []).map(function (p) { return resolveUrl(p.src); }).concat(d.photos);
    d.videos = (ev.videos || []).map(function (v) { return resolveUrl(v.src); }).concat(d.videos);
  });

  cardOrder = newKeys.concat(legacyKeys);   // naye cards sabse upar
}

/* ---------- cards (main grid) ---------- */
function renderCards() {
  const grid = document.querySelector('.gallery-grid');
  if (!grid) return;
  grid.innerHTML = '';

  cardOrder.forEach(function (key) {
    const d = galleryData[key];
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.setAttribute('data-category', d.category);

    const img = document.createElement('img');
    img.src = d.cover;
    img.alt = d.name;
    img.loading = 'lazy';

    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    const h3 = document.createElement('h3');
    h3.textContent = d.name;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'view-btn';
    btn.textContent = 'View';
    btn.addEventListener('click', function () { openGallery(key); });

    overlay.appendChild(h3);
    overlay.appendChild(btn);
    item.appendChild(img);
    item.appendChild(overlay);
    grid.appendChild(item);
  });
}

/* ---------- popups (har card ka) ---------- */
function renderPopups() {
  document.querySelectorAll('.gallery-popup').forEach(function (p) { p.remove(); });   // purane static popups hata do
  const anchor = document.getElementById('popupLightbox');

  cardOrder.forEach(function (key) {
    const d = galleryData[key];

    const popup = document.createElement('div');
    popup.id = 'popup-' + key;
    popup.className = 'gallery-popup';

    const content = document.createElement('div');
    content.className = 'gallery-popup-content';

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'gallery-close';
    close.innerHTML = '&times;';
    close.addEventListener('click', function () { closeGallery(key); });

    const title = document.createElement('h2');
    title.textContent = d.name;

    content.appendChild(close);
    content.appendChild(title);

    /* Photos */
    if (d.photos.length) {
      const ph = document.createElement('h3');
      ph.textContent = 'Photos';
      const photoBox = document.createElement('div');
      photoBox.className = 'popup-gallery';
      photoBox.id = 'photos-' + key;
      d.photos.forEach(function (url, idx) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = d.name;
        img.loading = 'lazy';
        img.style.cursor = 'pointer';
        img.addEventListener('click', function () { openPopupLightbox(key, idx); });
        photoBox.appendChild(img);
      });
      content.appendChild(ph);
      content.appendChild(photoBox);
    }

    /* Videos */
    if (d.videos.length) {
      const vh = document.createElement('h3');
      vh.textContent = 'Videos';
      const videoBox = document.createElement('div');
      videoBox.className = 'popup-videos';
      videoBox.id = 'videos-' + key;
      d.videos.forEach(function (url, idx) {
        const wrap = document.createElement('div');
        wrap.className = 'video-thumb';

        const yid = ytId(url);
        if (yid) {
          // YouTube video: thumbnail image dikhao
          const thumb = document.createElement('img');
          thumb.src = 'https://img.youtube.com/vi/' + yid + '/hqdefault.jpg';
          thumb.alt = d.name;
          thumb.loading = 'lazy';
          thumb.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
          wrap.appendChild(thumb);
        } else {
          // Local server video (mp4/webm/mov): #t=0.5 se thumbnail me ek frame dikhta hai (phone par bhi)
          const video = document.createElement('video');
          video.src = url + (url.indexOf('#') === -1 ? '#t=0.5' : '');
          video.muted = true;
          video.playsInline = true;
          video.setAttribute('playsinline', '');
          video.preload = 'metadata';
          wrap.appendChild(video);
        }

        const playIcon = document.createElement('span');
        playIcon.className = 'play-icon';
        playIcon.innerHTML = '&#9658;';
        wrap.appendChild(playIcon);
        wrap.addEventListener('click', function () { openPopupLightbox(key, idx, 'video'); });
        videoBox.appendChild(wrap);
      });
      content.appendChild(vh);
      content.appendChild(videoBox);
    }

    if (!d.photos.length && !d.videos.length) {
      const empty = document.createElement('p');
      empty.textContent = 'Photos jald hi add ki jayengi.';
      content.appendChild(empty);
    }

    popup.appendChild(content);
    popup.addEventListener('click', function (event) {
      if (event.target === popup) closeGallery(key);
    });
    document.body.insertBefore(popup, anchor);
  });
}

/* ---------- popup open / close ---------- */
function openGallery(key) {
  document.querySelectorAll('.gallery-popup').forEach(function (p) { p.style.display = 'none'; });
  const popup = document.getElementById('popup-' + key);
  if (popup) {
    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}
window.openGallery = openGallery;

function closeGallery(key) {
  const popup = document.getElementById('popup-' + key);
  if (popup) popup.style.display = 'none';
  document.body.style.overflow = 'auto';
}
window.closeGallery = closeGallery;

/* ---------- filter buttons ---------- */
function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      document.querySelectorAll('.gallery-item').forEach(function (item) {
        const match = (filter === 'all' || item.getAttribute('data-category') === filter);
        item.style.display = match ? '' : 'none';
      });
    });
  });
}

/* ---------- main grid lightbox (cover images) ---------- */
let galleryImages = [];
let currentLightboxIndex = 0;

function showLightbox() {
  document.getElementById('lightboxImage').src = galleryImages[currentLightboxIndex];
  document.getElementById('galleryLightbox').classList.add('active');
}

function setupMainLightbox() {
  galleryImages = Array.from(document.querySelectorAll('.gallery-item > img')).map(function (img) { return img.src; });

  document.querySelectorAll('.gallery-item').forEach(function (item, idx) {
    const img = item.querySelector('img');
    if (!img) return;
    img.addEventListener('click', function () {
      currentLightboxIndex = idx;
      showLightbox();
    });
  });

  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn  = document.getElementById('lightboxPrev');
  const nextBtn  = document.getElementById('lightboxNext');

  if (closeBtn) closeBtn.addEventListener('click', function () {
    document.getElementById('galleryLightbox').classList.remove('active');
  });
  if (prevBtn) prevBtn.addEventListener('click', function () {
    if (!galleryImages.length) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
    showLightbox();
  });
  if (nextBtn) nextBtn.addEventListener('click', function () {
    if (!galleryImages.length) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % galleryImages.length;
    showLightbox();
  });
}

/* ---------- popup ke andar fullscreen lightbox (photo + video + YouTube) ---------- */
let popupLbKey = null, popupLbIndex = 0, popupLbType = 'photo';

function openPopupLightbox(key, idx, type) {
  popupLbKey = key;
  popupLbIndex = idx;
  popupLbType = type || 'photo';
  renderPopupLightbox();
  document.getElementById('popupLightbox').classList.add('open');
}

function getYtFrame() {
  let f = document.getElementById('popupLightboxYt');
  if (!f) {
    f = document.createElement('iframe');
    f.id = 'popupLightboxYt';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    f.style.cssText = 'display:none;width:90%;max-width:960px;aspect-ratio:16/9;border:0;border-radius:8px';
    document.getElementById('popupLightboxVideo').after(f);
  }
  return f;
}

function renderPopupLightbox() {
  const data    = galleryData[popupLbKey];
  const imgEl   = document.getElementById('popupLightboxImg');
  const videoEl = document.getElementById('popupLightboxVideo');
  const yt      = getYtFrame();

  yt.removeAttribute('src');
  yt.style.display = 'none';

  if (popupLbType === 'video') {
    const url = data.videos[popupLbIndex];
    const id  = ytId(url);
    if (id) {
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.style.display = 'none';
      imgEl.style.display = 'none';
      yt.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
      yt.style.display = 'block';
      return;
    }
    // Local server video: <video> tag me chalao (controls ke saath)
    videoEl.playsInline = true;
    videoEl.src = url;
    videoEl.style.display = 'block';
    imgEl.style.display = 'none';
    videoEl.load();
    var pr = videoEl.play();
    if (pr && pr.catch) pr.catch(function () {});   // autoplay block ho to error na aaye, user play dabayega
  } else {
    videoEl.pause();
    videoEl.removeAttribute('src');
    videoEl.style.display = 'none';
    imgEl.src = data.photos[popupLbIndex];
    imgEl.style.display = 'block';
  }
}

function navPopupLightbox(dir) {
  const data = galleryData[popupLbKey];
  const list = (popupLbType === 'video') ? data.videos : data.photos;
  if (!list.length) return;
  popupLbIndex = (popupLbIndex + dir + list.length) % list.length;
  renderPopupLightbox();
}

function closePopupLightbox() {
  document.getElementById('popupLightbox').classList.remove('open');
  const videoEl = document.getElementById('popupLightboxVideo');
  videoEl.pause();
  videoEl.removeAttribute('src');
  const yt = document.getElementById('popupLightboxYt');
  if (yt) { yt.removeAttribute('src'); yt.style.display = 'none'; }
}

/* HTML ke onclick="" in functions ko dhundhta hai */
window.openPopupLightbox  = openPopupLightbox;
window.navPopupLightbox   = navPopupLightbox;
window.closePopupLightbox = closePopupLightbox;

/* ---------- keyboard ---------- */
document.addEventListener('keydown', function (e) {
  const lbOpen = document.getElementById('popupLightbox').classList.contains('open');
  if (e.key === 'Escape') {
    if (lbOpen) { closePopupLightbox(); return; }
    document.querySelectorAll('.gallery-popup').forEach(function (p) { p.style.display = 'none'; });
    document.body.style.overflow = 'auto';
    const main = document.getElementById('galleryLightbox');
    if (main) main.classList.remove('active');
  }
  if (lbOpen && e.key === 'ArrowLeft')  navPopupLightbox(-1);
  if (lbOpen && e.key === 'ArrowRight') navPopupLightbox(1);
});

/* ---------- start ---------- */
document.addEventListener('DOMContentLoaded', async function () {
  const apiEvents = await loadApiEvents();
  buildData(apiEvents);
  renderCards();
  renderPopups();
  setupFilters();
  setupMainLightbox();
});