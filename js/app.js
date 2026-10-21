/* =============================================
   Science BrainBox - App Utilities
   Shared functions: auth, theme, navigation,
   classes/levels, timetable, reminders, streaks
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

  // ---- CLASSES / LEVELS ----
  classes: [
    { id: 'jss1', name: 'JSS1', level: 'junior', dept: 'Junior Secondary' },
    { id: 'jss2', name: 'JSS2', level: 'junior', dept: 'Junior Secondary' },
    { id: 'jss3', name: 'JSS3', level: 'junior', dept: 'Junior Secondary' },
    { id: 'ss1', name: 'SS1', level: 'senior', dept: 'Science' },
    { id: 'ss2', name: 'SS2', level: 'senior', dept: 'Science' },
    { id: 'ss3', name: 'SS3', level: 'senior', dept: 'Science' }
  ],
  getClass(id) { return this.classes.find(c => c.id === id); },
  getLevel() { const u = this.getUser(); return (u && u.level) ? u.level : 'senior'; },
  getClassLabel() {
    const u = this.getUser();
    if (!u) return '';
    const c = this.getClass(u.classId);
    return u.className || (c ? c.name : '');
  },

  // ---- SUBJECT CATALOGUES ----
  seniorSubjects: [
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
  juniorSubjects: [
    { id: 'mathematics', name: 'Mathematics', icon: '📐', color: '#2563eb', path: 'Subjects/mathematics.html' },
    { id: 'english', name: 'English Studies', icon: '📖', color: '#db2777', path: 'Subjects/english.html' },
    { id: 'basic-science', name: 'Basic Science', icon: '🔬', color: '#059669', path: 'Subjects/basic-science.html' },
    { id: 'basic-technology', name: 'Basic Technology', icon: '⚙️', color: '#0891b2', path: 'Subjects/basic-technology.html' },
    { id: 'computer-science', name: 'Computer Studies', icon: '💻', color: '#4f46e5', path: 'Subjects/computer-science.html' },
    { id: 'civic-education', name: 'Civic Education', icon: '🏛️', color: '#ea580c', path: 'Subjects/civic-education.html' },
    { id: 'business-studies', name: 'Business Studies', icon: '💼', color: '#ca8a04', path: 'Subjects/business-studies.html' },
    { id: 'agricultural-science', name: 'Agricultural Science', icon: '🌾', color: '#16a34a', path: 'Subjects/agricultural-science.html' },
    { id: 'social-studies', name: 'Social Studies', icon: '🌍', color: '#7c3aed', path: 'Subjects/social-studies.html' }
  ],
  getSubjects() {
    return this.getLevel() === 'junior' ? this.juniorSubjects : this.seniorSubjects;
  },
  getSubject(id) {
    return this.getSubjects().find(s => s.id === id) ||
           this.seniorSubjects.find(s => s.id === id) ||
           this.juniorSubjects.find(s => s.id === id);
  },
  // First subject for the user's level (used for "Notes" nav link)
  firstSubject() {
    const subs = this.getSubjects();
    return subs.length ? subs[0] : { id: 'physics', path: 'Subjects/physics.html' };
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
    this.touchStreak();
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

  resetProgress() {
    ['sb_progress', 'sb_quiz_history', 'sb_daily', 'sb_bookmarks', 'sb_streak'].forEach(k => localStorage.removeItem(k));
  },

  // ---- STUDY STREAK ----
  touchStreak() {
    const today = new Date().toDateString();
    let s = null;
    try { s = JSON.parse(localStorage.getItem('sb_streak')); } catch { s = null; }
    if (!s || typeof s !== 'object') s = { count: 0, last: null, best: 0 };
    if (s.last === today) return s.count;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    s.count = (s.last === yesterday) ? s.count + 1 : 1;
    s.last = today;
    s.best = Math.max(s.best || 0, s.count);
    localStorage.setItem('sb_streak', JSON.stringify(s));
    return s.count;
  },
  getStreak() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem('sb_streak')); } catch { s = null; }
    if (!s || typeof s !== 'object') return { count: 0, best: 0 };
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (s.last !== today && s.last !== yesterday) s.count = 0;
    return s;
  },

  // ---- EXAM COUNTDOWN ----
  getExamDate() { return localStorage.getItem('sb_exam_date') || ''; },
  setExamDate(d) { d ? localStorage.setItem('sb_exam_date', d) : localStorage.removeItem('sb_exam_date'); },
  daysToExam() {
    const d = this.getExamDate();
    if (!d) return null;
    const exam = new Date(d + 'T00:00:00');
    if (isNaN(exam.getTime())) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.ceil((exam - today) / 86400000);
  },

  // Prompt-based exam date setter (used by dashboard + profile)
  __setExam() {
    const cur = this.getExamDate();
    const val = prompt('Enter your exam date (YYYY-MM-DD). Leave blank to clear:', cur || '');
    if (val === null) return;
    const trimmed = val.trim();
    if (trimmed) {
      const ok = /^\d{4}-\d{2}-\d{2}$/.test(trimmed) && !isNaN(new Date(trimmed + 'T00:00:00').getTime());
      if (!ok) {
        alert('Please enter a valid date in YYYY-MM-DD format, e.g. 2026-06-15');
        return;
      }
    }
    this.setExamDate(trimmed);
    window.location.reload();
  },

  // ---- MOTIVATION ----
  quotes: [
    'Success is the sum of small efforts repeated day in and day out.',
    'The secret of getting ahead is getting started.',
    'Don\u2019t wish it were easier, wish you were better.',
    'Study hard what interests you the most, in the most undisciplined, irreverent way possible.',
    'An investment in knowledge pays the best interest.',
    'The expert in anything was once a beginner.',
    'Push yourself, because no one else is going to do it for you.',
    'Great things never come from comfort zones.'
  ],
  getDailyQuote() {
    return this.quotes[Math.floor(Date.now() / 86400000) % this.quotes.length];
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

  // ---- TIMETABLES (level-aware) ----
  timetables: {
    senior: {
      '8:00–9:00':   { Mon: 'Mathematics', Tue: 'Chemistry', Wed: 'Biology', Thu: 'Physics', Fri: 'Mathematics' },
      '9:00–10:00':  { Mon: 'Physics', Tue: 'Mathematics', Wed: 'English', Thu: 'Chemistry', Fri: 'Biology' },
      '10:00–11:00': { Mon: 'Chemistry', Tue: 'Biology', Wed: 'Physics', Thu: 'Mathematics', Fri: 'Computer Sci.' },
      '11:00–12:00': { Mon: 'Biology', Tue: 'Further Maths', Wed: 'Geography', Thu: 'English', Fri: 'Physics' },
      '12:00–1:00':  { Mon: 'English', Tue: 'Computer Sci.', Wed: 'Civic Education', Thu: 'Further Maths', Fri: 'Chemistry' },
      '2:00–3:00':   { Mon: 'Geography', Tue: 'English', Wed: 'Mathematics', Thu: 'Computer Sci.', Fri: 'Geography' },
      '3:00–4:00':   { Mon: 'Civic Education', Tue: 'Geography', Wed: 'Further Maths', Thu: 'Biology', Fri: 'Civic Education' }
    },
    junior: {
      '8:00–9:00':   { Mon: 'Mathematics', Tue: 'Basic Science', Wed: 'English', Thu: 'Basic Technology', Fri: 'Mathematics' },
      '9:00–10:00':  { Mon: 'English', Tue: 'Mathematics', Wed: 'Basic Science', Thu: 'English', Fri: 'Basic Science' },
      '10:00–11:00': { Mon: 'Basic Science', Tue: 'Computer Studies', Wed: 'Social Studies', Thu: 'Mathematics', Fri: 'Business Studies' },
      '11:00–12:00': { Mon: 'Basic Technology', Tue: 'Business Studies', Wed: 'Agricultural Sci.', Thu: 'Civic Education', Fri: 'Computer Studies' },
      '12:00–1:00':  { Mon: 'Social Studies', Tue: 'English', Wed: 'Computer Studies', Thu: 'Basic Science', Fri: 'Agricultural Sci.' },
      '2:00–3:00':   { Mon: 'Civic Education', Tue: 'Agricultural Sci.', Wed: 'Business Studies', Thu: 'Social Studies', Fri: 'Civic Education' },
      '3:00–4:00':   { Mon: 'Business Studies', Tue: 'Social Studies', Wed: 'Civic Education', Thu: 'Business Studies', Fri: 'Social Studies' }
    }
  },
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  subjectIcons: {
    'Mathematics': '📐', 'Further Maths': '📊', 'English': '📖', 'Physics': '⚛️',
    'Chemistry': '🧪', 'Biology': '🔬', 'Computer Sci.': '💻', 'Computer Studies': '💻',
    'Geography': '🌍', 'Civic Education': '🏛️', 'Basic Science': '🔬', 'Basic Technology': '⚙️',
    'Business Studies': '💼', 'Agricultural Sci.': '🌾', 'Social Studies': '🌍'
  },
  getTimetable() { return this.timetables[this.getLevel()] || this.timetables.senior; },
  todayIndex() { return (new Date().getDay() + 6) % 7; },
  todayName() { return this.days[this.todayIndex()] || ''; },
  slotTo24(slot) {
    const start = slot.split('–')[0].trim();
    let h = parseInt(start.split(':')[0], 10);
    const m = parseInt(start.split(':')[1] || '0', 10);
    if (h < 8) h += 12; // afternoon slots (2,3)
    return { h, m };
  },
  // Next upcoming class for today (or null)
  nextClassToday() {
    const tt = this.getTimetable();
    const day = this.todayName();
    if (!day) return null;
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    for (const slot of Object.keys(tt)) {
      const { h, m } = this.slotTo24(slot);
      const start = h * 60 + m;
      if (start >= nowMin) return { subject: tt[slot][day.slice(0, 3)], slot: slot, day: day };
    }
    return null;
  },

  // ---- TIMETABLE REMINDERS ----
  getReminders() {
    try { return JSON.parse(localStorage.getItem('sb_reminders')) || []; } catch { return []; }
  },
  saveReminders(list) { localStorage.setItem('sb_reminders', JSON.stringify(list)); },
  reminderId(day, slot, subject) { return (day + '-' + slot + '-' + subject).replace(/\s+/g, '_'); },
  hasReminder(day, slot, subject) {
    return this.getReminders().some(r => r.id === this.reminderId(day, slot, subject));
  },
  addReminder(day, slot, subject) {
    const list = this.getReminders();
    const id = this.reminderId(day, slot, subject);
    if (list.some(r => r.id === id)) return;
    list.push({ id, day, slot, subject });
    this.saveReminders(list);
  },
  removeReminder(id) {
    this.saveReminders(this.getReminders().filter(r => r.id !== id));
  },
  async requestNotify() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    try { return (await Notification.requestPermission()) === 'granted'; } catch { return false; }
  },
  // Called on every page. Fires due reminders once per day.
  checkReminders() {
    const reminders = this.getReminders();
    if (!reminders.length) return;
    const day = this.todayName();
    if (!day) return;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const today = now.toDateString();
    const firedKey = 'sb_reminders_fired';
    let fired = {};
    try { fired = JSON.parse(localStorage.getItem(firedKey)) || {}; } catch { fired = {}; }
    let changed = false;
    reminders.forEach(r => {
      if (r.day !== day) return;
      const { h, m } = this.slotTo24(r.slot);
      const start = h * 60 + m;
      // fire from 5 min before the class until 10 min after it starts
      if (nowMin >= start - 5 && nowMin <= start + 10) {
        const key = r.id + '@' + today;
        if (!fired[key]) {
          this.notify('⏰ Class Reminder', (r.subject) + ' starts at ' + r.slot.split('–')[0].trim() + ' (' + r.day + ')');
          fired[key] = true; changed = true;
        }
      }
    });
    if (changed) localStorage.setItem(firedKey, JSON.stringify(fired));
  },
  notify(title, body) {
    this.toast('⏰ ' + body);
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: body, icon: '' });
      }
    } catch (e) { /* ignore */ }
  },
  toast(msg) {
    let el = document.getElementById('appToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'appToast';
      el.className = 'app-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 6000);
  },

  // ---- DAILY CHALLENGE ----
  getDailyChallenge() {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('sb_daily');
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d && d.date === today && d.question) return d;
      } catch { /* corrupted — regenerate */ }
    }
    const allQs = [];
    const data = window.SCIENCE_DATA || {};
    const myIds = this.getSubjects().map(s => s.id);
    for (const key in data) {
      if (!data[key] || !data[key].questions) continue;
      if (myIds.length && !myIds.includes(key)) continue;
      data[key].questions.forEach(q => allQs.push({ ...q, subject: data[key].subject || key }));
    }
    if (allQs.length === 0) {
      for (const key in data) {
        if (data[key] && data[key].questions) {
          data[key].questions.forEach(q => allQs.push({ ...q, subject: data[key].subject || key }));
        }
      }
    }
    if (allQs.length === 0) return null;
    const idx = Math.floor(Date.now() / 86400000) % allQs.length;
    const challenge = { date: today, question: allQs[idx] };
    localStorage.setItem('sb_daily', JSON.stringify(challenge));
    return challenge;
  },

  // ---- DATA LOADING ----
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
    const notesPath = this.firstSubject().path;
    topbar.innerHTML = `
      <div class="topbar-inner">
        <a href="${b}dashboard.html" class="logo">
          <span class="icon">🧠</span>
          <span>Science<span class="highlight">BrainBox</span></span>
        </a>
        <ul class="nav-links" id="navLinks">
          <li><a href="${b}dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a></li>
          <li><a href="${b}${notesPath}" class="${activePage === 'notes' ? 'active' : ''}">Notes</a></li>
          <li><a href="${b}lab/index.html" class="${activePage === 'lab' ? 'active' : ''}">Lab</a></li>
          <li><a href="${b}quiz.html" class="${activePage === 'quiz' ? 'active' : ''}">Quiz</a></li>
          <li><a href="${b}tools/index.html" class="${activePage === 'tools' ? 'active' : ''}">Tools</a></li>
          <li><a href="${b}profile.html" class="${activePage === 'profile' ? 'active' : ''}">Profile</a></li>
        </ul>
        <div style="display:flex;align-items:center;gap:8px">
          <button class="theme-toggle" id="searchOpen" title="Search questions, notes and formulas">🔍</button>
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
    const notesPath = this.firstSubject().path;
    mnav.innerHTML = `
      <ul>
        <li><a href="${b}dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}"><span class="mn-icon">🏠</span>Home</a></li>
        <li><a href="${b}${notesPath}" class="${activePage === 'notes' ? 'active' : ''}"><span class="mn-icon">📚</span>Notes</a></li>
        <li><a href="${b}quiz.html" class="${activePage === 'quiz' ? 'active' : ''}"><span class="mn-icon">📝</span>Quiz</a></li>
        <li><a href="${b}lab/index.html" class="${activePage === 'lab' ? 'active' : ''}"><span class="mn-icon">🔬</span>Lab</a></li>
        <li><a href="${b}tools/index.html" class="${activePage === 'tools' ? 'active' : ''}"><span class="mn-icon">🛠️</span>Tools</a></li>
      </ul>`;
  },

  renderFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return;
    const b = this.basePrefix();
    const user = this.getUser();
    const label = user ? ' · ' + this.getClassLabel() : '';
    footer.innerHTML = `
      <p>🧠 Science BrainBox &copy; ${new Date().getFullYear()} — Built for Secondary School &amp; Exam Preparation${label}</p>
      <div class="footer-links">
        <a href="${b}dashboard.html">Dashboard</a>
        <a href="${b}quiz.html">Quiz</a>
        <a href="${b}lab/index.html">Lab Corner</a>
        <a href="${b}tools/index.html">Study Tools</a>
        <a href="${b}profile.html">Profile</a>
      </div>
      <div class="footer-copy" style="margin-top:10px;font-size:.8rem;opacity:.85">
        Presented by KOLAWOLE ALABA WISDOM · © ${new Date().getFullYear()} All rights reserved.
      </div>`;
  },

  // ---- INIT PAGE ----
  initPage(activePage) {
    this.renderTopbar(activePage);
    this.renderMobileNav(activePage);
    this.renderFooter();
    this.checkReminders();
    if (!this._reminderInterval) {
      this._reminderInterval = setInterval(() => this.checkReminders(), 30000);
    }
    this.initPWA();
  },

  // ---- PWA (manifest + service worker) ----
  initPWA() {
    const b = this.basePrefix();
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = b + 'manifest.json';
      document.head.appendChild(link);
    }
    if (!document.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#1a73e8';
      document.head.appendChild(meta);
    }
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register(b + 'sw.js').catch(() => { /* ignore */ });
    }
  }
};

// Theme toggle global handler
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'themeToggle') App.toggleTheme();
});

// Auto-init theme on any page
App.initTheme();
