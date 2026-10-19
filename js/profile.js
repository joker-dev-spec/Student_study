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

// Shared with dashboard: prompt-based exam date setter
App.__setExam = function () {
  const cur = App.getExamDate();
  const val = prompt('Enter your exam date (YYYY-MM-DD). Leave blank to clear:', cur || '');
  if (val === null) return;
  const trimmed = val.trim();
  if (trimmed && !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    alert('Please use the format YYYY-MM-DD, e.g. 2026-06-15');
    return;
  }
  App.setExamDate(trimmed);
  window.location.reload();
};
