/* Study Tools: Timetable, Pomodoro, Flashcards, Bookmarks */

// ============================
// TIMETABLE
// ============================
function initTimetable() {
  App.initPage('tools');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['8:00–9:00', '9:00–10:00', '10:00–11:00', '11:00–12:00', '12:00–1:00', '2:00–3:00', '3:00–4:00'];
  const schedule = {
    '8:00–9:00':   { Mon: 'Mathematics', Tue: 'Chemistry', Wed: 'Biology', Thu: 'Physics', Fri: 'Mathematics' },
    '9:00–10:00':  { Mon: 'Physics', Tue: 'Mathematics', Wed: 'English', Thu: 'Chemistry', Fri: 'Biology' },
    '10:00–11:00': { Mon: 'Chemistry', Tue: 'Biology', Wed: 'Physics', Thu: 'Mathematics', Fri: 'Computer Sci.' },
    '11:00–12:00': { Mon: 'Biology', Tue: 'Further Maths', Wed: 'Geography', Thu: 'English', Fri: 'Physics' },
    '12:00–1:00':  { Mon: 'English', Tue: 'Computer Sci.', Wed: 'Civic Education', Thu: 'Further Maths', Fri: 'Chemistry' },
    '2:00–3:00':   { Mon: 'Geography', Tue: 'English', Wed: 'Mathematics', Thu: 'Computer Sci.', Fri: 'Geography' },
    '3:00–4:00':   { Mon: 'Civic Education', Tue: 'Geography', Wed: 'Further Maths', Thu: 'Biology', Fri: 'Civic Education' }
  };
  const subjectIcons = {
    'Mathematics': '📐', 'Further Maths': '📊', 'English': '📖', 'Physics': '⚛️',
    'Chemistry': '🧪', 'Biology': '🔬', 'Computer Sci.': '💻', 'Geography': '🌍',
    'Civic Education': '🏛️'
  };
  const todayIdx = (new Date().getDay() + 6) % 7;
  const todayName = days[todayIdx] || '';

  const table = document.getElementById('timetableTable');
  if (!table) return;

  let html = '<thead><tr><th>Time</th>';
  days.forEach(d => {
    html += `<th class="${d === todayName ? 'today-col' : ''}">${d}</th>`;
  });
  html += '</tr></thead><tbody>';

  times.forEach(t => {
    html += `<tr><td style="font-weight:700;background:var(--bg-input)">${t}</td>`;
    days.forEach(d => {
      const s = schedule[t][d];
      const icon = subjectIcons[s] || '📘';
      html += `<td class="subject-cell ${d === todayName ? 'today-col' : ''}">${icon} ${s}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;
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
  let sessions = parseInt(localStorage.getItem('sb_pomodoro_sessions') || '0');
  let mode = 'work'; // work, short, long

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
          localStorage.setItem('sb_pomodoro_sessions', sessions);
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

  const cardEl = document.getElementById('flashcard');
  const frontEl = document.getElementById('fcFront');
  const backEl = document.getElementById('fcBack');
  const counterEl = document.getElementById('fcCounter');
  const tabsEl = document.getElementById('fcTabs');

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
      cardEl.classList.remove('flipped');
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
    if (currentIdx > 0) currentIdx--;
    else currentIdx = filtered.length - 1;
    renderCard();
  });
  document.getElementById('fcNext').addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentIdx < filtered.length - 1) currentIdx++;
    else currentIdx = 0;
    renderCard();
  });

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
          <button class="btn btn-sm btn-danger" onclick="App.removeBookmark('${bm.id}');this.closest('.bookmark-item').remove()">🗑️</button>
        </div>`;
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
