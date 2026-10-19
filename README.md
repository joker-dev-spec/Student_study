# 🧠 SS2 Science BrainBox

A complete study app for **SS2 Science students in Nigeria** preparing for **WAEC** and their **3rd term** examinations.

Built with **only HTML, CSS, JavaScript and a reference Java backend** — no React, no frameworks, no build step. It runs by simply opening `index.html`, or on **GitHub Pages**, or on **localhost**.

---

## ✨ Features

### 1. Login
- Enter **Name** and **School**
- **Science Class** is auto-selected (Science Department)
- Session saved in `localStorage`

### 2. Dashboard
- **Progress circle** for every science subject
- **Weak Topics** auto-detected from quiz scores below 50%
- **Daily Science Challenge** — one random WAEC question each day with instant feedback
- Quick actions for Quiz, Lab, Formulas, Periodic Table, Flashcards, Pomodoro, Timetable and Bookmarks

### 3. Notes (deep science content)
Every topic includes **Definition**, **Formula**, **Diagram description**, **Worked Example** and a **JAMB/WAEC tip**.

| Subject | Topics |
|---|---|
| **Physics** | Vectors, Equilibrium, Motion, Light, Waves |
| **Chemistry** | Particulate Nature of Matter, Periodic Table, Chemical Bonding, Acids & Bases, Organic Introduction |
| **Biology** | Cell, Tissues, Photosynthesis, Respiratory System, Ecology |
| **Mathematics** | Logarithms, Sequences, Trigonometry, Calculus Intro |
| Further Mathematics | Vectors, Matrices, Differentiation, Integration, Probability |
| English | Vocabulary, Grammar, Figures of Speech |
| Computer Science | Hardware & Software, Programming, Networking, Data Representation |
| Geography | Map Reading, Physical Geography, Climatology, Human Geography |
| Civic Education | Democracy, Human Rights, Rule of Law, Citizenship |

### 4. Science Lab Corner
- **Virtual Experiments** — step-by-step practical guides (starch test, water test, Hooke's Law, moments)
- **Formula Sheet** — 50+ Physics/Chemistry/Maths formulas, fully **searchable**
- **Interactive Periodic Table** — click any element to see atomic number, mass, group, period, electron configuration and state

### 5. CBT Quiz Engine
- **25 questions per subject** (225 total), WAEC standard
- **Countdown timer** (45 s per question, auto-submits at zero)
- **Score** with animated result ring
- **Corrections** with a full explanation for every question
- **Difficulty** labels: Easy / Medium / Hard
- Questions stored in **`/data/*.json`** (fetched with vanilla JS) and also in a **Java `ArrayList`** (`QuizServlet`)

### 6. Study Tools
- **Timetable** — weekly science schedule with today highlighted
- **Pomodoro** — 25/5/15/50-minute focus & break timers, session counter
- **Flashcards** — flip cards for formulas and definitions, filterable by subject
- **Bookmarks** — save any subject's notes for quick review

### 7. Design
- **Science lab theme**: blue, white and green
- **Mobile-first** responsive layout with bottom navigation
- **Dark mode** toggle (remembered across sessions)
- Clean icons throughout

---

## 📁 Project Structure

```
Study project/
├── index.html                 # Login page
├── dashboard.html             # Student dashboard
├── quiz.html                  # CBT quiz engine (loads by subject)
├── css/
│   └── style.css              # Science lab theme + dark mode
├── js/
│   ├── data.js                # Embedded copy of all JSON (offline fallback)
│   ├── app.js                 # Shared utilities: auth, theme, nav, data loader
│   ├── auth.js                # Login logic
│   ├── dashboard.js           # Dashboard, progress, weak topics, daily challenge
│   ├── quiz.js                # CBT quiz engine (timer, scoring, corrections)
│   ├── notes.js               # Subject page, formula sheet, periodic table
│   └── tools.js               # Timetable, Pomodoro, Flashcards, Bookmarks
├── data/                      # All content as JSON
│   ├── physics.json           # 25 questions
│   ├── chemistry.json         # 25 questions
│   ├── biology.json           # 25 questions
│   ├── mathematics.json       # 25 questions
│   ├── further-mathematics.json
│   ├── english.json
│   ├── computer-science.json
│   ├── geography.json
│   ├── civic-education.json
│   ├── flashcards.json        # 30 flashcards
│   └── formulas.json          # 50+ formulas
├── Subjects/                  # Notes pages
│   ├── physics.html
│   ├── chemistry.html
│   ├── biology.html
│   ├── mathematics.html
│   ├── further-mathematics.html
│   ├── english.html
│   ├── computer-science.html
│   ├── geography.html
│   └── civic-education.html
├── lab/                       # Science Lab Corner
│   ├── index.html
│   ├── experiments.html
│   ├── formula-sheet.html
│   └── periodic-table.html
├── tools/                     # Study Tools
│   ├── index.html
│   ├── timetable.html
│   ├── pomodoro.html
│   ├── flashcards.html
│   └── bookmarks.html
├── java/                      # REFERENCE backend (optional — not required to run)
│   ├── pom.xml
│   └── com/sciencehub/
│       ├── models/
│       │   ├── Student.java
│       │   ├── Subject.java
│       │   └── Quiz.java
│       └── servlets/
│           ├── LoginServlet.java
│           ├── QuizServlet.java
│           └── ProgressServlet.java
└── README.md
```

---

## 🚀 How to Run

### Option A — Just open it (simplest)
1. Open the folder.
2. Double-click **`index.html`**.
3. Log in with any name and school, then start studying.

> The app automatically uses the embedded data in `js/data.js` when opened via `file://`.

### Option B — GitHub Pages (recommended for sharing)
1. Push this folder to a GitHub repository.
2. Go to **Settings → Pages**.
3. Set the source to the **main branch / root**.
4. Open `https://<your-username>.github.io/<repo-name>/`.

> On GitHub Pages the app **fetches the live `/data/*.json` files** with vanilla JS.

### Option C — Local HTTP server
Any static server works (which also enables the JSON fetch path):

```bash
# Python
python3 -m http.server 8080
# then open http://localhost:8080
```

```bash
# Node (if installed)
npx serve -l 8080
```

### Option D — Run the optional Java backend (localhost:8080)
The Java servlets are a **reference implementation** and are **not required** to use the app. To run them you need **JDK 17+** and **Maven**:

```bash
cd java
mvn jetty:run
# web app runs at http://localhost:8080/sciencebrainbox
```

Available endpoints:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/login` | Log in (params: `name`, `school`, `scienceClass`) |
| GET  | `/quiz?subject=physics` | Returns a shuffled question set |
| GET  | `/quiz?subject=physics&id=3` | Returns a single question |
| POST | `/quiz` | Grades an answer (params: `id`, `chosen`) |
| GET  | `/progress` | Progress report + weak topics |
| POST | `/progress` | Records a quiz result (params: `subject`, `topic`, `score`, `total`) |

---

## 🧪 Data Format

Each subject JSON file looks like this:

```json
{
  "subject": "Physics",
  "questions": [
    {
      "id": 1,
      "topic": "Vectors",
      "difficulty": "Easy",
      "question": "Which of the following is a vector quantity?",
      "options": ["Speed", "Mass", "Displacement", "Temperature"],
      "answer": 2,
      "explanation": "Displacement has both magnitude and direction."
    }
  ]
}
```

`answer` is the zero-based index of the correct option.

---

## 🛠️ Tech Stack

- **HTML5** — semantic, accessible markup
- **CSS3** — custom properties (variables), grid, flexbox, dark mode, mobile-first
- **JavaScript (ES6+)** — no frameworks, async/await, `localStorage`, `fetch`
- **Java 17 + Jakarta Servlet 6** — reference models and servlets (optional)

---

## 📝 Notes

- All progress, bookmarks, Pomodoro counts and quiz history are stored locally in your browser (`localStorage`).
- The `java/` folder is kept for reference and structure. Deleting it will not affect the web app.
- Works offline after the first load when opened directly (embedded data fallback).

---

**Built for SS2 Science students in Nigeria — study smart, pass WAEC.** 🇳🇬
