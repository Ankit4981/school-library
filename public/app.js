// =========================================================
// VIRAJ INTERNATIONAL SCHOOL — DIGITAL KNOWLEDGE & LIBRARY HUB
// Core Application Architecture & UI Controller
// =========================================================

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const A = $('#app');

// HTML Escape Sanitizer
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

// API Client Helper
const api = async (u, m = 'GET', b) => {
  const r = await fetch('/api/' + u, {
    method: m,
    headers: b && !(b instanceof FormData) ? { 'Content-Type': 'application/json' } : {},
    body: b instanceof FormData ? b : (b ? JSON.stringify(b) : undefined)
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Request failed. Please try again.');
  return d;
};

// Global App State
let user = null;
let currentView = 'home';
let cachedItems = [];
let appState = {
  activeCategory: 'All',
  activeGrade: 'All',
  activeSort: 'latest',
  searchFilter: '',
  newsFilter: 'week',
  quiz: {
    category: null,
    list: [],
    index: 0,
    score: 0,
    selected: null,
    answersLog: []
  }
};

// Category Mappings
const JUNIOR_CATS = ['All', 'Nursery Rhymes', 'Short Stories', 'Flip Books', 'Audio'];
const SECONDARY_CATS = ['All', 'Academics', 'Comics', 'Novels', 'Encyclopedias', 'Audio Books'];
const BIO_CATS = ['All', 'Scientists', 'Inventors', 'Leaders', 'Indian Personalities', 'Global Personalities'];

// Role Check Helper
const isLibrarian = () => user && ['librarian', 'admin'].includes(user.role);

// Toast Notification Engine
function showToast(message, type = 'info') {
  const container = $('#toastContainer');
  if (!container) return;
  const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || '✨'}</span><span>${esc(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// Theme Management
function initTheme() {
  const saved = localStorage.getItem('viraj_lib_theme') || 'light';
  document.body.className = `theme-${saved}`;
  const icon = $('#themeToggleIcon');
  if (icon) icon.textContent = saved === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const isDark = document.body.classList.contains('theme-dark');
  const next = isDark ? 'light' : 'dark';
  document.body.className = `theme-${next}`;
  localStorage.setItem('viraj_lib_theme', next);
  const icon = $('#themeToggleIcon');
  if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
}

// Navigation Dropdown Handlers
function toggleDropdown(id) {
  const el = $('#' + id);
  if (!el) return;
  const isHidden = el.hasAttribute('hidden');
  closeDropdowns();
  if (isHidden) el.removeAttribute('hidden');
}

function closeDropdowns() {
  $$('.dropdown-popover').forEach(d => d.setAttribute('hidden', ''));
  const searchDrop = $('#searchResultsDropdown');
  if (searchDrop) searchDrop.setAttribute('hidden', '');
}

window.addEventListener('click', e => {
  if (!e.target.closest('.nav-dropdown-wrapper') && !e.target.closest('.user-profile-wrapper') && !e.target.closest('.global-search-box')) {
    closeDropdowns();
  }
});

function toggleMobileMenu() {
  const drawer = $('#mobileDrawer');
  if (drawer) {
    if (drawer.hasAttribute('hidden')) drawer.removeAttribute('hidden');
    else drawer.setAttribute('hidden', '');
  }
}

// Router & View Switcher
async function go(view, sub) {
  currentView = view;
  closeDropdowns();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update nav active states
  $$('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });

  const renderFn = views[view];
  if (!renderFn) {
    go('home');
    return;
  }

  try {
    A.innerHTML = `
      <div style="text-align:center;padding:70px 20px;">
        <div class="user-avatar-circle" style="width:48px;height:48px;margin:0 auto 16px;animation:spin 1s infinite linear;">📖</div>
        <p style="color:var(--text-muted);font-weight:600;">Loading Viraj Digital Library...</p>
      </div>`;
    
    const html = await renderFn(sub);
    A.innerHTML = html;
    if (binders[view]) binders[view](sub);
  } catch (err) {
    A.innerHTML = `
      <div style="text-align:center;padding:60px 20px;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);">
        <div style="font-size:3rem;margin-bottom:12px;">⚠️</div>
        <h3>Unable to load library view</h3>
        <p style="color:var(--text-muted);margin:8px 0 20px;">${esc(err.message)}</p>
        <button class="btn" onclick="go('home')">Return to Library Home</button>
      </div>`;
    showToast(err.message, 'error');
  }
}

// Initial Boot Sequence
async function boot() {
  initTheme();
  initModal();

  try {
    user = await api('me');
  } catch {
    user = null;
  }

  updateNavAuthUI();
  go('home');
}

function updateNavAuthUI() {
  const guestBox = $('#guestActions');
  const userBox = $('#userProfileWrapper');
  const navAvatar = $('#navUserAvatar');
  const navName = $('#navUserName');
  const navRole = $('#navUserRole');
  const dropFullname = $('#dropdownUserFullname');
  const dropGrade = $('#dropdownUserGrade');
  const libSection = $('#librarianMenuSection');
  const mobileAdmin = $('#mobileAdminLink');
  const mobileLogout = $('#mobileLogoutBtn');

  if (user) {
    if (guestBox) guestBox.hidden = true;
    if (userBox) userBox.hidden = false;
    if (navAvatar) navAvatar.textContent = (user.name || 'U')[0].toUpperCase();
    if (navName) navName.textContent = (user.name || 'Student').split(' ')[0];
    if (navRole) navRole.textContent = isLibrarian() ? 'Librarian 🛡️' : (user.grade || 'Scholar');
    if (dropFullname) dropFullname.textContent = user.name;
    if (dropGrade) dropGrade.textContent = `@${user.username} • ${user.grade || 'Student'}`;
    
    if (libSection) libSection.hidden = !isLibrarian();
    if (mobileAdmin) mobileAdmin.hidden = !isLibrarian();
    if (mobileLogout) mobileLogout.hidden = false;
  } else {
    if (guestBox) guestBox.hidden = false;
    if (userBox) userBox.hidden = true;
    if (libSection) libSection.hidden = true;
    if (mobileAdmin) mobileAdmin.hidden = true;
    if (mobileLogout) mobileLogout.hidden = true;
  }
}

// Global Modal Preview & Reader System
function openPreview(title, fileUrl, metaInfo = 'Viraj Digital Library Resource') {
  const modal = $('#previewModal');
  const pTitle = $('#previewTitle');
  const pIcon = $('#previewIcon');
  const pMeta = $('#previewMeta');
  const pBody = $('#previewBody');
  const pFoot = $('#previewFootActions');
  if (!modal || !pBody) return;

  pTitle.textContent = title;
  pMeta.textContent = metaInfo;

  if (fileUrl.match(/\.(mp3|wav|ogg|m4a)$/i)) {
    pIcon.textContent = '🎧';
    pBody.innerHTML = `
      <div style="text-align:center;padding:32px 16px;">
        <div style="font-size:3.5rem;margin-bottom:12px;">🎵</div>
        <h3 style="margin-bottom:6px;">${esc(title)}</h3>
        <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:24px;">Audio Stream from School Repository</p>
        <audio controls autoplay style="width:100%;max-width:540px;" src="${fileUrl}">
          Your browser does not support audio playback.
        </audio>
      </div>`;
    pFoot.innerHTML = `<a href="${fileUrl}" target="_blank" download class="btn btn-sm btn-ghost">📥 Download Audio File</a>`;
  } else if (fileUrl.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) {
    pIcon.textContent = '🖼️';
    pBody.innerHTML = `
      <div style="text-align:center;">
        <img src="${fileUrl}" alt="${esc(title)}" style="max-width:100%;max-height:60vh;object-fit:contain;border-radius:var(--radius-md);box-shadow:var(--shadow-sm);">
      </div>`;
    pFoot.innerHTML = `<a href="${fileUrl}" target="_blank" download class="btn btn-sm btn-ghost">📥 Download High-Res Image</a>`;
  } else if (fileUrl.match(/\.pdf$/i)) {
    pIcon.textContent = '📕';
    pBody.innerHTML = `
      <iframe src="${fileUrl}" style="width:100%;min-height:520px;border:none;border-radius:var(--radius-md);" title="${esc(title)}"></iframe>`;
    pFoot.innerHTML = `<a href="${fileUrl}" target="_blank" download class="btn btn-sm btn-gold">📥 Open Full Screen / Download PDF</a>`;
  } else {
    pIcon.textContent = '📖';
    pBody.innerHTML = `
      <div style="text-align:center;padding:40px 16px;">
        <div style="font-size:3.5rem;margin-bottom:12px;">📁</div>
        <h3>${esc(title)}</h3>
        <p style="color:var(--text-muted);margin:8px 0 24px;">Resource file ready for reading & study</p>
        <a href="${fileUrl}" target="_blank" class="btn btn-gold btn-lg">📥 Access / Download Resource File</a>
      </div>`;
    pFoot.innerHTML = '';
  }

  modal.removeAttribute('hidden');
  modal.classList.remove('is-hidden');
  modal.style.display = 'flex';
}

function closePreview() {
  const modal = $('#previewModal');
  const pBody = $('#previewBody');
  if (modal) {
    modal.setAttribute('hidden', '');
    modal.classList.add('is-hidden');
    modal.style.display = 'none';
  }
  if (pBody) pBody.innerHTML = '';
}

function initModal() {
  const closeBtn = $('#closeModalBtn');
  const footBtn = $('#footCloseBtn');
  const modal = $('#previewModal');

  if (closeBtn) closeBtn.onclick = closePreview;
  if (footBtn) footBtn.onclick = closePreview;

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) closePreview();
    };
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePreview();
  });
}

// User Interaction Tracker & Reader Launcher
async function openItem(id, sec, title, file, author) {
  if (!user) {
    showToast('Please log in to read or bookmark digital books.', 'info');
    go('auth', 'login');
    return;
  }

  try {
    await api('use', 'POST', { kind: sec, title });
  } catch (e) {
    console.warn('Log usage error:', e);
  }

  if (file) {
    openPreview(title, '/uploads/' + file, `${author} • ${sec.toUpperCase()}`);
  } else {
    openPreview(title, '#', `${author} • Digital Reading Hub`);
    const pBody = $('#previewBody');
    if (pBody) {
      pBody.innerHTML = `
        <div style="text-align:center;padding:36px 16px;">
          <div style="font-size:3.5rem;margin-bottom:12px;">📖</div>
          <h3>${esc(title)}</h3>
          <p style="color:var(--text-secondary);font-size:0.95rem;max-width:540px;margin:12px auto 24px;">
            By <strong>${esc(author)}</strong><br>
            This curated academic reading title is registered in the Viraj International School catalog. Physical & e-copies are available at the library desk.
          </p>
          <div style="display:flex;gap:10px;justify-content:center;">
            <button class="btn btn-gold" onclick="toggleBookmark(${id}, event)">🔖 Save to Reading Passport</button>
            <button class="btn btn-ghost" onclick="closePreview()">Done</button>
          </div>
        </div>`;
    }
  }
}

// Bookmark Toggle Handler
async function toggleBookmark(id, event) {
  if (event) event.stopPropagation();
  if (!user) {
    showToast('Please log in to bookmark books.', 'info');
    go('auth', 'login');
    return;
  }

  try {
    const res = await api(`bookmark/${id}`, 'POST');
    showToast(res.saved ? 'Saved to your Reading Passport! 🔖' : 'Removed from bookmarks.', 'success');
    
    // Update heart icons on screen
    $$(`.bm-btn-${id}`).forEach(btn => {
      btn.classList.toggle('is-saved', res.saved);
      btn.innerHTML = res.saved ? '♥' : '♡';
    });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Global Live Search Functionality
async function handleGlobalSearch(query) {
  const q = (query || '').trim().toLowerCase();
  const dropdown = $('#searchResultsDropdown');
  if (!dropdown) return;

  if (q.length < 2) {
    dropdown.setAttribute('hidden', '');
    dropdown.innerHTML = '';
    return;
  }

  try {
    const results = await api(`items?search=${encodeURIComponent(q)}`);
    if (!results.length) {
      dropdown.innerHTML = `<div style="padding:12px;text-align:center;font-size:0.85rem;color:var(--text-muted);">No books found matching "${esc(q)}"</div>`;
    } else {
      dropdown.innerHTML = `
        <div class="dropdown-section-title">SEARCH RESULTS (${results.length})</div>
        ${results.slice(0, 6).map(b => `
          <div class="search-result-row" onclick="openItem(${b.id}, '${b.section}', '${esc(b.title).replace(/'/g, "\\'")}', '${esc(b.file || '')}', '${esc(b.author || '').replace(/'/g, "\\'")}'); closeDropdowns();">
            <div>
              <strong style="font-size:0.85rem;display:block;">${esc(b.title)}</strong>
              <small style="color:var(--text-muted);">${esc(b.author)} • ${esc(b.category)}</small>
            </div>
            <span class="btn btn-sm btn-ghost" style="padding:2px 8px;font-size:0.75rem;">Open</span>
          </div>`).join('')}`;
    }
    dropdown.removeAttribute('hidden');
  } catch (err) {
    console.warn(err);
  }
}

// Realistic Digital Book Card Renderer
function renderBookCard(book) {
  const isSaved = book.isBookmarked || false;
  let coverClass = 'cover-secondary';
  let typeIcon = '📖';

  if (book.section === 'junior') coverClass = 'cover-junior';
  else if (book.section === 'biography') coverClass = 'cover-biography';
  else if (book.category === 'Comics') coverClass = 'cover-comic';
  else if (book.category === 'Audio Books' || book.content_type === 'audio') coverClass = 'cover-audio';
  else if (book.category === 'Encyclopedias') coverClass = 'cover-encyclopedia';

  if (book.content_type === 'audio' || (book.file && book.file.match(/\.(mp3|wav|ogg)$/i))) typeIcon = '🎧';
  else if (book.content_type === 'flipbook') typeIcon = '📑';
  else if (book.content_type === 'comic') typeIcon = '🎨';

  return `
    <div class="book-card">
      <div class="book-cover-wrap ${coverClass}">
        <div class="book-cover-spine"></div>
        <div class="book-cover-top">
          <span class="book-type-badge">${typeIcon} ${esc(book.category || 'General')}</span>
          <button class="bookmark-heart-btn bm-btn-${book.id} ${isSaved ? 'is-saved' : ''}" 
            title="${isSaved ? 'Remove from Saved' : 'Bookmark this book'}" 
            onclick="toggleBookmark(${book.id}, event)">
            ${isSaved ? '♥' : '♡'}
          </button>
        </div>
        <div class="book-cover-title">${esc(book.title)}</div>
      </div>

      <div class="book-details">
        <div>
          <div class="book-author">By ${esc(book.author || 'Viraj Heritage Press')}</div>
          <div class="book-meta-row">
            <span class="meta-chip">🎓 ${esc(book.grade || 'All Grades')}</span>
            <span class="meta-chip">⏱ ${esc(book.read_time || '10 min')}</span>
          </div>
          <p class="book-desc-snippet">${esc(book.description || 'Comprehensive digital reading resource for students and teachers.')}</p>
        </div>

        <div class="book-action-footer">
          <button class="btn btn-sm btn-gold" style="width:100%;" 
            onclick="openItem(${book.id}, '${book.section}', '${esc(book.title).replace(/'/g, "\\'")}', '${esc(book.file || '')}', '${esc(book.author || '').replace(/'/g, "\\'")}')">
            ${book.content_type === 'audio' ? '🎧 Listen Now' : '📖 Read Now'}
          </button>
        </div>
      </div>
    </div>`;
}

// -------------------------------------------------------------
// ALL APPLICATION VIEWS (EXACT SPECIFIED SEQUENCE & ALIGNMENT)
// -------------------------------------------------------------
const views = {
  // 1. HOME VIEW (EXACT 11-PART SEQUENCE)
  async home() {
    const allItems = await api('items');
    
    // Balanced diverse featured books across all wings (Junior, Novel, Comic, Biography)
    const featuredJunior = allItems.find(b => b.section === 'junior' && b.category === 'Short Stories') || allItems.find(b => b.section === 'junior');
    const featuredNovel = allItems.find(b => b.category === 'Novels') || allItems.find(b => b.section === 'secondary');
    const featuredComic = allItems.find(b => b.category === 'Comics') || allItems.find(b => b.section === 'secondary');
    const featuredBio = allItems.find(b => b.section === 'biography' && b.category === 'Scientists') || allItems.find(b => b.section === 'biography');

    const featuredBooks = [featuredJunior, featuredNovel, featuredComic, featuredBio].filter(Boolean);
    const popularBooks = [
      allItems.find(b => b.category === 'Flip Books'),
      allItems.find(b => b.category === 'Academics'),
      allItems.find(b => b.category === 'Encyclopedias'),
      allItems.find(b => b.section === 'biography' && b.category === 'Inventors')
    ].filter(Boolean);
    const recentBooks = allItems.slice(0, 4);
    const candidates = await api('candidates');
    const totalVotes = candidates.reduce((sum, c) => sum + c.n, 0);
    const latestNews = await api('news?range=week');
    const readers = await api('readers');
    const schoolStar = readers.find(r => r.kind === 'school') || readers[0];
    const digitalStar = readers.find(r => r.kind === 'digital') || readers[1];

    let continueReadingShelf = '';
    if (user) {
      try {
        const meData = await api('me');
        if (meData.bookmarks && meData.bookmarks.length) {
          continueReadingShelf = `
            <!-- 3. Continue Reading / Saved Bookmarks -->
            <section class="home-section">
              <div class="section-header-row">
                <h3 class="section-title">📖 Continue Reading & Saved Shelf</h3>
                <span class="section-link" onclick="go('bookmarks')">View Reading Passport →</span>
              </div>
              <div class="books-shelf-grid">
                ${meData.bookmarks.slice(0, 4).map(renderBookCard).join('')}
              </div>
            </section>`;
        }
      } catch (e) {
        continueReadingShelf = '';
      }
    }

    return `
      <!-- 1. Hero Section -->
      <section class="library-hero">
        <div class="hero-left">
          <div class="hero-sub-badge">🏛️ Viraj International School</div>
          <h1 class="hero-heading">Digital Knowledge & Library Hub</h1>
          <p class="hero-motto">“Discover. Read. Learn. Participate.”</p>
          <div class="hero-buttons">
            <button class="btn btn-gold btn-lg" onclick="go('secondary')">📚 Explore Library</button>
            ${!user ? `
              <button class="btn btn-ghost btn-lg" onclick="go('auth', 'signup')">✨ Student / Member Sign Up</button>
            ` : `
              <button class="btn btn-ghost btn-lg" onclick="go('profile')">👤 My Reading Passport</button>
            `}
          </div>
        </div>

        <div class="hero-right-badge">
          <img src="logo.svg" alt="Viraj School Emblem" class="hero-crest-lg">
          <div class="hero-stat-badge">24/7 DIGITAL REPOSITORY</div>
        </div>
      </section>

      <!-- 2. Featured Digital Books -->
      <section class="home-section">
        <div class="section-header-row">
          <h3 class="section-title">🌟 Featured Digital Books</h3>
          <span class="section-link" onclick="go('secondary')">View All Featured →</span>
        </div>
        <div class="books-shelf-grid">
          ${(featuredBooks.length ? featuredBooks : allItems).slice(0, 4).map(renderBookCard).join('')}
        </div>
      </section>

      <!-- 3. Continue Reading Shelf (If available) -->
      ${continueReadingShelf}

      <!-- 4. Explore Library Wings -->
      <section class="home-section">
        <div class="section-header-row">
          <h3 class="section-title">🏛️ Explore Library</h3>
        </div>
        <div class="wings-grid">
          <!-- Junior Library -->
          <div class="wing-card" onclick="go('junior')">
            <div>
              <div class="wing-top">
                <div class="wing-icon">🧸</div>
                <span class="wing-pill">Primary Wing</span>
              </div>
              <h4 class="wing-title">Junior Library</h4>
              <p class="wing-desc">Nursery rhymes, stories, audio and flip books.</p>
            </div>
            <div class="wing-cta">
              <span>Open Junior Library</span>
              <span>→</span>
            </div>
          </div>

          <!-- Secondary Library -->
          <div class="wing-card" onclick="go('secondary')">
            <div>
              <div class="wing-top">
                <div class="wing-icon">📚</div>
                <span class="wing-pill">Middle & High</span>
              </div>
              <h4 class="wing-title">Secondary Library</h4>
              <p class="wing-desc">Academics, comics, novels, encyclopedias and audiobooks.</p>
            </div>
            <div class="wing-cta">
              <span>Open Secondary Library</span>
              <span>→</span>
            </div>
          </div>

          <!-- Biographies -->
          <div class="wing-card" onclick="go('biography')">
            <div>
              <div class="wing-top">
                <div class="wing-icon">👑</div>
                <span class="wing-pill">Inspirational</span>
              </div>
              <h4 class="wing-title">Biographies</h4>
              <p class="wing-desc">Stories of scientists, leaders, writers and great thinkers.</p>
            </div>
            <div class="wing-cta">
              <span>Read Biographies</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Popular This Week -->
      <section class="home-section">
        <div class="section-header-row">
          <h3 class="section-title">🔥 Popular This Week</h3>
          <span class="section-link" onclick="go('secondary')">Browse Popular →</span>
        </div>
        <div class="books-shelf-grid">
          ${(popularBooks.length ? popularBooks : allItems.slice(2, 6)).slice(0, 4).map(renderBookCard).join('')}
        </div>
      </section>

      <!-- 6. Recently Added -->
      <section class="home-section">
        <div class="section-header-row">
          <h3 class="section-title">✨ Recently Added</h3>
          <span class="section-link" onclick="go('secondary')">Browse All Recent →</span>
        </div>
        <div class="books-shelf-grid">
          ${recentBooks.map(renderBookCard).join('')}
        </div>
      </section>

      <!-- 7. Test Your Wits (Challenge Section) -->
      <section class="home-section">
        <div class="section-header-row">
          <h3 class="section-title">🧠 Test Your Wits</h3>
          <span class="section-link" onclick="go('quiz')">Open Quiz Arena →</span>
        </div>
        <div class="quiz-category-grid">
          <div class="quiz-card" style="border-top:4px solid var(--status-success);">
            <div>
              <div style="font-size:2.2rem;margin-bottom:8px;">🧸</div>
              <h4 style="font-size:1.15rem;margin-bottom:6px;">Junior Quiz</h4>
              <p style="color:var(--text-secondary);font-size:0.85rem;line-height:1.45;margin-bottom:14px;">
                Rhymes, animal kingdom, fairy tales, and beginner general science.
              </p>
            </div>
            <button class="btn btn-gold btn-sm" onclick="startQuizEngine('junior')">Start Junior Quiz ➡️</button>
          </div>

          <div class="quiz-card" style="border-top:4px solid var(--navy-primary);">
            <div>
              <div style="font-size:2.2rem;margin-bottom:8px;">📚</div>
              <h4 style="font-size:1.15rem;margin-bottom:6px;">Secondary Quiz</h4>
              <p style="color:var(--text-secondary);font-size:0.85rem;line-height:1.45;margin-bottom:14px;">
                World history, science, literature classics, geography, and vocabulary.
              </p>
            </div>
            <button class="btn btn-gold btn-sm" onclick="startQuizEngine('secondary')">Start Secondary Quiz ➡️</button>
          </div>

          <div class="quiz-card" style="border-top:4px solid var(--gold-primary);">
            <div>
              <div style="font-size:2.2rem;margin-bottom:8px;">👑</div>
              <h4 style="font-size:1.15rem;margin-bottom:6px;">Great Minds Quiz</h4>
              <p style="color:var(--text-secondary);font-size:0.85rem;line-height:1.45;margin-bottom:14px;">
                Historic leaders, Nobel laureates, inventors, and groundbreaking explorers.
              </p>
            </div>
            <button class="btn btn-gold btn-sm" onclick="startQuizEngine('biography')">Start Biography Quiz ➡️</button>
          </div>
        </div>
      </section>

      <!-- 8. Suggest a Book Section -->
      <section class="home-section">
        <div class="section-card-panel" style="border-left:4px solid var(--gold-primary);">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:1.8rem;">💡</span>
              <div>
                <h3 style="font-size:1.3rem;">Suggest a Book</h3>
                <p style="color:var(--text-muted);font-size:0.85rem;">Recommend titles or authors you want the school to add to the digital shelves.</p>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="go('suggest')">Full Recommendation Desk →</button>
          </div>

          <div class="quick-sug-grid">
            <input type="text" id="quickSugTitle" class="form-control" placeholder="Book Title (e.g. Sapiens by Yuval Noah Harari)">
            <input type="text" id="quickSugAuthor" class="form-control" placeholder="Author Name">
            <button class="btn btn-gold" onclick="submitQuickSuggestion()">Submit Suggestion</button>
          </div>
        </div>
      </section>

      <!-- 9. Vote for the Next Book (Democratic Polling Booth) -->
      <section class="home-section">
        <div class="section-header-row">
          <h3 class="section-title">🗳️ Vote for the Next Book</h3>
          <span class="section-link" onclick="go('elect')">View All Candidates →</span>
        </div>
        <div class="election-grid">
          ${candidates.slice(0, 3).map(c => {
            const pct = totalVotes > 0 ? Math.round((c.n / totalVotes) * 100) : 0;
            return `
              <div class="election-card">
                <div>
                  <h4 style="font-size:1.1rem;margin-bottom:4px;">${esc(c.title)}</h4>
                  <div style="font-size:0.82rem;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">By ${esc(c.author || 'Renowned Author')}</div>
                  <p style="font-size:0.8rem;color:var(--text-muted);line-height:1.4;margin-bottom:12px;">${esc(c.description || 'Candidate for school acquisition.')}</p>
                </div>
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:0.82rem;font-weight:700;">
                    <span>${c.n} Vote${c.n === 1 ? '' : 's'}</span>
                    <span style="color:var(--gold-primary);">${pct}%</span>
                  </div>
                  <div class="vote-tally-bar">
                    <div class="vote-tally-fill" style="width:${pct}%;"></div>
                  </div>
                  ${c.mine ? `
                    <button class="btn btn-sm btn-ghost" style="width:100%;color:var(--status-success);border-color:var(--status-success);" disabled>✓ Voted</button>
                  ` : `
                    <button class="btn btn-sm btn-gold" style="width:100%;" onclick="castStudentVote(${c.id})">🗳️ Vote for This Book</button>
                  `}
                </div>
              </div>`;
          }).join('')}
        </div>
      </section>

      <!-- 10. Avid Reader of the Month -->
      <section class="home-section">
        <div class="section-header-row">
          <h3 class="section-title">🏆 Avid Reader of the Month</h3>
          <span class="section-link" onclick="go('avid')">Hall of Fame →</span>
        </div>
        <div class="fame-podium-grid">
          <!-- School Campus Star -->
          <div class="fame-honor-card">
            <div class="fame-honor-header">
              <div class="fame-honor-avatar">🏫</div>
              <div>
                <span style="font-size:0.72rem;font-weight:700;color:var(--gold-primary);text-transform:uppercase;">School's Avid Reader of the Month</span>
                <h4 style="font-size:1.2rem;">${esc(schoolStar ? schoolStar.name : 'Aarav Sharma')}</h4>
                <small style="color:var(--text-muted);">${esc(schoolStar ? schoolStar.class_grade : 'Grade 8A')}</small>
              </div>
            </div>
            <div style="font-size:0.85rem;margin-bottom:6px;">
              <strong>📚 Content Consumed:</strong> ${esc(schoolStar ? schoolStar.consumed : '14 Classic World Literature Novels & Science Encyclopedias')}
            </div>
            <div class="fame-quote-box">
              "${esc(schoolStar ? schoolStar.reflection : 'Reading every day has expanded my vocabulary and imagination.')}"
            </div>
          </div>

          <!-- Digital Portal Star -->
          <div class="fame-honor-card" style="border-color:var(--blue-accent);">
            <div class="fame-honor-header">
              <div class="fame-honor-avatar" style="background:linear-gradient(135deg, var(--navy-primary), var(--blue-accent));">💻</div>
              <div>
                <span style="font-size:0.72rem;font-weight:700;color:var(--blue-accent);text-transform:uppercase;">Digital Portal Avid Reader</span>
                <h4 style="font-size:1.2rem;">${esc(digitalStar ? digitalStar.name : 'Diya Patel')}</h4>
                <small style="color:var(--text-muted);">${esc(digitalStar ? digitalStar.class_grade : 'Grade 6B')}</small>
              </div>
            </div>
            <div style="font-size:0.85rem;margin-bottom:6px;">
              <strong>🎧 Content Consumed:</strong> ${esc(digitalStar ? digitalStar.consumed : '22 Digital Audiobooks & Illustrated Flipbooks')}
            </div>
            <div class="fame-quote-box">
              "${esc(digitalStar ? digitalStar.reflection : 'The digital library portal makes reading and audiobooks so engaging!')}"
            </div>
          </div>
        </div>
      </section>

      <!-- 11. Daily Newspapers & Campus News -->
      <section class="home-section">
        <div class="section-header-row">
          <h3 class="section-title">📰 Daily Newspapers & Campus News</h3>
          <span class="section-link" onclick="go('news')">All Newspapers & Bulletins →</span>
        </div>

        <!-- Quick Digital Newspaper Stand -->
        <div class="newspaper-stand-grid" style="margin-bottom:20px;">
          <div class="newspaper-card">
            <div>
              <div class="newspaper-card-top">
                <div class="newspaper-icon">🗞️</div>
                <span class="newspaper-tag">Daily Student</span>
              </div>
              <h4 class="newspaper-title">The Hindu (In School)</h4>
              <p class="newspaper-desc">Daily national current affairs, science focus, vocabulary, and editorial debates.</p>
            </div>
            <div class="newspaper-action">
              <button class="btn btn-sm btn-gold" style="width:100%;" onclick="openPreview('The Hindu — In School Edition', '#', 'Daily National Student Newspaper • The Hindu Press')">📖 Read Today's Edition</button>
            </div>
          </div>

          <div class="newspaper-card">
            <div>
              <div class="newspaper-card-top">
                <div class="newspaper-icon">📰</div>
                <span class="newspaper-tag">Youth Edition</span>
              </div>
              <h4 class="newspaper-title">Indian Express Explorer</h4>
              <p class="newspaper-desc">Civics, science wonders, literature reviews, and young student columns.</p>
            </div>
            <div class="newspaper-action">
              <button class="btn btn-sm btn-gold" style="width:100%;" onclick="openPreview('Indian Express Student Explorer', '#', 'Youth Student Edition • Express Media')">📖 Read Today's Edition</button>
            </div>
          </div>

          <div class="newspaper-card">
            <div>
              <div class="newspaper-card-top">
                <div class="newspaper-icon">🌍</div>
                <span class="newspaper-tag">Academic NIE</span>
              </div>
              <h4 class="newspaper-title">Times NIE Student Daily</h4>
              <p class="newspaper-desc">Global inventions, campus sports, creative writing, and knowledge trivia.</p>
            </div>
            <div class="newspaper-action">
              <button class="btn btn-sm btn-gold" style="width:100%;" onclick="openPreview('Times NIE — Newspaper in Education', '#', 'Newspaper in Education • Times Group')">📖 Read Today's Edition</button>
            </div>
          </div>

          <div class="newspaper-card">
            <div>
              <div class="newspaper-card-top">
                <div class="newspaper-icon">🏫</div>
                <span class="newspaper-tag" style="background:var(--status-success-bg);color:var(--status-success);">Official Press</span>
              </div>
              <h4 class="newspaper-title">Viraj Campus Chronicle</h4>
              <p class="newspaper-desc">School activities, inter-house championships, book reviews, and notices.</p>
            </div>
            <div class="newspaper-action">
              <button class="btn btn-sm btn-gold" style="width:100%;" onclick="openPreview('Viraj Campus Chronicle — Weekly Edition', '#', 'Official School Press • Viraj International School')">📖 Read Campus Issue</button>
            </div>
          </div>
        </div>

        <div class="news-stack">
          ${latestNews.slice(0, 3).map(n => `
            <div class="news-article-card">
              <div class="news-top-row">
                <span class="pillar-badge" style="background:var(--bg-secondary);color:var(--navy-primary);font-size:0.72rem;">
                  📢 ${esc(n.category || 'General')}
                </span>
                <span style="font-size:0.75rem;color:var(--text-muted);">
                  📅 ${new Date(n.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • By ${esc(n.author || 'Library Desk')}
                </span>
              </div>
              <h4 style="font-size:1.15rem;color:var(--navy-primary);margin-bottom:6px;">${esc(n.title)}</h4>
              <p style="color:var(--text-secondary);font-size:0.88rem;line-height:1.5;">${esc(n.body)}</p>
            </div>`).join('') || '<p style="color:var(--text-muted);">No news posted this week.</p>'}
        </div>
      </section>`;
  },

  // 2. JUNIOR LIBRARY VIEW
  async junior() {
    const activeCat = appState.activeCategory || 'All';
    const activeGrade = appState.activeGrade || 'All';

    let url = 'items?section=junior';
    if (activeCat !== 'All') url += `&category=${encodeURIComponent(activeCat)}`;
    if (activeGrade !== 'All') url += `&grade=${encodeURIComponent(activeGrade)}`;

    const items = await api(url);
    cachedItems = items;

    return `
      <div style="margin-bottom:24px;">
        <h2 style="font-size:1.8rem;margin-bottom:4px;">🧸 Junior Library</h2>
        <p style="color:var(--text-muted);font-size:0.9rem;">Nursery rhymes, short stories, audio and flip books for primary learners.</p>
      </div>

      <!-- Catalog Toolbar -->
      <div class="catalog-toolbar">
        <div class="toolbar-search-row">
          <input type="text" id="shelfSearchInput" class="filter-input" placeholder="Search junior titles or authors..." oninput="filterLocalShelf(this.value)">
          <select id="gradeFilterSelect" class="filter-select" onchange="appState.activeGrade=this.value;go('junior')">
            <option value="All" ${activeGrade === 'All' ? 'selected' : ''}>All Age Groups / Grades</option>
            <option value="Pre-K" ${activeGrade === 'Pre-K' ? 'selected' : ''}>Pre-K - Kindergarten</option>
            <option value="Grade 1" ${activeGrade === 'Grade 1' ? 'selected' : ''}>Grade 1 - 2</option>
            <option value="Grade 3" ${activeGrade === 'Grade 3' ? 'selected' : ''}>Grade 3 - 5</option>
          </select>
        </div>

        <div class="catalog-category-tabs">
          ${JUNIOR_CATS.map(c => `
            <button class="cat-tab-btn ${c === activeCat ? 'active' : ''}" onclick="appState.activeCategory='${c}';go('junior')">
              ${c}
            </button>`).join('')}
        </div>
      </div>

      <!-- Shelf Items Grid (4-Column Aligned) -->
      <div id="shelfCardsContainer" class="books-shelf-grid">
        ${items.length ? items.map(renderBookCard).join('') : `
          <div style="grid-column:1/-1;text-align:center;padding:48px 20px;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);">
            <div style="font-size:3rem;margin-bottom:8px;">📚</div>
            <h4>No junior books found</h4>
            <p style="color:var(--text-muted);font-size:0.88rem;">Try clearing your search or selecting "All" categories.</p>
          </div>`}
      </div>`;
  },

  // 3. SECONDARY LIBRARY VIEW
  async secondary() {
    const activeCat = appState.activeCategory || 'All';
    const activeGrade = appState.activeGrade || 'All';

    let url = 'items?section=secondary';
    if (activeCat !== 'All') url += `&category=${encodeURIComponent(activeCat)}`;
    if (activeGrade !== 'All') url += `&grade=${encodeURIComponent(activeGrade)}`;

    const items = await api(url);
    cachedItems = items;

    return `
      <div style="margin-bottom:24px;">
        <h2 style="font-size:1.8rem;margin-bottom:4px;">📚 Secondary Library</h2>
        <p style="color:var(--text-muted);font-size:0.9rem;">Academics, comics, novels, encyclopedias and audiobooks for middle and senior students.</p>
      </div>

      <!-- Catalog Toolbar -->
      <div class="catalog-toolbar">
        <div class="toolbar-search-row">
          <input type="text" id="shelfSearchInput" class="filter-input" placeholder="Search by title, author, or subject..." oninput="filterLocalShelf(this.value)">
          <select id="gradeFilterSelect" class="filter-select" onchange="appState.activeGrade=this.value;go('secondary')">
            <option value="All" ${activeGrade === 'All' ? 'selected' : ''}>All Secondary Grades</option>
            <option value="Grade 6" ${activeGrade === 'Grade 6' ? 'selected' : ''}>Grades 6 - 8 (Middle School)</option>
            <option value="Grade 9" ${activeGrade === 'Grade 9' ? 'selected' : ''}>Grades 9 - 10 (Secondary)</option>
            <option value="Grade 11" ${activeGrade === 'Grade 11' ? 'selected' : ''}>Grades 11 - 12 (Senior Secondary)</option>
          </select>
        </div>

        <div class="catalog-category-tabs">
          ${SECONDARY_CATS.map(c => `
            <button class="cat-tab-btn ${c === activeCat ? 'active' : ''}" onclick="appState.activeCategory='${c}';go('secondary')">
              ${c}
            </button>`).join('')}
        </div>
      </div>

      <!-- Shelf Items Grid (4-Column Aligned) -->
      <div id="shelfCardsContainer" class="books-shelf-grid">
        ${items.length ? items.map(renderBookCard).join('') : `
          <div style="grid-column:1/-1;text-align:center;padding:48px 20px;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);">
            <div style="font-size:3rem;margin-bottom:8px;">📚</div>
            <h4>No secondary books found</h4>
            <p style="color:var(--text-muted);font-size:0.88rem;">Try selecting "All" categories or changing your search terms.</p>
          </div>`}
      </div>`;
  },

  // 4. BIOGRAPHIES VIEW
  async biography() {
    const activeCat = appState.activeCategory || 'All';
    let url = 'items?section=biography';
    if (activeCat !== 'All') url += `&category=${encodeURIComponent(activeCat)}`;

    const items = await api(url);
    cachedItems = items;

    return `
      <div style="margin-bottom:24px;">
        <h2 style="font-size:1.8rem;margin-bottom:4px;">👑 Biographies & Great Minds</h2>
        <p style="color:var(--text-muted);font-size:0.9rem;">Inspiring life stories of scientists, leaders, writers, inventors and great thinkers.</p>
      </div>

      <div class="catalog-toolbar">
        <div class="toolbar-search-row">
          <input type="text" id="shelfSearchInput" class="filter-input" placeholder="Search personality or field..." oninput="filterLocalShelf(this.value)">
        </div>
        <div class="catalog-category-tabs">
          ${BIO_CATS.map(c => `
            <button class="cat-tab-btn ${c === activeCat ? 'active' : ''}" onclick="appState.activeCategory='${c}';go('biography')">
              ${c}
            </button>`).join('')}
        </div>
      </div>

      <div id="shelfCardsContainer" class="books-shelf-grid">
        ${items.length ? items.map(renderBookCard).join('') : `
          <div style="grid-column:1/-1;text-align:center;padding:48px 20px;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);">
            <div style="font-size:3rem;margin-bottom:8px;">👑</div>
            <h4>No biographies found</h4>
            <p style="color:var(--text-muted);font-size:0.88rem;">Select "All" to browse all biographical profiles.</p>
          </div>`}
      </div>`;
  },

  // 5. TEST YOUR WITS (QUIZ ARENA)
  async quiz(sub) {
    if (!sub) {
      return `
        <div style="margin-bottom:28px;">
          <h2 style="font-size:1.8rem;margin-bottom:4px;">🧠 Test Your Wits</h2>
          <p style="color:var(--text-muted);font-size:0.9rem;">Select your trivia category to challenge your academic knowledge, earn points, and unlock achievements.</p>
        </div>

        <div class="quiz-category-grid">
          <div class="quiz-card" style="border-top:4px solid var(--status-success);">
            <div>
              <div style="font-size:2.5rem;margin-bottom:10px;">🧸</div>
              <h3 style="font-size:1.25rem;margin-bottom:6px;">Junior Quiz</h3>
              <p style="color:var(--text-secondary);font-size:0.85rem;line-height:1.45;margin-bottom:16px;">
                Nursery rhymes, animal kingdom, fairy tales, and beginner general science.
              </p>
              <div style="font-size:0.8rem;font-weight:700;color:var(--text-muted);margin-bottom:16px;">
                ⏱ 5 Questions • 50 Points Reward
              </div>
            </div>
            <button class="btn btn-gold" onclick="startQuizEngine('junior')">Start Junior Quiz ➡️</button>
          </div>

          <div class="quiz-card" style="border-top:4px solid var(--navy-primary);">
            <div>
              <div style="font-size:2.5rem;margin-bottom:10px;">📚</div>
              <h3 style="font-size:1.25rem;margin-bottom:6px;">Secondary Quiz</h3>
              <p style="color:var(--text-secondary);font-size:0.85rem;line-height:1.45;margin-bottom:16px;">
                World history, science, literature classics, geography, and vocabulary.
              </p>
              <div style="font-size:0.8rem;font-weight:700;color:var(--text-muted);margin-bottom:16px;">
                ⏱ 5 Questions • 50 Points Reward
              </div>
            </div>
            <button class="btn btn-gold" onclick="startQuizEngine('secondary')">Start Secondary Quiz ➡️</button>
          </div>

          <div class="quiz-card" style="border-top:4px solid var(--gold-primary);">
            <div>
              <div style="font-size:2.5rem;margin-bottom:10px;">👑</div>
              <h3 style="font-size:1.25rem;margin-bottom:6px;">Great Minds / Biography Quiz</h3>
              <p style="color:var(--text-secondary);font-size:0.85rem;line-height:1.45;margin-bottom:16px;">
                Historic leaders, Nobel laureates, inventors, and groundbreaking explorers.
              </p>
              <div style="font-size:0.8rem;font-weight:700;color:var(--text-muted);margin-bottom:16px;">
                ⏱ 5 Questions • 50 Points Reward
              </div>
            </div>
            <button class="btn btn-gold" onclick="startQuizEngine('biography')">Start Biography Quiz ➡️</button>
          </div>
        </div>`;
    }

    const qState = appState.quiz;
    if (!qState || !qState.list.length) {
      return `
        <div style="text-align:center;padding:50px 20px;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);">
          <div style="font-size:3rem;margin-bottom:8px;">🧩</div>
          <h3>No quiz questions available for this category yet</h3>
          <button class="btn" onclick="go('quiz')" style="margin-top:16px;">Back to Quiz Menu</button>
        </div>`;
    }

    // Quiz Completion Summary
    if (qState.index >= qState.list.length) {
      const accuracy = Math.round((qState.score / qState.list.length) * 100);
      const points = qState.score * 10;

      return `
        <div class="quiz-player-container" style="text-align:center;">
          <div style="font-size:4rem;margin-bottom:10px;">${accuracy >= 80 ? '🏆' : accuracy >= 50 ? '🌟' : '👏'}</div>
          <h2 style="font-size:1.8rem;margin-bottom:6px;">Quiz Complete!</h2>
          <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:24px;">Viraj International School • ${esc(qState.category.toUpperCase())} TEST YOUR WITS</p>

          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-bottom:24px;">
            <div class="metric-pill">
              <div class="metric-pill-val">${qState.score} / ${qState.list.length}</div>
              <div class="metric-pill-lbl">Correct Answers</div>
            </div>
            <div class="metric-pill">
              <div class="metric-pill-val">${accuracy}%</div>
              <div class="metric-pill-lbl">Accuracy Rate</div>
            </div>
            <div class="metric-pill">
              <div class="metric-pill-val" style="color:var(--gold-primary);">+${points}</div>
              <div class="metric-pill-lbl">Reading Points</div>
            </div>
          </div>

          <div style="text-align:left;background:var(--bg-secondary);padding:16px;border-radius:var(--radius-md);margin-bottom:24px;">
            <h4 style="font-size:0.95rem;margin-bottom:10px;">📝 Question Review & Explanations:</h4>
            ${qState.answersLog.map((log, idx) => `
              <div style="font-size:0.85rem;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid var(--border-color);">
                <strong>Q${idx + 1}: ${esc(log.q)}</strong><br>
                <span style="color:${log.isCorrect ? 'var(--status-success)' : 'var(--status-error)'};font-weight:700;">
                  ${log.isCorrect ? '✓ Correct' : '✗ Incorrect'}: ${esc(log.selectedText)}
                </span>
                ${!log.isCorrect ? `<span style="color:var(--status-success);margin-left:8px;">(Correct: ${esc(log.correctText)})</span>` : ''}
                ${log.explanation ? `<div style="color:var(--text-muted);font-size:0.8rem;margin-top:2px;">💡 ${esc(log.explanation)}</div>` : ''}
              </div>`).join('')}
          </div>

          <div style="display:flex;gap:12px;justify-content:center;">
            <button class="btn btn-gold" onclick="startQuizEngine('${qState.category}')">🔄 Retry Quiz</button>
            <button class="btn btn-ghost" onclick="go('quiz')">Choose Another Category</button>
          </div>
        </div>`;
    }

    const curr = qState.list[qState.index];
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const pct = ((qState.index + 1) / qState.list.length) * 100;

    return `
      <div class="quiz-player-container">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <button class="btn btn-sm btn-ghost" onclick="go('quiz')">← Exit Quiz</button>
          <span style="font-size:0.8rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">${esc(qState.category)} Wits</span>
        </div>

        <div class="quiz-progress-bar-bg">
          <div class="quiz-progress-fill" style="width:${pct}%"></div>
        </div>

        <div class="quiz-meta-info">
          <span>QUESTION ${qState.index + 1} OF ${qState.list.length}</span>
          <span>SCORE: ${qState.score} ⭐</span>
        </div>

        <div class="quiz-question-heading">
          ${esc(curr.q)}
        </div>

        <div class="quiz-options-stack">
          ${curr.opts.map((opt, i) => {
            let stateClass = '';
            if (qState.selected !== null) {
              if (i === curr.ans) stateClass = 'opt-correct';
              else if (i === qState.selected) stateClass = 'opt-wrong';
            }
            return `
              <button class="quiz-opt-btn ${stateClass}" 
                ${qState.selected === null ? `onclick="submitQuizAnswer(${i})"` : 'disabled'}>
                <span style="width:26px;height:26px;border-radius:50%;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:bold;">${letters[i] || i + 1}</span>
                <span>${esc(opt)}</span>
              </button>`;
          }).join('')}
        </div>

        ${qState.selected !== null ? `
          ${curr.explanation ? `<div class="quiz-explanation-box"><strong>Explanation:</strong> ${esc(curr.explanation)}</div>` : ''}
          <div style="text-align:right;margin-top:16px;">
            <button class="btn btn-gold btn-lg" onclick="advanceQuizQuestion()">
              ${qState.index + 1 === qState.list.length ? 'View Final Results 🏁' : 'Next Question ➡️'}
            </button>
          </div>` : ''}
      </div>`;
  },

  // 6. SUGGEST A BOOK
  async suggest() {
    let studentHistory = [];
    if (user) {
      studentHistory = await api('suggest');
    }

    return `
      <div style="max-width:760px;margin:0 auto;">
        <div style="margin-bottom:24px;">
          <h2 style="font-size:1.8rem;margin-bottom:4px;">💡 Suggest a Book</h2>
          <p style="color:var(--text-muted);font-size:0.9rem;">Recommend books, authors, or educational resources for the Viraj International School library.</p>
        </div>

        <div class="admin-panel-card" style="margin-bottom:32px;">
          <div class="form-group">
            <label class="form-label">Book Name *</label>
            <input id="sugTitle" class="form-control" type="text" placeholder="e.g. Percy Jackson & The Olympians">
          </div>

          <div class="form-group">
            <label class="form-label">Author</label>
            <input id="sugAuthor" class="form-control" type="text" placeholder="e.g. Rick Riordan">
          </div>

          <div class="form-group">
            <label class="form-label">Category</label>
            <select id="sugCategory" class="form-control">
              <option value="Academics & Science">Academics & Science</option>
              <option value="Fiction & Novels">Fiction & Novels</option>
              <option value="Comics & Graphic Novels">Comics & Graphic Novels</option>
              <option value="Biographies & Leaders">Biographies & Leaders</option>
              <option value="Junior Stories & Rhymes">Junior Stories & Rhymes</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Reason for Suggestion</label>
            <textarea id="sugReason" class="form-control" style="min-height:80px;" placeholder="Why would you like to see this book in the library?"></textarea>
          </div>

          <button class="btn btn-gold btn-lg" id="submitSuggestionBtn" style="width:100%;">Submit Suggestion</button>
        </div>

        ${user && studentHistory.length ? `
        <div>
          <h3 style="font-size:1.2rem;margin-bottom:14px;">📜 My Suggestions</h3>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${studentHistory.map(s => `
              <div class="admin-stat-card" style="justify-content:space-between;">
                <div>
                  <strong>${esc(s.title)}</strong>
                  <div style="color:var(--text-muted);font-size:0.8rem;">${esc(s.author || 'Author not specified')} • ${esc(s.category)}</div>
                  ${s.reason ? `<div style="font-style:italic;color:var(--text-secondary);font-size:0.8rem;margin-top:4px;">"${esc(s.reason)}"</div>` : ''}
                </div>
                <small style="color:var(--text-muted);">${new Date(s.at).toLocaleDateString()}</small>
              </div>`).join('')}
          </div>
        </div>` : ''}
      </div>`;
  },

  // 7. VOTE FOR THE NEXT BOOK
  async elect() {
    const candidates = await api('candidates');
    const totalVotes = candidates.reduce((sum, c) => sum + c.n, 0);

    return `
      <div>
        <div style="margin-bottom:24px;">
          <h2 style="font-size:1.8rem;margin-bottom:4px;">🗳️ Vote for the Next Book</h2>
          <p style="color:var(--text-muted);font-size:0.9rem;">Cast your vote on candidate book titles currently under consideration for the school library.</p>
        </div>

        <div class="election-grid">
          ${candidates.length ? candidates.map(c => {
            const pct = totalVotes > 0 ? Math.round((c.n / totalVotes) * 100) : 0;
            return `
              <div class="election-card">
                <div>
                  <div style="font-size:2rem;margin-bottom:8px;">📘</div>
                  <h4 style="font-size:1.2rem;margin-bottom:4px;">${esc(c.title)}</h4>
                  <div style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);margin-bottom:10px;">
                    By ${esc(c.author || 'Renowned Author')}
                  </div>
                  <p style="font-size:0.82rem;color:var(--text-muted);line-height:1.45;margin-bottom:14px;">
                    ${esc(c.description || 'Under consideration for library acquisition.')}
                  </p>
                </div>

                <div>
                  <div style="display:flex;align-items:center;justify-content:space-between;font-size:0.85rem;font-weight:700;">
                    <span>${c.n} Vote${c.n === 1 ? '' : 's'}</span>
                    <span style="color:var(--gold-primary);">${pct}%</span>
                  </div>

                  <div class="vote-tally-bar">
                    <div class="vote-tally-fill" style="width:${pct}%;"></div>
                  </div>

                  ${c.mine ? `
                    <button class="btn btn-ghost" style="width:100%;color:var(--status-success);border-color:var(--status-success);" disabled>
                      ✓ Voted
                    </button>` : `
                    <button class="btn btn-gold" style="width:100%;" onclick="castStudentVote(${c.id})">
                      Vote for This Book
                    </button>`}
                </div>
              </div>`;
          }).join('') : `
            <div style="grid-column:1/-1;text-align:center;padding:48px 20px;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);">
              <div style="font-size:3rem;margin-bottom:8px;">🗳️</div>
              <h4>No active book elections today</h4>
              <p style="color:var(--text-muted);font-size:0.88rem;">New candidate titles will be posted shortly.</p>
            </div>`}
        </div>
      </div>`;
  },

  // 8. AVID READER OF THE MONTH
  async avid() {
    const readers = await api('readers');
    const schoolStar = readers.find(r => r.kind === 'school') || readers[0];
    const digitalStar = readers.find(r => r.kind === 'digital') || readers[1];

    return `
      <div>
        <div style="margin-bottom:24px;">
          <h2 style="font-size:1.8rem;margin-bottom:4px;">🏆 Avid Reader of the Month</h2>
          <p style="color:var(--text-muted);font-size:0.9rem;">Celebrating dedication, consistent reading habits, and inspiring book reflections.</p>
        </div>

        <div class="fame-podium-grid">
          <!-- School Campus Star Reader -->
          <div class="fame-honor-card">
            <div class="fame-honor-header">
              <div class="fame-honor-avatar">🏫</div>
              <div>
                <span style="font-size:0.75rem;font-weight:700;color:var(--gold-primary);text-transform:uppercase;">School's Avid Reader of the Month</span>
                <h3 style="font-size:1.3rem;">${esc(schoolStar ? schoolStar.name : 'Aarav Sharma')}</h3>
                <small style="color:var(--text-muted);">${esc(schoolStar ? schoolStar.class_grade : 'Grade 8A')}</small>
              </div>
            </div>

            <div style="font-size:0.88rem;margin-bottom:10px;">
              <strong>📚 Content Consumed:</strong><br>
              <span style="color:var(--text-secondary);">${esc(schoolStar ? schoolStar.consumed : '14 Classic World Novels & Science Encyclopedias')}</span>
            </div>

            ${schoolStar && schoolStar.favourite_book ? `
            <div style="font-size:0.88rem;margin-bottom:10px;">
              <strong>⭐ Favourite Book:</strong> ${esc(schoolStar.favourite_book)}
            </div>` : ''}

            <div class="fame-quote-box">
              💭 <strong>Reader's Reflection:</strong><br>
              "${esc(schoolStar ? schoolStar.reflection : 'Reading has widened my imagination and taught me so much.')}"
            </div>
          </div>

          <!-- Digital Portal Star Reader -->
          <div class="fame-honor-card" style="border-color:var(--blue-accent);">
            <div class="fame-honor-header">
              <div class="fame-honor-avatar" style="background:linear-gradient(135deg, var(--navy-primary), var(--blue-accent));">💻</div>
              <div>
                <span style="font-size:0.75rem;font-weight:700;color:var(--blue-accent);text-transform:uppercase;">Digital Avid Reader of the Month</span>
                <h3 style="font-size:1.3rem;">${esc(digitalStar ? digitalStar.name : 'Diya Patel')}</h3>
                <small style="color:var(--text-muted);">${esc(digitalStar ? digitalStar.class_grade : 'Grade 6B')}</small>
              </div>
            </div>

            <div style="font-size:0.88rem;margin-bottom:10px;">
              <strong>🎧 Content Consumed:</strong><br>
              <span style="color:var(--text-secondary);">${esc(digitalStar ? digitalStar.consumed : '22 Digital Audiobooks & Illustrated Flipbooks')}</span>
            </div>

            ${digitalStar && digitalStar.favourite_book ? `
            <div style="font-size:0.88rem;margin-bottom:10px;">
              <strong>⭐ Favourite Book:</strong> ${esc(digitalStar.favourite_book)}
            </div>` : ''}

            <div class="fame-quote-box">
              💭 <strong>Reader's Reflection:</strong><br>
              "${esc(digitalStar ? digitalStar.reflection : 'The digital library portal makes reading and listening so enjoyable!')}"
            </div>
          </div>
        </div>
      </div>`;
  },

  // 9. DAILY NEWSPAPERS & CAMPUS NEWS
  async news() {
    const filter = appState.newsFilter || 'week';
    const stories = await api(`news?range=${filter}`);

    return `
      <div>
        <div style="margin-bottom:24px;">
          <h2 style="font-size:1.8rem;margin-bottom:4px;">📰 Daily Newspapers & Campus News</h2>
          <p style="color:var(--text-muted);font-size:0.9rem;">Access daily leading student newspapers, national editorial columns, and official campus circulars.</p>
        </div>

        <!-- Digital Newspapers Stand -->
        <div style="margin-bottom:32px;">
          <div class="section-header-row" style="margin-bottom:14px;">
            <h3 class="section-title" style="font-size:1.25rem;">🗞️ Daily Student Newspapers Stand</h3>
            <span style="font-size:0.8rem;font-weight:700;color:var(--text-muted);">UPDATED DAILY</span>
          </div>

          <div class="newspaper-stand-grid">
            <div class="newspaper-card">
              <div>
                <div class="newspaper-card-top">
                  <div class="newspaper-icon">🗞️</div>
                  <span class="newspaper-tag">Daily Student</span>
                </div>
                <h4 class="newspaper-title">The Hindu (In School)</h4>
                <p class="newspaper-desc">Daily national current affairs, science focus, vocabulary puzzles, and editorial debates.</p>
              </div>
              <div class="newspaper-action">
                <button class="btn btn-sm btn-gold" style="width:100%;" onclick="openPreview('The Hindu — In School Edition', '#', 'Daily National Student Newspaper • The Hindu Press')">📖 Read Digital Edition</button>
              </div>
            </div>

            <div class="newspaper-card">
              <div>
                <div class="newspaper-card-top">
                  <div class="newspaper-icon">📰</div>
                  <span class="newspaper-tag">Youth Edition</span>
                </div>
                <h4 class="newspaper-title">Indian Express Explorer</h4>
                <p class="newspaper-desc">Civics, science wonders, literature reviews, student debate columns, and global spotlights.</p>
              </div>
              <div class="newspaper-action">
                <button class="btn btn-sm btn-gold" style="width:100%;" onclick="openPreview('Indian Express Student Explorer', '#', 'Youth Student Edition • Express Media')">📖 Read Digital Edition</button>
              </div>
            </div>

            <div class="newspaper-card">
              <div>
                <div class="newspaper-card-top">
                  <div class="newspaper-icon">🌍</div>
                  <span class="newspaper-tag">Academic NIE</span>
                </div>
                <h4 class="newspaper-title">Times NIE Student Daily</h4>
                <p class="newspaper-desc">Global inventions, campus sports, creative writing showcase, and inter-school knowledge trivia.</p>
              </div>
              <div class="newspaper-action">
                <button class="btn btn-sm btn-gold" style="width:100%;" onclick="openPreview('Times NIE — Newspaper in Education', '#', 'Newspaper in Education • Times Group')">📖 Read Digital Edition</button>
              </div>
            </div>

            <div class="newspaper-card">
              <div>
                <div class="newspaper-card-top">
                  <div class="newspaper-icon">🏫</div>
                  <span class="newspaper-tag" style="background:var(--status-success-bg);color:var(--status-success);">Official Press</span>
                </div>
                <h4 class="newspaper-title">Viraj Campus Chronicle</h4>
                <p class="newspaper-desc">Official school weekly bulletin, inter-house championship tallies, book reviews, and academic events.</p>
              </div>
              <div class="newspaper-action">
                <button class="btn btn-sm btn-gold" style="width:100%;" onclick="openPreview('Viraj Campus Chronicle — Weekly Edition', '#', 'Official School Press • Viraj International School')">📖 Read Campus Issue</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Campus Circulars & News Feed -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
          <h3 class="section-title" style="font-size:1.25rem;">📢 Campus Bulletins & Announcements</h3>

          <div style="display:flex;gap:6px;">
            <button class="cat-tab-btn ${filter === 'today' ? 'active' : ''}" onclick="appState.newsFilter='today';go('news')">Today</button>
            <button class="cat-tab-btn ${filter === 'week' ? 'active' : ''}" onclick="appState.newsFilter='week';go('news')">This Week</button>
            <button class="cat-tab-btn ${filter === 'archive' ? 'active' : ''}" onclick="appState.newsFilter='archive';go('news')">Archived</button>
          </div>
        </div>

        <div class="news-stack">
          ${stories.length ? stories.map(s => `
            <div class="news-article-card">
              <div class="news-top-row">
                <span class="pillar-badge" style="background:var(--bg-secondary);color:var(--navy-primary);font-size:0.75rem;">
                  📢 ${esc(s.category || 'General')}
                </span>
                <span style="font-size:0.78rem;color:var(--text-muted);">
                  📅 ${new Date(s.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • By ${esc(s.author || 'Library Desk')}
                </span>
              </div>
              <h3 style="font-size:1.25rem;color:var(--navy-primary);margin-bottom:8px;">${esc(s.title)}</h3>
              <p style="color:var(--text-secondary);font-size:0.92rem;line-height:1.6;white-space:pre-line;">${esc(s.body)}</p>
            </div>`).join('') : `
            <div style="text-align:center;padding:48px 20px;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);">
              <div style="font-size:3rem;margin-bottom:8px;">📰</div>
              <h4>No news articles in this filter</h4>
              <p style="color:var(--text-muted);font-size:0.88rem;">Select "This Week" or "Archived" to read previous announcements.</p>
            </div>`}
        </div>
      </div>`;
  },

  // 10. USER PROFILE
  async profile() {
    if (!user) {
      go('auth', 'login');
      return '';
    }

    const u = await api('me');
    const counts = {};
    (u.usage || []).forEach(x => { counts[x.kind] = x.n; });
    const totalReads = (u.usage || []).reduce((a, x) => a + x.n, 0);

    let rank = 'Bronze Scholar 🥉';
    if (totalReads >= 30) rank = 'Grand Bibliophile 💎';
    else if (totalReads >= 15) rank = 'Master Scholar 🥇';
    else if (totalReads >= 5) rank = 'Book Explorer 🥈';

    return `
      <div>
        <div class="passport-banner">
          <div class="passport-user-header">
            <div class="passport-avatar-lg">${(u.name || 'S')[0].toUpperCase()}</div>
            <div>
              <h2 style="font-size:1.6rem;margin-bottom:4px;">${esc(u.name)}</h2>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span style="color:var(--text-muted);font-size:0.85rem;">@${esc(u.username)}</span>
                <span class="pillar-badge" style="background:var(--bg-secondary);color:var(--navy-primary);">${esc(u.grade || 'Student')}</span>
                <span class="pillar-badge" style="background:var(--gold-soft);color:var(--gold-primary);font-weight:700;">${rank}</span>
              </div>
            </div>
          </div>

          <h4 style="font-size:0.95rem;margin-bottom:12px;color:var(--text-muted);">📊 Reading Activity</h4>
          <div class="passport-metrics-row">
            <div class="metric-pill">
              <div class="metric-pill-val">${counts.junior || 0}</div>
              <div class="metric-pill-lbl">📚 Books Read</div>
            </div>
            <div class="metric-pill">
              <div class="metric-pill-val">${counts.secondary || 0}</div>
              <div class="metric-pill-lbl">🎧 Audio Stories</div>
            </div>
            <div class="metric-pill">
              <div class="metric-pill-val">${counts.biography || 0}</div>
              <div class="metric-pill-lbl">👑 Biographies Read</div>
            </div>
            <div class="metric-pill">
              <div class="metric-pill-val">${counts.quiz || 0}</div>
              <div class="metric-pill-lbl">🧠 Quizzes Completed</div>
            </div>
            <div class="metric-pill">
              <div class="metric-pill-val" style="color:var(--gold-primary);">${totalReads}</div>
              <div class="metric-pill-lbl">Total Interactions</div>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
          <!-- Bookmarks -->
          <div class="admin-panel-card">
            <div class="section-header-row">
              <h4 class="section-title" style="font-size:1.15rem;">🔖 Saved Books</h4>
              <span class="section-link" onclick="go('bookmarks')">View All →</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${(u.bookmarks || []).slice(0, 4).map(b => `
                <div class="admin-stat-card" style="justify-content:space-between;cursor:pointer;" onclick="openItem(${b.id}, '${b.section}', '${esc(b.title).replace(/'/g, "\\'")}', '${esc(b.file || '')}', '${esc(b.author || '').replace(/'/g, "\\'")}')">
                  <div>
                    <strong style="font-size:0.88rem;display:block;">${esc(b.title)}</strong>
                    <small style="color:var(--text-muted);">${esc(b.author)} • ${esc(b.category)}</small>
                  </div>
                  <span class="btn btn-sm btn-ghost">Read</span>
                </div>`).join('') || '<p style="color:var(--text-muted);font-size:0.85rem;">No saved books yet.</p>'}
            </div>
          </div>

          <!-- Recent Activity Log -->
          <div class="admin-panel-card">
            <div class="section-header-row">
              <h4 class="section-title" style="font-size:1.15rem;">🕒 Recently Read</h4>
              <span class="section-link" onclick="go('history')">View Full History →</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${(u.recent || []).slice(0, 5).map(r => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color);font-size:0.85rem;">
                  <div>
                    <strong>${esc(r.title)}</strong>
                    <div style="color:var(--text-muted);font-size:0.75rem;">${esc(r.kind)}</div>
                  </div>
                  <small style="color:var(--text-muted);">${new Date(r.at).toLocaleDateString()}</small>
                </div>`).join('') || '<p style="color:var(--text-muted);font-size:0.85rem;">No library history recorded yet.</p>'}
            </div>
          </div>
        </div>
      </div>`;
  },

  // 11. BOOKMARKS
  async bookmarks() {
    if (!user) { go('auth', 'login'); return ''; }
    const meData = await api('me');
    const bookmarks = meData.bookmarks || [];

    return `
      <div>
        <div style="margin-bottom:24px;">
          <h2 style="font-size:1.8rem;margin-bottom:4px;">🔖 Saved Books</h2>
          <p style="color:var(--text-muted);font-size:0.9rem;">Your personal reading collection for quick access.</p>
        </div>

        <div class="books-shelf-grid">
          ${bookmarks.length ? bookmarks.map(renderBookCard).join('') : `
            <div style="grid-column:1/-1;text-align:center;padding:48px 20px;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);">
              <div style="font-size:3rem;margin-bottom:8px;">🔖</div>
              <h4>No saved books</h4>
              <p style="color:var(--text-muted);font-size:0.88rem;">Click the heart icon on any book card to save it here.</p>
            </div>`}
        </div>
      </div>`;
  },

  // 12. READING HISTORY
  async history() {
    if (!user) { go('auth', 'login'); return ''; }
    const meData = await api('me');
    const recent = meData.recent || [];

    return `
      <div style="max-width:800px;margin:0 auto;">
        <div style="margin-bottom:24px;">
          <h2 style="font-size:1.8rem;margin-bottom:4px;">🕒 Reading History</h2>
          <p style="color:var(--text-muted);font-size:0.9rem;">Complete chronological log of your digital book reads, audio plays, and quiz attempts.</p>
        </div>

        <div class="admin-panel-card">
          ${recent.length ? recent.map(r => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border-color);">
              <div>
                <strong style="font-size:0.95rem;">${esc(r.title)}</strong>
                <div style="color:var(--text-muted);font-size:0.8rem;text-transform:capitalize;">Section: ${esc(r.kind)}</div>
              </div>
              <span class="pillar-badge" style="background:var(--bg-secondary);color:var(--text-muted);">
                ${new Date(r.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>`).join('') : '<p style="color:var(--text-muted);">No recorded library history yet.</p>'}
        </div>
      </div>`;
  },

  // 13. ABOUT THE LIBRARY
  about() {
    return `
      <div style="max-width:820px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:32px;">
          <img src="logo.svg" alt="Viraj Crest" style="width:72px;height:72px;margin-bottom:12px;">
          <h2 style="font-family:'Cinzel',serif;font-size:1.8rem;color:var(--navy-primary);">VIRAJ INTERNATIONAL SCHOOL</h2>
          <p style="color:var(--gold-primary);font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">Digital Knowledge & Library Hub</p>
        </div>

        <div class="admin-panel-card" style="margin-bottom:24px;">
          <h3 style="margin-bottom:10px;">🏛️ About the Library</h3>
          <p style="color:var(--text-secondary);line-height:1.6;margin-bottom:14px;">
            The Viraj International School Digital Knowledge & Library Hub provides students, faculty, and scholars with 24/7 access to curriculum textbooks, world literature, biographies, audiobooks, and knowledge challenges.
          </p>
        </div>
      </div>`;
  },

  // 14. AUTHENTICATION (LAPTOP LOGIN HUB & DUAL ROLES: STUDENT / ADMIN)
  auth(mode) {
    const isSignup = mode === 'signup';

    if (isSignup) {
      return `
        <div class="auth-center-wrap">
          <div class="auth-signup-box">
            <div class="auth-header-row">
              <img src="logo.svg" alt="Viraj School Emblem" class="auth-crest-sm">
              <div>
                <h2 style="font-size:1.4rem;margin-bottom:2px;">Student & Scholar Registration</h2>
                <p style="color:var(--text-muted);font-size:0.85rem;">Join the Viraj International School Digital Knowledge Hub</p>
              </div>
            </div>

            <div class="auth-signup-grid">
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <input id="authName" class="form-control" type="text" placeholder="e.g. Aarav Sharma" required>
              </div>

              <div class="form-group">
                <label class="form-label">Username (Student ID) *</label>
                <input id="authUser" class="form-control" type="text" placeholder="e.g. aarav_8a" required>
              </div>

              <div class="form-group">
                <label class="form-label">School / Personal Email</label>
                <input id="authEmail" class="form-control" type="email" placeholder="e.g. aarav@student.virajis.edu.in">
              </div>

              <div class="form-group">
                <label class="form-label">Class / Grade *</label>
                <select id="authGrade" class="form-control">
                  <option value="Grade 1-3">Primary (Grade 1 - 3)</option>
                  <option value="Grade 4-5">Primary (Grade 4 - 5)</option>
                  <option value="Grade 6-8" selected>Middle School (Grade 6 - 8)</option>
                  <option value="Grade 9-10">Secondary (Grade 9 - 10)</option>
                  <option value="Grade 11-12">Senior Secondary (Grade 11 - 12)</option>
                  <option value="Faculty">Teacher / Faculty Member</option>
                </select>
              </div>

              <div class="form-group" style="grid-column: 1 / -1;">
                <label class="form-label">Account Password *</label>
                <div class="password-input-wrap">
                  <input id="authPass" class="form-control" type="password" placeholder="Create a secure password" required>
                  <button type="button" class="pwd-toggle-btn" onclick="togglePasswordVisibility('authPass', this)" title="Show Password">👁️</button>
                </div>
              </div>
            </div>

            <div style="margin-top:12px;">
              <button class="btn btn-gold btn-lg auth-submit-btn" id="submitSignupBtn">
                ✨ Create Student Account
              </button>
            </div>

            <div class="auth-footer-link">
              Already registered? <a href="javascript:void(0)" onclick="go('auth', 'login')"><strong>Sign In to Library Hub</strong></a>
            </div>
          </div>
        </div>`;
    }

    // Login Hub (Dual Role: Student & Admin)
    return `
      <div class="auth-center-wrap">
        <div class="auth-hub-card">
          <!-- Left Academic Banner -->
          <div class="auth-banner-panel">
            <div class="auth-banner-content">
              <div>
                <img src="logo.svg" alt="Viraj School Emblem" class="auth-crest-lg">
                <h3 class="auth-banner-school">VIRAJ INTERNATIONAL SCHOOL</h3>
                <p class="auth-banner-tagline">Digital Knowledge & Library Hub</p>
                <div class="auth-divider"></div>
                
                <ul class="auth-features-list">
                  <li><span>📚</span> 24/7 Digital Library & Audiobooks</li>
                  <li><span>🧠</span> "Test Your Wits" Knowledge Arena</li>
                  <li><span>🗳️</span> Democratic Book Voting & Polling</li>
                  <li><span>🏆</span> Avid Reader of the Month Accolades</li>
                </ul>
              </div>

              <div class="auth-safe-badge">
                <span>🛡️ Safe & Supervised Learning Portal</span>
              </div>
            </div>
          </div>

          <!-- Right Authentication Form Panel -->
          <div class="auth-form-panel">
            <div class="auth-form-header">
              <h2 class="auth-form-title">Portal Sign In</h2>
              <p class="auth-form-subtitle">Choose your access role or enter your credentials</p>
            </div>

            <!-- Role Selector Tabs (Student & Admin) -->
            <div class="auth-role-tabs">
              <button type="button" class="role-tab-btn active" id="roleTabStudent" onclick="switchLoginRole('student')">
                <span>🎓</span>
                <span>Student / Scholar</span>
              </button>
              <button type="button" class="role-tab-btn" id="roleTabAdmin" onclick="switchLoginRole('admin')">
                <span>🛡️</span>
                <span>Librarian / Admin</span>
              </button>
            </div>

            <div class="role-context-badge" id="roleContextBadge">
              <span id="roleContextIcon">🎓</span>
              <span id="roleContextText">Student & Scholar Portal • Access ebooks, quizzes & reading passport</span>
            </div>

            <!-- Universal Login Form -->
            <form id="loginForm" onsubmit="event.preventDefault(); document.getElementById('submitLoginBtn').click();">
              <div class="form-group">
                <label class="form-label" id="loginUserLabel">Student Username or Email</label>
                <div class="input-icon-wrap">
                  <span class="input-icon">👤</span>
                  <input id="loginUser" class="form-control with-icon" type="text" placeholder="Enter username or email" required autofocus autocomplete="username">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Password</label>
                <div class="password-input-wrap">
                  <span class="input-icon">🔒</span>
                  <input id="loginPass" class="form-control with-icon" type="password" placeholder="••••••••" required autocomplete="current-password">
                  <button type="button" class="pwd-toggle-btn" onclick="togglePasswordVisibility('loginPass', this)" title="Show Password">👁️</button>
                </div>
              </div>

              <button class="btn btn-gold btn-lg auth-submit-btn" id="submitLoginBtn" type="button">
                Sign In to Library Desk ➡️
              </button>
            </form>

            <div class="auth-footer-link" id="authSignupPrompt">
              <span>New Student or Scholar? </span>
              <a href="javascript:void(0)" onclick="go('auth', 'signup')"><strong>Join the Knowledge Hub</strong></a>
            </div>
          </div>
        </div>
      </div>`;
  },

  // 15. LIBRARIAN DASHBOARD
  async admin() {
    if (!isLibrarian()) {
      return `<div style="text-align:center;padding:60px 20px;"><h3>Access Restricted</h3></div>`;
    }

    const stats = await api('admin/stats');
    const pendingUsers = await api('pending');
    const allBooks = await api('items');

    return `
      <div class="admin-hub-container">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <h2 style="font-size:1.8rem;margin-bottom:4px;">🛡️ Librarian Dashboard</h2>
            <p style="color:var(--text-muted);font-size:0.9rem;">Manage library resources, user verification, quiz questions, and announcements.</p>
          </div>
          <button class="btn btn-gold" onclick="$('#addResourcePanel').hidden = !$('#addResourcePanel').hidden">➕ Add New Resource</button>
        </div>

        <!-- Overview Analytics -->
        <div class="admin-stats-grid">
          <div class="admin-stat-card">
            <span style="font-size:1.8rem;">📚</span>
            <div>
              <strong style="font-size:1.2rem;display:block;">${stats.books}</strong>
              <small style="color:var(--text-muted);">Total Books</small>
            </div>
          </div>
          <div class="admin-stat-card">
            <span style="font-size:1.8rem;">👥</span>
            <div>
              <strong style="font-size:1.2rem;display:block;">${stats.users}</strong>
              <small style="color:var(--text-muted);">Total Users</small>
            </div>
          </div>
          <div class="admin-stat-card">
            <span style="font-size:1.8rem;">⏳</span>
            <div>
              <strong style="font-size:1.2rem;display:block;color:var(--gold-primary);">${stats.pendingUsers}</strong>
              <small style="color:var(--text-muted);">Pending Approvals</small>
            </div>
          </div>
          <div class="admin-stat-card">
            <span style="font-size:1.8rem;">🧠</span>
            <div>
              <strong style="font-size:1.2rem;display:block;">${stats.quizAttempts}</strong>
              <small style="color:var(--text-muted);">Quiz Attempts</small>
            </div>
          </div>
          <div class="admin-stat-card">
            <span style="font-size:1.8rem;">💡</span>
            <div>
              <strong style="font-size:1.2rem;display:block;">${stats.suggestions}</strong>
              <small style="color:var(--text-muted);">Suggestions</small>
            </div>
          </div>
          <div class="admin-stat-card">
            <span style="font-size:1.8rem;">🗳️</span>
            <div>
              <strong style="font-size:1.2rem;display:block;">${stats.votes}</strong>
              <small style="color:var(--text-muted);">Votes</small>
            </div>
          </div>
        </div>

        <!-- Add Resource Form -->
        <div id="addResourcePanel" class="admin-panel-card" hidden style="border-left:4px solid var(--gold-primary);">
          <h3 style="margin-bottom:16px;">📤 Add New Resource</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div class="form-group">
              <label class="form-label">Section</label>
              <select id="admSection" class="form-control">
                <option value="junior">Junior Library</option>
                <option value="secondary" selected>Secondary Library</option>
                <option value="biography">Biographies</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <input id="admCategory" class="form-control" type="text" placeholder="e.g. Academics, Comics, Novels">
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:16px;">
            <div class="form-group">
              <label class="form-label">Title</label>
              <input id="admTitle" class="form-control" type="text" placeholder="Book Title">
            </div>
            <div class="form-group">
              <label class="form-label">Author</label>
              <input id="admAuthor" class="form-control" type="text" placeholder="Author Name">
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
            <div class="form-group">
              <label class="form-label">Grade</label>
              <input id="admGrade" class="form-control" type="text" placeholder="e.g. Grades 6 - 8">
            </div>
            <div class="form-group">
              <label class="form-label">Reading Time</label>
              <input id="admReadTime" class="form-control" type="text" placeholder="e.g. 15 min read">
            </div>
            <div class="form-group">
              <label class="form-label">Content Type</label>
              <select id="admType" class="form-control">
                <option value="book">Book</option>
                <option value="audio">Audio</option>
                <option value="flipbook">Flip Book</option>
                <option value="comic">Comic</option>
                <option value="encyclopedia">Encyclopedia</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea id="admDesc" class="form-control" style="min-height:60px;" placeholder="Short synopsis..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">File Attachment (PDF, MP3, Image)</label>
            <input id="admFile" type="file" class="form-control">
          </div>

          <button class="btn btn-gold btn-lg" id="saveResourceBtn">Save & Add to Library</button>
        </div>

        <!-- Pending Approvals -->
        <div class="admin-panel-card">
          <h3 style="margin-bottom:14px;">⏳ User Management & Approvals (${pendingUsers.length})</h3>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${pendingUsers.length ? pendingUsers.map(p => `
              <div class="admin-stat-card" style="justify-content:space-between;">
                <div>
                  <strong>${esc(p.name)}</strong> (@${esc(p.username)})
                  <div style="color:var(--text-muted);font-size:0.8rem;">Class: ${esc(p.grade)} • Email: ${esc(p.email || 'None')}</div>
                </div>
                <div style="display:flex;gap:8px;">
                  <button class="btn btn-sm" style="background:var(--status-success);" onclick="adminApproveUser(${p.id}, 1)">Approve</button>
                  <button class="btn btn-sm btn-danger" onclick="adminApproveUser(${p.id}, 0)">Decline</button>
                </div>
              </div>`).join('') : '<p style="color:var(--text-muted);font-size:0.88rem;">No users waiting for approval.</p>'}
          </div>
        </div>

        <!-- Manage Questions & Announcements -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
          <div class="admin-panel-card">
            <h4 style="margin-bottom:12px;">📢 Post Announcement</h4>
            <div class="form-group">
              <label class="form-label">Title</label>
              <input id="admNewsTitle" class="form-control" type="text" placeholder="Title">
            </div>
            <div class="form-group">
              <label class="form-label">Details</label>
              <textarea id="admNewsBody" class="form-control" style="min-height:70px;" placeholder="Details..."></textarea>
            </div>
            <button class="btn btn-sm btn-gold" id="saveNewsBtn">Post Announcement</button>
          </div>

          <div class="admin-panel-card">
            <h4 style="margin-bottom:12px;">🧠 Add Quiz Question</h4>
            <div class="form-group">
              <label class="form-label">Category</label>
              <select id="admQuizSec" class="form-control">
                <option value="junior">Junior Quiz</option>
                <option value="secondary" selected>Secondary Quiz</option>
                <option value="biography">Biography Quiz</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Question</label>
              <input id="admQuizQ" class="form-control" type="text" placeholder="Question">
            </div>
            <div class="form-group">
              <label class="form-label">Options (Separated by |)</label>
              <input id="admQuizOpts" class="form-control" type="text" placeholder="Opt1 | Opt2 | Opt3 | Opt4">
            </div>
            <div class="form-group">
              <label class="form-label">Correct Option Number (1, 2, 3...)</label>
              <input id="admQuizAns" class="form-control" type="number" min="1" max="5" value="1">
            </div>
            <button class="btn btn-sm btn-gold" id="saveQuizQBtn">Add Question</button>
          </div>
        </div>
      </div>`;
  }
};

// -------------------------------------------------------------
// EVENT BINDERS & QUICK ACTIONS
// -------------------------------------------------------------
const binders = {
  auth(mode) {
    const isSignup = mode === 'signup';
    if (isSignup) {
      const btn = $('#submitSignupBtn');
      if (btn) btn.onclick = async () => {
        try {
          const name = ($('#authName') || {}).value;
          const username = ($('#authUser') || {}).value;
          const email = ($('#authEmail') || {}).value;
          const grade = ($('#authGrade') || {}).value;
          const password = ($('#authPass') || {}).value;

          if (!name || !username || !password) throw new Error('Please fill in Name, Username and Password.');
          
          btn.disabled = true;
          btn.textContent = 'Registering Account... ⏳';

          const res = await api('signup', 'POST', { name, username, email, grade, password });
          showToast(res.ok || 'Account submitted for librarian approval!', 'success');
          go('auth', 'login');
        } catch (err) {
          showToast(err.message, 'error');
          btn.disabled = false;
          btn.textContent = '✨ Create Student Account';
        }
      };
    } else {
      const btn = $('#submitLoginBtn');
      if (btn) btn.onclick = async () => {
        try {
          const username = ($('#loginUser') || {}).value;
          const password = ($('#loginPass') || {}).value;
          if (!username || !password) throw new Error('Please enter your username and password.');
          
          btn.disabled = true;
          btn.textContent = 'Authenticating... ⏳';

          const res = await api('login', 'POST', { username, password });
          user = res.user;
          updateNavAuthUI();
          
          if (isLibrarian()) {
            showToast(`Welcome Administrator ${user.name}! Accessing Librarian Hub 🛡️`, 'success');
            go('admin');
          } else {
            showToast(`Welcome Scholar ${user.name}! Accessing Knowledge Desk 📚`, 'success');
            go('profile');
          }
        } catch (err) {
          showToast(err.message, 'error');
          btn.disabled = false;
          btn.innerHTML = 'Sign In to Library Desk ➡️';
        }
      };
    }
  },

  suggest() {
    const btn = $('#submitSuggestionBtn');
    if (btn) btn.onclick = async () => {
      try {
        const title = ($('#sugTitle') || {}).value;
        const author = ($('#sugAuthor') || {}).value;
        const category = ($('#sugCategory') || {}).value;
        const reason = ($('#sugReason') || {}).value;

        if (!title) throw new Error('Please enter the book title.');
        const res = await api('suggest', 'POST', { title, author, category, reason });
        showToast(res.ok || 'Recommendation sent to librarian!', 'success');
        $('#sugTitle').value = '';
        $('#sugAuthor').value = '';
        $('#sugReason').value = '';
        go('suggest');
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  },

  admin() {
    const saveResBtn = $('#saveResourceBtn');
    if (saveResBtn) saveResBtn.onclick = async () => {
      try {
        const section = $('#admSection').value;
        const category = $('#admCategory').value;
        const title = $('#admTitle').value;
        const author = $('#admAuthor').value;
        const grade = $('#admGrade').value;
        const read_time = $('#admReadTime').value;
        const content_type = $('#admType').value;
        const description = $('#admDesc').value;
        const fileInput = $('#admFile');

        if (!title || !category) throw new Error('Title and Category are required.');

        const formData = new FormData();
        formData.append('section', section);
        formData.append('category', category);
        formData.append('title', title);
        formData.append('author', author);
        formData.append('grade', grade);
        formData.append('read_time', read_time);
        formData.append('content_type', content_type);
        formData.append('description', description);
        if (fileInput && fileInput.files[0]) formData.append('file', fileInput.files[0]);

        await api('items', 'POST', formData);
        showToast('Resource added to library!', 'success');
        go('admin');
      } catch (err) {
        showToast(err.message, 'error');
      }
    };

    const saveNewsBtn = $('#saveNewsBtn');
    if (saveNewsBtn) saveNewsBtn.onclick = async () => {
      try {
        const title = $('#admNewsTitle').value;
        const body = $('#admNewsBody').value;
        if (!title || !body) throw new Error('Title and details are required.');
        await api('news', 'POST', { title, body });
        showToast('Announcement posted!', 'success');
        go('admin');
      } catch (err) {
        showToast(err.message, 'error');
      }
    };

    const saveQuizQBtn = $('#saveQuizQBtn');
    if (saveQuizQBtn) saveQuizQBtn.onclick = async () => {
      try {
        const section = $('#admQuizSec').value;
        const q = $('#admQuizQ').value;
        const rawOpts = $('#admQuizOpts').value;
        const ans = +($('#admQuizAns').value) - 1;
        const opts = rawOpts.split('|').map(s => s.trim()).filter(Boolean);
        if (!q || opts.length < 2) throw new Error('Question and at least 2 options required.');
        await api('questions', 'POST', { section, q, opts, ans });
        showToast('Question added to quiz bank!', 'success');
        go('admin');
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  }
};

async function submitQuickSuggestion() {
  const title = ($('#quickSugTitle') || {}).value;
  const author = ($('#quickSugAuthor') || {}).value;
  if (!title) {
    showToast('Please enter the book title.', 'error');
    return;
  }
  try {
    const res = await api('suggest', 'POST', { title, author, category: 'General' });
    showToast(res.ok || 'Book suggestion sent to librarian!', 'success');
    $('#quickSugTitle').value = '';
    $('#quickSugAuthor').value = '';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function filterLocalShelf(query) {
  const q = (query || '').toLowerCase().trim();
  const filtered = cachedItems.filter(i => {
    return !q ||
      i.title.toLowerCase().includes(q) ||
      (i.author && i.author.toLowerCase().includes(q)) ||
      (i.category && i.category.toLowerCase().includes(q));
  });

  const container = $('#shelfCardsContainer');
  if (container) {
    container.innerHTML = filtered.length
      ? filtered.map(renderBookCard).join('')
      : '<div style="grid-column:1/-1;text-align:center;padding:48px 20px;"><h4>No matching books found</h4></div>';
  }
}

async function castStudentVote(id) {
  if (!user) {
    showToast('Please log in to vote for upcoming books.', 'info');
    go('auth', 'login');
    return;
  }
  try {
    await api(`vote/${id}`, 'POST');
    showToast('Your vote has been counted!', 'success');
    go(currentView);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function startQuizEngine(category) {
  try {
    const list = await api(`quiz/${category}`);
    if (!list.length) {
      showToast('No quiz questions available yet.', 'info');
      return;
    }
    appState.quiz = {
      category,
      list,
      index: 0,
      score: 0,
      selected: null,
      answersLog: []
    };
    go('quiz', category);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function submitQuizAnswer(idx) {
  const qState = appState.quiz;
  if (!qState || qState.selected !== null) return;

  qState.selected = idx;
  const curr = qState.list[qState.index];
  const isCorrect = idx === curr.ans;
  if (isCorrect) qState.score++;

  qState.answersLog.push({
    q: curr.q,
    selectedText: curr.opts[idx] || '',
    correctText: curr.opts[curr.ans] || '',
    isCorrect,
    explanation: curr.explanation || ''
  });

  showToast(isCorrect ? 'Correct! Well done! ⭐' : 'Not quite. Check the explanation! 💡', isCorrect ? 'success' : 'error');
  go('quiz', qState.category);
}

async function advanceQuizQuestion() {
  const qState = appState.quiz;
  if (!qState) return;

  qState.index++;
  qState.selected = null;

  if (qState.index >= qState.list.length && user) {
    try {
      await api('quiz-complete', 'POST', {
        category: qState.category,
        score: qState.score,
        total: qState.list.length
      });
    } catch (e) {
      console.warn(e);
    }
  }

  go('quiz', qState.category);
}

async function adminApproveUser(id, ok) {
  try {
    await api(`approve/${id}`, 'POST', { ok });
    showToast(ok ? 'Student approved and active!' : 'Registration request declined.', 'info');
    go('admin');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function logout() {
  try {
    await api('logout', 'POST');
    user = null;
    updateNavAuthUI();
    showToast('Logged out safely.', 'info');
    go('home');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = $('#' + inputId);
  if (!input) return;
  const isPwd = input.type === 'password';
  input.type = isPwd ? 'text' : 'password';
  if (btn) btn.textContent = isPwd ? '🙈' : '👁️';
}

function switchLoginRole(role) {
  const tabStudent = $('#roleTabStudent');
  const tabAdmin = $('#roleTabAdmin');
  const badgeText = $('#roleContextText');
  const badgeIcon = $('#roleContextIcon');
  const userLabel = $('#loginUserLabel');
  const userInput = $('#loginUser');
  const submitBtn = $('#submitLoginBtn');
  const signupPrompt = $('#authSignupPrompt');

  if (role === 'admin') {
    if (tabStudent) tabStudent.classList.remove('active');
    if (tabAdmin) tabAdmin.classList.add('active');
    if (badgeIcon) badgeIcon.textContent = '🛡️';
    if (badgeText) badgeText.textContent = 'Librarian & Admin Desk • Manage catalog, verify students & post news';
    if (userLabel) userLabel.textContent = 'Administrator / Librarian ID';
    if (userInput) {
      userInput.placeholder = 'e.g. librarian';
      userInput.focus();
    }
    if (submitBtn) submitBtn.innerHTML = 'Sign In to Librarian Hub 🛡️';
    if (signupPrompt) signupPrompt.style.display = 'none';
  } else {
    if (tabAdmin) tabAdmin.classList.remove('active');
    if (tabStudent) tabStudent.classList.add('active');
    if (badgeIcon) badgeIcon.textContent = '🎓';
    if (badgeText) badgeText.textContent = 'Student & Scholar Portal • Access ebooks, quizzes & reading passport';
    if (userLabel) userLabel.textContent = 'Student Username or Email';
    if (userInput) {
      userInput.placeholder = 'Enter username or email';
      userInput.focus();
    }
    if (submitBtn) submitBtn.innerHTML = 'Sign In to Library Desk ➡️';
    if (signupPrompt) signupPrompt.style.display = 'block';
  }
}

// Global Window Function Hooks
window.go = go;
window.openItem = openItem;
window.openPreview = openPreview;
window.closePreview = closePreview;
window.toggleBookmark = toggleBookmark;
window.toggleDropdown = toggleDropdown;
window.closeDropdowns = closeDropdowns;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleTheme = toggleTheme;
window.handleGlobalSearch = handleGlobalSearch;
window.filterLocalShelf = filterLocalShelf;
window.castStudentVote = castStudentVote;
window.submitQuickSuggestion = submitQuickSuggestion;
window.startQuizEngine = startQuizEngine;
window.submitQuizAnswer = submitQuizAnswer;
window.advanceQuizQuestion = advanceQuizQuestion;
window.adminApproveUser = adminApproveUser;
window.togglePasswordVisibility = togglePasswordVisibility;
window.switchLoginRole = switchLoginRole;
window.logout = logout;

// Start App
boot();
