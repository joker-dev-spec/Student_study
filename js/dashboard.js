/* Dashboard page logic */

(function () {
  const user = App.requireAuth();
  if (!user) return;

  App.initPage('dashboard');

  // Welcome banner
  document.getElementById('welcomeName').textContent = user.name;
  document.getElementById('welcomeSchool').textContent = user.school + ' — ' + App.getClassLabel();

  const history = App.getQuizHistory();
  const totalQuizzes = history.length;
  const avgPct = totalQuizzes > 0 ? Math.round(history.reduce((s, h) => s + h.pct, 0) / totalQuizzes) : 0;
  document.getElementById('statQuizzes').textContent = totalQuizzes;
  document.getElementById('statAvg').textContent = avgPct + '%';

  // Streak
  const streak = App.getStreak();
  const statStreak = document.getElementById('statStreak');
  if (statStreak) statStreak.textContent = streak.count;

  // Exam countdown
  const countdownEl = document.getElementById('examCountdown');
  if (countdownEl) {
    const days = App.daysToExam();
    if (days === null) {
      countdownEl.innerHTML = `<span class="cd-num">—</span><span class="cd-lbl">Set exam date</span>
        <button class="btn btn-secondary btn-sm" onclick="App.__setExam()">📅 Set Date</button>`;
    } else if (days < 0) {
      countdownEl.innerHTML = `<span class="cd-num">Done</span><span class="cd-lbl">Exam passed</span>
        <button class="btn btn-secondary btn-sm" onclick="App.__setExam()">Change</button>`;
    } else {
      countdownEl.innerHTML = `<span class="cd-num">${days}</span><span class="cd-lbl">day${days === 1 ? '' : 's'} to exam</span>
        <button class="btn btn-secondary btn-sm" onclick="App.__setExam()">Change</button>`;
    }
  }

  // Next class today
  const nextEl = document.getElementById('nextClass');
  if (nextEl) {
    const nc = App.nextClassToday();
    if (nc) {
      const icon = App.subjectIcons[nc.subject] || '📘';
      nextEl.innerHTML = `<div class="nc-icon">${icon}</div>
        <div><div class="nc-sub">${nc.subject}</div><div class="nc-meta">Today · ${nc.slot}</div></div>`;
    } else {
      nextEl.innerHTML = `<div class="nc-icon">🎉</div><div><div class="nc-sub">No more classes today</div>
        <div class="nc-meta">Great time to revise!</div></div>`;
    }
  }

  // Quote
  const quoteEl = document.getElementById('dailyQuote');
  if (quoteEl) quoteEl.textContent = '“' + App.getDailyQuote() + '”';

  // Subject progress cards
  const grid = document.getElementById('subjectGrid');
  App.getSubjects().forEach(sub => {
    const pct = App.getSubjectPct(sub.id);
    const prog = App.getProgress();
    const p = prog[sub.id];
    const detail = p ? p.attempts + ' attempt' + (p.attempts !== 1 ? 's' : '') : 'Not attempted yet';

    const card = document.createElement('a');
    card.className = 'subject-card';
    card.href = 'quiz.html?subject=' + sub.id;
    card.innerHTML = `
      ${App.renderProgressRing(pct)}
      <div class="info">
        <h3><span class="card-icon" style="font-size:1.1rem">${sub.icon}</span> ${sub.name}</h3>
        <p>${detail}</p>
      </div>`;
    grid.appendChild(card);
  });

  // Weak topics
  const weakList = document.getElementById('weakTopicList');
  const weak = App.getWeakTopics();
  if (weak.length === 0) {
    weakList.innerHTML = '<li class="empty-msg">✅ No weak topics detected yet. Take quizzes to build your profile!</li>';
  } else {
    weak.forEach(w => {
      const subj = App.getSubject(w.subject);
      const li = document.createElement('li');
      li.innerHTML = `<span>${subj ? subj.icon : ''} ${w.topic} <small>(${w.subject})</small></span> <span class="score">${w.pct}%</span>`;
      weakList.appendChild(li);
    });
  }

  // Daily challenge
  const daily = App.getDailyChallenge();
  if (daily && daily.question) {
    const q = daily.question;
    document.getElementById('dailyTopic').textContent = (q.subject || '') + ' — ' + q.topic + ' (' + q.difficulty + ')';
    document.getElementById('dailyQ').textContent = q.question;

    const optContainer = document.getElementById('dailyOptions');
    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'q-option';
      btn.innerHTML = `<span class="opt-letter">${letters[i]}</span> ${opt}`;
      btn.addEventListener('click', () => {
        optContainer.querySelectorAll('.q-option').forEach(b => b.disabled = true);
        btn.classList.add('selected');
        const correct = q.answer;
        optContainer.querySelectorAll('.q-option').forEach((b, j) => {
          if (j === correct) b.classList.add('correct');
          else if (j === i && i !== correct) b.classList.add('wrong');
        });
        const expl = document.getElementById('dailyExpl');
        expl.innerHTML = `<strong>${i === correct ? '✅ Correct!' : '❌ Incorrect.'}</strong> ${q.explanation}`;
        expl.classList.add('show');
      });
      optContainer.appendChild(btn);
    });
  }
})();
