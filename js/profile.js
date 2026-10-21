/* Profile page logic */

(function () {
  const user = App.requireAuth();
  if (!user) return;
  App.initPage('profile');

  document.getElementById('pfAvatar').textContent = user.level === 'junior' ? '🎒' : '🎓';
  document.getElementById('pfName').textContent = user.name;
  document.getElementById('pfMeta').textContent = user.school;
  document.getElementById('pfLevel').textContent =
    App.getClassLabel() + ' · ' + (user.department || '') +
    (user.loginTime ? ' · joined ' + new Date(user.loginTime).toLocaleDateString() : '');

  const history = App.getQuizHistory();
  const total = history.length;
  const avg = total ? Math.round(history.reduce((s, h) => s + h.pct, 0) / total) : 0;
  document.getElementById('pfQuizzes').textContent = total;
  document.getElementById('pfAvg').textContent = avg + '%';
  document.getElementById('pfStreak').textContent = App.getStreak().count;

  // Best subject
  const prog = App.getProgress();
  let best = null;
  for (const id in prog) {
    const pct = prog[id].best || 0;
    if (!best || pct > best.pct) best = { id, pct };
  }
  document.getElementById('pfBest').textContent = best ? (App.getSubject(best.id) ? App.getSubject(best.id).name.split(' ')[0] : best.id) : '—';

  // Progress list
  const list = document.getElementById('pfProgress');
  const subjects = App.getSubjects();
  let any = false;
  subjects.forEach(sub => {
    const p = prog[sub.id];
    if (!p) return;
    any = true;
    const pct = p.best || 0;
    const li = document.createElement('li');
    li.innerHTML = `<span>${sub.icon} ${sub.name}</span> <span class="score">${pct}% · ${p.attempts} attempt${p.attempts !== 1 ? 's' : ''}</span>`;
    list.appendChild(li);
  });
  if (!any) list.innerHTML = '<li class="empty-msg">No quiz data yet. Take a quiz to see your progress!</li>';

  // Export
  document.getElementById('pfExport').addEventListener('click', () => {
    const data = {
      user: App.getUser(),
      progress: App.getProgress(),
      history: App.getQuizHistory(),
      bookmarks: App.getBookmarks(),
      reminders: App.getReminders(),
      streak: App.getStreak(),
      examDate: App.getExamDate(),
      exported: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'science-brainbox-' + (user.name || 'student').replace(/\s+/g, '-').toLowerCase() + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
    App.toast('⬇️ Data exported');
  });

  // Import (merges into existing data)
  document.getElementById('pfImport').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let data;
      try { data = JSON.parse(reader.result); } catch {
        App.toast('⚠️ That file is not valid JSON.');
        return;
      }
      if (!data || typeof data !== 'object') {
        App.toast('⚠️ Unrecognised backup format.');
        return;
      }
      if (!confirm('Import data from "' + file.name + '"? Existing data will be merged.')) return;

      if (data.user && data.user.name) App.setUser(data.user);

      if (data.progress && typeof data.progress === 'object') {
        const prog = App.getProgress();
        for (const id in data.progress) {
          const incoming = data.progress[id];
          if (!prog[id] || (incoming.best || 0) > (prog[id].best || 0)) prog[id] = incoming;
        }
        App.saveProgress(prog);
      }

      if (Array.isArray(data.history)) {
        const h = App.getQuizHistory();
        localStorage.setItem('sb_quiz_history', JSON.stringify(h.concat(data.history)));
      }

      if (Array.isArray(data.bookmarks)) {
        const bms = App.getBookmarks();
        data.bookmarks.forEach(bm => {
          if (bm && bm.id && !bms.some(x => x.id === bm.id)) bms.push(bm);
        });
        localStorage.setItem('sb_bookmarks', JSON.stringify(bms));
      }

      if (Array.isArray(data.reminders)) {
        const rms = App.getReminders();
        data.reminders.forEach(r => {
          if (r && r.id && !rms.some(x => x.id === r.id)) rms.push(r);
        });
        App.saveReminders(rms);
      }

      if (data.streak && typeof data.streak === 'object') {
        const cur = App.getStreak();
        localStorage.setItem('sb_streak', JSON.stringify({
          count: Math.max(cur.count || 0, data.streak.count || 0),
          best: Math.max(cur.best || 0, data.streak.best || 0),
          last: data.streak.last || cur.last || null
        }));
      }

      if (typeof data.examDate === 'string') App.setExamDate(data.examDate);

      App.toast('✅ Data imported successfully');
      setTimeout(() => window.location.reload(), 700);
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Reset
  document.getElementById('pfReset').addEventListener('click', () => {
    if (confirm('This will erase all your quiz scores, bookmarks and streak. Continue?')) {
      App.resetProgress();
      App.toast('🗑️ Progress reset');
      setTimeout(() => window.location.reload(), 600);
    }
  });

  // Logout
  document.getElementById('pfLogout').addEventListener('click', () => {
    App.clearUser();
    window.location.href = 'index.html';
  });
})();
