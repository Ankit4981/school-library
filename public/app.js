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

// API Client Helper with safe timeout
const api = async (u, m = 'GET', b, timeoutMs = 4000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch('/api/' + u, {
      method: m,
      headers: b && !(b instanceof FormData) ? { 'Content-Type': 'application/json' } : {},
      body: b instanceof FormData ? b : (b ? JSON.stringify(b) : undefined),
      signal: controller.signal
    });
    clearTimeout(timer);
    const text = await r.text();
    let d = {};
    try { d = JSON.parse(text); } catch {}
    if (!r.ok) throw new Error(d.error || `Request failed (${r.status})`);
    return d;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
};

// Baseline starter catalog items from library.db for instant rendering
const STARTER_LIBRARY_ITEMS = [
  {
    "id": 1,
    "section": "junior",
    "category": "Nursery Rhymes",
    "title": "Twinkle Twinkle & Bedtime Rhymes Collection",
    "file": null,
    "author": "Traditional Heritage",
    "grade": "Pre-K - Grade 1",
    "read_time": "5 min read",
    "content_type": "book",
    "description": "A delightful collection of classic rhythmic rhymes with colorful visual stories.",
    "featured": 1,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 2,
    "section": "junior",
    "category": "Nursery Rhymes",
    "title": "Wheels on the Bus Singalong Edition",
    "file": null,
    "author": "Kids Musical Circle",
    "grade": "Pre-K - Grade 2",
    "read_time": "4 min audio",
    "content_type": "audio",
    "description": "Energetic singalong rhymes designed to build early vocabulary and phonics.",
    "featured": 0,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 3,
    "section": "junior",
    "category": "Short Stories",
    "title": "The Lion and the Clever Rabbit (Panchatantra)",
    "file": null,
    "author": "Vishnu Sharma Classics",
    "grade": "Grades 1 - 3",
    "read_time": "8 min read",
    "content_type": "book",
    "description": "Timeless Panchatantra fable teaching wit, wisdom and peaceful problem solving.",
    "featured": 1,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 4,
    "section": "junior",
    "category": "Short Stories",
    "title": "The Magic Mango Tree & Other Moral Tales",
    "file": null,
    "author": "Sudha Murty Collection",
    "grade": "Grades 2 - 4",
    "read_time": "10 min read",
    "content_type": "book",
    "description": "Heartwarming stories of kindness, sharing, and honesty set in Indian villages.",
    "featured": 0,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 5,
    "section": "junior",
    "category": "Flip Books",
    "title": "World of Animals: Interactive Illustrated Flip Guide",
    "file": null,
    "author": "Viraj Junior Science Hub",
    "grade": "Grades 1 - 4",
    "read_time": "12 min read",
    "content_type": "flipbook",
    "description": "Turn pages to discover fascinating wildlife habitats, animal sounds, and habits.",
    "featured": 1,
    "popular": 0,
    "at": 1791144189565
  },
  {
    "id": 6,
    "section": "junior",
    "category": "Flip Books",
    "title": "Space Explorers: The Solar System for Young Minds",
    "file": null,
    "author": "NASA & Cambridge Kids",
    "grade": "Grades 2 - 5",
    "read_time": "15 min read",
    "content_type": "flipbook",
    "description": "Take a journey across planets, glowing stars, rocket ships, and moons.",
    "featured": 1,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 7,
    "section": "junior",
    "category": "Audio",
    "title": "Bedtime Audio Fairy Tales - Hansel & Gretel",
    "file": null,
    "author": "Brothers Grimm (Audio Theatre)",
    "grade": "Grades 1 - 4",
    "read_time": "14 min audio",
    "content_type": "audio",
    "description": "Full voice-dramatized classic fairy tale with ambient sound effects.",
    "featured": 0,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 8,
    "section": "junior",
    "category": "Audio",
    "title": "The Brave Little Hummingbird",
    "file": null,
    "author": "Folk Tales of the World",
    "grade": "Grades 1 - 3",
    "read_time": "6 min audio",
    "content_type": "audio",
    "description": "Inspiring audio fable on courage and doing your part no matter how small you are.",
    "featured": 0,
    "popular": 0,
    "at": 1791144189565
  },
  {
    "id": 9,
    "section": "secondary",
    "category": "Academics",
    "title": "Foundations of Physics & Science Explorer",
    "file": null,
    "author": "NCERT & Cambridge Press",
    "grade": "Grades 6 - 8",
    "read_time": "25 min read",
    "content_type": "book",
    "description": "Clear visual explanations of forces, light, electricity, matter, and atoms.",
    "featured": 1,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 10,
    "section": "secondary",
    "category": "Academics",
    "title": "Mastering Mathematics & Logic Puzzles",
    "file": null,
    "author": "Prof. Ramanujan Academy",
    "grade": "Grades 7 - 10",
    "read_time": "20 min read",
    "content_type": "book",
    "description": "Algebraic problem solving, geometric patterns, and math Olympiad training puzzles.",
    "featured": 0,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 11,
    "section": "secondary",
    "category": "Comics",
    "title": "Amar Chitra Katha: Epic Heroes & Great Legends",
    "file": null,
    "author": "Anant Pai Classics",
    "grade": "Grades 5 - 9",
    "read_time": "18 min read",
    "content_type": "comic",
    "description": "Vibrant illustrated graphic stories depicting historic heroes and valor.",
    "featured": 1,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 12,
    "section": "secondary",
    "category": "Comics",
    "title": "Adventures of Tintin & The Secret Island",
    "file": null,
    "author": "Hergé",
    "grade": "Grades 6 - 10",
    "read_time": "22 min read",
    "content_type": "comic",
    "description": "The iconic reporter and his faithful dog Snowy uncover a global mystery.",
    "featured": 0,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 13,
    "section": "secondary",
    "category": "Novels",
    "title": "Around the World in Eighty Days",
    "file": null,
    "author": "Jules Verne",
    "grade": "Grades 6 - 12",
    "read_time": "45 min read",
    "content_type": "book",
    "description": "Phileas Fogg embarks on an unforgettable high-stakes journey across continents.",
    "featured": 1,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 14,
    "section": "secondary",
    "category": "Novels",
    "title": "The Adventures of Sherlock Holmes",
    "file": null,
    "author": "Sir Arthur Conan Doyle",
    "grade": "Grades 7 - 12",
    "read_time": "35 min read",
    "content_type": "book",
    "description": "Master detective Sherlock Holmes solves the most perplexing mysteries in Victorian London.",
    "featured": 1,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 15,
    "section": "secondary",
    "category": "Encyclopedias",
    "title": "DK Illustrated Visual Science Encyclopedia",
    "file": null,
    "author": "DK Publishing",
    "grade": "Grades 6 - 12",
    "read_time": "30 min read",
    "content_type": "encyclopedia",
    "description": "Thousands of cutting-edge diagrams covering human anatomy, space, geology, and technology.",
    "featured": 1,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 16,
    "section": "secondary",
    "category": "Audio Books",
    "title": "Treasure Island - Full Audio Dramatization",
    "file": null,
    "author": "Robert Louis Stevenson",
    "grade": "Grades 6 - 11",
    "read_time": "40 min audio",
    "content_type": "audio",
    "description": "Jim Hawkins sets sail on the Hispaniola in search of buried treasure.",
    "featured": 0,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 17,
    "section": "biography",
    "category": "Scientists",
    "title": "Wings of Fire - An Autobiography",
    "file": null,
    "author": "Dr. A.P.J. Abdul Kalam",
    "grade": "Grades 6 - 12",
    "read_time": "30 min read",
    "content_type": "biography",
    "description": "The inspiring story of a boy from Rameswaram who became India Missile Pioneer and President.",
    "featured": 1,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 18,
    "section": "biography",
    "category": "Scientists",
    "title": "Albert Einstein: A Life of Genius & Discovery",
    "file": null,
    "author": "Walter Isaacson Edition",
    "grade": "Grades 7 - 12",
    "read_time": "25 min read",
    "content_type": "biography",
    "description": "How a rebellious patent clerk transformed modern understanding of space, time, and gravity.",
    "featured": 1,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 19,
    "section": "biography",
    "category": "Inventors",
    "title": "Marie Curie: Courage, Curiosity & Radioactivity",
    "file": null,
    "author": "Science Heritage Foundation",
    "grade": "Grades 6 - 11",
    "read_time": "22 min read",
    "content_type": "biography",
    "description": "The groundbreaking journey of the first woman to win two Nobel Prizes in physics and chemistry.",
    "featured": 1,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 20,
    "section": "biography",
    "category": "Leaders",
    "title": "Swami Vivekananda: Inspiring Vision for Youth",
    "file": null,
    "author": "Ramakrishna Mission",
    "grade": "Grades 7 - 12",
    "read_time": "20 min read",
    "content_type": "biography",
    "description": "The awakening message of strength, education, and character building for young minds.",
    "featured": 0,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 21,
    "section": "biography",
    "category": "Indian Personalities",
    "title": "Srinivasa Ramanujan: The Man Who Knew Infinity",
    "file": null,
    "author": "Robert Kanigel Digest",
    "grade": "Grades 8 - 12",
    "read_time": "28 min read",
    "content_type": "biography",
    "description": "The pure mathematical genius whose formulas continue to unlock modern black hole physics.",
    "featured": 1,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 22,
    "section": "biography",
    "category": "Global Personalities",
    "title": "Mahatma Gandhi: The Story of My Experiments with Truth",
    "file": null,
    "author": "M.K. Gandhi Digest",
    "grade": "Grades 7 - 12",
    "read_time": "30 min read",
    "content_type": "biography",
    "description": "The monumental journey of non-violence, courage, and moral leadership that moved nations.",
    "featured": 0,
    "popular": 1,
    "at": 1791144189565
  },
  {
    "id": 23,
    "section": "secondary",
    "category": "Novels",
    "title": "Goosebumps #19: Deep Trouble",
    "file": "deep-trouble.html",
    "author": "R.L. Stine",
    "grade": "Grades 4 - 8",
    "read_time": "45 min read",
    "content_type": "book",
    "description": "Billy Deep and his sister Sheena visit their marine biologist uncle Dr. D on the Caribbean research boat Cassandra. A real mermaid and a twelve-tentacled sea monster lead them into a dangerous rescue mission against greedy smugglers.",
    "featured": 1,
    "popular": 1,
    "at": 1792216613859
  },
  {
    "id": 24,
    "section": "secondary",
    "category": "Novels",
    "title": "Goosebumps #22: Ghost Beach",
    "file": "ghost-beach.html",
    "author": "R.L. Stine",
    "grade": "Grades 4 - 8",
    "read_time": "45 min read",
    "content_type": "book",
    "description": "Jerry and Terri Sadler spend summer in New England with cousins Brad and Agatha. Exploring a cliffside cave and an ancient graveyard, they uncover headstones bearing the names of their new playmates—and a terrifying 350-year-old secret.",
    "featured": 1,
    "popular": 1,
    "at": 1792213013859
  },
  {
    "id": 25,
    "section": "secondary",
    "category": "Novels",
    "title": "Goosebumps #21: Go Eat Worms!",
    "file": "go-eat-worms.html",
    "author": "R.L. Stine",
    "grade": "Grades 4 - 8",
    "read_time": "45 min read",
    "content_type": "book",
    "description": "Todd Barstow is an avid worm collector preparing his school science expo project. After slicing a live worm in half, worms mysteriously invade his cap, food, and bed—until a monstrous mother worm rises from the earth seeking revenge!",
    "featured": 1,
    "popular": 1,
    "at": 1792209413859
  },
  {
    "id": 26,
    "section": "secondary",
    "category": "Novels",
    "title": "Goosebumps #18: Monster Blood II",
    "file": "monster-blood-2.html",
    "author": "R.L. Stine",
    "grade": "Grades 4 - 8",
    "read_time": "45 min read",
    "content_type": "book",
    "description": "Evan Ross thought the green Monster Blood was gone forever. But when bully Conan Barber torments him and he gets stuck on hamster duty, Andy feeds a spoonful of green slime to Cuddles the hamster—who expands into a 10-foot classroom terror!",
    "featured": 1,
    "popular": 1,
    "at": 1792205813859
  },
  {
    "id": 27,
    "section": "secondary",
    "category": "Novels",
    "title": "Goosebumps #16: One Day at HorrorLand",
    "file": "one-day-at-horrorland.html",
    "author": "R.L. Stine",
    "grade": "Grades 4 - 8",
    "read_time": "45 min read",
    "content_type": "book",
    "description": "The Morris family takes an unexpected turn to HorrorLand, a scary theme park with the Doom Slide and Coffin Cruise. But the scares are dangerously real—the park is run by actual monsters filming for The Monster Channel!",
    "featured": 1,
    "popular": 1,
    "at": 1792202213859
  },
  {
    "id": 28,
    "section": "biography",
    "category": "Comics",
    "title": "Amar chitra katha",
    "file": "https://drive.google.com/drive/folders/1LvkXH_yMJnQcPvAsqUenn45-f_pZ2Ppu?usp=drive_link",
    "author": "Amar chitra katha",
    "grade": "All Grades",
    "read_time": "10 min read",
    "content_type": "book",
    "description": "",
    "featured": 0,
    "popular": 0,
    "at": 1792980334769
  },
  {
    "id": 29,
    "section": "junior",
    "category": "Short Stories",
    "title": "Panchatantra: The Loyal Mongoose",
    "file": "book_1792985217_1_01_Panchatantra_The_Loyal_Mongoose.pdf",
    "author": "Pandit Vishnu Sharma",
    "grade": "Pre-K - Grade 5",
    "read_time": "5 min read",
    "content_type": "book",
    "description": "Complete Short Stories volume in the Viraj Digital Library collection. 1 illustrated pages available for in-site reading.",
    "featured": 0,
    "popular": 0,
    "at": 1792985217732
  },
  {
    "id": 30,
    "section": "secondary",
    "category": "Comics",
    "title": "Amar Chitra Katha: Chanakya the Mastermind",
    "file": "book_1792985217_2_Amar_Chitra_Katha_Chanakya.pdf",
    "author": "Anant Pai",
    "grade": "Grades 6 - 12",
    "read_time": "5 min read",
    "content_type": "book",
    "description": "Complete Comics volume in the Viraj Digital Library collection. 1 illustrated pages available for in-site reading.",
    "featured": 0,
    "popular": 0,
    "at": 1792985217732
  },
  {
    "id": 31,
    "section": "biography",
    "category": "Indian Personalities",
    "title": "APJ Abdul Kalam: My Journey",
    "file": "book_1792985217_3_Biography_APJ_Abdul_Kalam.pdf",
    "author": "Dr. A.P.J. Abdul Kalam",
    "grade": "Grades 5 - 12",
    "read_time": "5 min read",
    "content_type": "book",
    "description": "Complete Indian Personalities volume in the Viraj Digital Library collection. 1 illustrated pages available for in-site reading.",
    "featured": 0,
    "popular": 0,
    "at": 1792985217732
  }
];

// Global App State
let user = null;
let currentView = 'home';
let cachedItems = [...STARTER_LIBRARY_ITEMS];
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
const SECONDARY_CATS = ['All', 'Goosebumps & Horror', 'Novels', 'Comics', 'Academics', 'Encyclopedias', 'Audio Books'];
const BIO_CATS = ['All', 'Scientists', 'Inventors', 'Leaders', 'Indian Personalities', 'Global Personalities'];

// Role Check Helper
const isLibrarian = () => user && ['librarian', 'admin'].includes(user.role);

// Toast Notification Engine (Slides in Top-Right, leaves after 3 seconds)
function showToast(message, type = 'info') {
  const container = $('#toastContainer');
  if (!container) return;
  const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '✨'}</span><span class="toast-msg">${esc(message)}</span>`;
  container.appendChild(toast);

  // Leave after 3 seconds (3000ms) with slide-out animation
  setTimeout(() => {
    if (toast && toast.classList) toast.classList.add('toast-leaving');
    setTimeout(() => {
      if (toast && toast.parentNode) toast.remove();
    }, 250);
  }, 3000);
}

// Theme Management (250ms smooth transition)
function initTheme() {
  const saved = localStorage.getItem('viraj_lib_theme') || 'light';
  document.body.className = `theme-${saved}`;
  const icon = $('#themeToggleIcon');
  if (icon) icon.textContent = saved === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  // Add temporary transition class for exactly 250ms
  document.body.classList.add('theme-transitioning');
  const isDark = document.body.classList.contains('theme-dark');
  const next = isDark ? 'light' : 'dark';
  document.body.classList.remove('theme-light', 'theme-dark');
  document.body.classList.add(`theme-${next}`);
  localStorage.setItem('viraj_lib_theme', next);
  const icon = $('#themeToggleIcon');
  if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';

  setTimeout(() => {
    document.body.classList.remove('theme-transitioning');
  }, 260);
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
  if (!e.target.closest('.nav-dropdown-wrapper') && 
      !e.target.closest('.user-profile-wrapper') && 
      !e.target.closest('.global-search-box') && 
      !e.target.closest('.nav-tool-wrapper')) {
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
    if (window.lucide) window.lucide.createIcons();
    applyPageStaggerEntrance();
    init3DCardTilt();
    if (view === 'home') {
      initShelfParallax();
    }
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
  FocusTimer.init();
  init3DCardTilt();
  if (window.lucide) window.lucide.createIcons();

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
    if (guestBox) { guestBox.hidden = true; guestBox.style.display = 'none'; }
    if (userBox) { userBox.hidden = false; userBox.style.display = 'flex'; }
    if (navAvatar) navAvatar.textContent = (user.name || 'U')[0].toUpperCase();
    if (navName) navName.textContent = (user.name || 'Student').split(' ')[0];
    if (navRole) navRole.textContent = isLibrarian() ? 'Librarian 🛡️' : (user.grade || 'Scholar');
    if (dropFullname) dropFullname.textContent = user.name;
    if (dropGrade) dropGrade.textContent = `@${user.username} • ${user.grade || 'Student'}`;
    
    if (libSection) libSection.hidden = !isLibrarian();
    if (mobileAdmin) mobileAdmin.hidden = !isLibrarian();
    if (mobileLogout) mobileLogout.hidden = false;
    const navAddBtn = $('#navAdminQuickBtn');
    if (navAddBtn) navAddBtn.style.display = isLibrarian() ? 'inline-flex' : 'none';
    const moreLibSection = $('#moreLibrarianSection');
    if (moreLibSection) moreLibSection.style.display = isLibrarian() ? 'block' : 'none';
  } else {
    if (guestBox) { guestBox.hidden = false; guestBox.style.display = 'flex'; }
    if (userBox) { userBox.hidden = true; userBox.style.display = 'none'; }
    if (libSection) libSection.hidden = true;
    if (mobileAdmin) mobileAdmin.hidden = true;
    if (mobileLogout) mobileLogout.hidden = true;
    const navAddBtn = $('#navAdminQuickBtn');
    if (navAddBtn) navAddBtn.style.display = 'none';
    const moreLibSection = $('#moreLibrarianSection');
    if (moreLibSection) moreLibSection.style.display = 'none';
  }
}

// Global In-Site Digital Reader System (100% In-Site Experience)
let readingTimerInterval = null;
let readingSeconds = 0;

function updateReadingTimerDisplay() {
  const el = $('#readerTimerText');
  if (!el) return;
  const mins = Math.floor(readingSeconds / 60).toString().padStart(2, '0');
  const secs = (readingSeconds % 60).toString().padStart(2, '0');
  el.textContent = `${mins}:${secs}`;
}

function toggleReaderTheater() {
  const card = $('#readerModalCard');
  const btn = $('#theaterToggleBtn');
  if (!card) return;
  const isTheater = card.classList.toggle('is-theater-fullscreen');
  if (btn) {
    btn.innerHTML = isTheater ? '🗗' : '⛶';
    btn.title = isTheater ? 'Exit Fullscreen' : 'Fullscreen Theater View';
  }
}

function switchFolderView(folderId, mode) {
  const iframe = $('#readerIframe');
  const btnGrid = $('#btnFolderGrid');
  const btnList = $('#btnFolderList');
  if (!iframe) return;
  iframe.src = `https://drive.google.com/embeddedfolderview?id=${folderId}#${mode}`;
  if (btnGrid) btnGrid.classList.toggle('is-active', mode === 'grid');
  if (btnList) btnList.classList.toggle('is-active', mode === 'list');
}

function openPreview(title, fileUrl, metaInfo = 'Viraj Digital Library Resource', bookId = null, isRented = false) {
  const modal = $('#previewModal');
  const pTitle = $('#previewTitle');
  const pIcon = $('#previewIcon');
  const pMeta = $('#previewMeta');
  const pBody = $('#previewBody');
  const pFoot = $('#previewFootActions');
  const rentalBadge = $('#previewRentalBadge');
  if (!modal || !pBody) return;

  pTitle.textContent = title;
  pMeta.textContent = metaInfo;
  if (rentalBadge) {
    rentalBadge.style.display = isRented ? 'inline-flex' : 'none';
  }

  // Reset timer
  clearInterval(readingTimerInterval);
  readingSeconds = 0;
  readingTimerInterval = setInterval(() => {
    readingSeconds++;
    updateReadingTimerDisplay();
  }, 1000);

  // Normalize Drive URLs
  const isGoogleDrive = fileUrl.includes('drive.google.com') || fileUrl.includes('docs.google.com');
  const folderMatch = fileUrl.match(/(?:folders\/|folderview\?id=|embeddedfolderview\?id=)([a-zA-Z0-9_-]+)/);
  const isDriveFolder = isGoogleDrive && (Boolean(folderMatch) || fileUrl.includes('/folders/'));

  if (isDriveFolder) {
    pIcon.textContent = '📂';
    const folderId = folderMatch ? folderMatch[1] : '';
    const embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;

    pBody.innerHTML = `
      <div class="reader-stage-container">
        <div class="reader-drive-notice">
          <span>📂 <strong>Digital Book Collection Shelf</strong> • Browse all volumes & chapters below. Click any book to read inside this reader.</span>
          <div class="reader-view-toggles">
            <button class="btn btn-xs btn-ghost is-active" id="btnFolderGrid" onclick="switchFolderView('${folderId}', 'grid')">⊞ Grid View</button>
            <button class="btn btn-xs btn-ghost" id="btnFolderList" onclick="switchFolderView('${folderId}', 'list')">☰ List View</button>
          </div>
        </div>
        <div class="reader-frame-wrap">
          <iframe id="readerIframe" src="${embedUrl}" allow="autoplay; fullscreen" title="${esc(title)}"></iframe>
        </div>
      </div>`;

    pFoot.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span class="reader-timer-badge">⏱️ <span id="readerTimerText">00:00</span></span>
        <span class="meta-chip" style="background:var(--bg-surface);color:var(--text-muted);font-size:0.75rem;">🛡️ In-Site Reading • Stays inside Portal</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="btn btn-sm btn-ghost" onclick="toggleReaderTheater()">⛶ Fullscreen Reader</button>
        ${bookId ? `<button class="btn btn-sm btn-ghost" onclick="toggleBookmark(${bookId}, event)">🔖 Bookmark</button>` : ''}
      </div>`;
  } else if (isGoogleDrive) {
    pIcon.textContent = '📘';
    let embedUrl = fileUrl;
    const fileMatch = fileUrl.match(/(?:file\/d\/|open\?id=|uc\?id=|document\/d\/|presentation\/d\/|spreadsheets\/d\/)([a-zA-Z0-9_-]+)/);
    const fileId = fileMatch ? fileMatch[1] : '';

    if (fileUrl.includes('docs.google.com/document')) {
      embedUrl = `https://docs.google.com/document/d/${fileId}/preview`;
    } else if (fileUrl.includes('docs.google.com/presentation')) {
      embedUrl = `https://docs.google.com/presentation/d/${fileId}/embed`;
    } else if (fileUrl.includes('docs.google.com/spreadsheets')) {
      embedUrl = `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
    } else if (fileId) {
      embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    } else if (fileUrl.includes('/view')) {
      embedUrl = fileUrl.replace(/\/view(\?.*)?$/, '/preview');
    }

    pBody.innerHTML = `
      <div class="reader-stage-container">
        <div class="reader-drive-notice">
          <span>📘 <strong>Full Digital Edition</strong> • Read page-by-page directly inside this reader with zoom & page flipping.</span>
          <span style="font-size:0.75rem;opacity:0.85;">🔒 In-Site Reading Mode Active</span>
        </div>
        <div class="reader-frame-wrap">
          <iframe id="readerIframe" src="${embedUrl}" allow="autoplay; fullscreen" title="${esc(title)}"></iframe>
        </div>
      </div>`;

    pFoot.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span class="reader-timer-badge">⏱️ <span id="readerTimerText">00:00</span></span>
        <span class="meta-chip" style="background:var(--bg-surface);color:var(--text-muted);font-size:0.75rem;">🛡️ In-Site Reading Active</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="btn btn-sm btn-ghost" onclick="toggleReaderTheater()">⛶ Fullscreen Reader</button>
        ${bookId ? `<button class="btn btn-sm btn-ghost" onclick="toggleBookmark(${bookId}, event)">🔖 Bookmark</button>` : ''}
      </div>`;
  } else if (fileUrl.match(/\.(mp3|wav|ogg|m4a)$/i)) {
    pIcon.textContent = '🎧';
    pBody.innerHTML = `
      <div style="text-align:center;padding:48px 16px;">
        <div style="font-size:3.8rem;margin-bottom:12px;">🎵</div>
        <h3 style="margin-bottom:6px;">${esc(title)}</h3>
        <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:24px;">Audio Stream from School Repository</p>
        <audio controls autoplay style="width:100%;max-width:540px;" src="${fileUrl}">
          Your browser does not support audio playback.
        </audio>
      </div>`;
    pFoot.innerHTML = `
      <span class="reader-timer-badge">⏱️ <span id="readerTimerText">00:00</span></span>
      ${bookId ? `<button class="btn btn-sm btn-ghost" onclick="toggleBookmark(${bookId}, event)">🔖 Bookmark</button>` : ''}`;
  } else if (fileUrl.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) {
    pIcon.textContent = '🖼️';
    pBody.innerHTML = `
      <div style="text-align:center;padding:20px;">
        <img src="${fileUrl}" alt="${esc(title)}" style="max-width:100%;max-height:78vh;object-fit:contain;border-radius:var(--radius-md);box-shadow:var(--shadow-sm);">
      </div>`;
    pFoot.innerHTML = `
      <span class="reader-timer-badge">⏱️ <span id="readerTimerText">00:00</span></span>
      <button class="btn btn-sm btn-ghost" onclick="toggleReaderTheater()">⛶ Fullscreen</button>`;
  } else if (fileUrl.match(/\.html$/i) || fileUrl.includes('/books/')) {
    pIcon.textContent = '🎃';
    pBody.innerHTML = `
      <div class="reader-stage-container">
        <div class="reader-frame-wrap">
          <iframe id="readerIframe" src="${fileUrl}" allow="autoplay; fullscreen" style="background:var(--bg-surface);" title="${esc(title)}"></iframe>
        </div>
      </div>`;
    pFoot.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span class="reader-timer-badge">⏱️ <span id="readerTimerText">00:00</span></span>
        <span class="meta-chip" style="background:var(--bg-surface);color:var(--text-muted);font-size:0.75rem;">Interactive Novel Edition</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="btn btn-sm btn-ghost" onclick="toggleReaderTheater()">⛶ Fullscreen Reader</button>
        ${bookId ? `<button class="btn btn-sm btn-ghost" onclick="toggleBookmark(${bookId}, event)">🔖 Bookmark</button>` : ''}
      </div>`;
  } else if (fileUrl.match(/\.pdf$/i)) {
    pIcon.textContent = '📕';
    pBody.innerHTML = `
      <div class="reader-stage-container">
        <div class="reader-frame-wrap">
          <iframe id="readerIframe" src="${fileUrl}#toolbar=1&navpanes=0" allow="autoplay; fullscreen" title="${esc(title)}"></iframe>
        </div>
      </div>`;
    pFoot.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span class="reader-timer-badge">⏱️ <span id="readerTimerText">00:00</span></span>
        <span class="meta-chip" style="background:var(--bg-surface);color:var(--text-muted);font-size:0.75rem;">First-Party Academic PDF</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="btn btn-sm btn-ghost" onclick="toggleReaderTheater()">⛶ Fullscreen Reader</button>
        ${bookId ? `<button class="btn btn-sm btn-ghost" onclick="toggleBookmark(${bookId}, event)">🔖 Bookmark</button>` : ''}
      </div>`;
  } else if (fileUrl && fileUrl !== '#') {
    pIcon.textContent = '📖';
    pBody.innerHTML = `
      <div class="reader-stage-container">
        <div class="reader-frame-wrap">
          <iframe id="readerIframe" src="${fileUrl}" allow="autoplay; fullscreen" title="${esc(title)}"></iframe>
        </div>
      </div>`;
    pFoot.innerHTML = `
      <span class="reader-timer-badge">⏱️ <span id="readerTimerText">00:00</span></span>
      <button class="btn btn-sm btn-ghost" onclick="toggleReaderTheater()">⛶ Fullscreen Reader</button>`;
  } else {
    pIcon.textContent = '📖';
    pBody.innerHTML = `
      <div style="text-align:center;padding:48px 16px;">
        <div style="font-size:3.8rem;margin-bottom:12px;">📖</div>
        <h3>${esc(title)}</h3>
        <p style="color:var(--text-secondary);font-size:0.95rem;max-width:540px;margin:12px auto 24px;">
          This title is registered in the Viraj International School catalog. Physical & e-copies are available at the library desk.
        </p>
        <div style="display:flex;gap:10px;justify-content:center;">
          ${bookId ? `<button class="btn btn-gold" onclick="toggleBookmark(${bookId}, event)">🔖 Save to Reading Passport</button>` : ''}
          <button class="btn btn-ghost" onclick="closePreview()">Close</button>
        </div>
      </div>`;
    pFoot.innerHTML = '';
  }

  modal.removeAttribute('hidden');
  modal.classList.remove('is-hidden');
  modal.style.display = 'flex';
}

function closePreview() {
  const modal = $('#previewModal');
  const card = $('#readerModalCard');
  const pBody = $('#previewBody');
  const theaterBtn = $('#theaterToggleBtn');

  clearInterval(readingTimerInterval);
  if (modal) {
    modal.setAttribute('hidden', '');
    modal.classList.add('is-hidden');
    modal.style.display = 'none';
  }
  if (card) {
    card.classList.remove('is-theater-fullscreen');
  }
  if (theaterBtn) {
    theaterBtn.innerHTML = '⛶';
    theaterBtn.title = 'Toggle Fullscreen Theater View';
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
    if (e.key === 'Escape') {
      closePreview();
      closeBookDetail();
      if (typeof closeSurpriseModal === 'function') closeSurpriseModal();
      if (typeof toggleFocusPanel === 'function') toggleFocusPanel(false);
      closeDropdowns();
      const drawer = $('#mobileDrawer');
      if (drawer && !drawer.hasAttribute('hidden')) toggleMobileMenu();
    }
  });
}

// User Interaction Tracker & Reader Launcher
async function openItem(id, sec, title, file, author, isRented = false) {
  if (user) {
    try {
      await api('use', 'POST', { kind: sec, title });
    } catch (e) {
      console.warn('Log usage error:', e);
    }
  } else {
    showToast('Reading as Guest Scholar. Log in anytime to borrow books to your Reading Passport! 🔖', 'info');
  }

  if (file) {
    let targetUrl = file;
    if (!file.startsWith('http://') && !file.startsWith('https://')) {
      const isHtml = file.endsWith('.html');
      targetUrl = isHtml ? `/books/${file}` : `/uploads/${file}`;
    }
    openPreview(title, targetUrl, `${author} • ${sec.toUpperCase()} LIBRARY`, id, isRented);
  } else {
    openPreview(title, '#', `${author} • Digital Reading Hub`, id, isRented);
  }
}

// Combined Borrow & Read Action (100% Free Access)
async function handleBookAction(id, sec, title, file, author, isAlreadyRented) {
  if (user && !isAlreadyRented) {
    try {
      const rentRes = await api(`rent/${id}`, 'POST');
      if (rentRes.rented) {
        showToast(`🎉 Book borrowed! 14-day free loan active in your Reading Passport.`, 'success');
        const item = (cachedItems || []).find(b => b.id === id);
        if (item) item.isRented = true;
      }
    } catch (e) {
      console.warn('Auto-borrow notice:', e);
    }
  }
  openItem(id, sec, title, file, author, isAlreadyRented || Boolean(user));
}

// Borrow/Rent Book action alias
async function rentBook(id, sec, title, file, author) {
  return handleBookAction(id, sec, title, file, author, false);
}

async function returnRental(id, event) {
  if (event) event.stopPropagation();
  if (!user) return;
  try {
    await api(`return/${id}`, 'POST');
    showToast('Book successfully returned to library desk. Thank you, scholar! 📚', 'success');
    const item = (cachedItems || []).find(b => b.id === id);
    if (item) item.isRented = false;
    go('profile');
  } catch (err) {
    showToast(err.message, 'error');
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

// Ambient Reading Sounds & Focus Tools Nav Handlers (One Focus Mode Drawer)
function syncFocusHeaderButton() {
  const focusBtn = $('#focusModeBtn');
  const livePill = $('#focusLivePill');
  const soundPlaying = typeof AmbienceAudio !== 'undefined' && AmbienceAudio.isPlaying && AmbienceAudio.isPlaying();
  const timerRunning = typeof FocusTimer !== 'undefined' && FocusTimer.isRunning && FocusTimer.isRunning();
  const digits = $('#timerDigitsDisplay');
  const timerText = digits ? digits.textContent : '';

  if (focusBtn) {
    const panel = $('#focusSidePanel');
    const isPanelOpen = panel && !panel.hasAttribute('hidden') && panel.classList.contains('is-open');
    focusBtn.classList.toggle('is-active', Boolean(soundPlaying || timerRunning || isPanelOpen));
  }

  if (livePill) {
    if (timerRunning && soundPlaying) {
      livePill.textContent = `${timerText || 'Sprint'} • Sound`;
      livePill.removeAttribute('hidden');
    } else if (timerRunning) {
      livePill.textContent = timerText || 'Sprint';
      livePill.removeAttribute('hidden');
    } else if (soundPlaying) {
      livePill.textContent = 'Audio On';
      livePill.removeAttribute('hidden');
    } else {
      livePill.setAttribute('hidden', '');
    }
  }
}

function toggleFocusPanel(forceState) {
  const panel = $('#focusSidePanel');
  const backdrop = $('#focusPanelBackdrop');
  if (!panel) return;

  const isOpen = !panel.hasAttribute('hidden') && panel.classList.contains('is-open');
  const shouldOpen = typeof forceState === 'boolean' ? forceState : !isOpen;

  if (shouldOpen) {
    closeDropdowns();
    panel.removeAttribute('hidden');
    if (backdrop) backdrop.removeAttribute('hidden');
    requestAnimationFrame(() => {
      panel.classList.add('is-open');
      if (backdrop) backdrop.classList.add('is-open');
    });
    document.body.classList.add('focus-panel-locked');
    if (window.lucide) window.lucide.createIcons();
  } else {
    panel.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-open');
    setTimeout(() => {
      panel.setAttribute('hidden', '');
      if (backdrop) backdrop.setAttribute('hidden', '');
    }, 280);
    document.body.classList.remove('focus-panel-locked');
  }
  syncFocusHeaderButton();
}

function toggleAmbientStudio() {
  toggleFocusPanel(true);
}

function toggleFocusTimerWidget() {
  toggleFocusPanel(true);
}

// =========================================================
// CELEBRATION CHIME (PURE NATIVE WEB AUDIO SYNTHESIS)
// =========================================================
function playCelebrationChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const aCtx = new AudioContextClass();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = aCtx.createOscillator();
      const gain = aCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, aCtx.currentTime + idx * 0.09);
      gain.gain.setValueAtTime(0.18, aCtx.currentTime + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, aCtx.currentTime + idx * 0.09 + 0.38);
      osc.connect(gain);
      gain.connect(aCtx.destination);
      osc.start(aCtx.currentTime + idx * 0.09);
      osc.stop(aCtx.currentTime + idx * 0.09 + 0.42);
    });
  } catch (e) {
    console.warn(e);
  }
}

// =========================================================
// PROCEDURAL AMBIENT STUDY SOUNDS (PURE WEB AUDIO API)
// Zero external files, 100% offline, soothing synthesis
// =========================================================
const AmbienceAudio = (() => {
  let ctx = null;
  let masterGain = null;
  let currentSound = 'rain';
  let isPlaying = false;
  let activeNodes = [];
  let intervalId = null;

  function initCtx() {
    if (!ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        ctx = new AudioContextClass();
        masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.45, ctx.currentTime);
        masterGain.connect(ctx.destination);
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  function stopCurrent() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    activeNodes.forEach(n => {
      try { n.stop && n.stop(); n.disconnect && n.disconnect(); } catch (e) {}
    });
    activeNodes = [];
  }

  function createPinkNoiseBuffer(seconds = 5) {
    if (!ctx) return null;
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  function playRain() {
    const buffer = createPinkNoiseBuffer(6);
    if (!buffer) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    src.start();
    activeNodes.push(src, filter, gain);

    intervalId = setInterval(() => {
      if (!isPlaying || !ctx) return;
      try {
        const drop = ctx.createOscillator();
        const dropGain = ctx.createGain();
        drop.type = 'sine';
        const startFreq = 800 + Math.random() * 800;
        drop.frequency.setValueAtTime(startFreq, ctx.currentTime);
        drop.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
        dropGain.gain.setValueAtTime(0.08 * Math.random(), ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        drop.connect(dropGain);
        dropGain.connect(masterGain);
        drop.start();
        drop.stop(ctx.currentTime + 0.09);
      } catch (e) {}
    }, 280);
  }

  function playFire() {
    const buffer = createPinkNoiseBuffer(5);
    if (!buffer) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    src.start();
    activeNodes.push(src, filter, gain);

    intervalId = setInterval(() => {
      if (!isPlaying || !ctx) return;
      if (Math.random() > 0.4) {
        try {
          const crackle = ctx.createOscillator();
          const crackleGain = ctx.createGain();
          crackle.type = 'square';
          crackle.frequency.setValueAtTime(100 + Math.random() * 1200, ctx.currentTime);
          crackleGain.gain.setValueAtTime(0.06 + Math.random() * 0.08, ctx.currentTime);
          crackleGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
          crackle.connect(crackleGain);
          crackleGain.connect(masterGain);
          crackle.start();
          crackle.stop(ctx.currentTime + 0.04);
        } catch (e) {}
      }
    }, 120);
  }

  function playWaves() {
    const buffer = createPinkNoiseBuffer(6);
    if (!buffer) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(250, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.55, ctx.currentTime);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    src.start();
    activeNodes.push(src, filter, lfo, lfoGain, gain);
  }

  function playStudy() {
    const buffer = createPinkNoiseBuffer(6);
    if (!buffer) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);
    filter.Q.setValueAtTime(0.7, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    src.start();
    activeNodes.push(src, filter, gain);
  }

  function startSound(type) {
    initCtx();
    stopCurrent();
    currentSound = type;
    if (type === 'rain') playRain();
    else if (type === 'fire') playFire();
    else if (type === 'waves') playWaves();
    else if (type === 'study') playStudy();
    isPlaying = true;
    updateUI();
  }

  function togglePlay() {
    initCtx();
    if (isPlaying) {
      stopCurrent();
      isPlaying = false;
    } else {
      startSound(currentSound);
    }
    updateUI();
  }

  function select(type) {
    currentSound = type;
    $$('.ambient-card').forEach(c => {
      c.classList.toggle('active-ambient', c.dataset.sound === type);
    });
    if (isPlaying) {
      startSound(type);
    }
  }

  function setVolume(val) {
    initCtx();
    if (masterGain && ctx) {
      masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), ctx.currentTime);
    }
  }

  function updateUI() {
    const btn = $('#ambientSoundBtn');
    const badge = $('#ambientLiveBadge');
    const playBtn = $('#ambientPlayBtn');
    if (btn) btn.classList.toggle('is-active', isPlaying);
    if (badge) {
      badge.textContent = isPlaying ? 'LIVE 🎧' : 'OFF';
      badge.classList.toggle('is-active', isPlaying);
    }
    if (playBtn) {
      playBtn.textContent = isPlaying ? '⏸ Pause Sound' : '▶ Start Sound';
    }
    syncFocusHeaderButton();
  }

  return { select, togglePlay, setVolume, startSound, isPlaying: () => isPlaying };
})();

// =========================================================
// 20-MINUTE READING FOCUS SPRINT TIMER
// =========================================================
const FocusTimer = (() => {
  let totalSeconds = 20 * 60;
  let remainingSeconds = 20 * 60;
  let timerInterval = null;
  let isRunning = false;

  function updateDisplay() {
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    const str = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    
    const digits = $('#timerDigitsDisplay');
    const badge = $('#navTimerBadge');
    const ring = $('#timerRingProgress');
    const statusPill = $('#timerStatusPill');

    if (digits) digits.textContent = str;
    if (badge) {
      badge.textContent = str;
      badge.hidden = !isRunning && remainingSeconds === totalSeconds;
    }
    if (statusPill) {
      statusPill.textContent = isRunning ? 'SPRINTING ⏱' : (remainingSeconds === 0 ? 'DONE 🏆' : 'READY');
      statusPill.classList.toggle('is-active', isRunning);
    }
    if (ring) {
      const circumference = 301.6;
      const progress = remainingSeconds / totalSeconds;
      ring.style.strokeDashoffset = circumference * (1 - progress);
    }
    syncFocusHeaderButton();
  }

  function tick() {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      isRunning = false;
      updateDisplay();
      playCelebrationChime();
      showToast('🎉 Reading Sprint Complete! You earned +25 Reading Passport points!', 'success');
      const startBtn = $('#timerStartBtn');
      if (startBtn) startBtn.textContent = '▶ Restart Sprint';
      const btn = $('#focusTimerBtn');
      if (btn) btn.classList.remove('is-active');
    }
  }

  function toggle() {
    const startBtn = $('#timerStartBtn');
    const btn = $('#focusTimerBtn');
    if (isRunning) {
      clearInterval(timerInterval);
      timerInterval = null;
      isRunning = false;
      if (startBtn) startBtn.textContent = '▶ Resume';
      if (btn) btn.classList.remove('is-active');
    } else {
      if (remainingSeconds <= 0) remainingSeconds = totalSeconds;
      timerInterval = setInterval(tick, 1000);
      isRunning = true;
      if (startBtn) startBtn.textContent = '⏸ Pause';
      if (btn) btn.classList.add('is-active');
    }
    updateDisplay();
  }

  function reset() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    remainingSeconds = totalSeconds;
    const startBtn = $('#timerStartBtn');
    const btn = $('#focusTimerBtn');
    if (startBtn) startBtn.textContent = '▶ Start Sprint';
    if (btn) btn.classList.remove('is-active');
    updateDisplay();
  }

  function setDuration(minutes) {
    totalSeconds = parseInt(minutes, 10) * 60;
    reset();
  }

  return { toggle, reset, setDuration, init: updateDisplay, isRunning: () => isRunning };
})();

// =========================================================
// 🌟 DAILY BOOK WISDOM & LITERARY TRIVIA WIDGET
// =========================================================
const DAILY_WISDOM_QUOTES = [
  {
    quote: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    author: "Dr. Seuss",
    tag: "Reading Inspiration"
  },
  {
    quote: "A reader lives a thousand lives before he dies. The man who never reads lives only one.",
    author: "George R.R. Martin",
    tag: "Power of Literature"
  },
  {
    quote: "There is more treasure in books than in all the pirate's loot on Treasure Island.",
    author: "Walt Disney",
    tag: "Lifelong Treasure"
  },
  {
    quote: "Books are a uniquely portable magic.",
    author: "Stephen King",
    tag: "Magic of Words"
  },
  {
    quote: "Did you know? R.L. Stine wrote all Goosebumps books in just 8 to 10 days each, typing out over 400 million sold copies worldwide!",
    author: "Goosebumps Trivia Desk",
    tag: "Campus Fact of the Day"
  },
  {
    quote: "If you don't like to read, you haven't found the right book yet.",
    author: "J.K. Rowling",
    tag: "Discover Your Genre"
  }
];

let currentWisdomIndex = Math.floor(Math.random() * DAILY_WISDOM_QUOTES.length);

function shuffleWisdomQuote() {
  currentWisdomIndex = (currentWisdomIndex + 1) % DAILY_WISDOM_QUOTES.length;
  const card = $('#dailyWisdomCard');
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(4px)';
    setTimeout(() => {
      const item = DAILY_WISDOM_QUOTES[currentWisdomIndex];
      const tagEl = $('#wisdomTag');
      const quoteEl = $('#wisdomQuote');
      const authEl = $('#wisdomAuthor');
      if (tagEl) tagEl.textContent = item.tag;
      if (quoteEl) quoteEl.textContent = `“${item.quote}”`;
      if (authEl) authEl.textContent = `— ${item.author}`;
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 200);
  }
}

function renderDailyWisdomWidget() {
  const item = DAILY_WISDOM_QUOTES[currentWisdomIndex];
  return `
    <section class="daily-wisdom-section">
      <div class="daily-wisdom-card" id="dailyWisdomCard">
        <div class="wisdom-content">
          <div class="wisdom-icon-circle">📜</div>
          <div>
            <div class="wisdom-tag" id="wisdomTag">${esc(item.tag)}</div>
            <div class="wisdom-quote" id="wisdomQuote">“${esc(item.quote)}”</div>
            <div class="wisdom-author" id="wisdomAuthor">— ${esc(item.author)}</div>
          </div>
        </div>
        <div class="wisdom-action-btn">
          <button class="btn btn-sm btn-ghost" onclick="shuffleWisdomQuote()" title="Load another inspiring wisdom quote">
            🎲 Another Quote
          </button>
        </div>
      </div>
    </section>`;
}

// =========================================================
// 🎲 MYSTERY BOOK DISCOVERER / SURPRISE ME
// =========================================================
async function openRandomBook() {
  const modal = $('#surpriseModal');
  const body = $('#surpriseModalBody');
  if (!modal || !body) return;

  modal.removeAttribute('hidden');
  modal.style.display = 'flex';

  const items = cachedItems.length ? cachedItems : await api('items');
  if (!items || !items.length) {
    showToast('Catalog is loading, please try again.', 'info');
    return;
  }

  const winner = items[Math.floor(Math.random() * items.length)];
  const isGoosebumps = Boolean(winner.title && (winner.title.includes('Goosebumps') || (winner.author && winner.author.includes('Stine'))));
  const customCover = BOOK_COVERS[winner.title] || (isGoosebumps ? (
    winner.title.includes('Deep Trouble') ? '/covers/deep-trouble.jpg' :
    winner.title.includes('Ghost Beach') ? '/covers/ghost-beach.jpg' :
    winner.title.includes('Go Eat Worms') ? '/covers/go-eat-worms.jpg' :
    winner.title.includes('Monster Blood') ? '/covers/monster-blood-2.jpg' :
    winner.title.includes('HorrorLand') ? '/covers/one-day-at-horrorland.jpg' : null
  ) : null);

  body.innerHTML = `
    <div class="surprise-reel-container">
      <div style="font-size:2.8rem;margin-bottom:12px;animation:spin 0.6s infinite linear;">🎲</div>
      <h3 style="font-size:1.3rem;margin-bottom:6px;">Consulting Library Oracles...</h3>
      <p style="color:var(--text-muted);font-size:0.85rem;">Selecting a captivating title from the school catalog...</p>
    </div>`;

  setTimeout(() => {
    playCelebrationChime();
    body.innerHTML = `
      <div class="surprise-reel-container surprise-winner-reveal">
        <div style="font-size:1.6rem;margin-bottom:8px;">✨ It's a Match! ✨</div>
        ${customCover ? `
          <img src="${customCover}" alt="${esc(winner.title)}" class="surprise-cover-spotlight">
        ` : `
          <div class="surprise-cover-spotlight" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg, var(--navy-primary), var(--blue-accent));color:#fff;font-size:2.8rem;">
            ${winner.section === 'junior' ? '🧸' : (winner.category === 'Comics' ? '🎨' : '📖')}
          </div>
        `}
        <h3 class="surprise-book-title">${esc(winner.title)}</h3>
        <div class="surprise-book-author">By ${esc(winner.author || 'Viraj Heritage Press')}</div>
        <div style="display:flex;gap:6px;justify-content:center;margin-bottom:14px;">
          <span class="meta-chip">📚 ${esc(winner.category || 'General')}</span>
          <span class="meta-chip">🎓 ${esc(winner.grade || 'All Grades')}</span>
          <span class="meta-chip">⏱ ${esc(winner.read_time || '15 min')}</span>
        </div>
        <p class="surprise-book-blurb">${esc(winner.description || 'A brilliant literary and educational work available in the Viraj International School Digital Hub.')}</p>
        <div class="surprise-modal-actions">
          <button class="btn btn-gold btn-lg" onclick="closeSurpriseModal(); openItem(${winner.id}, '${winner.section}', '${esc(winner.title).replace(/'/g, "\\'")}', '${esc(winner.file || '')}', '${esc(winner.author || '').replace(/'/g, "\\'")}')">
            📖 Start Reading Now
          </button>
          <button class="btn btn-ghost" onclick="openRandomBook()">
            🎲 Spin Again
          </button>
          <button class="btn btn-ghost" onclick="closeSurpriseModal()">
            Close
          </button>
        </div>
      </div>`;
  }, 650);
}

function closeSurpriseModal() {
  const modal = $('#surpriseModal');
  if (modal) {
    modal.setAttribute('hidden', '');
    modal.style.display = 'none';
  }
}

// =========================================================
// ⚡ BOOK DETAIL / SYNOPSIS MODAL & SIMILAR BOOKS ROW
// =========================================================
async function openBookDetail(id, event) {
  if (event) event.stopPropagation();
  const modal = $('#quickPeekModal');
  const body = $('#peekModalBody');
  const titleEl = $('#peekTitle');
  const metaEl = $('#peekMeta');
  if (!modal || !body) return;

  const items = (cachedItems && cachedItems.length) ? cachedItems : await api('items');
  cachedItems = items;
  const book = items.find(b => Number(b.id) === Number(id));
  if (!book) {
    showToast('Book details not found.', 'error');
    return;
  }

  const isSaved = book.isBookmarked || false;
  const isRented = book.isRented || false;
  const wingLabel = book.section === 'junior' ? 'Junior Wing (Pre-K - 5)' : (book.section === 'biography' ? 'Biographies & Hall of Fame' : 'Secondary Academic Wing');
  const wingShort = book.section === 'junior' ? 'JUNIOR' : (book.section === 'biography' ? 'BIOGRAPHY' : 'SECONDARY');

  const isGoosebumps = Boolean(book.title && (book.title.includes('Goosebumps') || (book.author && book.author.includes('Stine'))));
  const customCover = BOOK_COVERS[book.title] || (isGoosebumps ? (
    book.title.includes('Deep Trouble') ? '/covers/deep-trouble.jpg' :
    book.title.includes('Ghost Beach') ? '/covers/ghost-beach.jpg' :
    book.title.includes('Go Eat Worms') ? '/covers/go-eat-worms.jpg' :
    book.title.includes('Monster Blood') ? '/covers/monster-blood-2.jpg' :
    book.title.includes('HorrorLand') ? '/covers/one-day-at-horrorland.jpg' : null
  ) : null);

  // Similar books from same section or category (excluding current book)
  const similarBooks = items.filter(b => b.id !== book.id && (b.category === book.category || b.section === book.section)).slice(0, 4);

  if (titleEl) titleEl.textContent = book.title;
  if (metaEl) metaEl.textContent = `${wingLabel} • By ${book.author || 'Viraj Heritage Press'}`;

  body.innerHTML = `
    <div class="book-detail-grid">
      <!-- Left: 3D Book Stage (Perspective 1000px, 26px Spine, Mouse Tilt & Touch Drag) -->
      <div class="detail-cover-col">
        <div class="book-3d-stage" id="detail3DStage" aria-label="Interactive 3D Book Display">
          <div class="book-3d-object" id="detail3DObject">
            <!-- Front Face: Cover Image or Archival Placeholder -->
            <div class="book-3d-face book-3d-front">
              ${customCover ? `
                <picture>
                  <source srcset="${esc(customCover.replace('.jpg', '.webp'))}" type="image/webp">
                  <img src="${esc(customCover)}" alt="${esc(book.title)} book cover" loading="lazy" decoding="async" width="240" height="360" class="detail-cover-img" />
                </picture>
              ` : `
                <div class="book-placeholder-cover placeholder-theme-${book.section || 'secondary'} detail-placeholder">
                  <div class="placeholder-spine-groove"></div>
                  <div class="placeholder-frame">
                    <div class="placeholder-top-row">
                      <span class="placeholder-wing-tag">${wingShort}</span>
                      <span class="placeholder-crest-icon"><i data-lucide="book-marked" aria-hidden="true"></i></span>
                    </div>
                    <div class="placeholder-title-block">
                      <h4 class="placeholder-title">${esc(book.title)}</h4>
                    </div>
                    <div class="placeholder-bottom-row">
                      <span class="placeholder-author">${esc(book.author || 'Viraj Heritage Press')}</span>
                      <span class="placeholder-category-tag">${esc(book.category || 'General')}</span>
                    </div>
                  </div>
                </div>
              `}
            </div>

            <!-- Authentic 3D Book Spine (26px) -->
            <div class="book-3d-face book-3d-spine placeholder-theme-${book.section || 'secondary'}">
              <div class="spine-gold-emboss">
                <span class="spine-crest-star">✦</span>
                <span class="spine-title-vertical">${esc(book.title)}</span>
                <span class="spine-imprint">VIRAJ</span>
              </div>
            </div>

            <!-- Realistic Page Edges (Paper Texture Lines) -->
            <div class="book-3d-face book-3d-pages-right"></div>
            <div class="book-3d-face book-3d-pages-top"></div>
            <div class="book-3d-face book-3d-pages-bottom"></div>

            <!-- Back Cover with Crest Seal & Barcode -->
            <div class="book-3d-face book-3d-back placeholder-theme-${book.section || 'secondary'}">
              <div class="back-cover-crease">
                <div class="back-crest-seal">
                  <img src="logo.png" alt="" class="back-seal-img" aria-hidden="true">
                  <div class="back-seal-title">VIRAJ INTERNATIONAL SCHOOL</div>
                  <div class="back-seal-sub">CBSE Kurgaon • Digital Knowledge Hub</div>
                </div>
                <div class="back-barcode-sim">
                  <span class="barcode-lines">||||| | |||| || ||| | |||||</span>
                  <span class="barcode-num">ISBN VIS-LIB-${book.id || '2026'}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Dynamic Cast Soft Shadow -->
          <div class="book-3d-floor-shadow" id="detail3DShadow"></div>

          <!-- Interactive 3D Indicator Hint -->
          <div class="book-3d-hint-tag">
            <i data-lucide="box" aria-hidden="true"></i>
            <span>3D Book • Move mouse / drag to rotate</span>
          </div>

          <div class="detail-avail-pill ${isRented ? 'is-rented' : 'is-free'}">
            <i data-lucide="${isRented ? 'check-circle-2' : 'sparkles'}" aria-hidden="true"></i>
            <span>${isRented ? 'Borrowed (14-Day School Loan)' : 'Available Free • Digital Library'}</span>
          </div>
        </div>
      </div>

      <!-- Right: Book Details & Actions -->
      <div class="detail-info-col">
        <div class="detail-chips-row">
          <span class="meta-chip"><i data-lucide="bookmark" aria-hidden="true"></i> ${esc(book.category || 'General')}</span>
          <span class="meta-chip"><i data-lucide="graduation-cap" aria-hidden="true"></i> ${esc(book.grade || 'All Grades')}</span>
          <span class="meta-chip"><i data-lucide="clock" aria-hidden="true"></i> ${esc(book.read_time || '10 min read')}</span>
        </div>

        <h2 class="detail-book-title">${esc(book.title)}</h2>
        <div class="detail-book-author">By <strong>${esc(book.author || 'Viraj Heritage Press')}</strong> • ${wingLabel}</div>

        <div class="detail-summary-box">
          <h4 class="detail-section-heading">Synopsis & Reader Overview</h4>
          <p class="detail-summary-text">
            ${esc(book.description || 'Complete curated reading edition registered in the school digital knowledge hub. Accessible anywhere 24/7 on desktop and tablet.')}
          </p>
        </div>

        <div class="detail-specs-box">
          <i data-lucide="monitor" aria-hidden="true"></i>
          <span><strong>Reader Specs:</strong> In-site digital viewer with font resizing, 4 themes (Sepia, Light, Dark, Slime), and full-screen theater mode.</span>
        </div>

        <!-- Action Buttons (Save & Read) -->
        <div class="detail-actions-row">
          <button type="button" class="btn btn-gold btn-lg detail-action-btn" onclick="closeBookDetail(); handleBookAction(${book.id}, '${book.section}', '${esc(book.title).replace(/'/g, "\\'")}', '${esc(book.file || '')}', '${esc(book.author || '').replace(/'/g, "\\'")}', ${Boolean(isRented)})">
            <i data-lucide="book-open" aria-hidden="true"></i>
            <span>${isRented ? 'Read Book (Borrowed)' : 'Borrow & Read Free'}</span>
          </button>
          <button type="button" class="btn btn-outline btn-lg detail-action-btn bm-btn-${book.id} ${isSaved ? 'is-saved' : ''}" onclick="toggleBookmark(${book.id}, event)">
            <i data-lucide="bookmark" aria-hidden="true"></i>
            <span>${isSaved ? 'Saved to Passport' : 'Save to Passport'}</span>
          </button>
          <button type="button" class="btn btn-ghost btn-lg detail-action-btn" onclick="closeBookDetail()">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Similar Books Row -->
    ${similarBooks.length ? `
      <div class="detail-similar-section">
        <h4 class="detail-similar-heading">
          <i data-lucide="sparkles" aria-hidden="true"></i> Similar Books in ${esc(book.category || wingLabel)}
        </h4>
        <div class="similar-books-grid">
          ${similarBooks.map(sim => `
            <div class="similar-book-card" onclick="openBookDetail(${sim.id})">
              <div class="similar-mini-cover">
                ${BOOK_COVERS[sim.title] ? `
                  <img src="${esc(BOOK_COVERS[sim.title])}" alt="${esc(sim.title)}" loading="lazy" width="60" height="90" class="similar-img" />
                ` : `
                  <div class="similar-placeholder placeholder-theme-${sim.section || 'secondary'}">
                    <span>${esc(sim.title).slice(0, 18)}...</span>
                  </div>
                `}
              </div>
              <div class="similar-info">
                <strong class="similar-title" title="${esc(sim.title)}">${esc(sim.title)}</strong>
                <small class="similar-author">${esc(sim.author || 'Viraj Press')}</small>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;

  modal.removeAttribute('hidden');
  modal.style.display = 'flex';
  if (window.lucide) window.lucide.createIcons();
  initBookDetail3D();
}

function closeBookDetail() {
  const modal = $('#quickPeekModal');
  if (modal) {
    modal.setAttribute('hidden', '');
    modal.style.display = 'none';
  }
}
const openQuickPeek = openBookDetail;
const closeQuickPeek = closeBookDetail;

// =========================================================
// 🌟 3D INTERACTIVE BOOK DETAIL (LAPTOP MOUSE / TABLET DRAG)
// =========================================================
function initBookDetail3D() {
  const stage = $('#detail3DStage');
  const bookObj = $('#detail3DObject');
  const shadow = $('#detail3DShadow');
  if (!stage || !bookObj) return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    bookObj.style.transform = 'rotateY(-10deg) rotateX(4deg)';
    return;
  }

  const defaultRotY = -12;
  const defaultRotX = 4;
  let curRotY = defaultRotY;
  let curRotX = defaultRotX;

  // Set resting 3D angle showing spine
  bookObj.style.transform = `rotateY(${defaultRotY}deg) rotateX(${defaultRotX}deg)`;

  // Laptop / Desktop mouse tilt
  const canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (canHover) {
    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const xNorm = (e.clientX - rect.left) / rect.width - 0.5;
      const yNorm = (e.clientY - rect.top) / rect.height - 0.5;

      curRotY = defaultRotY + (xNorm * 28);
      curRotX = defaultRotX - (yNorm * 18);

      bookObj.style.transition = 'transform 0.08s ease-out';
      bookObj.style.transform = `rotateY(${curRotY.toFixed(1)}deg) rotateX(${curRotX.toFixed(1)}deg)`;

      if (shadow) {
        shadow.style.transition = 'transform 0.08s ease-out';
        shadow.style.transform = `translateX(${(-curRotY * 1.2).toFixed(1)}px) scale(${1 - Math.abs(curRotY) * 0.005})`;
      }
    });

    stage.addEventListener('mouseleave', () => {
      bookObj.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      bookObj.style.transform = `rotateY(${defaultRotY}deg) rotateX(${defaultRotX}deg)`;
      if (shadow) {
        shadow.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        shadow.style.transform = `translateX(0px) scale(1)`;
      }
    });
  }

  // Tablet touch drag support
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartRotY = curRotY;
  let touchStartRotX = curRotX;
  let isDragging = false;

  stage.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartRotY = curRotY;
      touchStartRotX = curRotX;
      bookObj.style.transition = 'none';
      if (shadow) shadow.style.transition = 'none';
    }
  }, { passive: true });

  stage.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - touchStartX;
    const deltaY = e.touches[0].clientY - touchStartY;

    curRotY = Math.max(-45, Math.min(25, touchStartRotY + deltaX * 0.35));
    curRotX = Math.max(-18, Math.min(18, touchStartRotX - deltaY * 0.35));

    bookObj.style.transform = `rotateY(${curRotY.toFixed(1)}deg) rotateX(${curRotX.toFixed(1)}deg)`;
    if (shadow) {
      shadow.style.transform = `translateX(${(-curRotY * 1.2).toFixed(1)}px) scale(${1 - Math.abs(curRotY) * 0.005})`;
    }
  }, { passive: true });

  stage.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    bookObj.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    bookObj.style.transform = `rotateY(${defaultRotY}deg) rotateX(${defaultRotX}deg)`;
    if (shadow) {
      shadow.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      shadow.style.transform = `translateX(0px) scale(1)`;
    }
    curRotY = defaultRotY;
    curRotX = defaultRotX;
  });
}

// =========================================================
// 📚 3D BOOK CARDS TILT (LAPTOP) & SCALE-UP (TABLET)
// =========================================================
let cardTiltInitialized = false;
function init3DCardTilt() {
  if (cardTiltInitialized) return;
  cardTiltInitialized = true;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Laptops / Desktops with pointer and hover
  const canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!canHover) {
    // Tablet: scale-up on tap handled via CSS (.book-card.overlay-active)
    return;
  }

  let activeCard = null;
  let ticking = false;

  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.book-card');
    if (!card) {
      if (activeCard) {
        resetCardTilt(activeCard);
        activeCard = null;
      }
      return;
    }

    if (activeCard && activeCard !== card) {
      resetCardTilt(activeCard);
    }
    activeCard = card;

    if (!ticking) {
      requestAnimationFrame(() => {
        if (!activeCard) { ticking = false; return; }
        const rect = activeCard.getBoundingClientRect();
        // Normalized cursor coordinates (-0.5 to 0.5)
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        // Gentle tilt max 8 degrees
        const rotY = Math.max(-8, Math.min(8, x * 16));
        const rotX = Math.max(-8, Math.min(8, -y * 16));

        // Moving soft shadow
        const shadowX = -rotY * 1.5;
        const shadowY = rotX * 1.5 + 14;
        const shadowBlur = 24;

        activeCard.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-5px)`;
        activeCard.style.boxShadow = `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${shadowBlur}px rgba(15, 23, 42, 0.18)`;
        ticking = false;
      });
      ticking = true;
    }
  });

  document.addEventListener('mouseleave', () => {
    if (activeCard) {
      resetCardTilt(activeCard);
      activeCard = null;
    }
  });
}

function resetCardTilt(card) {
  if (!card) return;
  card.style.transition = 'transform 0.28s ease-out, box-shadow 0.28s ease-out';
  card.style.transform = '';
  card.style.boxShadow = '';
  setTimeout(() => {
    if (card) card.style.transition = '';
  }, 280);
}

// Authentic Book Cover Artwork Registry
const BOOK_COVERS = {
  'Goosebumps #19: Deep Trouble': '/covers/deep-trouble.jpg',
  'Goosebumps #22: Ghost Beach': '/covers/ghost-beach.jpg',
  'Goosebumps #21: Go Eat Worms!': '/covers/go-eat-worms.jpg',
  'Goosebumps #18: Monster Blood II': '/covers/monster-blood-2.jpg',
  'Goosebumps #16: One Day at HorrorLand': '/covers/one-day-at-horrorland.jpg'
};

// Touch overlay toggle for tablets
function toggleCardOverlay(cardEl, event) {
  if (!cardEl) return;
  if (event && (event.target.closest('button') || event.target.closest('a'))) return;
  const wasActive = cardEl.classList.contains('overlay-active');
  document.querySelectorAll('.book-card.overlay-active').forEach(c => c.classList.remove('overlay-active'));
  if (!wasActive) {
    cardEl.classList.add('overlay-active');
  }
}

window.addEventListener('click', e => {
  if (!e.target.closest('.book-card')) {
    document.querySelectorAll('.book-card.overlay-active').forEach(c => c.classList.remove('overlay-active'));
  }
});

// Shimmering Skeleton Loader Generator
function renderBookSkeleton(count = 4) {
  let skeletons = '';
  for (let i = 0; i < count; i++) {
    skeletons += `
      <div class="book-card book-card-skeleton" aria-hidden="true">
        <div class="book-cover-container skeleton-shimmer">
          <div class="skeleton-icon-placeholder"></div>
        </div>
        <div class="book-card-info skeleton-info">
          <div class="skeleton-line skeleton-shimmer" style="width:40%;height:10px;margin-bottom:8px;"></div>
          <div class="skeleton-line skeleton-shimmer" style="width:85%;height:14px;margin-bottom:8px;"></div>
          <div class="skeleton-line skeleton-shimmer" style="width:60%;height:11px;"></div>
        </div>
      </div>
    `;
  }
  return skeletons;
}

// Uniform 2:3 Aspect Ratio Book Card Renderer with Archival Placeholders & Hover/Tap Overlay
function renderBookCard(book) {
  const isSaved = book.isBookmarked || false;
  const isRented = book.isRented || false;
  const wingLabel = book.section === 'junior' ? 'Junior Wing' : (book.section === 'biography' ? 'Biographies' : 'Secondary Wing');
  const wingShort = book.section === 'junior' ? 'JUNIOR' : (book.section === 'biography' ? 'BIOGRAPHY' : 'SECONDARY');

  const isGoosebumps = Boolean(book.title && (book.title.includes('Goosebumps') || (book.author && book.author.includes('Stine'))));
  const customCover = BOOK_COVERS[book.title] || (isGoosebumps ? (
    book.title.includes('Deep Trouble') ? '/covers/deep-trouble.jpg' :
    book.title.includes('Ghost Beach') ? '/covers/ghost-beach.jpg' :
    book.title.includes('Go Eat Worms') ? '/covers/go-eat-worms.jpg' :
    book.title.includes('Monster Blood') ? '/covers/monster-blood-2.jpg' :
    book.title.includes('HorrorLand') ? '/covers/one-day-at-horrorland.jpg' : null
  ) : null);

  const placeholderTheme = `placeholder-theme-${book.section || 'secondary'}`;

  return `
    <div class="book-card ${isGoosebumps ? 'book-card-goosebumps' : ''}" data-id="${book.id}" role="button" tabindex="0" aria-label="${esc(book.title)} by ${esc(book.author || 'Viraj Heritage Press')}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleCardOverlay(this, event);}" onclick="toggleCardOverlay(this, event)">
      <!-- 2:3 Aspect Ratio Book Cover Container -->
      <div class="book-cover-container">
        ${customCover ? `
          <picture>
            <source srcset="${esc(customCover.replace('.jpg', '.webp'))}" type="image/webp">
            <img src="${esc(customCover)}" alt="${esc(book.title)} book cover" loading="lazy" decoding="async" width="200" height="300" class="book-cover-img" />
          </picture>
        ` : `
          <div class="book-placeholder-cover ${placeholderTheme}">
            <div class="placeholder-spine-groove"></div>
            <div class="placeholder-frame">
              <div class="placeholder-top-row">
                <span class="placeholder-wing-tag">${wingShort}</span>
                <span class="placeholder-crest-icon"><i data-lucide="book-marked" aria-hidden="true"></i></span>
              </div>
              <div class="placeholder-title-block">
                <h4 class="placeholder-title">${esc(book.title)}</h4>
              </div>
              <div class="placeholder-bottom-row">
                <span class="placeholder-author">${esc(book.author || 'Viraj Heritage Press')}</span>
                <span class="placeholder-category-tag">${esc(book.category || 'General')}</span>
              </div>
            </div>
          </div>
        `}

        <!-- Availability Badge on Card -->
        <div class="book-avail-badge ${isRented ? 'avail-borrowed' : 'avail-free'}">
          <i data-lucide="${isRented ? 'check-circle-2' : 'sparkles'}" aria-hidden="true"></i>
          <span>${isRented ? 'Borrowed' : 'Available Free'}</span>
        </div>

        <!-- Hover (Laptop) & Tap (Tablet) Interactive Overlay -->
        <div class="book-card-overlay">
          <div class="overlay-summary-wrap">
            <span class="overlay-summary-label">Synopsis</span>
            <p class="overlay-summary-text">${esc(book.description || 'Complete digital reading edition registered in the school library.')}</p>
          </div>

          <div class="overlay-actions-row">
            <button type="button" class="btn btn-sm btn-gold overlay-action-btn overlay-read-btn" 
              onclick="handleBookAction(${book.id}, '${book.section}', '${esc(book.title).replace(/'/g, "\\'")}', '${esc(book.file || '')}', '${esc(book.author || '').replace(/'/g, "\\'")}', ${Boolean(isRented)})" 
              title="Read book">
              <i data-lucide="book-open" aria-hidden="true"></i> <span>Read</span>
            </button>
            <button type="button" class="btn btn-sm btn-outline overlay-action-btn overlay-save-btn bm-btn-${book.id} ${isSaved ? 'is-saved' : ''}" 
              onclick="toggleBookmark(${book.id}, event)" 
              title="${isSaved ? 'Remove from Saved' : 'Save to Passport'}">
              <i data-lucide="bookmark" aria-hidden="true"></i> <span>${isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button type="button" class="btn btn-sm btn-ghost overlay-action-btn overlay-info-btn" 
              onclick="openBookDetail(${book.id}, event)" 
              title="View full synopsis & details">
              <i data-lucide="info" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Card Information Section -->
      <div class="book-card-info" onclick="openBookDetail(${book.id}, event)">
        <div class="book-info-meta-row">
          <span class="book-wing-tag">${wingLabel}</span>
          <span class="book-grade-chip">${esc(book.grade || 'All Grades')}</span>
        </div>
        <h3 class="book-card-title" title="${esc(book.title)}">${esc(book.title)}</h3>
        <div class="book-card-author">By ${esc(book.author || 'Viraj Heritage Press')}</div>
      </div>
    </div>
  `;
}

// =========================================================
// HERO SECTION INTERACTIVE SEARCH & FILTER CONTROLLER
// =========================================================
function handleHeroSearch(query) {
  const q = (query || '').trim().toLowerCase();
  const clearBtn = $('#heroSearchClearBtn');
  if (clearBtn) clearBtn.hidden = !q;
  renderHeroFilteredResults();
}

function handleHeroFilterChange() {
  renderHeroFilteredResults();
}

function resetHeroFilters() {
  const input = $('#heroSearchInput');
  const wing = $('#heroFilterWing');
  const genre = $('#heroFilterGenre');
  const author = $('#heroFilterAuthor');
  const clearBtn = $('#heroSearchClearBtn');
  if (input) input.value = '';
  if (wing) wing.value = 'All';
  if (genre) genre.value = 'All';
  if (author) author.value = 'All';
  if (clearBtn) clearBtn.hidden = true;
  
  const dropdown = $('#heroSearchResultsDropdown');
  if (dropdown) {
    dropdown.setAttribute('hidden', '');
    dropdown.innerHTML = '';
  }
}

function clearHeroSearch() {
  const input = $('#heroSearchInput');
  const clearBtn = $('#heroSearchClearBtn');
  if (input) {
    input.value = '';
    input.focus();
  }
  if (clearBtn) clearBtn.hidden = true;
  renderHeroFilteredResults();
}

function renderHeroFilteredResults() {
  const dropdown = $('#heroSearchResultsDropdown');
  if (!dropdown) return;

  const input = $('#heroSearchInput');
  const wingSelect = $('#heroFilterWing');
  const genreSelect = $('#heroFilterGenre');
  const authorSelect = $('#heroFilterAuthor');

  const q = input ? (input.value || '').trim().toLowerCase() : '';
  const wing = wingSelect ? wingSelect.value : 'All';
  const genre = genreSelect ? genreSelect.value : 'All';
  const author = authorSelect ? authorSelect.value : 'All';

  const isFiltering = q.length >= 2 || wing !== 'All' || genre !== 'All' || author !== 'All';

  if (!isFiltering) {
    dropdown.setAttribute('hidden', '');
    dropdown.innerHTML = '';
    return;
  }

  const items = cachedItems && cachedItems.length ? cachedItems : [];
  const filtered = items.filter(b => {
    if (wing !== 'All' && b.section !== wing) return false;
    if (genre !== 'All' && b.category !== genre) return false;
    if (author !== 'All' && b.author !== author) return false;
    if (q) {
      const matchTitle = (b.title || '').toLowerCase().includes(q);
      const matchAuthor = (b.author || '').toLowerCase().includes(q);
      const matchCat = (b.category || '').toLowerCase().includes(q);
      const matchDesc = (b.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchCat && !matchDesc) return false;
    }
    return true;
  });

  if (!filtered.length) {
    dropdown.innerHTML = `
      <div class="hero-search-empty">
        <span style="font-size:1.5rem;margin-bottom:6px;display:block;"><i data-lucide="search-x" aria-hidden="true"></i></span>
        <strong style="color:var(--text-main);display:block;margin-bottom:4px;">No matching books found</strong>
        <span style="color:var(--text-muted);font-size:0.85rem;">Try adjusting your search terms or resetting the Wing/Genre filters.</span>
      </div>`;
  } else {
    dropdown.innerHTML = `
      <div class="hero-search-results-header">
        <strong>${filtered.length} MATCHING BOOK${filtered.length === 1 ? '' : 'S'} FOUND</strong>
        <button type="button" class="hero-search-close-link" onclick="$('#heroSearchResultsDropdown').setAttribute('hidden', '');" aria-label="Close search preview">✕ Close</button>
      </div>
      <div class="hero-search-results-list">
        ${filtered.slice(0, 8).map(b => {
          const wingLabel = b.section === 'junior' ? 'Junior Wing' : (b.section === 'biography' ? 'Biographies' : 'Secondary Wing');
          return `
            <div class="hero-search-result-item" onclick="openItem(${b.id}, '${b.section}', '${esc(b.title).replace(/'/g, "\\'")}', '${esc(b.file || '')}', '${esc(b.author || '').replace(/'/g, "\\'")}'); $('#heroSearchResultsDropdown').setAttribute('hidden', '');">
              <div class="hero-result-thumb">
                <i data-lucide="book-open" aria-hidden="true"></i>
              </div>
              <div class="hero-result-details">
                <div class="hero-result-title">${esc(b.title)}</div>
                <div class="hero-result-meta">
                  <span class="hero-result-author">${esc(b.author || 'Viraj Library')}</span>
                  <span class="hero-result-sep">•</span>
                  <span class="hero-result-cat">${esc(b.category || 'General')}</span>
                  <span class="hero-result-badge">${wingLabel}</span>
                </div>
              </div>
              <button type="button" class="btn btn-sm btn-gold hero-result-action-btn" aria-label="Read ${esc(b.title)}">
                Read
              </button>
            </div>
          `;
        }).join('')}
      </div>
      ${filtered.length > 8 ? `
        <div class="hero-search-more-row">
          <button type="button" class="btn btn-ghost btn-sm" onclick="executeHeroSearch()">
            View all ${filtered.length} matching books in library catalog →
          </button>
        </div>
      ` : ''}
    `;
  }

  dropdown.removeAttribute('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function executeHeroSearch() {
  const input = $('#heroSearchInput');
  const wingSelect = $('#heroFilterWing');
  const genreSelect = $('#heroFilterGenre');

  const q = input ? (input.value || '').trim() : '';
  const wing = wingSelect ? wingSelect.value : 'All';
  const genre = genreSelect ? genreSelect.value : 'All';

  catalogState.search = q;
  catalogState.section = wing !== 'All' ? wing : 'all';
  catalogState.category = genre !== 'All' ? genre : 'All';
  catalogState.page = 1;

  const targetWing = wing !== 'All' ? wing : 'secondary';
  go(targetWing);
}

function applyHeroTag(tag, wing) {
  catalogState.search = tag;
  catalogState.section = wing || 'all';
  catalogState.page = 1;
  go(wing || 'secondary');
}

// =========================================================
// 📚 UNIFIED CATALOG BROWSING ENGINE (LAPTOP SIDEBAR + TABLET DRAWER)
// =========================================================
const catalogState = {
  section: 'all', // 'all', 'junior', 'secondary', 'biography'
  category: 'All',
  grade: 'All',
  availability: 'All', // 'All', 'free', 'borrowed'
  sort: 'newest', // 'newest', 'az', 'popular'
  search: '',
  page: 1,
  pageSize: 8,
  isDrawerOpen: false
};

function getFilteredCatalogBooks(items) {
  return items.filter(b => {
    if (catalogState.section !== 'all' && b.section !== catalogState.section) return false;
    if (catalogState.category !== 'All' && b.category !== catalogState.category) return false;
    if (catalogState.grade !== 'All' && b.grade && !b.grade.toLowerCase().includes(catalogState.grade.toLowerCase())) return false;
    if (catalogState.availability === 'free' && b.isRented) return false;
    if (catalogState.availability === 'borrowed' && !b.isRented) return false;
    if (catalogState.search) {
      const q = catalogState.search.toLowerCase().trim();
      const match = (b.title || '').toLowerCase().includes(q) ||
                    (b.author || '').toLowerCase().includes(q) ||
                    (b.category || '').toLowerCase().includes(q) ||
                    (b.description || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

function sortCatalogBooks(items) {
  const copy = [...items];
  if (catalogState.sort === 'newest') {
    copy.sort((a, b) => (b.at || b.id) - (a.at || a.id));
  } else if (catalogState.sort === 'az') {
    copy.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else if (catalogState.sort === 'popular') {
    copy.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || (b.at || b.id) - (a.at || a.id));
  }
  return copy;
}

function countActiveFilters() {
  let count = 0;
  if (catalogState.category !== 'All') count++;
  if (catalogState.grade !== 'All') count++;
  if (catalogState.availability !== 'All') count++;
  if (catalogState.search) count++;
  if (catalogState.sort !== 'newest') count++;
  return count;
}

function renderCatalogActiveChips() {
  const chips = [];
  if (catalogState.search) {
    chips.push(`<span class="active-chip">Search: "${esc(catalogState.search)}" <button type="button" onclick="clearCatalogSearch()" aria-label="Remove search filter">✕</button></span>`);
  }
  if (catalogState.section !== 'all') {
    const wingLabel = catalogState.section === 'junior' ? 'Junior Wing' : (catalogState.section === 'biography' ? 'Biographies' : 'Secondary Wing');
    chips.push(`<span class="active-chip">Wing: ${wingLabel} <button type="button" onclick="setCatalogWing('all')" aria-label="Remove wing filter">✕</button></span>`);
  }
  if (catalogState.category !== 'All') {
    chips.push(`<span class="active-chip">Genre: ${esc(catalogState.category)} <button type="button" onclick="setCatalogCategory('All')" aria-label="Remove genre filter">✕</button></span>`);
  }
  if (catalogState.grade !== 'All') {
    chips.push(`<span class="active-chip">Grade: ${esc(catalogState.grade)} <button type="button" onclick="setCatalogGrade('All')" aria-label="Remove grade filter">✕</button></span>`);
  }
  if (catalogState.availability !== 'All') {
    chips.push(`<span class="active-chip">Availability: ${catalogState.availability === 'free' ? 'Free (Immediate)' : 'Borrowed'} <button type="button" onclick="setCatalogAvailability('All')" aria-label="Remove availability filter">✕</button></span>`);
  }
  if (catalogState.sort !== 'newest') {
    chips.push(`<span class="active-chip">Sort: ${catalogState.sort === 'az' ? 'A-Z' : 'Popular'} <button type="button" onclick="setCatalogSort('newest')" aria-label="Reset sort">✕</button></span>`);
  }

  if (!chips.length) return '';
  return `
    <div class="active-chips-inner">
      <span class="active-chips-label"><i data-lucide="check" aria-hidden="true"></i> Active Filters:</span>
      ${chips.join('')}
      <button type="button" class="clear-all-chips-btn" onclick="resetCatalogFilters()">Clear All</button>
    </div>`;
}

async function renderCatalogPage(initialSection = 'all') {
  catalogState.section = initialSection;
  catalogState.page = 1;

  if (appState.activeCategory && appState.activeCategory !== 'All') {
    catalogState.category = appState.activeCategory;
    appState.activeCategory = 'All';
  }
  if (appState.activeGrade && appState.activeGrade !== 'All') {
    catalogState.grade = appState.activeGrade;
    appState.activeGrade = 'All';
  }
  if (appState.searchFilter) {
    catalogState.search = appState.searchFilter;
    appState.searchFilter = '';
  }

  let items = [];
  try {
    items = cachedItems.length ? cachedItems : await api('items');
    cachedItems = items;
  } catch (err) {
    return `
      <div class="catalog-error-state">
        <div class="error-state-icon"><i data-lucide="alert-triangle" aria-hidden="true"></i></div>
        <h3 class="error-state-title">Unable to Load Library Catalog</h3>
        <p class="error-state-desc">${esc(err.message || 'There was a connection issue loading the catalog items.')}</p>
        <button class="btn btn-gold btn-md" onclick="retryCatalogFetch('${initialSection}')">
          <i data-lucide="rotate-ccw" aria-hidden="true"></i>
          <span>Retry Loading Catalog</span>
        </button>
      </div>`;
  }

  const sectionMeta = {
    junior: {
      title: 'Junior Wing (Pre-K - 5)',
      desc: 'Nursery rhymes, illustrated storybooks, interactive audio, and flipbooks for primary learners.',
      icon: 'smile',
      badge: 'Primary Wing'
    },
    secondary: {
      title: 'Secondary Wing (6 - 12)',
      desc: 'Academics, classic novels, graphic novels, encyclopedias, and R.L. Stine horror series.',
      icon: 'book-open',
      badge: 'Middle & Senior'
    },
    biography: {
      title: 'Biographies & Hall of Fame',
      desc: 'Inspiring life stories of historic scientists, Nobel laureates, world leaders, and thinkers.',
      icon: 'crown',
      badge: 'Hall of Fame'
    },
    all: {
      title: 'Complete Library Catalog',
      desc: 'Browse, filter, and discover all digital books, guides, and literature across all school wings.',
      icon: 'library',
      badge: 'All Wings'
    }
  };

  const meta = sectionMeta[initialSection] || sectionMeta.all;
  const sectionItems = initialSection === 'all' ? items : items.filter(b => b.section === initialSection);
  const distinctCats = ['All', ...new Set(sectionItems.map(b => b.category).filter(Boolean))];
  const distinctGrades = ['All', ...new Set(sectionItems.map(b => b.grade).filter(Boolean))];

  const filteredAndSorted = sortCatalogBooks(getFilteredCatalogBooks(items));
  const totalMatches = filteredAndSorted.length;
  const limit = catalogState.page * catalogState.pageSize;
  const visibleBooks = filteredAndSorted.slice(0, limit);
  const hasMore = totalMatches > limit;
  const remaining = totalMatches - limit;
  const activeCount = countActiveFilters();

  return `
    <div class="catalog-page-container">
      <!-- Catalog Header -->
      <div class="catalog-page-header">
        <div class="catalog-header-text">
          <div class="catalog-section-badge">
            <i data-lucide="${meta.icon}" aria-hidden="true"></i>
            <span>${meta.badge}</span>
          </div>
          <h1 class="catalog-title">${meta.title}</h1>
          <p class="catalog-subtitle">${meta.desc}</p>
        </div>
        <div class="catalog-header-actions">
          <span class="catalog-total-pill" id="catalogTotalPill">
            <i data-lucide="book-marked" aria-hidden="true"></i>
            <span id="catalogMatchCountText">${totalMatches} Book${totalMatches === 1 ? '' : 's'}</span>
          </span>
          ${isLibrarian() ? `
            <button class="btn btn-gold btn-sm" onclick="go('admin')" style="display:inline-flex;align-items:center;gap:6px;">
              <i data-lucide="plus" aria-hidden="true"></i> <span>Add Books</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Tablet Filter & Sort Header Bar (768px - 1040px) -->
      <div class="tablet-filter-header">
        <div class="tablet-search-wrap">
          <i data-lucide="search" class="tablet-search-icon" aria-hidden="true"></i>
          <input
            type="text"
            id="tabletShelfSearchInput"
            class="tablet-search-input"
            placeholder="Search titles, authors, genres..."
            value="${esc(catalogState.search)}"
            oninput="handleCatalogSearch(this.value)"
          >
          ${catalogState.search ? `
            <button type="button" class="tablet-search-clear-btn" onclick="clearCatalogSearch()" aria-label="Clear search">
              <i data-lucide="x" aria-hidden="true"></i>
            </button>
          ` : ''}
        </div>

        <div class="tablet-filter-actions">
          <button
            type="button"
            class="btn btn-outline tablet-filter-toggle-btn ${activeCount > 0 ? 'is-active' : ''}"
            onclick="toggleCatalogFilterDrawer()"
            aria-expanded="false"
            aria-controls="tabletFilterDrawer"
          >
            <i data-lucide="sliders-horizontal" aria-hidden="true"></i>
            <span>Filters</span>
            ${activeCount > 0 ? `<span class="filter-count-badge">${activeCount}</span>` : ''}
          </button>

          <select class="tablet-sort-select" onchange="setCatalogSort(this.value)" aria-label="Sort catalog">
            <option value="newest" ${catalogState.sort === 'newest' ? 'selected' : ''}>Sort: Newest</option>
            <option value="az" ${catalogState.sort === 'az' ? 'selected' : ''}>Sort: A-Z</option>
            <option value="popular" ${catalogState.sort === 'popular' ? 'selected' : ''}>Sort: Popular</option>
          </select>
        </div>
      </div>

      <!-- Tablet Collapsible Filter Drawer -->
      <div id="tabletFilterDrawer" class="tablet-filter-drawer" hidden>
        <div class="tablet-drawer-inner">
          <div class="tablet-drawer-row">
            <label class="filter-label"><i data-lucide="compass" aria-hidden="true"></i> Genre / Category</label>
            <select class="filter-select" onchange="setCatalogCategory(this.value)">
              ${distinctCats.map(c => `<option value="${esc(c)}" ${catalogState.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
            </select>
          </div>

          <div class="tablet-drawer-row">
            <label class="filter-label"><i data-lucide="graduation-cap" aria-hidden="true"></i> Grade Level</label>
            <select class="filter-select" onchange="setCatalogGrade(this.value)">
              ${distinctGrades.map(g => `<option value="${esc(g)}" ${catalogState.grade === g ? 'selected' : ''}>${esc(g)}</option>`).join('')}
            </select>
          </div>

          <div class="tablet-drawer-row">
            <label class="filter-label"><i data-lucide="check-circle-2" aria-hidden="true"></i> Availability</label>
            <select class="filter-select" onchange="setCatalogAvailability(this.value)">
              <option value="All" ${catalogState.availability === 'All' ? 'selected' : ''}>All Availability</option>
              <option value="free" ${catalogState.availability === 'free' ? 'selected' : ''}>Available Free (Immediate)</option>
              <option value="borrowed" ${catalogState.availability === 'borrowed' ? 'selected' : ''}>Currently Borrowed</option>
            </select>
          </div>

          <div class="tablet-drawer-footer">
            <button type="button" class="btn btn-outline btn-sm" onclick="resetCatalogFilters()">
              <i data-lucide="rotate-ccw" aria-hidden="true"></i> <span>Reset Filters</span>
            </button>
            <button type="button" class="btn btn-gold btn-sm" onclick="toggleCatalogFilterDrawer(false)">
              <i data-lucide="check" aria-hidden="true"></i> <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Catalog Layout (Laptop 2-Column: Sticky Sidebar + Cards) -->
      <div class="catalog-layout">
        <!-- Sticky Sidebar on Laptop -->
        <aside class="catalog-sidebar" aria-label="Catalog Filters">
          <div class="catalog-sidebar-head">
            <span class="sidebar-title"><i data-lucide="filter" aria-hidden="true"></i> Filter & Sort</span>
            ${activeCount > 0 ? `
              <button type="button" class="sidebar-reset-link" onclick="resetCatalogFilters()">Reset All</button>
            ` : ''}
          </div>

          <!-- Search Filter -->
          <div class="sidebar-filter-group">
            <label class="sidebar-filter-label" for="sidebarSearchInput">
              <i data-lucide="search" aria-hidden="true"></i> Search Catalog
            </label>
            <div class="sidebar-search-wrap">
              <input
                type="text"
                id="sidebarSearchInput"
                class="sidebar-search-input"
                placeholder="Title, author, keywords..."
                value="${esc(catalogState.search)}"
                oninput="handleCatalogSearch(this.value)"
              >
              ${catalogState.search ? `
                <button type="button" class="sidebar-search-clear" onclick="clearCatalogSearch()" aria-label="Clear search">✕</button>
              ` : ''}
            </div>
          </div>

          <!-- Sort Selector -->
          <div class="sidebar-filter-group">
            <label class="sidebar-filter-label">
              <i data-lucide="arrow-down-up" aria-hidden="true"></i> Sort Books
            </label>
            <div class="catalog-sort-pills" role="radiogroup" aria-label="Sort books by">
              <button
                type="button"
                class="sort-pill-btn ${catalogState.sort === 'newest' ? 'is-active' : ''}"
                onclick="setCatalogSort('newest')"
              >
                ✨ Newest
              </button>
              <button
                type="button"
                class="sort-pill-btn ${catalogState.sort === 'az' ? 'is-active' : ''}"
                onclick="setCatalogSort('az')"
              >
                🔤 A - Z
              </button>
              <button
                type="button"
                class="sort-pill-btn ${catalogState.sort === 'popular' ? 'is-active' : ''}"
                onclick="setCatalogSort('popular')"
              >
                🔥 Popular
              </button>
            </div>
          </div>

          <!-- Wing Selector -->
          <div class="sidebar-filter-group">
            <label class="sidebar-filter-label">
              <i data-lucide="building" aria-hidden="true"></i> Library Wing
            </label>
            <div class="sidebar-wing-list">
              <button
                type="button"
                class="sidebar-option-btn ${catalogState.section === 'all' ? 'is-active' : ''}"
                onclick="setCatalogWing('all')"
              >
                <span>📚 All Wings</span>
                <span class="option-count">${items.length}</span>
              </button>
              <button
                type="button"
                class="sidebar-option-btn ${catalogState.section === 'junior' ? 'is-active' : ''}"
                onclick="setCatalogWing('junior')"
              >
                <span>🧸 Junior Wing</span>
                <span class="option-count">${items.filter(b => b.section === 'junior').length}</span>
              </button>
              <button
                type="button"
                class="sidebar-option-btn ${catalogState.section === 'secondary' ? 'is-active' : ''}"
                onclick="setCatalogWing('secondary')"
              >
                <span>📖 Secondary Wing</span>
                <span class="option-count">${items.filter(b => b.section === 'secondary').length}</span>
              </button>
              <button
                type="button"
                class="sidebar-option-btn ${catalogState.section === 'biography' ? 'is-active' : ''}"
                onclick="setCatalogWing('biography')"
              >
                <span>👑 Biographies</span>
                <span class="option-count">${items.filter(b => b.section === 'biography').length}</span>
              </button>
            </div>
          </div>

          <!-- Category / Genre Filter -->
          <div class="sidebar-filter-group">
            <label class="sidebar-filter-label">
              <i data-lucide="compass" aria-hidden="true"></i> Category / Genre
            </label>
            <div class="sidebar-category-chips">
              ${distinctCats.map(c => `
                <button
                  type="button"
                  class="sidebar-cat-chip ${catalogState.category === c ? 'is-active' : ''}"
                  onclick="setCatalogCategory('${esc(c)}')"
                >
                  ${esc(c)}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Grade Level Filter -->
          <div class="sidebar-filter-group">
            <label class="sidebar-filter-label" for="sidebarGradeSelect">
              <i data-lucide="graduation-cap" aria-hidden="true"></i> Target Grade Level
            </label>
            <select id="sidebarGradeSelect" class="sidebar-filter-select" onchange="setCatalogGrade(this.value)">
              ${distinctGrades.map(g => `<option value="${esc(g)}" ${catalogState.grade === g ? 'selected' : ''}>${esc(g)}</option>`).join('')}
            </select>
          </div>

          <!-- Availability Filter -->
          <div class="sidebar-filter-group">
            <label class="sidebar-filter-label" for="sidebarAvailSelect">
              <i data-lucide="check-circle-2" aria-hidden="true"></i> Availability
            </label>
            <select id="sidebarAvailSelect" class="sidebar-filter-select" onchange="setCatalogAvailability(this.value)">
              <option value="All" ${catalogState.availability === 'All' ? 'selected' : ''}>All Titles</option>
              <option value="free" ${catalogState.availability === 'free' ? 'selected' : ''}>Available Free (Immediate)</option>
              <option value="borrowed" ${catalogState.availability === 'borrowed' ? 'selected' : ''}>Currently Borrowed</option>
            </select>
          </div>
        </aside>

        <!-- Right: Books Content Grid -->
        <main class="catalog-main">
          <!-- Active Filter Chips Bar -->
          <div class="catalog-active-chips-bar" id="catalogActiveChipsBar">
            ${renderCatalogActiveChips()}
          </div>

          <!-- Books Grid -->
          <div id="catalogCardsContainer" class="books-shelf-grid catalog-grid">
            ${totalMatches ? visibleBooks.map(renderBookCard).join('') : `
              <div class="catalog-empty-state">
                <div class="empty-state-icon"><i data-lucide="search-x" aria-hidden="true"></i></div>
                <h3 class="empty-state-title">No books found, try another word</h3>
                <p class="empty-state-desc">We couldn't find any books matching "${esc(catalogState.search || catalogState.category)}". Try checking for typos or resetting your filters.</p>
                <button type="button" class="btn btn-gold btn-md empty-state-reset-btn" onclick="resetCatalogFilters()">
                  <i data-lucide="rotate-ccw" aria-hidden="true"></i>
                  <span>Reset All Filters</span>
                </button>
              </div>
            `}
          </div>

          <!-- Load More Button -->
          <div id="catalogLoadMoreWrap" class="catalog-load-more-wrap" ${hasMore ? '' : 'hidden'}>
            <button type="button" class="btn btn-outline btn-lg load-more-btn" onclick="loadMoreCatalogBooks()">
              <i data-lucide="chevron-down" aria-hidden="true"></i>
              <span>Load More Books (${remaining} remaining)</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  `;
}

function updateCatalogCardsDisplay() {
  const container = $('#catalogCardsContainer');
  const countEl = $('#catalogMatchCountText');
  const chipsEl = $('#catalogActiveChipsBar');
  const loadMoreWrap = $('#catalogLoadMoreWrap');
  const loadMoreBtn = loadMoreWrap ? loadMoreWrap.querySelector('button') : null;

  const items = cachedItems && cachedItems.length ? cachedItems : [];
  const filteredAndSorted = sortCatalogBooks(getFilteredCatalogBooks(items));
  const totalMatches = filteredAndSorted.length;
  const limit = catalogState.page * catalogState.pageSize;
  const visibleBooks = filteredAndSorted.slice(0, limit);
  const hasMore = totalMatches > limit;
  const remaining = totalMatches - limit;

  if (countEl) {
    countEl.textContent = `${totalMatches} Book${totalMatches === 1 ? '' : 's'}`;
  }

  if (chipsEl) {
    chipsEl.innerHTML = renderCatalogActiveChips();
  }

  const toggleBtn = $('.tablet-filter-toggle-btn');
  const activeCount = countActiveFilters();
  if (toggleBtn) {
    toggleBtn.classList.toggle('is-active', activeCount > 0);
    const badge = toggleBtn.querySelector('.filter-count-badge');
    if (activeCount > 0) {
      if (badge) badge.textContent = activeCount;
      else {
        const span = document.createElement('span');
        span.className = 'filter-count-badge';
        span.textContent = activeCount;
        toggleBtn.appendChild(span);
      }
    } else if (badge) {
      badge.remove();
    }
  }

  $$('.sort-pill-btn').forEach(btn => {
    btn.classList.toggle('is-active', btn.textContent.toLowerCase().includes(catalogState.sort));
  });
  $$('.sidebar-option-btn').forEach(btn => {
    const isThis = (catalogState.section === 'all' && btn.textContent.includes('All Wings')) ||
                   (catalogState.section === 'junior' && btn.textContent.includes('Junior')) ||
                   (catalogState.section === 'secondary' && btn.textContent.includes('Secondary')) ||
                   (catalogState.section === 'biography' && btn.textContent.includes('Biographies'));
    btn.classList.toggle('is-active', isThis);
  });
  $$('.sidebar-cat-chip').forEach(btn => {
    btn.classList.toggle('is-active', btn.textContent.trim() === catalogState.category);
  });

  if (container) {
    if (!totalMatches) {
      container.innerHTML = `
        <div class="catalog-empty-state">
          <div class="empty-state-icon"><i data-lucide="search-x" aria-hidden="true"></i></div>
          <h3 class="empty-state-title">No books found, try another word</h3>
          <p class="empty-state-desc">We couldn't find any books matching "${esc(catalogState.search || catalogState.category)}". Try checking for typos or resetting your filters.</p>
          <button type="button" class="btn btn-gold btn-md empty-state-reset-btn" onclick="resetCatalogFilters()">
            <i data-lucide="rotate-ccw" aria-hidden="true"></i>
            <span>Reset All Filters</span>
          </button>
        </div>`;
    } else {
      container.innerHTML = visibleBooks.map(renderBookCard).join('');
    }
  }

  if (loadMoreWrap) {
    loadMoreWrap.hidden = !hasMore;
    if (loadMoreBtn && hasMore) {
      loadMoreBtn.innerHTML = `
        <i data-lucide="chevron-down" aria-hidden="true"></i>
        <span>Load More Books (${remaining} remaining)</span>`;
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

function handleCatalogSearch(query) {
  catalogState.search = (query || '').trim();
  catalogState.page = 1;
  const sideInp = $('#sidebarSearchInput');
  const tabInp = $('#tabletShelfSearchInput');
  if (sideInp && sideInp.value !== query) sideInp.value = query;
  if (tabInp && tabInp.value !== query) tabInp.value = query;
  updateCatalogCardsDisplay();
}

function clearCatalogSearch() {
  catalogState.search = '';
  catalogState.page = 1;
  const sideInp = $('#sidebarSearchInput');
  const tabInp = $('#tabletShelfSearchInput');
  if (sideInp) sideInp.value = '';
  if (tabInp) tabInp.value = '';
  updateCatalogCardsDisplay();
}

function setCatalogSort(value) {
  catalogState.sort = value;
  catalogState.page = 1;
  const tabletSelect = $('.tablet-sort-select');
  if (tabletSelect && tabletSelect.value !== value) tabletSelect.value = value;
  updateCatalogCardsDisplay();
}

function setCatalogWing(wing) {
  catalogState.section = wing;
  catalogState.page = 1;
  updateCatalogCardsDisplay();
}

function setCatalogCategory(cat) {
  catalogState.category = cat;
  catalogState.page = 1;
  updateCatalogCardsDisplay();
}

function setCatalogGrade(grade) {
  catalogState.grade = grade;
  catalogState.page = 1;
  const sideSelect = $('#sidebarGradeSelect');
  if (sideSelect) sideSelect.value = grade;
  updateCatalogCardsDisplay();
}

function setCatalogAvailability(avail) {
  catalogState.availability = avail;
  catalogState.page = 1;
  const sideSelect = $('#sidebarAvailSelect');
  if (sideSelect) sideSelect.value = avail;
  updateCatalogCardsDisplay();
}

function resetCatalogFilters() {
  catalogState.search = '';
  catalogState.category = 'All';
  catalogState.grade = 'All';
  catalogState.availability = 'All';
  catalogState.sort = 'newest';
  catalogState.page = 1;

  const sideInp = $('#sidebarSearchInput');
  const tabInp = $('#tabletShelfSearchInput');
  const sideGrade = $('#sidebarGradeSelect');
  const sideAvail = $('#sidebarAvailSelect');
  const tabSort = $('.tablet-sort-select');

  if (sideInp) sideInp.value = '';
  if (tabInp) tabInp.value = '';
  if (sideGrade) sideGrade.value = 'All';
  if (sideAvail) sideAvail.value = 'All';
  if (tabSort) tabSort.value = 'newest';

  updateCatalogCardsDisplay();
}

function loadMoreCatalogBooks() {
  const container = $('#catalogCardsContainer');
  if (!container) return;

  const items = cachedItems && cachedItems.length ? cachedItems : [];
  const filteredAndSorted = sortCatalogBooks(getFilteredCatalogBooks(items));
  const currentCount = catalogState.page * catalogState.pageSize;
  const nextBatch = filteredAndSorted.slice(currentCount, currentCount + catalogState.pageSize);

  if (!nextBatch.length) return;

  // Insert shimmering skeleton cards
  const skeletonEl = document.createElement('div');
  skeletonEl.className = 'skeleton-batch-loader';
  skeletonEl.innerHTML = renderBookSkeleton(Math.min(4, nextBatch.length));
  while (skeletonEl.firstChild) {
    container.appendChild(skeletonEl.firstChild);
  }

  setTimeout(() => {
    document.querySelectorAll('.book-card-skeleton').forEach(s => s.remove());
    catalogState.page++;
    const totalRendered = catalogState.page * catalogState.pageSize;
    const hasMore = filteredAndSorted.length > totalRendered;
    const remaining = filteredAndSorted.length - totalRendered;

    const fragment = document.createRange().createContextualFragment(nextBatch.map(renderBookCard).join(''));
    container.appendChild(fragment);

    const loadMoreWrap = $('#catalogLoadMoreWrap');
    if (loadMoreWrap) {
      loadMoreWrap.hidden = !hasMore;
      const btn = loadMoreWrap.querySelector('button');
      if (btn && hasMore) {
        btn.innerHTML = `<i data-lucide="chevron-down" aria-hidden="true"></i><span>Load More Books (${remaining} remaining)</span>`;
      }
    }
    if (window.lucide) window.lucide.createIcons();
  }, 240);
}

function toggleCatalogFilterDrawer(forceState) {
  const drawer = $('#tabletFilterDrawer');
  const toggleBtn = $('.tablet-filter-toggle-btn');
  if (!drawer) return;

  const isOpen = !drawer.hasAttribute('hidden') && drawer.classList.contains('is-open');
  const shouldOpen = typeof forceState === 'boolean' ? forceState : !isOpen;

  if (shouldOpen) {
    drawer.removeAttribute('hidden');
    drawer.classList.add('is-open');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.classList.add('is-drawer-open');
    }
  } else {
    drawer.classList.remove('is-open');
    drawer.setAttribute('hidden', '');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.classList.remove('is-drawer-open');
    }
  }
}

function retryCatalogFetch(section) {
  go(section || 'secondary');
}

// -------------------------------------------------------------
// ALL APPLICATION VIEWS (EXACT SPECIFIED SEQUENCE & ALIGNMENT)
// -------------------------------------------------------------
const views = {
  // 1. HOME VIEW (EXACT 11-PART SEQUENCE)
  async home() {
    let allItems = [];
    try {
      const res = await api('items');
      allItems = Array.isArray(res) ? res : [];
      cachedItems = allItems;
    } catch (err) {
      console.warn('Catalog items fetch error:', err);
      allItems = Array.isArray(cachedItems) ? cachedItems : [];
    }
    const goosebumpsBooks = allItems.filter(b => b.title && b.title.includes('Goosebumps'));
    
    // Real dynamic categories and authors from existing database fields
    const distinctCategories = [...new Set(allItems.map(b => b.category).filter(Boolean))].sort();
    const distinctAuthors = [...new Set(allItems.map(b => b.author).filter(Boolean))].sort();

    // The 4 Specified Rows Below Hero:
    // 1. New Arrivals (sorted by b.at || b.id desc)
    const newArrivals = [...allItems].sort((a, b) => (b.at || b.id) - (a.at || a.id)).slice(0, 4);

    // 2. Most Read This Month (popular === 1 per school database schema)
    const mostReadMonth = allItems.filter(b => b.popular === 1).slice(0, 4);

    // 3. Recommended for Junior Wing (section === 'junior')
    const recommendedJunior = allItems.filter(b => b.section === 'junior').slice(0, 4);

    // 4. Continue Reading Shelf (user bookmarks/rentals when logged in, or prompt cards)
    let continueReadingContent = '';
    if (user) {
      try {
        const meData = await api('me');
        const userSavedBooks = (meData && Array.isArray(meData.bookmarks) && meData.bookmarks.length) ? meData.bookmarks : [];
        if (userSavedBooks.length) {
          continueReadingContent = `
            <div class="books-shelf-grid">
              ${userSavedBooks.slice(0, 4).map(renderBookCard).join('')}
            </div>`;
        } else {
          continueReadingContent = `
            <div class="continue-reading-empty-card">
              <div class="cr-empty-icon"><i data-lucide="bookmark-plus" aria-hidden="true"></i></div>
              <div class="cr-empty-text">
                <h4 class="cr-empty-title">Your Reading Passport is Ready</h4>
                <p class="cr-empty-desc">You haven't saved any books yet. Click "Save" on any book card to keep it on your personal shelf.</p>
              </div>
              <button class="btn btn-gold btn-sm" onclick="go('secondary')">
                <i data-lucide="compass" aria-hidden="true"></i> <span>Explore Catalog</span>
              </button>
            </div>`;
        }
      } catch (e) {
        continueReadingContent = `
          <div class="continue-reading-empty-card">
            <div class="cr-empty-icon"><i data-lucide="bookmark" aria-hidden="true"></i></div>
            <div class="cr-empty-text">
              <h4 class="cr-empty-title">Continue Reading</h4>
              <p class="cr-empty-desc">Explore our digital collection and save books to your personal shelf.</p>
            </div>
            <button class="btn btn-gold btn-sm" onclick="go('secondary')">Browse Books</button>
          </div>`;
      }
    } else {
      continueReadingContent = `
        <div class="continue-reading-empty-card guest-card">
          <div class="cr-empty-icon"><i data-lucide="user-check" aria-hidden="true"></i></div>
          <div class="cr-empty-text">
            <h4 class="cr-empty-title">Personalized Continue Reading Shelf</h4>
            <p class="cr-empty-desc">Sign in with your Scholar ID to save books to your personal shelf and resume reading across devices.</p>
          </div>
          <div class="cr-guest-actions">
            <button class="btn btn-gold btn-sm" onclick="go('auth', 'login')">
              <i data-lucide="log-in" aria-hidden="true"></i> <span>Scholar Login</span>
            </button>
            <button class="btn btn-ghost btn-sm" onclick="go('auth', 'signup')">
              <i data-lucide="user-plus" aria-hidden="true"></i> <span>Join Hub</span>
            </button>
          </div>
        </div>`;
    }

    let candidates = [];
    try {
      const cData = await api('candidates');
      candidates = Array.isArray(cData) ? cData : [];
    } catch(e){}
    const totalVotes = candidates.reduce((sum, c) => sum + (c.n || 0), 0);

    let latestNews = [];
    try {
      const nData = await api('news?range=week');
      latestNews = Array.isArray(nData) ? nData : [];
    } catch(e){}

    let readers = [];
    try {
      const rData = await api('readers');
      readers = Array.isArray(rData) ? rData : [];
    } catch(e){}
    const schoolStar = readers.find(r => r.kind === 'school') || readers[0];
    const digitalStar = readers.find(r => r.kind === 'digital') || readers[1];

    return `
      <!-- 1. Hero Section -->
      <section class="library-hero" id="heroSection">
        <div class="hero-crest-watermark" aria-hidden="true">
          <img src="logo.png" alt="" class="hero-watermark-img">
        </div>

        <!-- 3D Floating Books (Pure CSS 3D, 60fps GPU, 0KB overhead) -->
        <div class="hero-3d-floating-scene" aria-hidden="true">
          <!-- Floating Book 1: Gold Scholastic Folio -->
          <div class="hero-float-book hero-float-book-1">
            <div class="hbook-3d-obj">
              <div class="hbook-face hbook-front hbook-gold">
                <div class="hbook-emboss">
                  <span class="hbook-crest">✦</span>
                  <span class="hbook-label">CBSE ACADEMICS</span>
                  <div class="hbook-rule"></div>
                </div>
              </div>
              <div class="hbook-face hbook-spine hbook-spine-gold">
                <span>VIRAJ SCHOLASTIC • VOL. I</span>
              </div>
              <div class="hbook-face hbook-pages"></div>
              <div class="hbook-face hbook-back hbook-gold"></div>
            </div>
            <div class="hbook-shadow"></div>
          </div>

          <!-- Floating Book 2: Navy Science Folio -->
          <div class="hero-float-book hero-float-book-2">
            <div class="hbook-3d-obj">
              <div class="hbook-face hbook-front hbook-navy">
                <div class="hbook-emboss">
                  <span class="hbook-crest">🏛️</span>
                  <span class="hbook-label">SCIENCE & DISCOVERY</span>
                  <div class="hbook-rule"></div>
                </div>
              </div>
              <div class="hbook-face hbook-spine hbook-spine-navy">
                <span>SCIENCE ARCHIVE</span>
              </div>
              <div class="hbook-face hbook-pages"></div>
              <div class="hbook-face hbook-back hbook-navy"></div>
            </div>
            <div class="hbook-shadow"></div>
          </div>

          <!-- Floating Book 3: Emerald Literature Primer -->
          <div class="hero-float-book hero-float-book-3">
            <div class="hbook-3d-obj">
              <div class="hbook-face hbook-front hbook-emerald">
                <div class="hbook-emboss">
                  <span class="hbook-crest">📖</span>
                  <span class="hbook-label">LITERARY CLASSICS</span>
                  <div class="hbook-rule"></div>
                </div>
              </div>
              <div class="hbook-face hbook-spine hbook-spine-emerald">
                <span>LITERATURE & TALES</span>
              </div>
              <div class="hbook-face hbook-pages"></div>
              <div class="hbook-face hbook-back hbook-emerald"></div>
            </div>
            <div class="hbook-shadow"></div>
          </div>
        </div>

        <div class="hero-content">
          <div class="hero-badge">
            <span class="hero-live-dot" aria-hidden="true"></span>
            <span>VIRAJ INTERNATIONAL SCHOOL • DIGITAL KNOWLEDGE HUB</span>
          </div>

          <h1 class="hero-heading">Viraj International School Digital Library Hub</h1>
          <p class="hero-subheading">Discover, read, and excel with free access to thousands of books, academic guides, and literary adventures.</p>

          <!-- Big Search Bar With Filters (wing, genre, author from existing data) -->
          <div class="hero-search-card" role="search" aria-label="Library catalog search">
            <div class="hero-search-main-row">
              <div class="hero-search-input-wrap">
                <i data-lucide="search" class="hero-search-icon" aria-hidden="true"></i>
                <input
                  type="search"
                  id="heroSearchInput"
                  class="hero-search-input"
                  placeholder="Search books by title, author, series, or keyword..."
                  autocomplete="off"
                  aria-label="Search digital library"
                  oninput="handleHeroSearch(this.value)"
                  onkeydown="if(event.key==='Enter') executeHeroSearch()"
                >
                <button
                  type="button"
                  class="hero-search-clear-btn"
                  id="heroSearchClearBtn"
                  onclick="clearHeroSearch()"
                  title="Clear search input"
                  aria-label="Clear search input"
                  hidden
                >
                  <i data-lucide="x" aria-hidden="true"></i>
                </button>
              </div>

              <button
                type="button"
                class="btn btn-gold hero-search-submit-btn"
                onclick="executeHeroSearch()"
                aria-label="Search library catalog"
              >
                <i data-lucide="search" aria-hidden="true"></i>
                <span>Search Books</span>
              </button>
            </div>

            <!-- Filters Row: wing, genre, author (using only fields that exist in our data) -->
            <div class="hero-filters-row">
              <div class="hero-filter-group">
                <label for="heroFilterWing" class="hero-filter-label">
                  <i data-lucide="book-open" aria-hidden="true"></i> Wing
                </label>
                <select id="heroFilterWing" class="hero-filter-select" onchange="handleHeroFilterChange()">
                  <option value="All">All Wings</option>
                  <option value="junior">Junior Wing (Pre-K - 5)</option>
                  <option value="secondary">Secondary Wing (6 - 12)</option>
                  <option value="biography">Biographies & Hall of Fame</option>
                </select>
              </div>

              <div class="hero-filter-group">
                <label for="heroFilterGenre" class="hero-filter-label">
                  <i data-lucide="compass" aria-hidden="true"></i> Genre
                </label>
                <select id="heroFilterGenre" class="hero-filter-select" onchange="handleHeroFilterChange()">
                  <option value="All">All Genres</option>
                  ${distinctCategories.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
                </select>
              </div>

              <div class="hero-filter-group">
                <label for="heroFilterAuthor" class="hero-filter-label">
                  <i data-lucide="user" aria-hidden="true"></i> Author
                </label>
                <select id="heroFilterAuthor" class="hero-filter-select" onchange="handleHeroFilterChange()">
                  <option value="All">All Authors</option>
                  ${distinctAuthors.map(a => `<option value="${esc(a)}">${esc(a)}</option>`).join('')}
                </select>
              </div>

              <button type="button" class="hero-filter-reset-btn" id="heroFilterResetBtn" onclick="resetHeroFilters()" title="Reset filters">
                <i data-lucide="rotate-ccw" aria-hidden="true"></i>
                <span>Reset</span>
              </button>
            </div>

            <!-- Live Search Results Dropdown -->
            <div id="heroSearchResultsDropdown" class="hero-search-results-dropdown" hidden></div>
          </div>

          <!-- Two Buttons: Browse Books and Join the Hub -->
          <div class="hero-actions-row">
            <button class="btn btn-gold btn-lg hero-action-btn" onclick="go('secondary')">
              <i data-lucide="library" aria-hidden="true"></i>
              <span>Browse Books</span>
            </button>
            ${!user ? `
              <button class="btn btn-outline btn-lg hero-action-btn" onclick="go('auth', 'signup')">
                <i data-lucide="user-plus" aria-hidden="true"></i>
                <span>Join the Hub</span>
              </button>
            ` : `
              <button class="btn btn-outline btn-lg hero-action-btn" onclick="go('profile')">
                <i data-lucide="award" aria-hidden="true"></i>
                <span>Reading Passport</span>
              </button>
            `}
          </div>

          <!-- Quick Trending Tags -->
          <div class="hero-trending-row">
            <span class="hero-trending-label"><i data-lucide="flame" aria-hidden="true"></i> Trending:</span>
            <button type="button" class="hero-trending-pill" onclick="applyHeroTag('Goosebumps', 'secondary')">Goosebumps</button>
            <button type="button" class="hero-trending-pill" onclick="applyHeroTag('HorrorLand', 'secondary')">HorrorLand</button>
            <button type="button" class="hero-trending-pill" onclick="applyHeroTag('Sherlock Holmes', 'secondary')">Sherlock Holmes</button>
            <button type="button" class="hero-trending-pill" onclick="applyHeroTag('Wings of Fire', 'biography')">Wings of Fire</button>
            <button type="button" class="hero-trending-pill" onclick="applyHeroTag('Comics', 'secondary')">Comics</button>
            <button type="button" class="hero-trending-pill" onclick="go('quiz')">Quiz Arena</button>
          </div>
        </div>
      </section>

      <!-- 1B. Daily Book Wisdom & Inspiration Widget -->
      ${renderDailyWisdomWidget()}

      <!-- 2. FOUR CORE LIBRARY SHELVES WITH WOODEN SHELVES -->
      <!-- Shelf 1: New Arrivals -->
      <section class="home-section">
        <div class="section-header-row">
          <div class="section-title-wrap">
            <span class="section-badge-icon"><i data-lucide="sparkles" aria-hidden="true"></i></span>
            <h3 class="section-title">New Arrivals</h3>
          </div>
          <span class="section-link" onclick="go('secondary')">Browse All New Arrivals →</span>
        </div>
        <div class="books-shelf-grid">
          ${newArrivals.map(renderBookCard).join('')}
        </div>
        <div class="wooden-shelf" aria-hidden="true"></div>
      </section>

      <!-- Shelf 2: Most Read This Month -->
      <section class="home-section">
        <div class="section-header-row">
          <div class="section-title-wrap">
            <span class="section-badge-icon"><i data-lucide="flame" aria-hidden="true"></i></span>
            <h3 class="section-title">Most Read This Month</h3>
          </div>
          <span class="section-link" onclick="go('secondary')">Browse Popular →</span>
        </div>
        <div class="books-shelf-grid">
          ${mostReadMonth.map(renderBookCard).join('')}
        </div>
        <div class="wooden-shelf" aria-hidden="true"></div>
      </section>

      <!-- Shelf 3: Recommended for Junior Wing -->
      <section class="home-section">
        <div class="section-header-row">
          <div class="section-title-wrap">
            <span class="section-badge-icon"><i data-lucide="smile" aria-hidden="true"></i></span>
            <h3 class="section-title">Recommended for Junior Wing</h3>
          </div>
          <span class="section-link" onclick="go('junior')">Open Junior Wing →</span>
        </div>
        <div class="books-shelf-grid">
          ${recommendedJunior.map(renderBookCard).join('')}
        </div>
        <div class="wooden-shelf" aria-hidden="true"></div>
      </section>

      <!-- Shelf 4: Continue Reading -->
      <section class="home-section">
        <div class="section-header-row">
          <div class="section-title-wrap">
            <span class="section-badge-icon"><i data-lucide="bookmark" aria-hidden="true"></i></span>
            <h3 class="section-title">Continue Reading</h3>
          </div>
          <span class="section-link" onclick="go('profile')">View Reading Passport →</span>
        </div>
        ${continueReadingContent}
        <div class="wooden-shelf" aria-hidden="true"></div>
      </section>

      <!-- 3. Explore Library Wings -->
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

      <!-- 4. Special Collection: R.L. Stine's Goosebumps Series -->
      ${goosebumpsBooks.length ? `
      <section class="home-section goosebumps-banner-section">
        <div class="goosebumps-banner-card">
          <div class="gb-banner-content">
            <div class="gb-tag-badge">🎃 EXCLUSIVE COMPLETE COLLECTION</div>
            <h2 class="gb-banner-title">R.L. Stine's Goosebumps Classics</h2>
            <p class="gb-banner-desc">
              Five complete, unabridged childhood horror and mystery masterpieces are now live in the school library! Experience every chapter online with reading themes, font scaling, audio narration, and original PDF downloads.
            </p>
            <div class="gb-banner-actions">
              <button class="btn btn-green btn-lg" onclick="appState.activeCategory='Goosebumps & Horror';go('secondary')">
                👻 Browse Goosebumps Series
              </button>
              <button class="btn btn-ghost btn-lg" onclick="openItem(${goosebumpsBooks[0].id}, 'secondary', '${esc(goosebumpsBooks[0].title).replace(/'/g, "\\'")}', '${esc(goosebumpsBooks[0].file)}', '${esc(goosebumpsBooks[0].author).replace(/'/g, "\\'")}')">
                📖 Read Featured: ${esc(goosebumpsBooks[0].title.split(':')[1] || goosebumpsBooks[0].title).trim()}
              </button>
            </div>
          </div>
          <div class="gb-covers-preview-strip">
            <img src="/covers/one-day-at-horrorland.jpg" alt="HorrorLand" class="gb-mini-cover" title="One Day at HorrorLand" onclick="appState.activeCategory='Goosebumps & Horror';go('secondary')">
            <img src="/covers/monster-blood-2.jpg" alt="Monster Blood II" class="gb-mini-cover" title="Monster Blood II" onclick="appState.activeCategory='Goosebumps & Horror';go('secondary')">
            <img src="/covers/deep-trouble.jpg" alt="Deep Trouble" class="gb-mini-cover" title="Deep Trouble" onclick="appState.activeCategory='Goosebumps & Horror';go('secondary')">
            <img src="/covers/go-eat-worms.jpg" alt="Go Eat Worms!" class="gb-mini-cover" title="Go Eat Worms!" onclick="appState.activeCategory='Goosebumps & Horror';go('secondary')">
            <img src="/covers/ghost-beach.jpg" alt="Ghost Beach" class="gb-mini-cover" title="Ghost Beach" onclick="appState.activeCategory='Goosebumps & Horror';go('secondary')">
          </div>
        </div>

        <div class="section-header-row">
          <h3 class="section-title">🎃 Goosebumps Horror Classics (${goosebumpsBooks.length})</h3>
          <span class="section-link" onclick="appState.activeCategory='Goosebumps & Horror';go('secondary')">View In Secondary Wing →</span>
        </div>
        <div class="books-shelf-grid">
          ${goosebumpsBooks.map(renderBookCard).join('')}
        </div>
      </section>` : ''}

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
              <button class="btn btn-sm btn-gold" style="width:100%;" onclick="openPreview('The Hindu — In School Edition', '/books/the-hindu-in-school.html', 'Daily National Student Newspaper • The Hindu Press')">📖 Read Today's Edition</button>
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
              <button class="btn btn-sm btn-gold" style="width:100%;" onclick="openPreview('Indian Express Student Explorer', '/books/indian-express-explorer.html', 'Youth Student Edition • Express Media')">📖 Read Today's Edition</button>
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
              <button class="btn btn-sm btn-gold" style="width:100%;" onclick="openPreview('Times NIE — Newspaper in Education', '/books/times-nie-edition.html', 'Newspaper in Education • Times Group')">📖 Read Today's Edition</button>
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
              <button class="btn btn-sm btn-gold" style="width:100%;" onclick="openPreview('Viraj Campus Chronicle — Weekly Edition', '/books/viraj-campus-chronicle.html', 'Official School Press • Viraj International School')">📖 Read Campus Issue</button>
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

  // 2. JUNIOR LIBRARY VIEW (CATALOG BROWSING)
  async junior() {
    return await renderCatalogPage('junior');
  },

  // 3. SECONDARY LIBRARY VIEW (CATALOG BROWSING)
  async secondary() {
    return await renderCatalogPage('secondary');
  },

  // 4. BIOGRAPHIES VIEW (CATALOG BROWSING)
  async biography() {
    return await renderCatalogPage('biography');
  },

  // 4B. COMPLETE REPOSITORY BROWSE
  async books() {
    return await renderCatalogPage('all');
  },

  // 5. TEST YOUR WITS (QUIZ ARENA)
  async quiz(sub) {
    if (!sub) {
      return `
        <div style="margin-bottom:28px;">
          <h1 class="view-title" style="font-size:1.8rem;margin-bottom:4px;">🧠 Test Your Wits</h1>
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
          <h1 class="view-title" style="font-size:1.8rem;margin-bottom:4px;">💡 Suggest a Book</h1>
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
          <h1 class="view-title" style="font-size:1.8rem;margin-bottom:4px;">🗳️ Vote for the Next Book</h1>
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
          <h1 class="view-title" style="font-size:1.8rem;margin-bottom:4px;">🏆 Avid Reader of the Month</h1>
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
          <h1 class="view-title" style="font-size:1.8rem;margin-bottom:4px;">📰 Daily Newspapers & Campus News</h1>
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
                <button class="btn btn-sm btn-gold" style="width:100%;" onclick="openPreview('The Hindu — In School Edition', '/books/the-hindu-in-school.html', 'Daily National Student Newspaper • The Hindu Press')">📖 Read Digital Edition</button>
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
                <button class="btn btn-sm btn-gold" style="width:100%;" onclick="openPreview('Indian Express Student Explorer', '/books/indian-express-explorer.html', 'Youth Student Edition • Express Media')">📖 Read Digital Edition</button>
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
                <button class="btn btn-sm btn-gold" style="width:100%;" onclick="openPreview('Times NIE — Newspaper in Education', '/books/times-nie-edition.html', 'Newspaper in Education • Times Group')">📖 Read Digital Edition</button>
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
                <button class="btn btn-sm btn-gold" style="width:100%;" onclick="openPreview('Viraj Campus Chronicle — Weekly Edition', '/books/viraj-campus-chronicle.html', 'Official School Press • Viraj International School')">📖 Read Campus Issue</button>
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
    let nextRankName = 'Book Explorer 🥈';
    let progressPct = Math.min(100, Math.round((totalReads / 5) * 100));
    let progressLabel = `${totalReads} of 5 reads towards Book Explorer 🥈`;

    if (totalReads >= 30) {
      rank = 'Grand Bibliophile 💎';
      nextRankName = 'Grand Bibliophile 💎 (Max Tier)';
      progressPct = 100;
      progressLabel = `Maximum Scholar Rank Achieved! (${totalReads} total reads)`;
    } else if (totalReads >= 15) {
      rank = 'Master Scholar 🥇';
      nextRankName = 'Grand Bibliophile 💎';
      progressPct = Math.min(100, Math.round(((totalReads - 15) / 15) * 100));
      progressLabel = `${totalReads - 15} of 15 more reads to reach Grand Bibliophile 💎`;
    } else if (totalReads >= 5) {
      rank = 'Book Explorer 🥈';
      nextRankName = 'Master Scholar 🥇';
      progressPct = Math.min(100, Math.round(((totalReads - 5) / 10) * 100));
      progressLabel = `${totalReads - 5} of 10 more reads to reach Master Scholar 🥇`;
    }

    // Reading Passport Badges Registry
    const badges = [
      { id: 'first_read', title: 'First Steps', emoji: '📖', desc: 'Read your first book in the hub', earned: totalReads >= 1, req: 'Read 1 book' },
      { id: 'explorer', title: 'Book Explorer', emoji: '🥈', desc: 'Read 5 books across any wing', earned: totalReads >= 5, req: 'Read 5 books' },
      { id: 'scholar', title: 'Master Scholar', emoji: '🥇', desc: 'Read 15 books across any wing', earned: totalReads >= 15, req: 'Read 15 books' },
      { id: 'bibliophile', title: 'Grand Bibliophile', emoji: '💎', desc: 'Complete 30 books & stories', earned: totalReads >= 30, req: 'Read 30 books' },
      { id: 'quiz_ace', title: 'Quiz Arena Ace', emoji: '🧠', desc: 'Complete at least 1 reading quiz', earned: (counts.quiz || 0) >= 1, req: 'Complete 1 quiz' },
      { id: 'curator', title: 'Passport Curator', emoji: '🔖', desc: 'Save a book to your personal shelf', earned: (u.bookmarks || []).length >= 1, req: 'Save 1 book' }
    ];

    return `
      <div>
        <div class="passport-banner">
          <div class="passport-user-header">
            <div class="passport-avatar-lg">${(u.name || 'S')[0].toUpperCase()}</div>
            <div>
              <h1 class="view-title" style="font-size:1.6rem;margin-bottom:4px;">${esc(u.name)} — Reading Passport</h1>
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

        <!-- Animated Reading Passport Progress & Tier Goals -->
        <div class="passport-tier-progress-card">
          <div class="passport-tier-header">
            <div class="passport-tier-title">
              <i data-lucide="award" aria-hidden="true"></i>
              <span>Next Scholar Rank: <strong>${nextRankName}</strong></span>
            </div>
            <span class="passport-tier-pct">${progressPct}%</span>
          </div>
          <div class="passport-progress-track">
            <div class="passport-progress-fill" style="width: ${progressPct}%" role="progressbar" aria-valuenow="${progressPct}" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
          <div class="passport-progress-caption">${progressLabel}</div>
        </div>

        <!-- Reading Passport Badges Shelf with Celebratory Confetti -->
        <div class="admin-panel-card passport-badges-card" style="margin-bottom:24px;">
          <div class="section-header-row">
            <div>
              <h4 class="section-title" style="font-size:1.2rem;">🏅 Scholar Achievement Badges</h4>
              <p style="color:var(--text-muted);font-size:0.85rem;margin-top:2px;">Unlock verified digital reading milestones as you advance through the school catalog.</p>
            </div>
            <span class="pillar-badge" style="background:var(--gold-soft);color:var(--gold-primary);font-weight:700;">
              ${badges.filter(b => b.earned).length} of ${badges.length} Badges Earned
            </span>
          </div>

          <div class="passport-badges-grid">
            ${badges.map(b => `
              <div class="passport-badge-item ${b.earned ? 'is-earned' : 'is-locked'}" 
                role="button" 
                tabindex="0"
                onclick="handlePassportBadgeClick(event, '${esc(b.title)}', ${b.earned}, '${esc(b.req)}')"
                title="${b.earned ? 'Click to celebrate!' : b.req}">
                <div class="pbadge-icon-wrap">
                  <span class="pbadge-emoji">${b.emoji}</span>
                  ${b.earned ? '<span class="pbadge-star-check">✓</span>' : '<span class="pbadge-lock-icon">🔒</span>'}
                </div>
                <div class="pbadge-info">
                  <div class="pbadge-title">${esc(b.title)}</div>
                  <div class="pbadge-desc">${esc(b.desc)}</div>
                  <div class="pbadge-status-pill">${b.earned ? 'Earned ⭐' : b.req}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Active Borrowed Books Shelf -->
        <div class="admin-panel-card" style="margin-bottom:24px;">
          <div class="section-header-row">
            <div>
              <h4 class="section-title" style="font-size:1.2rem;">📚 My Borrowed Books & Active Loans (100% Free Access)</h4>
              <p style="color:var(--text-muted);font-size:0.85rem;margin-top:2px;">Books currently checked out to your student account with official school library permission. 100% free access.</p>
            </div>
            <span class="pillar-badge" style="background:var(--status-success-bg);color:var(--status-success);font-weight:700;">${(u.rentals || []).length} Active Loans</span>
          </div>

          ${(u.rentals && u.rentals.length) ? `
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:14px;margin-top:14px;">
              ${u.rentals.map(r => {
                const daysLeft = Math.max(1, Math.ceil((r.due_at - Date.now()) / (864e5)));
                return `
                  <div class="admin-stat-card" style="flex-direction:column;align-items:flex-start;gap:12px;background:var(--bg-surface);padding:16px;">
                    <div style="width:100%;display:flex;justify-content:space-between;align-items:flex-start;">
                      <div>
                        <div style="font-weight:700;font-size:0.95rem;color:var(--text-main);margin-bottom:2px;">${esc(r.title)}</div>
                        <div style="color:var(--text-muted);font-size:0.8rem;">By ${esc(r.author || 'Viraj Press')} • ${esc(r.category || 'General')}</div>
                      </div>
                      <span class="meta-chip" style="background:var(--status-success-bg);color:var(--status-success);font-size:0.75rem;">🟢 ${daysLeft} days left</span>
                    </div>
                    <div style="width:100%;display:flex;gap:8px;">
                      <button class="btn btn-sm btn-gold" style="flex:1;" onclick="openItem(${r.id}, '${r.section}', '${esc(r.title).replace(/'/g, "\\'")}', '${esc(r.file || '')}', '${esc(r.author || '').replace(/'/g, "\\'")}', true)">
                        📖 Read Book
                      </button>
                      <button class="btn btn-sm btn-ghost" onclick="returnRental(${r.id}, event)" title="Return to Library">
                        ↩️ Return
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div style="text-align:center;padding:24px;background:var(--bg-secondary);border-radius:var(--radius-md);margin-top:10px;">
              <div style="font-size:2rem;margin-bottom:6px;">📖</div>
              <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:8px;">You don't have any books currently borrowed.</p>
              <button class="btn btn-sm btn-gold" onclick="go('home')">Browse Library Shelves</button>
            </div>
          `}
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
          <h1 class="view-title" style="font-size:1.8rem;margin-bottom:4px;">🔖 Saved Books</h1>
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
          <h1 class="view-title" style="font-size:1.8rem;margin-bottom:4px;">🕒 Reading History</h1>
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

  // 13. ABOUT THE LIBRARY & VIRAJ INTERNATIONAL SCHOOL
  about() {
    // Current IST Time calculation for Campus Working Hours
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istDate = new Date(utcTime + (5.5 * 3600000));
    const day = istDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const hours = istDate.getHours();
    const minutes = istDate.getMinutes();
    const currentMins = hours * 60 + minutes;

    let isOpen = false;
    let statusMsg = '';
    let statusClass = 'status-closed';

    if (day === 0) {
      statusMsg = 'Campus Closed Today (Sunday) • Reopens Monday at 8:00 AM';
      statusClass = 'status-closed';
    } else if (day === 6) {
      if (currentMins >= 8 * 60 && currentMins < 14 * 60) {
        statusMsg = 'Campus Open Today (8:00 AM – 2:00 PM)';
        statusClass = 'status-open';
      } else if (currentMins < 8 * 60) {
        statusMsg = 'Campus Opens at 8:00 AM Today (Saturday)';
        statusClass = 'status-closed';
      } else {
        statusMsg = 'Campus Closed for the Day • Reopens Monday at 8:00 AM';
        statusClass = 'status-closed';
      }
    } else {
      if (currentMins >= 8 * 60 && currentMins < 16 * 60) {
        statusMsg = 'Campus Open Today (8:00 AM – 4:00 PM)';
        statusClass = 'status-open';
      } else if (currentMins < 8 * 60) {
        statusMsg = 'Campus Opens at 8:00 AM Today';
        statusClass = 'status-closed';
      } else {
        statusMsg = 'Campus Closed for the Day • Reopens Tomorrow at 8:00 AM';
        statusClass = 'status-closed';
      }
    }

    const schedule = [
      { d: 1, name: 'Monday', hours: '8:00 AM – 4:00 PM' },
      { d: 2, name: 'Tuesday', hours: '8:00 AM – 4:00 PM' },
      { d: 3, name: 'Wednesday', hours: '8:00 AM – 4:00 PM' },
      { d: 4, name: 'Thursday', hours: '8:00 AM – 4:00 PM' },
      { d: 5, name: 'Friday', hours: '8:00 AM – 4:00 PM' },
      { d: 6, name: 'Saturday', hours: '8:00 AM – 2:00 PM' },
      { d: 0, name: 'Sunday', hours: 'Closed' }
    ];

    return `
      <div class="about-page-wrap">
        <!-- Hero Header -->
        <div class="about-hero-banner">
          <img src="logo.png" alt="Viraj International School Crest" class="about-crest-lg">
          <h1 class="about-school-name">VIRAJ INTERNATIONAL SCHOOL</h1>
          <p class="about-school-affil">🎓 CBSE Affiliated Institution • Kurgaon, Boisar, Maharashtra</p>
          <p class="about-school-motto">
            “Nurturing intellectual curiosity, moral integrity, academic distinction, and lifelong learning for every scholar.”
          </p>
          <div class="about-action-btns">
            <a href="https://www.virajinternationalschool.com/" target="_blank" rel="noopener" class="btn btn-gold">
              🌐 Official School Website ↗
            </a>
            <a href="https://www.google.com/search?q=viraj+international+school+address&ludocid=6206948811688517609" target="_blank" rel="noopener" class="btn btn-ghost" style="color:#ffffff;border-color:rgba(255,255,255,0.4);">
              🧭 Directions (30 mins from Boisar) ↗
            </a>
            <a href="tel:08554998833" class="btn btn-ghost" style="color:#ffffff;border-color:rgba(255,255,255,0.4);">
              📞 Call: 085549 98833
            </a>
          </div>
        </div>

        <!-- 2-Column Campus & Timing Grid -->
        <div class="about-grid-2col">
          <!-- Campus & Location Card -->
          <div class="about-detail-card">
            <div class="about-card-title">
              <span>🏛️</span>
              <span>Campus & Contact Details</span>
            </div>

            <div class="about-info-row">
              <span class="about-info-icon">📍</span>
              <div class="about-info-text">
                <strong>Campus Address</strong>
                <span>Survey No.27, Boisar - Tarapur Rd, Near Kurgaon Grampanchayat Office, Kurgaon, Boisar, Maharashtra 401502</span>
              </div>
            </div>

            <div class="about-info-row">
              <span class="about-info-icon">🚗</span>
              <div class="about-info-text">
                <strong>Travel & Accessibility</strong>
                <span>~30 mins transit from Boisar town center & Boisar Railway Station</span>
              </div>
            </div>

            <div class="about-info-row">
              <span class="about-info-icon">📞</span>
              <div class="about-info-text">
                <strong>Telephone Desk</strong>
                <a href="tel:08554998833" class="footer-ext-link" style="font-size:1rem;font-weight:700;">085549 98833</a>
              </div>
            </div>

            <div class="about-info-row">
              <span class="about-info-icon">🌐</span>
              <div class="about-info-text">
                <strong>Official Portal</strong>
                <a href="https://www.virajinternationalschool.com/" target="_blank" rel="noopener" class="footer-ext-link">
                  https://www.virajinternationalschool.com/ ↗
                </a>
              </div>
            </div>

            <div class="about-info-row">
              <span class="about-info-icon">🏫</span>
              <div class="about-info-text">
                <strong>Curriculum & Board</strong>
                <span>Central Board of Secondary Education (CBSE), New Delhi</span>
              </div>
            </div>

            <div style="margin-top:auto;padding-top:14px;">
              <a href="https://www.google.com/search?q=viraj+international+school+address&ludocid=6206948811688517609" target="_blank" rel="noopener" class="btn btn-sm btn-gold" style="width:100%;text-align:center;display:block;text-decoration:none;">
                🗺️ Open in Google Maps (Kurgaon Campus)
              </a>
            </div>
          </div>

          <!-- Working Hours & Live Status Card -->
          <div class="about-detail-card">
            <div class="about-card-title">
              <span>⏰</span>
              <span>Campus & Library Timings</span>
            </div>

            <div class="campus-status-pill ${statusClass}">
              <span class="status-dot-pulse"></span>
              <span>${statusMsg}</span>
            </div>

            <table class="timing-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Campus & Library Hours</th>
                </tr>
              </thead>
              <tbody>
                ${schedule.map(s => `
                  <tr class="${s.d === day ? 'today-row' : ''}">
                    <td>
                      ${s.name}
                      ${s.d === day ? '<span class="today-pill-tag">Today</span>' : ''}
                    </td>
                    <td>${s.hours}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div style="margin-top:16px;padding:12px;background:var(--bg-body);border-radius:var(--radius-sm);border:1px solid var(--border-color);font-size:0.82rem;line-height:1.45;color:var(--text-secondary);">
              <strong style="color:var(--navy-primary);display:block;margin-bottom:4px;">🌐 24/7 Digital Library Hub Access</strong>
              While the physical school campus observes official hours, this digital repository, reader, focus timer, and quizzes are accessible online 24 hours a day, 7 days a week.
            </div>
          </div>
        </div>

        <!-- Library Wings & Learning Ecosystem -->
        <div class="about-detail-card" style="margin-bottom:28px;">
          <div class="about-card-title">
            <span>📚</span>
            <span>Digital Library Hub Ecosystem</span>
          </div>
          <p style="color:var(--text-secondary);font-size:0.92rem;line-height:1.6;margin-bottom:16px;">
            The Viraj International School Digital Knowledge Hub provides a comprehensive multi-tier reading environment designed to foster curiosity, academic excellence, and independent critical thinking.
          </p>

          <div class="about-wings-grid">
            <div class="about-wing-box" onclick="go('junior')">
              <span class="about-wing-icon">🧸</span>
              <div class="about-wing-title">Junior Library Wing</div>
              <div class="about-wing-desc">Nursery rhymes, illustrated short stories, interactive flip-books, and bedtime audio for primary grades.</div>
            </div>

            <div class="about-wing-box" onclick="go('secondary')">
              <span class="about-wing-icon">📖</span>
              <div class="about-wing-title">Secondary Academic Wing</div>
              <div class="about-wing-desc">CBSE curriculum sciences, Goosebumps & horror thrillers, world literature classics, graphic novels, and visual encyclopedias.</div>
            </div>

            <div class="about-wing-box" onclick="go('biography')">
              <span class="about-wing-icon">👑</span>
              <div class="about-wing-title">Biographies & Great Minds</div>
              <div class="about-wing-desc">Inspiring stories of legendary scientists, inventors, Indian personalities, and global trailblazers.</div>
            </div>

            <div class="about-wing-box" onclick="go('quiz')">
              <span class="about-wing-icon">🧠</span>
              <div class="about-wing-title">Test Your Wits Arena</div>
              <div class="about-wing-desc">Dynamic multi-level quizzes across science, literature, and general knowledge with instant feedback and passport points.</div>
            </div>

            <div class="about-wing-box" onclick="go('news')">
              <span class="about-wing-icon">📰</span>
              <div class="about-wing-title">Daily Newspapers & Press</div>
              <div class="about-wing-desc">The Hindu (In School), Indian Express Explorer, Times NIE, and official Viraj campus circulars.</div>
            </div>

            <div class="about-wing-box" onclick="go('avid')">
              <span class="about-wing-icon">🏆</span>
              <div class="about-wing-title">Avid Reader Honors</div>
              <div class="about-wing-desc">Monthly gold podium celebrations for top campus and digital readers, inspiring peer excellence.</div>
            </div>
          </div>
        </div>

        <!-- Student Reading Passport & Ethics -->
        <div class="about-detail-card">
          <div class="about-card-title">
            <span>🛡️</span>
            <span>Digital Library Guidelines & Student Charter</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:16px;margin-top:8px;">
            <div>
              <h4 style="font-size:0.95rem;margin-bottom:6px;color:var(--navy-primary);">🎖️ Reading Passport Progression</h4>
              <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5;">
                Every active reading sprint, completed chapter, and quiz adds points to your official profile, elevating you through Bronze Scholar 🥉, Book Explorer 🥈, Master Scholar 🥇, and Grand Bibliophile 💎.
              </p>
            </div>

            <div>
              <h4 style="font-size:0.95rem;margin-bottom:6px;color:var(--navy-primary);">💡 Democratic Acquisitions</h4>
              <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5;">
                Students actively shape our collections by submitting purchase requests via the "Suggest a Book" desk and voting in bi-weekly book election polls.
              </p>
            </div>

            <div>
              <h4 style="font-size:0.95rem;margin-bottom:6px;color:var(--navy-primary);">🤝 Academic Integrity</h4>
              <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5;">
                All resources are curated for safe, age-appropriate learning in adherence to CBSE ethical standards and digital citizenship principles.
              </p>
            </div>
          </div>
        </div>

        <!-- Librarian Desk & Curatorial Staff Contact (Task 5 Marked Placeholder) -->
        <div class="about-detail-card" style="margin-top:24px;">
          <div class="about-card-title">
            <span>👩‍🏫</span>
            <span>Campus Librarian Desk & Curatorial Staff</span>
          </div>
          <div class="librarian-desk-card" style="display:flex;gap:18px;align-items:center;background:var(--bg-body);padding:20px;border-radius:var(--radius-md);border:1px solid var(--border-color);flex-wrap:wrap;">
            <div style="width:58px;height:58px;border-radius:50%;background:var(--gold-soft);color:var(--gold-primary);display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:700;flex-shrink:0;">
              📖
            </div>
            <div style="flex:1;min-width:240px;">
              <h4 style="font-size:1.1rem;color:var(--text-main);margin-bottom:4px;">
                [Librarian Desk: Mrs. / Mr. Academic Librarian Placeholder]
              </h4>
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px;">
                Head Librarian • Department of Knowledge & Information Resources, Viraj International School
              </p>
              <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:0.84rem;color:var(--text-secondary);">
                <span><strong>Email:</strong> <a href="mailto:library@virajinternationalschool.com" class="footer-ext-link">library@virajinternationalschool.com</a></span>
                <span><strong>Desk Phone:</strong> <a href="tel:08554998833" class="footer-ext-link">085549 98833 (Ext: 104)</a></span>
                <span><strong>Office:</strong> Ground Floor Academic Wing, Room L-102</span>
              </div>
            </div>
            <div>
              <button class="btn btn-sm btn-gold" onclick="go('suggest')">
                <i data-lucide="lightbulb" aria-hidden="true"></i> <span>Send Book Request</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;
  },

  // 13B. PRIVACY POLICY
  privacy() {
    return `
      <div class="policy-page-wrap" style="max-width:880px;margin:0 auto;padding:24px 16px 60px;">
        <div class="policy-header" style="margin-bottom:32px;border-bottom:1.5px solid var(--border-color);padding-bottom:20px;">
          <div class="policy-badge" style="display:inline-flex;align-items:center;gap:6px;font-size:0.8rem;font-weight:700;color:var(--gold-primary);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
            <i data-lucide="shield-check" aria-hidden="true"></i> Student Privacy & Trust
          </div>
          <h1 class="view-title" style="font-size:clamp(1.8rem, 3vw, 2.4rem);margin-bottom:8px;color:var(--text-main);">Digital Library Privacy Policy</h1>
          <p style="color:var(--text-muted);font-size:0.95rem;">Viraj International School • CBSE Kurgaon, Boisar • Effective Academic Year 2025–2026</p>
        </div>

        <div class="policy-content" style="display:flex;flex-direction:column;gap:24px;line-height:1.7;color:var(--text-secondary);font-size:0.95rem;">
          <section class="policy-card" style="background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:24px;">
            <h2 style="font-size:1.25rem;color:var(--navy-primary);margin-bottom:10px;">1. Scholastic Data Protection Commitment</h2>
            <p>Viraj International School is dedicated to providing a safe, advertisement-free, and privacy-first digital learning environment for all enrolled students, teachers, and parents. We do not sell, rent, or monetize student reading data, profile identifiers, or quiz history.</p>
          </section>

          <section class="policy-card" style="background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:24px;">
            <h2 style="font-size:1.25rem;color:var(--navy-primary);margin-bottom:10px;">2. Information We Collect</h2>
            <p>Our digital repository collects only minimal academic information necessary for library functions:</p>
            <ul style="margin-left:20px;margin-top:8px;display:flex;flex-direction:column;gap:6px;">
              <li><strong>Student Scholar Profiles:</strong> Name, class grade level, and chosen username for digital library card identification.</li>
              <li><strong>Reading Activity & Passports:</strong> Books read, chapters completed, bookmarks saved, and reading sprint minutes for earning academic merit badges.</li>
              <li><strong>Focus & Preference Data:</strong> Ambient study sound levels, font size adjustments, and color theme preferences stored locally on your device via browser LocalStorage.</li>
            </ul>
          </section>

          <section class="policy-card" style="background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:24px;">
            <h2 style="font-size:1.25rem;color:var(--navy-primary);margin-bottom:10px;">3. Cookies & Local Storage</h2>
            <p>This library platform uses zero third-party tracking or advertising cookies. Browser local storage is employed strictly for your convenience to remember your reading progress across sessions and maintain offline functionality.</p>
          </section>

          <section class="policy-card" style="background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:24px;">
            <h2 style="font-size:1.25rem;color:var(--navy-primary);margin-bottom:10px;">4. Parental & Guardian Rights</h2>
            <p>Parents and legal guardians may review their student's reading records, borrow history, or request profile removal at any time by contacting the Campus Library Desk.</p>
            <div style="margin-top:14px;">
              <button class="btn btn-gold btn-sm" onclick="go('about')">Contact Library Desk</button>
            </div>
          </section>
        </div>
      </div>`;
  },

  // 13C. TERMS OF USE
  terms() {
    return `
      <div class="policy-page-wrap" style="max-width:880px;margin:0 auto;padding:24px 16px 60px;">
        <div class="policy-header" style="margin-bottom:32px;border-bottom:1.5px solid var(--border-color);padding-bottom:20px;">
          <div class="policy-badge" style="display:inline-flex;align-items:center;gap:6px;font-size:0.8rem;font-weight:700;color:var(--gold-primary);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
            <i data-lucide="file-text" aria-hidden="true"></i> Academic Charter
          </div>
          <h1 class="view-title" style="font-size:clamp(1.8rem, 3vw, 2.4rem);margin-bottom:8px;color:var(--text-main);">Digital Library Terms of Use</h1>
          <p style="color:var(--text-muted);font-size:0.95rem;">Viraj International School • CBSE Kurgaon, Boisar • Student Digital Agreement</p>
        </div>

        <div class="policy-content" style="display:flex;flex-direction:column;gap:24px;line-height:1.7;color:var(--text-secondary);font-size:0.95rem;">
          <section class="policy-card" style="background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:24px;">
            <h2 style="font-size:1.25rem;color:var(--navy-primary);margin-bottom:10px;">1. Free Educational Access</h2>
            <p>All literature, reference guides, audio materials, and daily student press editions provided on the Viraj Digital Knowledge Hub are provided 100% free of charge to enrolled scholars for educational and personal enrichment.</p>
          </section>

          <section class="policy-card" style="background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:24px;">
            <h2 style="font-size:1.25rem;color:var(--navy-primary);margin-bottom:10px;">2. Digital Book Loans (14-Day Lending)</h2>
            <p>Students may check out books to their personal reading shelf under our official 14-day school loan system. Books automatically renew or may be returned anytime with one click to keep slots available for other scholars.</p>
          </section>

          <section class="policy-card" style="background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:24px;">
            <h2 style="font-size:1.25rem;color:var(--navy-primary);margin-bottom:10px;">3. Scholar Code of Conduct</h2>
            <p>Scholars are expected to uphold Viraj International School's values of integrity and excellence:</p>
            <ul style="margin-left:20px;margin-top:8px;display:flex;flex-direction:column;gap:6px;">
              <li>Use constructive and thoughtful language when submitting book suggestions.</li>
              <li>Respect fellow scholars during democratic voting elections for upcoming titles.</li>
              <li>Refrain from attempting to bypass site integrity or digital reader safeguards.</li>
            </ul>
          </section>

          <section class="policy-card" style="background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:24px;">
            <h2 style="font-size:1.25rem;color:var(--navy-primary);margin-bottom:10px;">4. Multi-Device Compatibility</h2>
            <p>Scholars may access this hub from desktop laptops, school computer labs, or personal tablets. Offline reading support is enabled through our Progressive Web App (PWA) service worker.</p>
          </section>
        </div>
      </div>`;
  },

  // 13D. ACADEMIC ETHICS
  ethics() {
    return `
      <div class="policy-page-wrap" style="max-width:880px;margin:0 auto;padding:24px 16px 60px;">
        <div class="policy-header" style="margin-bottom:32px;border-bottom:1.5px solid var(--border-color);padding-bottom:20px;">
          <div class="policy-badge" style="display:inline-flex;align-items:center;gap:6px;font-size:0.8rem;font-weight:700;color:var(--gold-primary);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
            <i data-lucide="award" aria-hidden="true"></i> Scholastic Integrity
          </div>
          <h1 class="view-title" style="font-size:clamp(1.8rem, 3vw, 2.4rem);margin-bottom:8px;color:var(--text-main);">Academic Ethics & Copyright Guidelines</h1>
          <p style="color:var(--text-muted);font-size:0.95rem;">Viraj International School • CBSE Academic Integrity & Anti-Plagiarism Charter</p>
        </div>

        <div class="policy-content" style="display:flex;flex-direction:column;gap:24px;line-height:1.7;color:var(--text-secondary);font-size:0.95rem;">
          <section class="policy-card" style="background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:24px;">
            <h2 style="font-size:1.25rem;color:var(--navy-primary);margin-bottom:10px;">1. Educational Fair Use & Copyright Compliance</h2>
            <p>Materials hosted in the Viraj Digital Library Hub are curated strictly for non-profit educational instruction under Indian Copyright Act Section 52 (Fair Dealing for Educational Purposes) and CBSE instructional guidelines. Commercial duplication or re-distribution is strictly prohibited.</p>
          </section>

          <section class="policy-card" style="background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:24px;">
            <h2 style="font-size:1.25rem;color:var(--navy-primary);margin-bottom:10px;">2. Anti-Plagiarism & Citation Etiquette</h2>
            <p>Scholars conducting science research, biography presentations, or literary essays are required to cite their sources accurately. Quotes and reference ideas derived from digital library volumes should always reference the book title, author, and edition.</p>
          </section>

          <section class="policy-card" style="background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:24px;">
            <h2 style="font-size:1.25rem;color:var(--navy-primary);margin-bottom:10px;">3. Responsible Digital Citizenship</h2>
            <p>Every student scholar represents Viraj International School. Digital literacy encompasses honesty, respectful communication, academic fairness in Quiz Arena competitions, and safeguarding personal login credentials.</p>
          </section>
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
              <img src="logo.png" alt="Viraj School Emblem" class="auth-crest-sm">
              <div>
                <h2 style="font-size:1.4rem;margin-bottom:2px;">Student & Scholar Registration</h2>
                <p style="color:var(--text-muted);font-size:0.85rem;">Join the Viraj International School Digital Knowledge Hub (CBSE Kurgaon)</p>
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
                <img src="logo.png" alt="Viraj School Emblem" class="auth-crest-lg">
                <h3 class="auth-banner-school">VIRAJ INTERNATIONAL SCHOOL</h3>
                <p class="auth-banner-tagline">CBSE School • Kurgaon, Boisar</p>
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
      return `
        <div style="text-align:center;padding:70px 20px;max-width:540px;margin:40px auto;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-lg);box-shadow:var(--shadow-md);">
          <div style="font-size:3rem;margin-bottom:12px;">🛡️</div>
          <h2 style="margin-bottom:8px;">Librarian Access Required</h2>
          <p style="color:var(--text-muted);margin-bottom:24px;">Please log in with your librarian account to add or manage books.</p>
          <button class="btn btn-gold btn-lg" onclick="go('auth', 'login')">🔑 Log In as Librarian</button>
        </div>`;
    }

    let stats = { books: 0, users: 0, pendingUsers: 0, quizAttempts: 0, suggestions: 0, votes: 0 };
    let pendingUsers = [];
    let allBooks = [];

    try {
      const res = await Promise.all([
        api('admin/stats').catch(e => { console.warn(e); return stats; }),
        api('pending').catch(e => { console.warn(e); return []; }),
        api('items').catch(e => { console.warn(e); return []; })
      ]);
      stats = res[0] || stats;
      pendingUsers = res[1] || [];
      allBooks = res[2] || [];
    } catch (err) {
      console.error('Admin view fetch error:', err);
    }

    return `
      <div class="admin-hub-container">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <h1 class="view-title" style="font-size:1.8rem;margin-bottom:4px;">🛡️ Librarian Dashboard</h1>
            <p style="color:var(--text-muted);font-size:0.9rem;">Manage library resources, user verification, quiz questions, and announcements.</p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-green" onclick="$('#zipImportPanel').hidden = !$('#zipImportPanel').hidden">📦 Auto-Import ZIP of PDFs</button>
            <button class="btn btn-gold" onclick="$('#addResourcePanel').hidden = !$('#addResourcePanel').hidden">➕ Add Single Resource</button>
            <button class="btn btn-ghost" onclick="$('#batchImportPanel').hidden = !$('#batchImportPanel').hidden">⚡ Batch Import Drive Links</button>
          </div>
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

        <!-- 📦 Smart ZIP Archive Auto-Importer & Classifier Panel -->
        <div id="zipImportPanel" class="admin-panel-card" hidden style="border-left:4px solid #3b82f6;background:linear-gradient(180deg, var(--bg-surface), var(--bg-secondary));">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:1.8rem;">📦</span>
              <div>
                <h3 style="margin:0;color:var(--blue-soft);">Smart ZIP Archive Importer & Auto-Sorter</h3>
                <small style="color:var(--text-muted);">Upload a .zip containing any number of PDF books. System automatically reads metadata, creates clean titles, sorts into wings & categories, and hosts files for 100% in-site reading.</small>
              </div>
            </div>
            <button class="btn btn-xs btn-ghost" onclick="$('#zipImportPanel').hidden = true">✕ Close</button>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
            <div class="form-group">
              <label class="form-label">Wing Assignment Strategy</label>
              <select id="zipDefaultSection" class="form-control">
                <option value="" selected>🤖 Smart Auto-Detect (Uses folder names, keywords & PDF metadata)</option>
                <option value="junior">🧸 Force Junior Library Wing</option>
                <option value="secondary">📚 Force Secondary Library Wing</option>
                <option value="biography">👑 Force Biographies Wing</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Student Access Rights</label>
              <input type="text" class="form-control" value="100% Free School Access • Librarian Permission" readonly style="opacity:0.85;">
            </div>
          </div>

          <div style="border:2px dashed var(--blue-soft);border-radius:var(--radius-lg);padding:28px 20px;text-align:center;background:rgba(59, 130, 246, 0.04);margin-bottom:18px;">
            <div style="font-size:3rem;margin-bottom:8px;">📁</div>
            <h4 style="margin-bottom:6px;">Select or Drop a .ZIP File with PDF Books</h4>
            <p style="color:var(--text-muted);font-size:0.88rem;max-width:540px;margin:0 auto 16px;">
              The system extracts all PDFs, reads page counts, auto-sorts by genre, and immediately adds them to library shelves for free student reading!
            </p>
            <input type="file" id="zipArchiveInput" accept=".zip,application/zip" style="display:none;">
            <button type="button" class="btn btn-blue btn-lg" id="btnSelectZip" onclick="$('#zipArchiveInput').click()">
              📦 Select ZIP File to Auto-Import
            </button>
            <div id="zipUploadProgress" style="margin-top:14px;font-weight:600;font-size:0.9rem;color:var(--blue-soft);" hidden>
              ⏳ Processing archive, reading PDF metadata & auto-sorting books... Please wait.
            </div>
          </div>

          <div id="zipImportResults" style="display:none;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:16px;"></div>
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
            <label class="form-label">File Attachment (PDF, MP3, Image from Computer)</label>
            <input id="admFile" type="file" class="form-control">
          </div>

          <div class="form-group">
            <label class="form-label">Or External / Google Drive Link (URL)</label>
            <input id="admLink" type="url" class="form-control" placeholder="https://drive.google.com/file/d/... or https://drive.google.com/drive/folders/...">
            <small style="color:var(--gold-primary);font-size:0.8rem;display:block;margin-top:4px;">
              🛡️ <strong>In-Site Reading Guarantee:</strong> Google Drive files and folders render 100% inside the website reader without redirecting students! For public student access, ensure Drive sharing is set to <em>"Anyone with the link can view"</em>.
            </small>
          </div>

          <button class="btn btn-gold btn-lg" id="saveResourceBtn">Save & Add to Library</button>
        </div>

        <!-- ⚡ Batch Drive Links & Books Importer -->
        <div id="batchImportPanel" class="admin-panel-card" hidden style="border-left:4px solid #10b981;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <h3 style="margin:0;color:#10b981;">⚡ Batch Import from Google Drive or PDF Links</h3>
            <button class="btn btn-xs btn-ghost" onclick="$('#batchImportPanel').hidden = true">✕ Close</button>
          </div>
          <p style="color:var(--text-secondary);font-size:0.88rem;margin-bottom:14px;line-height:1.5;">
            Import multiple books into the catalog at once. Simply paste a list of books with their Google Drive links (one per line).<br>
            <strong>Supported formats:</strong><br>
            • <code>Book Title | https://drive.google.com/file/d/... | Author Name | Category</code><br>
            • <code>Book Title - https://drive.google.com/file/d/...</code><br>
            • Or simply paste a list of Google Drive links directly!
          </p>

          <div style="background:var(--bg-card);border:1px dashed var(--accent-gold);border-radius:var(--radius-md);padding:14px 18px;margin-bottom:16px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
            <div>
              <strong style="color:var(--accent-gold);font-size:0.95rem;">📄 Have an Index / Catalog PDF with Links?</strong>
              <div style="font-size:0.82rem;color:var(--text-muted);margin-top:2px;">
                Upload your master PDF (e.g. folder index or collection list). We will automatically scan and extract all Google Drive links & titles directly into the import box below!
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <input type="file" id="batchPdfInput" accept=".pdf" style="display:none;">
              <button type="button" class="btn btn-sm btn-gold" id="uploadPdfBtn" onclick="$('#batchPdfInput').click()">📎 Select & Scan PDF</button>
              <span id="batchPdfStatus" style="font-size:0.82rem;font-weight:600;color:var(--text-secondary);"></span>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px;">
            <div class="form-group">
              <label class="form-label">Default Library Wing</label>
              <select id="batchSection" class="form-control">
                <option value="secondary" selected>Secondary Library Wing</option>
                <option value="junior">Junior Library Wing</option>
                <option value="biography">Biographies Wing</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Default Category</label>
              <input id="batchCategory" class="form-control" type="text" placeholder="e.g. Academics, World Literature, Science" value="General">
            </div>
            <div class="form-group">
              <label class="form-label">Default Grade</label>
              <input id="batchGrade" class="form-control" type="text" placeholder="e.g. Grades 6 - 10" value="All Grades">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Paste Book Titles & Drive Links (One entry per line)</label>
            <textarea id="batchText" class="form-control" style="min-height:140px;font-family:monospace;font-size:0.85rem;" placeholder="Physics Class 9 NCERT | https://drive.google.com/file/d/... | NCERT Press | Academics&#10;Goosebumps: Night of the Living Dummy | https://drive.google.com/file/d/... | R.L. Stine | Goosebumps & Horror&#10;Sherlock Holmes: A Study in Scarlet - https://drive.google.com/file/d/..."></textarea>
          </div>

          <div style="display:flex;gap:12px;align-items:center;">
            <button class="btn btn-green btn-lg" id="saveBatchBtn">⚡ Run Batch Import</button>
            <small style="color:var(--text-muted);">Books will be immediately visible across shelves, search, and reading passports.</small>
          </div>
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
      const userInp = $('#loginUser');
      if (userInp) {
        userInp.addEventListener('input', e => {
          const val = (e.target.value || '').trim().toLowerCase();
          if (['librarian', 'ankit', 'manasvi', 'admin'].some(k => val.startsWith(k))) {
            switchLoginRole('admin');
          }
        });
      }

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
          btn.innerHTML = $('#roleTabAdmin')?.classList.contains('active') ? 'Sign In to Librarian Hub 🛡️' : 'Sign In to Library Desk ➡️';
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
        const link = $('#admLink') ? $('#admLink').value.trim() : '';
        if (link) formData.append('link', link);
        if (fileInput && fileInput.files[0]) formData.append('file', fileInput.files[0]);

        await api('items', 'POST', formData);
        showToast('Resource added to library!', 'success');
        go('admin');
      } catch (err) {
        showToast(err.message, 'error');
      }
    };

    const zipArchiveInput = $('#zipArchiveInput');
    if (zipArchiveInput) {
      zipArchiveInput.onchange = async () => {
        const file = zipArchiveInput.files[0];
        if (!file) return;
        const progressEl = $('#zipUploadProgress');
        const resultsEl = $('#zipImportResults');
        const btnSelect = $('#btnSelectZip');
        const defaultSection = ($('#zipDefaultSection') || {}).value || '';

        try {
          if (progressEl) {
            progressEl.hidden = false;
            progressEl.textContent = `⏳ Uploading and processing "${file.name}"... Unpacking PDFs & auto-sorting genres...`;
          }
          if (btnSelect) btnSelect.disabled = true;

          const fd = new FormData();
          fd.append('zip', file);
          if (defaultSection) fd.append('default_section', defaultSection);

          const res = await api('admin/import-zip', 'POST', fd);

          if (resultsEl) {
            const wingsCount = { junior: 0, secondary: 0, biography: 0 };
            (res.items || []).forEach(b => {
              if (wingsCount[b.section] !== undefined) wingsCount[b.section]++;
            });

            resultsEl.style.display = 'block';
            resultsEl.innerHTML = `
              <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-color);padding-bottom:12px;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
                <div style="font-weight:700;color:var(--status-success);font-size:1.05rem;">
                  🎉 Successfully Auto-Imported & Sorted ${res.count} Books!
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  <span class="meta-chip">🧸 Junior: ${wingsCount.junior}</span>
                  <span class="meta-chip">📚 Secondary: ${wingsCount.secondary}</span>
                  <span class="meta-chip">👑 Biographies: ${wingsCount.biography}</span>
                </div>
              </div>
              <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px;">
                All books were extracted, assigned clean titles, categorized, and hosted on the school server. Students can read them 100% free with school library permission!
              </p>
              <div style="max-height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;font-size:0.82rem;">
                ${(res.items || []).map((b, i) => `
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg-secondary);border-radius:6px;">
                    <div>
                      <strong>${i + 1}. ${esc(b.title)}</strong>
                      <span style="color:var(--text-muted);margin-left:6px;">(${esc(b.pages)} pages • ${esc(b.read_time)})</span>
                    </div>
                    <span class="meta-chip">${esc(b.section.toUpperCase())} • ${esc(b.category)}</span>
                  </div>
                `).join('')}
              </div>
              <div style="margin-top:14px;text-align:right;">
                <button class="btn btn-sm btn-gold" onclick="go('admin')">Refresh Dashboard & Shelves</button>
              </div>
            `;
          }

          showToast(`Successfully extracted, sorted, and added ${res.count} books from ZIP! 📚`, 'success');
        } catch (err) {
          showToast(err.message || 'ZIP import failed', 'error');
          if (progressEl) progressEl.textContent = `❌ Error: ${err.message}`;
        } finally {
          if (btnSelect) btnSelect.disabled = false;
          zipArchiveInput.value = '';
        }
      };
    }

    const batchPdfInput = $('#batchPdfInput');
    if (batchPdfInput) {
      batchPdfInput.onchange = async () => {
        const file = batchPdfInput.files[0];
        if (!file) return;
        const statusEl = $('#batchPdfStatus');
        const uploadBtn = $('#uploadPdfBtn');
        try {
          if (statusEl) statusEl.textContent = '⏳ Scanning PDF and extracting book links...';
          if (uploadBtn) uploadBtn.disabled = true;

          const fd = new FormData();
          fd.append('pdf', file);
          const res = await api('admin/extract-pdf-links', 'POST', fd);

          if (!res.items || !res.items.length) {
            showToast('No hyperlinks or Drive links found inside this PDF.', 'info');
            if (statusEl) statusEl.textContent = '⚠️ No links found in file.';
            return;
          }

          const defaultCategory = $('#batchCategory').value.trim() || 'General';
          const lines = res.items.map(item => `${item.title} | ${item.url} | Viraj Educational Press | ${defaultCategory}`);
          const currentText = $('#batchText').value.trim();
          $('#batchText').value = (currentText ? currentText + '\n' : '') + lines.join('\n');

          showToast(`Extracted ${res.items.length} book links! Review the list below and click 'Run Batch Import'.`, 'success');
          if (statusEl) statusEl.textContent = `✅ Extracted ${res.items.length} books!`;
        } catch (err) {
          showToast(err.message, 'error');
          if (statusEl) statusEl.textContent = '❌ Extraction failed.';
        } finally {
          if (uploadBtn) uploadBtn.disabled = false;
          batchPdfInput.value = '';
        }
      };
    }

    const saveBatchBtn = $('#saveBatchBtn');
    if (saveBatchBtn) saveBatchBtn.onclick = async () => {
      try {
        const defaultSection = $('#batchSection').value;
        const defaultCategory = $('#batchCategory').value.trim() || 'General';
        const defaultGrade = $('#batchGrade').value.trim() || 'All Grades';
        const rawText = $('#batchText').value.trim();
        if (!rawText) throw new Error('Please paste your book links or title list.');

        const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
        const parsedItems = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          let title = '';
          let link = '';
          let author = 'Viraj Educational Press';
          let category = defaultCategory;

          if (line.includes('|')) {
            const parts = line.split('|').map(p => p.trim());
            title = parts[0];
            link = parts[1] || '';
            if (parts[2]) author = parts[2];
            if (parts[3]) category = parts[3];
          } else if (line.includes(' - http')) {
            const idx = line.indexOf(' - http');
            title = line.substring(0, idx).trim();
            link = line.substring(idx + 3).trim();
          } else if (line.startsWith('http://') || line.startsWith('https://')) {
            link = line;
            title = `Digital Resource #${i + 1}`;
          } else {
            title = line;
          }

          if (title) {
            parsedItems.push({
              section: defaultSection,
              category,
              title,
              author,
              grade: defaultGrade,
              read_time: '15 min read',
              content_type: 'book',
              link
            });
          }
        }

        if (!parsedItems.length) throw new Error('No valid books or links detected.');

        const res = await api('items/batch', 'POST', { items: parsedItems });
        showToast(`Successfully imported ${res.count} books & drive links into the library! 📚`, 'success');
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
  if (!user) {
    showToast('Please log in with your student account to submit book recommendations! 📚', 'info');
    go('auth', 'login');
    return;
  }
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
  if ($('#catalogCardsContainer')) {
    handleCatalogSearch(query);
    return;
  }
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

  // Micro-interaction: green pulse for correct, gentle shake for wrong
  const buttons = document.querySelectorAll('.quiz-opt-btn');
  const clickedBtn = buttons[idx];
  const correctBtn = buttons[curr.ans];

  if (clickedBtn) {
    if (isCorrect) {
      clickedBtn.classList.add('opt-correct');
      const rect = clickedBtn.getBoundingClientRect();
      launchConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    } else {
      clickedBtn.classList.add('opt-wrong');
      if (correctBtn) correctBtn.classList.add('opt-correct');
    }
  }

  showToast(isCorrect ? 'Correct! Well done! ⭐' : 'Not quite. Check the explanation! 💡', isCorrect ? 'success' : 'error');

  // Allow tactile micro-interaction (420ms) to complete before advancing state
  setTimeout(() => {
    go('quiz', qState.category);
  }, 420);
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

// =========================================================
// 🚀 MOTION ENGINE: PAGE STAGGER, PARALLAX & CONFETTI
// =========================================================

// Page load: fade and slide-up with 60-80ms (70ms) stagger
function applyPageStaggerEntrance() {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const targets = Array.from(document.querySelectorAll(
    '#app > * > section, #app > * > .catalog-main-layout, #app > * > .admin-panel-card, #app > * > .passport-banner, #app .shelf-section, #app .hero-search-card, #app .passport-tier-progress-card'
  )).slice(0, 10);

  if (!targets.length) return;

  if (window.gsap && typeof gsap.fromTo === 'function') {
    gsap.fromTo(targets, 
      { opacity: 0, y: 16 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.36, 
        stagger: 0.07, // 70ms within 60-80ms specification
        ease: 'power2.out',
        clearProps: 'transform,opacity'
      }
    );
  } else {
    // Pure CSS fallback
    targets.forEach((el, idx) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 0.35s ease-out, transform 0.35s ease-out';
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, idx * 70);
    });
  }
}

// Very subtle parallax on bookshelf rows (throttled with requestAnimationFrame)
let parallaxActive = false;
function initShelfParallax() {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  if (parallaxActive) return;
  parallaxActive = true;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const shelves = document.querySelectorAll('.wooden-shelf');
        if (!shelves.length) {
          ticking = false;
          return;
        }
        const vh = window.innerHeight || 800;
        shelves.forEach(shelf => {
          const rect = shelf.getBoundingClientRect();
          if (rect.top < vh + 100 && rect.bottom > -100) {
            const centerOffset = (rect.top + rect.height / 2) - (vh / 2);
            // Subtle shift clamped to ±5px
            const offset = Math.max(-5, Math.min(5, -centerOffset * 0.015));
            shelf.style.transform = `translateY(${offset.toFixed(1)}px)`;
          }
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// Short celebratory canvas confetti burst (zero external dependencies)
function launchConfettiBurst(originX, originY) {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-burst-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const startX = (originX && originX > 0) ? originX : window.innerWidth / 2;
  const startY = (originY && originY > 0) ? originY : window.innerHeight / 2;

  // School scholastic theme colors (Gold, Navy, Crimson, Emerald, Amber)
  const colors = ['#D4AF37', '#1E3A8A', '#DC2626', '#16A34A', '#F59E0B', '#3B82F6', '#8B5CF6'];
  const particleCount = 42;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
    const speed = 4 + Math.random() * 7;
    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3.5, // Initial upward burst
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 5 + Math.random() * 5,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      gravity: 0.22,
      drag: 0.96
    });
  }

  const startTime = performance.now();
  const duration = 1200; // 1.2s short celebration

  function frame(currentTime) {
    const elapsed = currentTime - startTime;
    if (elapsed > duration) {
      if (canvas.parentNode) canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach(p => {
      p.vx *= p.drag;
      p.vy = (p.vy + p.gravity) * p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.opacity = Math.max(0, 1 - (elapsed / duration));

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

// Reading Passport Badge Interaction Handler
function handlePassportBadgeClick(event, title, earned, req) {
  if (event) event.stopPropagation();
  if (earned) {
    const x = event ? event.clientX : window.innerWidth / 2;
    const y = event ? event.clientY : window.innerHeight / 2;
    launchConfettiBurst(x, y);
    showToast(`Badge Unlocked: ${title}! ⭐ Verified on Passport.`, 'success');
  } else {
    showToast(`Locked Milestone: ${req}`, 'info');
  }
}

// Global Window Function Hooks
window.go = go;
window.openItem = openItem;
window.handleBookAction = handleBookAction;
window.rentBook = rentBook;
window.returnRental = returnRental;
window.toggleReaderTheater = toggleReaderTheater;
window.switchFolderView = switchFolderView;
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

// Task 3 Book Browsing & Catalog Hooks
window.handleCatalogSearch = handleCatalogSearch;
window.clearCatalogSearch = clearCatalogSearch;
window.setCatalogSort = setCatalogSort;
window.setCatalogWing = setCatalogWing;
window.setCatalogCategory = setCatalogCategory;
window.setCatalogGrade = setCatalogGrade;
window.setCatalogAvailability = setCatalogAvailability;
window.resetCatalogFilters = resetCatalogFilters;
window.loadMoreCatalogBooks = loadMoreCatalogBooks;
window.toggleCatalogFilterDrawer = toggleCatalogFilterDrawer;
window.retryCatalogFetch = retryCatalogFetch;
window.openBookDetail = openBookDetail;
window.closeBookDetail = closeBookDetail;
window.toggleCardOverlay = toggleCardOverlay;

// Task 4 Motion Hooks
window.applyPageStaggerEntrance = applyPageStaggerEntrance;
window.initShelfParallax = initShelfParallax;
window.launchConfettiBurst = launchConfettiBurst;
window.handlePassportBadgeClick = handlePassportBadgeClick;
window.initBookDetail3D = initBookDetail3D;
window.init3DCardTilt = init3DCardTilt;

// Start App
boot();
