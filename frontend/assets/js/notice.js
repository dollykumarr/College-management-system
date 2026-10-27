/* =========================================================
   NOTICE BOARD — notice.js
   Dynamic notice board connected to notices_api.php
   (all icons are inline SVG, so no encoding problems)
   ========================================================= */

/* =========================
   API PATHS
   ========================= */

const API_URL =
  '/College%20management%20system/backend/scr/notices_api.php';

const UPLOAD_URL =
  '/College%20management%20system/backend/scr/uploads/notices/';


/* =========================
   SETTINGS
   ========================= */

const PAGE_SIZE = 6;
const NEW_DAYS = 7;


/* =========================
   SVG ICONS
   ========================= */

const svg = (paths) =>
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" ' +
  'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
  'stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';

const ICONS = {
  list: svg(
    '<path d="M8 6h13M8 12h13M8 18h13"/>' +
    '<circle cx="3.5" cy="6" r="1"/>' +
    '<circle cx="3.5" cy="12" r="1"/>' +
    '<circle cx="3.5" cy="18" r="1"/>'
  ),
  calendar: svg(
    '<rect x="3" y="4" width="18" height="18" rx="2"/>' +
    '<path d="M16 2v4M8 2v4M3 10h18"/>'
  ),
  down: svg('<path d="M6 9l6 6 6-6"/>'),
  up: svg('<path d="M18 15l-6-6-6 6"/>'),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  inbox: svg(
    '<path d="M22 12h-6l-2 3h-4l-2-3H2"/>' +
    '<path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>'
  )
};


/* =========================
   DOM ELEMENTS
   ========================= */

const importantList = document.getElementById('importantList');
const noticeList = document.getElementById('noticeList');
const archiveYears = document.getElementById('archiveYears');
const archiveList = document.getElementById('archiveList');

const searchInput = document.getElementById('noticeSearch');
const categorySel = document.getElementById('noticeCategory');


/* =========================
   STATE
   ========================= */

let allNotices = [];
let activeCat = 'all';
let visibleCount = PAGE_SIZE;


/* =========================
   HELPERS
   ========================= */

function esc(value) {
  const div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML;
}

function fmtDate(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString + 'T00:00:00');

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function cap(value) {
  if (!value) return '';

  return String(value).charAt(0).toUpperCase() +
         String(value).slice(1);
}

function todayStart() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysFromToday(dateString) {
  if (!dateString) return null;

  const date = new Date(dateString + 'T00:00:00');

  if (Number.isNaN(date.getTime())) return null;

  return Math.round((date - todayStart()) / 86400000);
}

function fileUrl(fileName) {
  return UPLOAD_URL + encodeURIComponent(String(fileName));
}


/* =========================
   NEW BADGE
   ========================= */

function isNew(notice) {
  if (!notice.notice_date) return false;

  const age = -daysFromToday(notice.notice_date);

  return age >= 0 && age <= NEW_DAYS;
}


/* =========================
   DEADLINE BADGE
   ========================= */

function deadlineTag(notice) {

  if (!notice.deadline) return '';

  const remaining = daysFromToday(notice.deadline);

  if (remaining === null) return '';

  /* Deadline passed */
  if (remaining < 0) {
    return '<span class="notice-tag tag-closed">Closed</span>';
  }

  /* Last day */
  if (remaining === 0) {
    return '<span class="notice-tag tag-urgent">Last day today</span>';
  }

  /* 1-7 days */
  if (remaining <= 7) {
    return `
      <span class="notice-tag tag-urgent">
        ${remaining} day${remaining > 1 ? 's' : ''} left
      </span>
    `;
  }

  /* More than 7 days */
  return `
    <span class="notice-tag tag-deadline">
      Deadline: ${esc(fmtDate(notice.deadline))}
    </span>
  `;
}


/* =========================
   BADGES
   ========================= */

function badges(notice) {

  let html = '';

  if (isNew(notice)) {
    html += '<span class="notice-tag tag-new">NEW</span>';
  }

  html += deadlineTag(notice);

  return html;
}


/* =========================
   ATTACHMENT PREVIEW
   ========================= */

function thumb(notice) {

  if (!notice.attachment) return '';

  const fileName = String(notice.attachment);
  const lowerName = fileName.toLowerCase();
  const url = fileUrl(fileName);

  /* IMAGE */
  if (/\.(jpe?g|png|webp)$/i.test(lowerName)) {
    return `
      <a href="${url}" target="_blank" rel="noopener"
         class="notice-attachment" aria-label="Open image attachment">
        <img src="${url}" alt="Notice attachment" loading="lazy">
        <span class="attachment-overlay">View image</span>
      </a>
    `;
  }

  /* PDF */
  if (lowerName.endsWith('.pdf')) {
    return `
      <a href="${url}" target="_blank" rel="noopener"
         class="notice-attachment notice-pdf">
        <span class="pdf-icon">PDF</span>
        <span class="pdf-text">View PDF</span>
      </a>
    `;
  }

  return '';
}


/* =========================
   ACTION BUTTONS
   ========================= */

function fileLinks(notice) {

  if (!notice.attachment) {
    return '<span class="no-attachment">No attachment</span>';
  }

  const fileName = String(notice.attachment);
  const url = fileUrl(fileName);
  const isPdf = fileName.toLowerCase().endsWith('.pdf');

  let html = `
    <a href="${url}" target="_blank" rel="noopener"
       class="notice-action view-btn">View</a>
  `;

  if (isPdf) {
    html += `
      <a href="${url}" download
         class="notice-action download-btn">Download</a>
    `;
  }

  return html;
}


/* =========================
   IMPORTANT NOTICE CARD
   ========================= */

function importantCard(notice) {

  return `
    <article class="important-card">

      <div class="important-card-top">

        <div class="important-icon">!</div>

        <div class="important-heading">

          <div class="notice-meta">
            <span class="notice-category">${esc(cap(notice.category))}</span>
            ${badges(notice)}
          </div>

          <h3>${esc(notice.title)}</h3>

        </div>

      </div>

      <p class="important-description">${esc(notice.description)}</p>

      ${thumb(notice)}

      <div class="important-footer">

        <span class="notice-date">${esc(fmtDate(notice.notice_date))}</span>

        ${
          notice.attachment
            ? `
              <a href="${fileUrl(notice.attachment)}"
                 target="_blank" rel="noopener" class="important-view">
                View notice ${ICONS.arrow}
              </a>
            `
            : ''
        }

      </div>

    </article>
  `;
}


/* =========================
   NORMAL NOTICE CARD
   ========================= */

function noticeCard(notice) {

  return `
    <article class="notice-card" data-category="${esc(notice.category)}">

      <div class="notice-card-main">

        <div class="notice-meta">
          <span class="notice-category">${esc(cap(notice.category))}</span>
          ${badges(notice)}
        </div>

        <h3 class="notice-title">${esc(notice.title)}</h3>

        <p class="notice-description">${esc(notice.description)}</p>

        ${thumb(notice)}

        <div class="notice-card-footer">

          <span class="notice-date">${esc(fmtDate(notice.notice_date))}</span>

          ${
            notice.deadline
              ? `<span class="deadline-mini">Deadline: ${esc(fmtDate(notice.deadline))}</span>`
              : ''
          }

        </div>

      </div>

      <div class="notice-actions">
        ${fileLinks(notice)}
      </div>

    </article>
  `;
}


/* =========================
   EMPTY / LOADING / ERROR
   ========================= */

function showEmpty(element, message) {

  if (!element) return;

  element.innerHTML = `
    <div class="notice-empty">
      <div class="empty-icon">${ICONS.inbox}</div>
      <p>${esc(message)}</p>
    </div>
  `;
}

function showLoading(element) {

  if (!element) return;

  element.innerHTML = `
    <div class="notice-loading">
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
      <p>Loading notices...</p>
    </div>
  `;
}

function showError(element) {

  if (!element) return;

  element.innerHTML = `
    <div class="notice-error">
      <strong>Unable to load notices</strong>
      <p>Please refresh the page and try again.</p>
    </div>
  `;
}


/* =========================
   STATS
   ========================= */

function renderStats() {

  let box = document.getElementById('noticeStats');

  if (!box) {

    const section = importantList
      ? importantList.closest('section')
      : null;

    if (!section || !section.parentNode) return;

    box = document.createElement('div');
    box.id = 'noticeStats';
    box.className = 'notice-stats';

    section.parentNode.insertBefore(box, section);
  }

  const now = new Date();

  const total = allNotices.length;

  const important = allNotices.filter(function (notice) {
    return Number(notice.is_important) === 1;
  }).length;

  const thisMonth = allNotices.filter(function (notice) {

    if (!notice.notice_date) return false;

    const date = new Date(notice.notice_date + 'T00:00:00');

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );

  }).length;

  box.innerHTML = `

    <div class="stat-card">
      <div class="stat-icon">${ICONS.list}</div>
      <div class="stat-content">
        <strong>${total}</strong>
        <span>Total Notices</span>
      </div>
    </div>

    <div class="stat-card stat-important">
      <div class="stat-icon"><span>!</span></div>
      <div class="stat-content">
        <strong>${important}</strong>
        <span>Important</span>
      </div>
    </div>

    <div class="stat-card stat-month">
      <div class="stat-icon">${ICONS.calendar}</div>
      <div class="stat-content">
        <strong>${thisMonth}</strong>
        <span>This Month</span>
      </div>
    </div>

  `;
}


/* =========================
   CATEGORY CHIPS
   ========================= */

function renderChips() {

  if (!noticeList || !noticeList.parentNode) return;

  let wrapper = document.getElementById('categoryChips');

  if (!wrapper) {

    wrapper = document.createElement('div');
    wrapper.id = 'categoryChips';
    wrapper.className = 'notice-filters';

    noticeList.parentNode.insertBefore(wrapper, noticeList);

    wrapper.addEventListener('click', function (event) {

      const button = event.target.closest('button[data-cat]');

      if (!button) return;

      activeCat = button.dataset.cat;
      visibleCount = PAGE_SIZE;

      renderChips();
      renderLatest();
    });
  }

  const categories = [
    'all',
    ...new Set(
      allNotices
        .map(function (notice) { return notice.category; })
        .filter(Boolean)
    )
  ];

  wrapper.innerHTML = `

    <div class="filter-heading">
      <span>Browse by category</span>
    </div>

    <div class="category-chips">
      ${
        categories.map(function (category) {

          const active = category === activeCat ? 'active' : '';

          return `
            <button type="button"
                    class="category-chip ${active}"
                    data-cat="${esc(category)}">
              ${category === 'all' ? 'All Notices' : esc(cap(category))}
            </button>
          `;

        }).join('')
      }
    </div>

  `;

  /* Hide old dropdown */
  if (categorySel) {
    categorySel.style.display = 'none';
  }
}


/* =========================
   LOAD MORE BUTTON
   ========================= */

function ensureLoadMore() {

  let button = document.getElementById('loadMoreBtn');

  if (!button) {

    button = document.createElement('button');
    button.id = 'loadMoreBtn';
    button.type = 'button';
    button.className = 'load-more';

    noticeList.parentNode.insertBefore(button, noticeList.nextSibling);

    button.addEventListener('click', function () {
      visibleCount += PAGE_SIZE;
      renderLatest();
    });
  }

  return button;
}


/* =========================
   RENDER IMPORTANT NOTICES
   ========================= */

function renderImportant() {

  if (!importantList) return;

  const important = allNotices.filter(function (notice) {
    return Number(notice.is_important) === 1;
  });

  if (!important.length) {
    showEmpty(importantList, 'No important notices right now.');
    return;
  }

  importantList.innerHTML = important.map(importantCard).join('');
}


/* =========================
   RENDER LATEST NOTICES
   ========================= */

function renderLatest() {

  if (!noticeList) return;

  const query = searchInput
    ? searchInput.value.trim().toLowerCase()
    : '';

  const filtered = allNotices.filter(function (notice) {

    const categoryMatch =
      activeCat === 'all' || notice.category === activeCat;

    const title = String(notice.title || '').toLowerCase();
    const description = String(notice.description || '').toLowerCase();

    const searchMatch =
      !query || title.includes(query) || description.includes(query);

    return categoryMatch && searchMatch;
  });

  const button = ensureLoadMore();

  if (!filtered.length) {
    showEmpty(noticeList, 'No notices found.');
    button.style.display = 'none';
    return;
  }

  noticeList.innerHTML = filtered
    .slice(0, visibleCount)
    .map(noticeCard)
    .join('');

  const remaining = filtered.length - visibleCount;

  if (remaining > 0) {
    button.style.display = '';
    button.innerHTML = `
      <span>Load more</span>
      <small>${remaining} more</small>
    `;
  } else {
    button.style.display = 'none';
  }
}


/* =========================
   ARCHIVE TOGGLE
   ========================= */

function archiveButtonHtml(isOpen) {
  return isOpen
    ? `<span>Hide Archive</span><span class="archive-arrow">${ICONS.up}</span>`
    : `<span>View Archive</span><span class="archive-arrow">${ICONS.down}</span>`;
}

function setupArchiveToggle() {

  if (!archiveYears || !archiveList) return;

  const archiveSection = archiveYears.closest('section');

  if (!archiveSection) return;

  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'archive-toggle';
  button.setAttribute('aria-expanded', 'false');
  button.innerHTML = archiveButtonHtml(false);

  archiveYears.parentNode.insertBefore(button, archiveYears);

  archiveYears.style.display = 'none';
  archiveList.style.display = 'none';

  button.addEventListener('click', function () {

    const isClosed = archiveYears.style.display === 'none';

    archiveYears.style.display = isClosed ? '' : 'none';
    archiveList.style.display = isClosed ? '' : 'none';

    button.setAttribute('aria-expanded', isClosed ? 'true' : 'false');
    button.innerHTML = archiveButtonHtml(isClosed);
  });
}


/* =========================
   LOAD NOTICES
   ========================= */

async function loadNotices() {

  showLoading(importantList);
  showLoading(noticeList);

  try {

    const response = await fetch(API_URL, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error('HTTP error ' + response.status);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'API error');
    }

    allNotices = Array.isArray(data.notices) ? data.notices : [];

    renderStats();
    renderChips();
    renderImportant();
    renderLatest();

  } catch (error) {

    console.error('Notice API Error:', error);

    showError(importantList);
    showError(noticeList);
  }
}


/* =========================
   LOAD ARCHIVE YEARS
   ========================= */

async function loadArchiveYears() {

  if (!archiveYears) return;

  try {

    const response = await fetch(API_URL + '?years=1', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error('Archive request failed');
    }

    const data = await response.json();

    if (!data.success || !Array.isArray(data.years) || !data.years.length) {

      archiveYears.innerHTML =
        '<span class="archive-empty">No archived notices yet.</span>';

      return;
    }

    archiveYears.innerHTML = data.years.map(function (year) {
      return `
        <button type="button" class="archive-year" data-year="${esc(year)}">
          ${esc(year)}
        </button>
      `;
    }).join('');

    archiveYears.querySelectorAll('[data-year]').forEach(function (button) {
      button.addEventListener('click', function () {
        loadArchive(this.dataset.year);
      });
    });

  } catch (error) {

    console.error('Archive Error:', error);

    archiveYears.innerHTML =
      '<span class="archive-empty">Unable to load archive.</span>';
  }
}


/* =========================
   LOAD ARCHIVE (BY YEAR)
   ========================= */

async function loadArchive(year) {

  if (!archiveList) return;

  showLoading(archiveList);

  try {

    const response = await fetch(
      API_URL + '?status=archived&year=' + encodeURIComponent(year),
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Archive request failed');
    }

    const data = await response.json();

    if (!data.success || !Array.isArray(data.notices) || !data.notices.length) {
      showEmpty(archiveList, 'No notices found for ' + year + '.');
      return;
    }

    archiveList.innerHTML = data.notices.map(noticeCard).join('');

  } catch (error) {

    console.error('Archive loading error:', error);

    showError(archiveList);
  }
}


/* =========================
   SEARCH
   ========================= */

if (searchInput) {
  searchInput.addEventListener('input', function () {
    visibleCount = PAGE_SIZE;
    renderLatest();
  });
}


/* =========================
   START
   ========================= */

setupArchiveToggle();
loadNotices();
loadArchiveYears();