/* Quiz Engine — CBT Quiz with timer, score, corrections */

(function () {
  const user = App.requireAuth();
  if (!user) return;
  App.initPage('quiz');

  const params = new URLSearchParams(window.location.search);
  const subjectId = params.get('subject');

  const startScreen = document.getElementById('quizStart');
  const quizScreen = document.getElementById('quizScreen');
  const resultScreen = document.getElementById('quizResult');
  const container = document.getElementById('quizContainer');

  let questions = [];
  let currentQ = 0;
  let selectedAnswers = [];
  let timer = null;
  let timeLeft = 0;
  const TIME_PER_Q = 45; // seconds per question
  const LETTERS = ['A', 'B', 'C', 'D'];

  // ---- START SCREEN (subject selection) ----
  if (!subjectId) {
    showSubjectPicker();
  } else {
    showStartScreen(subjectId);
  }

  function showSubjectPicker() {
    startScreen.innerHTML = `
      <div class="quiz-start">
        <div class="icon">📝</div>
        <h2>Choose a Subject</h2>
        <p>Select a science subject to start your WAEC-standard CBT quiz</p>
        <div class="subject-grid mt-3" style="max-width:600px;margin:20px auto">
          ${App.subjects.map(s => `
            <a href="quiz.html?subject=${s.id}" class="subject-card" style="text-decoration:none">
              <div class="card-icon" style="font-size:2rem">${s.icon}</div>
              <div class="info"><h3>${s.name}</h3><p>25 questions</p></div>
            </a>`).join('')}
        </div>
      </div>`;
  }

  async function showStartScreen(subId) {
    const data = await App.loadSubjectData(subId);
    if (!data || !data.questions) {
      startScreen.innerHTML = `<div class="quiz-start"><div class="icon">❌</div><h2>Subject Not Found</h2><p>Questions for this subject could not be loaded.</p><a href="quiz.html" class="btn btn-primary mt-2">Choose Another Subject</a></div>`;
      return;
    }

    const sub = App.getSubject(subId);
    const prog = App.getProgress();
    const p = prog[subId];

    startScreen.innerHTML = `
      <div class="quiz-start">
        <div class="icon">${sub ? sub.icon : '📝'}</div>
        <h2>${data.subject} Quiz</h2>
        <p>WAEC Standard — 25 Multiple Choice Questions</p>
        ${p ? `<p class="mt-1" style="color:var(--primary);font-weight:700">Best Score: ${p.best}% | Attempts: ${p.attempts}</p>` : ''}
        <ul class="rules">
          <li>25 questions covering ${data.questions.length} topics</li>
          <li>Time limit: ${TIME_PER_Q} seconds per question</li>
          <li>Each question has 4 options (A–D)</li>
          <li>Explanations shown after submission</li>
          <li>Difficulty: Easy, Medium & Hard</li>
        </ul>
        <button class="btn btn-primary btn-lg mt-2" onclick="window.__startQuiz('${subId}')">
          🚀 Start Quiz
        </button>
        <a href="quiz.html" class="btn btn-secondary mt-2" style="display:inline-flex">← Change Subject</a>
      </div>`;
  }

  window.__startQuiz = async function (subId) {
    const data = await App.loadSubjectData(subId);
    if (!data || !data.questions) return;
    questions = [...data.questions].sort(() => Math.random() - 0.5).slice(0, 25);
    currentQ = 0;
    selectedAnswers = new Array(questions.length).fill(null);
    timeLeft = questions.length * TIME_PER_Q;

    startScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');

    renderQuizHeader(data.subject, subId);
    renderQuestion();
    startTimer();
  };

  function renderQuizHeader(subjectName, subId) {
    let header = document.getElementById('quizHeaderBar');
    if (!header) {
      header = document.createElement('div');
      header.className = 'quiz-header';
      header.id = 'quizHeaderBar';
      document.querySelector('.quiz-body').before(header);
    }
    header.innerHTML = `
      <div class="quiz-header-inner">
        <div class="quiz-meta">
          <a href="quiz.html" class="btn btn-secondary btn-sm">✕ Exit</a>
          <div class="meta-item"><span class="label">Subject:</span> ${subjectName}</div>
          <div class="meta-item"><span class="label">Question:</span> <span id="qCounter">1/${questions.length}</span></div>
        </div>
        <div class="quiz-timer" id="quizTimer">${App.formatTime(timeLeft)}</div>
      </div>`;
    header.classList.remove('hidden');
  }

  function renderQuestion() {
    const q = questions[currentQ];
    const sub = App.getSubject(subjectId);
    const answered = selectedAnswers[currentQ];

    document.getElementById('qCounter').textContent = (currentQ + 1) + '/' + questions.length;
    document.getElementById('progressFill').style.width = ((currentQ) / questions.length * 100) + '%';

    let html = `
      <div class="question-card">
        <div class="q-number">Question ${currentQ + 1} of ${questions.length}</div>
        <div class="q-badges">
          <span class="badge badge-${q.difficulty.toLowerCase()}">${q.difficulty}</span>
          <span class="badge badge-topic">${q.topic}</span>
        </div>
        <div class="q-text">${q.question}</div>
        <div class="q-options" id="quizOptions">
          ${q.options.map((opt, i) => `
            <button class="q-option ${answered === i ? 'selected' : ''}" onclick="window.__selectOption(${i})">
              <span class="opt-letter">${LETTERS[i]}</span> ${opt}
            </button>`).join('')}
        </div>
      </div>
      <div class="quiz-nav">
        <button class="btn btn-secondary" onclick="window.__prevQ()" ${currentQ === 0 ? 'disabled' : ''}>← Previous</button>
        ${currentQ < questions.length - 1
          ? '<button class="btn btn-primary" onclick="window.__nextQ()">Next →</button>'
          : '<button class="btn btn-green" onclick="window.__submitQuiz()">📋 Submit Quiz</button>'}
      </div>`;

    container.innerHTML = html;
  }

  window.__selectOption = function (idx) {
    selectedAnswers[currentQ] = idx;
    document.getElementById('quizOptions').querySelectorAll('.q-option').forEach((b, i) => {
      b.classList.toggle('selected', i === idx);
    });
  };

  window.__nextQ = function () {
    if (currentQ < questions.length - 1) { currentQ++; renderQuestion(); }
  };
  window.__prevQ = function () {
    if (currentQ > 0) { currentQ--; renderQuestion(); }
  };

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
      timeLeft--;
      const el = document.getElementById('quizTimer');
      if (!el) return;
      el.textContent = App.formatTime(timeLeft);
      el.className = 'quiz-timer';
      if (timeLeft <= 30) el.classList.add('danger');
      else if (timeLeft <= 60) el.classList.add('warning');
      if (timeLeft <= 0) {
        clearInterval(timer);
        window.__submitQuiz();
      }
    }, 1000);
  }

  window.__submitQuiz = function () {
    clearInterval(timer);
    let score = 0;
    let correct = 0;
    const corrections = [];
    const topicScores = {};

    questions.forEach((q, i) => {
      const isCorrect = selectedAnswers[i] === q.answer;
      if (isCorrect) { score++; correct++; }
      if (!topicScores[q.topic]) topicScores[q.topic] = { correct: 0, total: 0 };
      topicScores[q.topic].total++;
      if (isCorrect) topicScores[q.topic].correct++;

      corrections.push({
        q: q,
        yourAnswer: selectedAnswers[i],
        correct: isCorrect
      });
    });

    // Record topic scores for weak topic detection
    for (const t in topicScores) {
      App.recordTopicScore(subjectId, t, topicScores[t].correct, topicScores[t].total);
    }

    // Record overall result
    App.addQuizResult(subjectId, score, questions.length, Object.keys(topicScores).filter(t => topicScores[t].correct / topicScores[t].total < 0.5));

    const pct = Math.round(score / questions.length * 100);
    const timeUsed = questions.length * TIME_PER_Q - timeLeft;

    // Build results screen
    quizScreen.classList.add('hidden');
    const headerBar = document.getElementById('quizHeaderBar');
    if (headerBar) headerBar.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    const r = 60;
    const c = 2 * Math.PI * r;
    const offset = c - (pct / 100) * c;
    const ringColor = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
    const gradeMsg = pct >= 80 ? '🌟 Excellent! Outstanding performance!' :
                     pct >= 60 ? '👍 Good job! Keep studying to improve!' :
                     pct >= 40 ? '📚 Fair. Focus on your weak topics.' :
                                 '💪 Keep practicing. Review notes and retry!';

    let resultHTML = `
      <div class="quiz-results">
        <div class="result-circle">
          <svg width="140" height="140">
            <circle class="bg-ring" cx="70" cy="70" r="${r}"/>
            <circle class="fg-ring" cx="70" cy="70" r="${r}" style="stroke:${ringColor}"
              stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
          </svg>
          <div class="score-text">
            <span class="pct" style="color:${ringColor}">${pct}%</span>
            <span class="lbl">Score</span>
          </div>
        </div>
        <h2>${pct >= 70 ? '🎉 Well Done!' : pct >= 40 ? '📝 Good Effort!' : '📖 Keep Studying!'}</h2>
        <p class="grade-msg">${gradeMsg}</p>
        <div class="result-stats">
          <div class="rs rs-correct"><div class="rs-val">${score}</div><div class="rs-lbl">Correct</div></div>
          <div class="rs rs-wrong"><div class="rs-val">${questions.length - score}</div><div class="rs-lbl">Wrong</div></div>
          <div class="rs rs-time"><div class="rs-val">${App.formatTime(timeUsed)}</div><div class="rs-lbl">Time Used</div></div>
        </div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="window.__startQuiz('${subjectId}')">🔄 Retry Quiz</button>
          <a href="dashboard.html" class="btn btn-secondary">🏠 Dashboard</a>
          <a href="quiz.html" class="btn btn-secondary">📝 Other Subjects</a>
        </div>
      </div>

      <div class="corrections">
        <h3>📋 Corrections & Explanations</h3>`;

    corrections.forEach((c, i) => {
      resultHTML += `
        <div class="correction-item">
          <div class="ci-q">Q${i + 1}. ${c.q.question}</div>
          ${c.correct
            ? `<div class="ci-answer correct-ans">✅ Your answer: ${LETTERS[c.yourAnswer !== null ? c.yourAnswer : 0]}. ${c.q.options[c.yourAnswer !== null ? c.yourAnswer : 0]}</div>`
            : `<div class="ci-answer wrong-ans">❌ Your answer: ${c.yourAnswer !== null ? LETTERS[c.yourAnswer] + '. ' + c.q.options[c.yourAnswer] : 'Not answered'}</div>
               <div class="ci-answer correct-ans">✅ Correct answer: ${LETTERS[c.q.answer]}. ${c.q.options[c.q.answer]}</div>`}
          <div class="ci-explain">💡 ${c.q.explanation}</div>
        </div>`;
    });

    resultHTML += '</div>';
    resultScreen.innerHTML = resultHTML;
  };
})();
