const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'books', 'data');
const outDir = path.join(__dirname, '..', 'public', 'books');
const upDir = path.join(__dirname, '..', 'uploads');

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(upDir, { recursive: true });

const bookIds = [
  'deep-trouble',
  'ghost-beach',
  'go-eat-worms',
  'monster-blood-2',
  'one-day-at-horrorland'
];

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

bookIds.forEach(id => {
  const jsonPath = path.join(dataDir, `${id}.json`);
  if (!fs.existsSync(jsonPath)) {
    console.warn('Missing data file:', jsonPath);
    return;
  }

  const book = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Generate complete self-contained HTML reader
  const html = `<!DOCTYPE html>
<html lang="en" data-theme="sepia">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(book.full_title)} — Viraj Digital Library Reader</title>
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Creepster&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,600&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --font-body: 'Lora', Georgia, serif;
      --font-ui: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-title: 'Cinzel', serif;
      --font-spooky: 'Creepster', cursive;
      --base-size: 19px;
      --line-height: 1.8;
      
      /* Theme: Sepia (Default) */
      --bg: #f7f2e7;
      --surface: #ede5d5;
      --surface-border: #d8cbbb;
      --text: #2c251e;
      --text-muted: #706354;
      --accent: #8b3a0f;
      --accent-glow: rgba(139, 58, 15, 0.15);
      --highlight: #2e7d32;
    }

    [data-theme="light"] {
      --bg: #ffffff;
      --surface: #f4f6fa;
      --surface-border: #e2e8f0;
      --text: #1e293b;
      --text-muted: #64748b;
      --accent: #0f2b5c;
      --accent-glow: rgba(15, 43, 92, 0.12);
      --highlight: #d97706;
    }

    [data-theme="dark"] {
      --bg: #12151c;
      --surface: #1a1f2c;
      --surface-border: #2a3245;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
      --accent: #f59e0b;
      --accent-glow: rgba(245, 158, 11, 0.15);
      --highlight: #10b981;
    }

    [data-theme="goosebumps"] {
      --bg: #0b0f0e;
      --surface: #131a17;
      --surface-border: #1f3328;
      --text: #dcfce7;
      --text-muted: #86efac;
      --accent: #22c55e;
      --accent-glow: rgba(34, 197, 94, 0.25);
      --highlight: #a855f7;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      font-size: var(--base-size);
      line-height: var(--line-height);
      transition: background 0.25s ease, color 0.25s ease;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Fixed Reader Top Bar */
    .reader-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--surface);
      border-bottom: 1px solid var(--surface-border);
      backdrop-filter: blur(10px);
      padding: 10px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-family: var(--font-ui);
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--bg);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      color: var(--text);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
    }
    .back-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .header-book-meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .header-book-title {
      font-size: 0.95rem;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--text);
    }
    .header-book-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .control-btn, .ch-select, .theme-select {
      background: var(--bg);
      border: 1px solid var(--surface-border);
      color: var(--text);
      padding: 6px 10px;
      border-radius: 8px;
      font-family: var(--font-ui);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.2s ease;
    }
    .control-btn:hover, .ch-select:hover, .theme-select:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .audio-btn.is-playing {
      background: var(--accent);
      color: #ffffff;
      border-color: var(--accent);
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 var(--accent-glow); }
      70% { box-shadow: 0 0 0 8px transparent; }
      100% { box-shadow: 0 0 0 0 transparent; }
    }

    /* Reading Progress Bar */
    .progress-bar-wrap {
      position: sticky;
      top: 57px;
      z-index: 99;
      height: 4px;
      width: 100%;
      background: var(--surface-border);
    }
    .progress-bar-fill {
      height: 100%;
      background: var(--accent);
      width: 0%;
      transition: width 0.2s ease;
    }

    /* Main Reading Article Container */
    .reader-container {
      max-width: 760px;
      margin: 0 auto;
      padding: 36px 22px 90px;
      flex: 1;
      width: 100%;
    }

    /* Hero Book Cover & Info */
    .book-front-hero {
      text-align: center;
      margin-bottom: 48px;
      padding-bottom: 36px;
      border-bottom: 2px dashed var(--surface-border);
    }
    .book-cover-img {
      max-width: 260px;
      width: 100%;
      border-radius: 12px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.22);
      margin: 0 auto 20px;
      display: block;
      transition: transform 0.3s ease;
    }
    .book-cover-img:hover {
      transform: scale(1.02);
    }
    .book-badge-series {
      font-family: var(--font-ui);
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 8px;
      display: inline-block;
    }
    .book-main-title {
      font-family: var(--font-title);
      font-size: 2.2rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 8px;
      color: var(--text);
    }
    .book-tagline {
      font-style: italic;
      color: var(--text-muted);
      font-size: 1.1rem;
      margin-bottom: 16px;
    }
    .book-metadata-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-bottom: 20px;
      font-family: var(--font-ui);
      font-size: 0.78rem;
    }
    .meta-pill {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      padding: 4px 12px;
      border-radius: 100px;
      font-weight: 600;
    }
    .book-summary-box {
      background: var(--surface);
      border-left: 4px solid var(--accent);
      padding: 16px 20px;
      border-radius: 8px;
      text-align: left;
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--text);
      margin-top: 18px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }

    /* Chapter Presentation */
    .chapter-section {
      margin-bottom: 60px;
      display: none;
    }
    .chapter-section.is-active {
      display: block;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .chapter-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--surface-border);
    }
    .chapter-num-badge {
      font-family: var(--font-ui);
      font-size: 0.85rem;
      font-weight: 800;
      color: var(--accent);
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 4px;
      display: block;
    }
    .chapter-title {
      font-family: var(--font-title);
      font-size: 1.8rem;
      font-weight: 700;
    }

    .chapter-body p {
      margin-bottom: 1.4em;
      text-align: justify;
      hyphens: auto;
    }

    .chapter-body p:first-of-type::first-letter {
      font-size: 3.2em;
      float: left;
      line-height: 0.85;
      margin-right: 0.12em;
      font-family: var(--font-title);
      color: var(--accent);
      font-weight: 700;
    }

    /* Chapter Navigation Bottom Footer */
    .chapter-nav-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid var(--surface-border);
      font-family: var(--font-ui);
    }
    .nav-ch-btn {
      padding: 10px 18px;
      background: var(--surface);
      border: 1px solid var(--surface-border);
      color: var(--text);
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }
    .nav-ch-btn:hover:not(:disabled) {
      background: var(--accent);
      color: #ffffff;
      border-color: var(--accent);
    }
    .nav-ch-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
      .header-book-sub, .hide-mobile { display: none; }
      .reader-container { padding: 20px 16px 60px; }
      .book-main-title { font-size: 1.7rem; }
      .chapter-title { font-size: 1.4rem; }
    }
  </style>
</head>
<body>

  <!-- Top Sticky Header Bar -->
  <header class="reader-header">
    <div class="header-left">
      <button class="back-btn" onclick="window.location.href='/'">
        <span>←</span> <span class="hide-mobile">Library Hub</span>
      </button>
      <div class="header-book-meta">
        <div class="header-book-title">${escapeHtml(book.full_title)}</div>
        <div class="header-book-sub">By ${escapeHtml(book.author)} • Viraj Digital E-Book</div>
      </div>
    </div>

    <div class="header-controls">
      <!-- Chapter Dropdown -->
      <select id="chapterSelect" class="ch-select" onchange="jumpToChapter(parseInt(this.value))">
        ${book.chapters.map(c => `
          <option value="${c.chapter}">Chapter ${c.chapter}</option>`).join('')}
      </select>

      <!-- Audio Read-Aloud -->
      <button class="control-btn audio-btn" id="audioBtn" onclick="toggleAudio()" title="Listen to Chapter Read Aloud">
        <span id="audioIcon">🔊</span> <span class="hide-mobile" id="audioLabel">Listen</span>
      </button>

      <!-- Font Size Controls -->
      <button class="control-btn" onclick="adjustFont(-1)" title="Decrease font size">A-</button>
      <button class="control-btn" onclick="adjustFont(1)" title="Increase font size">A+</button>

      <!-- Reading Theme -->
      <select id="themeSelect" class="theme-select" onchange="setTheme(this.value)" title="Choose reading theme">
        <option value="sepia">📜 Sepia</option>
        <option value="light">☀️ Light</option>
        <option value="dark">🌙 Dark</option>
        <option value="goosebumps">🧪 Goosebumps</option>
      </select>

      <!-- Fullscreen Toggle -->
      <button class="control-btn hide-mobile" onclick="toggleFullscreen()" title="Toggle Fullscreen Reading">
        ⛶ Fullscreen
      </button>
    </div>
  </header>

  <!-- Progress Bar -->
  <div class="progress-bar-wrap">
    <div class="progress-bar-fill" id="progressBar"></div>
  </div>

  <!-- Reader Body -->
  <main class="reader-container">
    
    <!-- Hero Header / Cover -->
    <div class="book-front-hero">
      <img src="${book.cover}" alt="${escapeHtml(book.title)} Cover" class="book-cover-img">
      <div class="book-badge-series">GOOSEBUMPS SERIES • BOOK #${book.number}</div>
      <h1 class="book-main-title">${escapeHtml(book.title)}</h1>
      <p class="book-tagline">“${escapeHtml(book.tagline)}”</p>
      
      <div class="book-metadata-pills">
        <span class="meta-pill">✍️ ${escapeHtml(book.author)}</span>
        <span class="meta-pill">📅 ${book.year}</span>
        <span class="meta-pill">⏱️ ${book.read_time}</span>
        <span class="meta-pill">📖 ${book.total_chapters} Full Chapters</span>
        <span class="meta-pill">🎓 ${book.grade}</span>
      </div>

      <div class="book-summary-box">
        <strong>Book Overview:</strong><br>
        ${escapeHtml(book.summary)}
      </div>
    </div>

    <!-- Chapters Container -->
    <div id="chaptersContainer">
      ${book.chapters.map(c => `
        <article class="chapter-section ${c.chapter === 1 ? 'is-active' : ''}" id="ch-${c.chapter}" data-chapter="${c.chapter}">
          <div class="chapter-header">
            <span class="chapter-num-badge">Goosebumps #${book.number}</span>
            <h2 class="chapter-title">Chapter ${c.chapter}</h2>
          </div>
          <div class="chapter-body">
            ${c.text.split('\n\n').filter(p => p.trim()).map(p => `<p>${escapeHtml(p.trim())}</p>`).join('')}
          </div>
          
          <div class="chapter-nav-row">
            <button class="nav-ch-btn" onclick="jumpToChapter(${c.chapter - 1})" ${c.chapter === 1 ? 'disabled' : ''}>
              ← Previous Chapter
            </button>
            <span style="font-weight:600;font-size:0.85rem;color:var(--text-muted);">Chapter ${c.chapter} of ${book.total_chapters}</span>
            <button class="nav-ch-btn" onclick="jumpToChapter(${c.chapter + 1})" ${c.chapter === book.total_chapters ? 'disabled' : ''}>
              Next Chapter →
            </button>
          </div>
        </article>`).join('')}
    </div>

  </main>

  <script>
    const bookId = '${book.id}';
    const totalChapters = ${book.total_chapters};
    let currentChapter = 1;
    let synth = window.speechSynthesis;
    let utterance = null;
    let isSpeaking = false;

    // Load saved chapter or bookmark
    try {
      const saved = localStorage.getItem('gb_ch_' + bookId);
      if (saved && parseInt(saved) >= 1 && parseInt(saved) <= totalChapters) {
        currentChapter = parseInt(saved);
      }
    } catch(e) {}

    function updateView() {
      document.querySelectorAll('.chapter-section').forEach(sec => {
        const ch = parseInt(sec.dataset.chapter);
        sec.classList.toggle('is-active', ch === currentChapter);
      });

      const select = document.getElementById('chapterSelect');
      if (select) select.value = currentChapter;

      // Update progress bar
      const pct = Math.round((currentChapter / totalChapters) * 100);
      const bar = document.getElementById('progressBar');
      if (bar) bar.style.width = pct + '%';

      // Save position
      try {
        localStorage.setItem('gb_ch_' + bookId, currentChapter);
      } catch(e) {}

      // Scroll to chapter top smoothly
      const activeSec = document.getElementById('ch-' + currentChapter);
      if (activeSec) {
        const top = activeSec.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }

      // Stop speech if chapter changed
      if (isSpeaking) stopAudio();
    }

    function jumpToChapter(ch) {
      if (ch < 1 || ch > totalChapters) return;
      currentChapter = ch;
      updateView();
    }

    // Font Sizing
    let currentFontSize = 19;
    function adjustFont(delta) {
      currentFontSize = Math.min(28, Math.max(15, currentFontSize + delta));
      document.documentElement.style.setProperty('--base-size', currentFontSize + 'px');
      try { localStorage.setItem('gb_font_size', currentFontSize); } catch(e) {}
    }

    // Theme Management
    function setTheme(th) {
      document.documentElement.setAttribute('data-theme', th);
      try { localStorage.setItem('gb_reader_theme', th); } catch(e) {}
    }

    // Speech synthesis Audio Read-Aloud
    function toggleAudio() {
      if (isSpeaking) {
        stopAudio();
      } else {
        startAudio();
      }
    }

    function startAudio() {
      if (!synth) {
        alert('Speech audio is not supported in this browser.');
        return;
      }
      stopAudio();

      const activeSec = document.getElementById('ch-' + currentChapter);
      if (!activeSec) return;

      const bodyText = activeSec.querySelector('.chapter-body').innerText;
      utterance = new SpeechSynthesisUtterance("Chapter " + currentChapter + ". " + bodyText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        isSpeaking = false;
        updateAudioButtonUI();
        if (currentChapter < totalChapters) {
          jumpToChapter(currentChapter + 1);
          setTimeout(startAudio, 600);
        }
      };

      utterance.onerror = () => {
        isSpeaking = false;
        updateAudioButtonUI();
      };

      synth.speak(utterance);
      isSpeaking = true;
      updateAudioButtonUI();
    }

    function stopAudio() {
      if (synth) synth.cancel();
      isSpeaking = false;
      updateAudioButtonUI();
    }

    function updateAudioButtonUI() {
      const btn = document.getElementById('audioBtn');
      const icon = document.getElementById('audioIcon');
      const lbl = document.getElementById('audioLabel');
      if (!btn) return;
      btn.classList.toggle('is-playing', isSpeaking);
      if (icon) icon.textContent = isSpeaking ? '⏸️' : '🔊';
      if (lbl) lbl.textContent = isSpeaking ? 'Pause' : 'Listen';
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      }
    }

    // Keyboard Shortcuts (Arrow keys for chapters)
    window.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === 'ArrowRight' && currentChapter < totalChapters) {
        jumpToChapter(currentChapter + 1);
      } else if (e.key === 'ArrowLeft' && currentChapter > 1) {
        jumpToChapter(currentChapter - 1);
      }
    });

    // Restore user preferences
    try {
      const savedTheme = localStorage.getItem('gb_reader_theme') || 'sepia';
      setTheme(savedTheme);
      document.getElementById('themeSelect').value = savedTheme;

      const savedSize = localStorage.getItem('gb_font_size');
      if (savedSize) {
        currentFontSize = parseInt(savedSize);
        document.documentElement.style.setProperty('--base-size', currentFontSize + 'px');
      }
    } catch(e) {}

    // Initial render
    updateView();
  </script>
</body>
</html>`;

  const pubHtmlPath = path.join(outDir, `${id}.html`);
  const upHtmlPath = path.join(upDir, `${id}.html`);
  fs.writeFileSync(pubHtmlPath, html, 'utf8');
  fs.writeFileSync(upHtmlPath, html, 'utf8');
  console.log(`Generated reader: ${pubHtmlPath} (${html.length} bytes)`);
});

console.log('All 5 reader HTML files generated successfully!');
