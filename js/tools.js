/* Study Tools: Timetable, Pomodoro, Flashcards, Bookmarks */

// ============================
// TIMETABLE
// ============================
function initTimetable() {
  App.initPage('tools');
  const days = App.days;
  const tt = App.getTimetable();
  const times = Object.keys(tt);
  const todayName = App.todayName();
  const table = document.getElementById('timetableTable');
  if (!table) return;

  const subjectIcons = App.subjectIcons;

  function renderTable() {
    let html = '<thead><tr><th>Time</th>';
    days.forEach(d => {
      html += `<th class="${d === todayName ? 'today-col' : ''}">${d}</th>`;
    });
    html += '</tr></thead><tbody>';

    times.forEach(t => {
      html += `<tr><td style="font-weight:700;background:var(--bg-input)">${t}</td>`;
      days.forEach(d => {
        const s = tt[t][d.slice(0, 3)];
        const icon = subjectIcons[s] || '📘';
        const on = App.hasReminder(d, t, s);
        html += `<td class="subject-cell ${d === todayName ? 'today-col' : ''}">
          <span class="cell-subject">${icon} ${s}</span>
          <button class="remind-btn ${on ? 'on' : ''}" title="${on ? 'Reminder on' : 'Remind me'}"
            onclick="window.__toggleReminder('${d}','${t}','${s}')">${on ? '🔔' : '🔕'}</button>
        </td>`;
      });
      html += '</tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
    renderReminderList();
  }

  function renderReminderList() {
    const listEl = document.getElementById('reminderList');
    if (!listEl) return;
    const list = App.getReminders();
    if (!list.length) {
      listEl.innerHTML = '<div class="alert show alert-warning">🔕 No reminders yet. Click the bell next to any class to get a notification before it starts.</div>';
      return;
    }
    listEl.innerHTML = list.map(r => `
      <div class="bookmark-item">
        <div class="bm-info">
          <h4>${subjectIcons[r.subject] || '📘'} ${r.subject}</h4>
          <p>${r.day} · ${r.slot}</p>
        </div>
        <div class="bm-actions">
          <button class="btn btn-sm btn-danger" onclick="window.__toggleReminder('${r.day}','${r.slot}','${r.subject}')">🗑️ Remove</button>
        </div>
      </div>`).join('');
  }

  window.__toggleReminder = function (day, slot, subject) {
    if (App.hasReminder(day, slot, subject)) {
      App.removeReminder(App.reminderId(day, slot, subject));
    } else {
      App.addReminder(day, slot, subject);
      App.requestNotify();
      App.toast('🔔 Reminder set for ' + subject + ' on ' + day + ' at ' + slot.split('–')[0].trim());
    }
    renderTable();
  };

  const notifyBtn = document.getElementById('enableNotify');
  if (notifyBtn) {
    notifyBtn.addEventListener('click', async () => {
      const ok = await App.requestNotify();
      App.toast(ok ? '✅ Notifications enabled' : '⚠️ Notifications blocked — reminders will still show in-app.');
    });
  }

  renderTable();
}

// ============================
// POMODORO
// ============================
function initPomodoro() {
  App.initPage('tools');
  let totalSeconds = 25 * 60;
  let remaining = totalSeconds;
  let isRunning = false;
  let interval = null;
  let mode = 'work'; // work, short, long

  // Daily session counter — stored as { date, count }, resets each day
  function loadSessions() {
    try {
      const s = JSON.parse(localStorage.getItem('sb_pomodoro_sessions'));
      if (s && s.date === new Date().toDateString()) return s.count || 0;
    } catch { /* corrupted */ }
    return 0;
  }
  function saveSessions(count) {
    localStorage.setItem('sb_pomodoro_sessions', JSON.stringify({ date: new Date().toDateString(), count }));
  }
  let sessions = loadSessions();

  const display = document.getElementById('pomDisplay');
  const modeLabel = document.getElementById('pomMode');
  const sessionsEl = document.getElementById('pomSessions');
  const startBtn = document.getElementById('pomStart');
  const resetBtn = document.getElementById('pomReset');

  function updateDisplay() {
    display.textContent = App.formatTime(remaining);
    sessionsEl.innerHTML = 'Completed sessions today: <span>' + sessions + '</span>';
    const pct = ((totalSeconds - remaining) / totalSeconds) * 100;
    document.getElementById('pomProgress').style.width = pct + '%';
  }

  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    startBtn.textContent = '⏸ Pause';
    startBtn.className = 'btn btn-secondary btn-lg';
    interval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(interval);
        isRunning = false;
        remaining = 0;
        updateDisplay();
        if (mode === 'work') {
          sessions++;
          saveSessions(sessions);
          mode = sessions % 4 === 0 ? 'long' : 'short';
          totalSeconds = mode === 'long' ? 15 * 60 : 5 * 60;
          remaining = totalSeconds;
          modeLabel.textContent = mode === 'long' ? '☕ Long Break' : '☕ Short Break';
          alert('🎉 Pomodoro complete! Time for a ' + (mode === 'long' ? 'long' : 'short') + ' break.');
        } else {
          mode = 'work';
          totalSeconds = 25 * 60;
          remaining = totalSeconds;
          modeLabel.textContent = '📚 Focus Time';
          alert('✅ Break over! Ready for the next Pomodoro?');
        }
        startBtn.textContent = '▶ Start';
        startBtn.className = 'btn btn-primary btn-lg';
        updateDisplay();
        return;
      }
      updateDisplay();
    }, 1000);
  }

  function pauseTimer() {
    isRunning = false;
    clearInterval(interval);
    startBtn.textContent = '▶ Resume';
    startBtn.className = 'btn btn-primary btn-lg';
  }

  startBtn.addEventListener('click', () => {
    if (isRunning) pauseTimer();
    else startTimer();
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(interval);
    isRunning = false;
    remaining = totalSeconds;
    startBtn.textContent = '▶ Start';
    startBtn.className = 'btn btn-primary btn-lg';
    updateDisplay();
  });

  // Presets
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      clearInterval(interval);
      isRunning = false;
      const mins = parseInt(btn.dataset.min);
      mode = btn.dataset.mode || 'work';
      totalSeconds = mins * 60;
      remaining = totalSeconds;
      modeLabel.textContent = mode === 'short' ? '☕ Short Break' : mode === 'long' ? '☕ Long Break' : '📚 Focus Time';
      startBtn.textContent = '▶ Start';
      startBtn.className = 'btn btn-primary btn-lg';
      updateDisplay();
    });
  });

  updateDisplay();
}

// ============================
// FLASHCARDS
// ============================
function initFlashcards() {
  App.initPage('tools');
  const allCards = (window.SCIENCE_DATA && window.SCIENCE_DATA.flashcards) ? window.SCIENCE_DATA.flashcards.cards : [];
  let currentSet = 'All';
  let currentIdx = 0;
  let filtered = [...allCards];
  let mode = 'browse'; // browse | srs
  let srsQueue = [];
  let srsReviewed = 0;

  const cardEl = document.getElementById('flashcard');
  const frontEl = document.getElementById('fcFront');
  const backEl = document.getElementById('fcBack');
  const counterEl = document.getElementById('fcCounter');
  const tabsEl = document.getElementById('fcTabs');
  const srsBar = document.getElementById('srsBar');
  const srsRating = document.getElementById('srsRating');

  // ---- SRS storage (SM-2 lite) ----
  function getSRS() {
    try { return JSON.parse(localStorage.getItem('sb_srs')) || {}; } catch { return {}; }
  }
  function saveSRS(s) { localStorage.setItem('sb_srs', JSON.stringify(s)); }
  function cardState(id) {
    const s = getSRS();
    return s[id] || { interval: 0, ease: 2.5, due: 0 };
  }
  function isDue(id) { return cardState(id).due <= Date.now(); }
  function newCount(list) { return list.filter(c => !getSRS()[c.id]).length; }
  function dueCount(list) { return list.filter(c => isDue(c.id)).length; }

  function grade(id, quality) {
    // quality: 0=again, 1=hard, 2=good, 3=easy
    const s = getSRS();
    const st = s[id] || { interval: 0, ease: 2.5, due: 0 };
    const DAY = 86400000;
    if (quality === 0) {
      st.ease = Math.max(1.3, st.ease - 0.2);
      st.interval = 0;
      st.due = Date.now() + 10 * 60000; // relearn in 10 min
    } else if (quality === 1) {
      st.ease = Math.max(1.3, st.ease - 0.15);
      st.interval = Math.max(1, st.interval * 1.2);
      st.due = Date.now() + st.interval * DAY;
    } else if (quality === 2) {
      st.interval = st.interval <= 0 ? 1 : st.interval * st.ease;
      st.due = Date.now() + st.interval * DAY;
    } else {
      st.ease += 0.15;
      st.interval = st.interval <= 0 ? 4 : st.interval * st.ease * 1.3;
      st.due = Date.now() + st.interval * DAY;
    }
    s[id] = st;
    saveSRS(s);
  }

  // ---- Mode bar ----
  function renderSrsBar() {
    if (!srsBar) return;
    if (mode === 'browse') {
      srsBar.innerHTML = `
        <button class="btn btn-secondary btn-sm active" data-mode="browse">📖 Browse</button>
        <button class="btn btn-primary btn-sm" data-mode="srs">🎯 Study Mode</button>
        <span class="srs-due">${dueCount(filtered)} due · ${newCount(filtered)} new</span>`;
    } else {
      srsBar.innerHTML = `
        <button class="btn btn-secondary btn-sm" data-mode="browse">📖 Browse</button>
        <button class="btn btn-primary btn-sm active" data-mode="srs">🎯 Study Mode</button>
        <span class="srs-due">Reviewed this session: <strong>${srsReviewed}</strong> · Queue left: <strong>${srsQueue.length}</strong></span>`;
    }
    srsBar.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });
  }

  function setMode(m) {
    mode = m;
    srsReviewed = 0;
    cardEl.classList.remove('flipped');
    if (m === 'srs') {
      srsQueue = filtered.filter(c => isDue(c.id));
      if (!srsQueue.length) {
        App.toast('🎉 All cards are learned! Nothing due right now.');
        mode = 'browse';
      } else {
        currentIdx = filtered.indexOf(srsQueue[0]);
        if (srsRating) srsRating.classList.add('show');
      }
    } else if (srsRating) {
      srsRating.classList.remove('show');
    }
    renderSrsBar();
    renderCard();
  }

  function nextSRS() {
    srsReviewed++;
    if (!srsQueue.length) {
      App.toast('🎉 Session complete! You reviewed ' + srsReviewed + ' card' + (srsReviewed === 1 ? '' : 's') + '.');
      if (srsRating) srsRating.classList.remove('show');
      mode = 'browse';
      renderSrsBar();
      return;
    }
    const card = srsQueue[0];
    currentIdx = filtered.indexOf(card);
    renderSrsBar();
    renderCard();
  }

  if (srsRating) {
    srsRating.querySelectorAll('[data-q]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (mode !== 'srs' || !srsQueue.length) return;
        const card = srsQueue.shift();
        grade(card.id, parseInt(btn.dataset.q, 10));
        nextSRS();
      });
    });
  }

  const subjects = ['All', ...new Set(allCards.map(c => c.subject))];
  tabsEl.innerHTML = subjects.map(s =>
    `<button class="preset-btn ${s === 'All' ? 'active' : ''}" data-subject="${s}">${s}</button>`
  ).join('');

  tabsEl.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsEl.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSet = btn.dataset.subject;
      filtered = currentSet === 'All' ? [...allCards] : allCards.filter(c => c.subject === currentSet);
      currentIdx = 0;
      srsQueue = filtered.filter(c => isDue(c.id));
      srsReviewed = 0;
      if (mode === 'srs') {
        if (srsQueue.length) currentIdx = filtered.indexOf(srsQueue[0]);
        else { mode = 'browse'; if (srsRating) srsRating.classList.remove('show'); }
      }
      cardEl.classList.remove('flipped');
      renderSrsBar();
      renderCard();
    });
  });

  function renderCard() {
    if (filtered.length === 0) {
      frontEl.querySelector('.fc-content').textContent = 'No cards available';
      backEl.querySelector('.fc-content').textContent = 'Try another category';
      counterEl.textContent = '0 / 0';
      return;
    }
    const card = filtered[currentIdx];
    frontEl.querySelector('.fc-content').textContent = card.front;
    backEl.querySelector('.fc-content').textContent = card.back;
    counterEl.textContent = (currentIdx + 1) + ' / ' + filtered.length;
    cardEl.classList.remove('flipped');
  }

  cardEl.addEventListener('click', () => cardEl.classList.toggle('flipped'));

  document.getElementById('fcPrev').addEventListener('click', (e) => {
    e.stopPropagation();
    if (mode === 'srs') return; // queue order is fixed in study mode
    if (currentIdx > 0) currentIdx--;
    else currentIdx = filtered.length - 1;
    renderCard();
  });
  document.getElementById('fcNext').addEventListener('click', (e) => {
    e.stopPropagation();
    if (mode === 'srs') return;
    if (currentIdx < filtered.length - 1) currentIdx++;
    else currentIdx = 0;
    renderCard();
  });

  renderSrsBar();
  renderCard();
}

// ============================
// BOOKMARKS
// ============================
function initBookmarks() {
  App.initPage('tools');
  const listEl = document.getElementById('bookmarkList');

  function render() {
    const bookmarks = App.getBookmarks();
    if (bookmarks.length === 0) {
      listEl.innerHTML = '<div class="alert show alert-warning">📌 No bookmarks yet. Bookmark topics from subject notes pages!</div>';
      return;
    }
    listEl.innerHTML = '';
    const b = App.basePrefix();
    bookmarks.forEach(bm => {
      const div = document.createElement('div');
      div.className = 'bookmark-item';
      div.innerHTML = `
        <div class="bm-info">
          <h4>${bm.icon || '📘'} ${bm.title}</h4>
          <p>${bm.subject || ''} — ${bm.topic || ''}</p>
        </div>
        <div class="bm-actions">
          <a href="${b}${bm.link}" class="btn btn-sm btn-secondary">📖 Open</a>
          <button class="btn btn-sm btn-danger" data-bm-id="${bm.id}">🗑️</button>
        </div>`;
      div.querySelector('[data-bm-id]').addEventListener('click', () => {
        App.removeBookmark(bm.id);
        render();
      });
      listEl.appendChild(div);
    });
  }

  render();
}

// ============================
// TOOLS INDEX
// ============================
function initToolsIndex() {
  App.initPage('tools');
}
