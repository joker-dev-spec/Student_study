/* =============================================
   SS2 Science BrainBox - App Utilities
   Shared functions: auth, theme, navigation
   ============================================= */

const App = {
  // ---- AUTH ----
  getUser() {
    try { return JSON.parse(localStorage.getItem('sb_user')); } catch { return null; }
  },
  setUser(user) { localStorage.setItem('sb_user', JSON.stringify(user)); },
  clearUser() { localStorage.removeItem('sb_user'); },
  requireAuth() {
    const u = this.getUser();
    if (!u) { window.location.href = this.basePrefix() + 'index.html'; return null; }
    return u;
  },

  // ---- THEME ----
  getTheme() { return localStorage.getItem('sb_theme') || 'light'; },
  setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('sb_theme', t);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = t === 'dark' ? '☀️' : '🌙';
  },
  toggleTheme() {
    this.setTheme(this.getTheme() === 'dark' ? 'light' : 'dark');
  },
  initTheme() { this.setTheme(this.getTheme()); },

  // ---- PROGRESS STORAGE ----
  getProgress() {
    try { return JSON.parse(localStorage.getItem('sb_progress')) || {}; } catch { return {}; }
  },
  saveProgress(p) { localStorage.setItem('sb_progress', JSON.stringify(p)); },

  getQuizHistory() {
    try { return JSON.parse(localStorage.getItem('sb_quiz_history')) || []; } catch { return []; }
  },
  addQuizResult(subject, score, total, weakTopics) {
    const h = this.getQuizHistory();
    h.push({ subject, score, total, pct: Math.round(score / total * 100), weakTopics, date: new Date().toISOString() });
    localStorage.setItem('sb_quiz_history', JSON.stringify(h));
    const prog = this.getProgress();
    if (!prog[subject]) prog[subject] = { attempts: 0, best: 0, totalCorrect: 0, totalAnswered: 0, topicScores: {} };
    const p = prog[subject];
    p.attempts++;
    p.totalCorrect += score;
    p.totalAnswered += total;
    p.best = Math.max(p.best, Math.round(score / total * 100));
    p.lastScore = Math.round(score / total * 100);
    p.lastDate = new Date().toISOString();
    this.saveProgress(prog);
  },

  getSubjectPct(subject) {
    const p = this.getProgress();
    if (!p[subject]) return 0;
    return p[subject].best || 0;
  },

  getWeakTopics() {
    const p = this.getProgress();
    const weak = [];
    for (const subj in p) {
      const ts = p[subj].topicScores || {};
      for (const t in ts) {
        const s = ts[t];
        if (s.answered > 0 && (s.correct / s.answered) < 0.5) {
          weak.push({ subject: subj, topic: t, pct: Math.round(s.correct / s.answered * 100) });
        }
      }
    }
    return weak.sort((a, b) => a.pct - b.pct).slice(0, 8);
  },

  recordTopicScore(subject, topic, correct, total) {
    const p = this.getProgress();
    if (!p[subject]) p[subject] = { attempts: 0, best: 0, totalCorrect: 0, totalAnswered: 0, topicScores: {} };
    if (!p[subject].topicScores) p[subject].topicScores = {};
    if (!p[subject].topicScores[topic]) p[subject].topicScores[topic] = { correct: 0, answered: 0 };
    p[subject].topicScores[topic].correct += correct;
    p[subject].topicScores[topic].answered += total;
    this.saveProgress(p);
  },

  // ---- BOOKMARKS ----
  getBookmarks() {
    try { return JSON.parse(localStorage.getItem('sb_bookmarks')) || []; } catch { return []; }
  },
  addBookmark(bm) {
    const list = this.getBookmarks();
    if (!list.find(x => x.id === bm.id)) {
      list.push({ ...bm, saved: new Date().toISOString() });
      localStorage.setItem('sb_bookmarks', JSON.stringify(list));
    }
  },
  removeBookmark(id) {
    let list = this.getBookmarks();
    list = list.filter(x => x.id !== id);
    localStorage.setItem('sb_bookmarks', JSON.stringify(list));
  },
  hasBookmark(id) { return this.getBookmarks().some(x => x.id === id); },

  // ---- DAILY CHALLENGE ----
  getDailyChallenge() {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('sb_daily');
    if (saved) {
      const d = JSON.parse(saved);
      if (d.date === today) return d;
    }
    // Generate new daily challenge
    const allQs = [];
    const data = window.SCIENCE_DATA || {};
    for (const key in data) {
      if (data[key] && data[key].questions) {
        data[key].questions.forEach(q => allQs.push({ ...q, subject: data[key].subject || key }));
      }
    }
    if (allQs.length === 0) return null;
    const idx = Math.floor(Date.now() / 86400000) % allQs.length;
    const challenge = { date: today, question: allQs[idx] };
    localStorage.setItem('sb_daily', JSON.stringify(challenge));
    return challenge;
  },

  // ---- SUBJECT INFO ----
  subjects: [
    { id: 'mathematics', name: 'Mathematics', icon: '📐', color: '#2563eb', path: 'Subjects/mathematics.html' },
    { id: 'further-mathematics', name: 'Further Mathematics', icon: '📊', color: '#7c3aed', path: 'Subjects/further-mathematics.html' },
    { id: 'english', name: 'English', icon: '📖', color: '#db2777', path: 'Subjects/english.html' },
    { id: 'physics', name: 'Physics', icon: '⚛️', color: '#0891b2', path: 'Subjects/physics.html' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: '#059669', path: 'Subjects/chemistry.html' },
    { id: 'biology', name: 'Biology', icon: '🔬', color: '#16a34a', path: 'Subjects/biology.html' },
    { id: 'computer-science', name: 'Computer Science', icon: '💻', color: '#4f46e5', path: 'Subjects/computer-science.html' },
    { id: 'geography', name: 'Geography', icon: '🌍', color: '#ca8a04', path: 'Subjects/geography.html' },
    { id: 'civic-education', name: 'Civic Education', icon: '🏛️', color: '#ea580c', path: 'Subjects/civic-education.html' }
  ],

  getSubject(id) { return this.subjects.find(s => s.id === id); },

  // ---- DATA LOADING ----
  // Prefer fetching the live /data/*.json files (works on GitHub Pages and
  // any local HTTP server). Fall back to the embedded copy in js/data.js so
  // the app also works when opened directly via file://.
  async loadSubjectData(subjectId) {
    try {
      const res = await fetch(this.basePrefix() + 'data/' + subjectId + '.json', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        window.SCIENCE_DATA = window.SCIENCE_DATA || {};
        window.SCIENCE_DATA[subjectId] = data;
        return data;
      }
    } catch (e) { /* file:// or offline — use embedded data */ }
    return (window.SCIENCE_DATA || {})[subjectId] || null;
  },

  // ---- RENDER HELPERS ----
  renderProgressRing(pct, size = 58) {
    const r = (size - 6) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (pct / 100) * c;
    const color = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--primary)';
    return `<div class="progress-ring" style="width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}">
        <circle class="bg-ring" cx="${size/2}" cy="${size/2}" r="${r}"/>
        <circle class="fg-ring" cx="${size/2}" cy="${size/2}" r="${r}"
          style="stroke:${color}" stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
      </svg>
      <div class="ring-text">${pct}%</div>
    </div>`;
  },

  formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  },

  // ---- BASE PATH (handles nested folders: root, Subjects/, lab/, tools/) ----
  basePrefix() {
    const scripts = document.querySelectorAll('script[src]');
    for (const s of scripts) {
      const src = s.getAttribute('src') || '';
      const idx = src.indexOf('js/app.js');
      if (idx !== -1) return src.substring(0, idx);
    }
    return '';
  },

  // ---- NAV ----
  initNav() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
      document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) navLinks.classList.remove('open');
      });
    }
  },

  // ---- TOP BAR ----
  renderTopbar(activePage) {
    const user = this.getUser();
    const topbar = document.getElementById('topbar');
    if (!topbar) return;
    const b = this.basePrefix();
    topbar.innerHTML = `
      <div class="topbar-inner">
        <a href="${b}dashboard.html" class="logo">
          <span class="icon">🧠</span>
          <span>Science<span class="highlight">BrainBox</span></span>
        </a>
        <ul class="nav-links" id="navLinks">
          <li><a href="${b}dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a></li>
          <li><a href="${b}Subjects/physics.html" class="${activePage === 'notes' ? 'active' : ''}">Notes</a></li>
          <li><a href="${b}lab/index.html" class="${activePage === 'lab' ? 'active' : ''}">Lab</a></li>
          <li><a href="${b}quiz.html" class="${activePage === 'quiz' ? 'active' : ''}">Quiz</a></li>
          <li><a href="${b}tools/index.html" class="${activePage === 'tools' ? 'active' : ''}">Tools</a></li>
        </ul>
        <div style="display:flex;align-items:center;gap:8px">
          <button class="theme-toggle" id="themeToggle" title="Toggle dark mode">🌙</button>
          ${user ? `<button class="btn btn-secondary btn-sm" onclick="App.clearUser();window.location.href='${b}index.html'" title="Logout">🚪</button>` : ''}
          <button class="hamburger" id="hamburger">☰</button>
        </div>
      </div>`;
    this.initTheme();
    this.initNav();
  },

  renderMobileNav(activePage) {
    const mnav = document.getElementById('mobileNav');
    if (!mnav) return;
    const b = this.basePrefix();
    mnav.innerHTML = `
      <ul>
        <li><a href="${b}dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}"><span class="mn-icon">🏠</span>Home</a></li>
        <li><a href="${b}Subjects/physics.html" class="${activePage === 'notes' ? 'active' : ''}"><span class="mn-icon">📚</span>Notes</a></li>
        <li><a href="${b}quiz.html" class="${activePage === 'quiz' ? 'active' : ''}"><span class="mn-icon">📝</span>Quiz</a></li>
        <li><a href="${b}lab/index.html" class="${activePage === 'lab' ? 'active' : ''}"><span class="mn-icon">🔬</span>Lab</a></li>
        <li><a href="${b}tools/index.html" class="${activePage === 'tools' ? 'active' : ''}"><span class="mn-icon">🛠️</span>Tools</a></li>
      </ul>`;
  },

  renderFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return;
    const b = this.basePrefix();
    footer.innerHTML = `
      <p>🧠 SS2 Science BrainBox &copy; ${new Date().getFullYear()} — Built for WAEC & 3rd Term Preparation</p>
      <div class="footer-links">
        <a href="${b}dashboard.html">Dashboard</a>
        <a href="${b}quiz.html">Quiz</a>
        <a href="${b}lab/index.html">Lab Corner</a>
        <a href="${b}tools/index.html">Study Tools</a>
      </div>`;
  },

  // ---- INIT PAGE ----
  initPage(activePage) {
    this.renderTopbar(activePage);
    this.renderMobileNav(activePage);
    this.renderFooter();
  }
};

// Theme toggle global handler
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'themeToggle') App.toggleTheme();
});

// Auto-init theme on any page
App.initTheme();
