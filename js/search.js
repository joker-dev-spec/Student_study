/* Global search — questions, flashcards, formulas and subjects */

const SBSearch = {
  index: null,
  overlay: null,

  base() { return App.basePrefix(); },

  async buildIndex() {
    if (this.index) return this.index;
    const items = [];
    const data = window.SCIENCE_DATA || {};

    // Ensure every subject's data is available (fetch missing ones)
    const subjectIds = [...new Set([
      ...App.seniorSubjects.map(s => s.id),
      ...App.juniorSubjects.map(s => s.id)
    ])];
    await Promise.all(subjectIds.map(id => App.loadSubjectData(id)));
    if (!data.flashcards) await App.loadSubjectData('flashcards');
    if (!data.formulas) await App.loadSubjectData('formulas');

    const all = window.SCIENCE_DATA || {};
    for (const key in all) {
      const entry = all[key];
      if (!entry) continue;

      if (entry.questions) {
        entry.questions.forEach(q => items.push({
          type: 'question',
          title: q.question,
          meta: (entry.subject || key) + ' · ' + q.topic + ' · ' + q.difficulty,
          icon: (App.getSubject(key) || {}).icon || '📝',
          text: (q.question + ' ' + q.options.join(' ') + ' ' + q.topic + ' ' + q.explanation).toLowerCase(),
          href: this.base() + 'quiz.html?subject=' + key
        }));
      }
      if (entry.cards) {
        entry.cards.forEach(c => items.push({
          type: 'flashcard',
          title: c.front,
          meta: 'Flashcard · ' + c.subject,
          icon: '🃏',
          text: (c.front + ' ' + c.back + ' ' + c.subject).toLowerCase(),
          href: this.base() + 'tools/flashcards.html'
        }));
      }
      if (entry.formulas) {
        entry.formulas.forEach(f => items.push({
          type: 'formula',
          title: f.name + ' — ' + f.formula,
          meta: 'Formula · ' + f.subject + ' · ' + f.category,
          icon: '∑',
          text: (f.name + ' ' + f.formula + ' ' + f.subject + ' ' + f.category).toLowerCase(),
          href: this.base() + 'lab/formula-sheet.html'
        }));
      }
    }

    // Subject pages
    const seen = new Set();
    App.getSubjects().concat(App.getLevel() === 'junior' ? App.seniorSubjects : App.juniorSubjects)
      .forEach(s => {
        if (seen.has(s.id)) return;
        seen.add(s.id);
        items.push({
          type: 'subject',
          title: s.name + ' — Notes',
          meta: 'Subject notes',
          icon: s.icon,
          text: (s.name + ' notes').toLowerCase(),
          href: this.base() + s.path
        });
      });

    this.index = items;
    return items;
  },

  query(q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return this.index
      .map(it => {
        let score = 0;
        for (const t of terms) {
          if (it.title.toLowerCase().includes(t)) score += 3;
          if (it.text.includes(t)) score += 1;
        }
        return { it, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
      .map(r => r.it);
  },

  esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  async open() {
    if (!this.overlay) this.buildOverlay();
    this.overlay.classList.add('show');
    const input = document.getElementById('searchInput');
    input.value = '';
    input.focus();
    const results = document.getElementById('searchResults');
    results.innerHTML = '<div class="search-hint">Type to search questions, flashcards, formulas and notes…</div>';
    await this.buildIndex();
  },

  close() {
    if (this.overlay) this.overlay.classList.remove('show');
  },

  buildOverlay() {
    const ov = document.createElement('div');
    ov.className = 'search-overlay';
    ov.id = 'searchOverlay';
    ov.innerHTML = `
      <div class="search-panel">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input type="text" id="searchInput" placeholder="Search anything… e.g. logarithm, F = ma, cell" autocomplete="off">
          <button class="btn btn-secondary btn-sm" id="searchClose">✕</button>
        </div>
        <div class="search-results" id="searchResults"></div>
      </div>`;
    document.body.appendChild(ov);
    this.overlay = ov;

    const input = document.getElementById('searchInput');
    let t = null;
    input.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => this.run(input.value), 150);
    });
    document.getElementById('searchClose').addEventListener('click', () => this.close());
    ov.addEventListener('click', (e) => { if (e.target === ov) this.close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.open();
      }
    });
  },

  run(q) {
    const results = document.getElementById('searchResults');
    if (!this.index) {
      results.innerHTML = '<div class="search-hint">Loading search index…</div>';
      return;
    }
    const items = this.query(q);
    if (!q.trim()) {
      results.innerHTML = '<div class="search-hint">Type to search questions, flashcards, formulas and notes…</div>';
      return;
    }
    if (!items.length) {
      results.innerHTML = '<div class="search-hint">No results for “' + this.esc(q) + '”</div>';
      return;
    }
    results.innerHTML = items.map(it => {
      const title = it.title.length > 110 ? it.title.slice(0, 110) + '…' : it.title;
      return `
      <a class="search-result" href="${this.esc(it.href)}">
        <span class="sr-icon">${it.icon}</span>
        <span class="sr-body">
          <span class="sr-title">${this.esc(title)}</span>
          <span class="sr-meta">${this.esc(it.meta)}</span>
        </span>
        <span class="sr-type">${it.type}</span>
      </a>`;
    }).join('');
  }
};

// Wire up the 🔍 button (topbar is rendered by App.initPage)
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'searchOpen') SBSearch.open();
});
