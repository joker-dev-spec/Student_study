package com.sciencehub.servlets;

import com.sciencehub.models.Quiz;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

/**
 * QuizServlet — in-memory quiz bank (ArrayList) and quiz engine.
 *
 * GET  /quiz?subject=physics          → returns 25 shuffled questions as JSON
 * GET  /quiz?subject=physics&id=3     → returns a single question
 * POST /quiz                          → grades submitted answers
 *
 * The full 350-question bank (14 subjects x 25 questions) lives in /data/*.json
 * for the GitHub Pages build. This servlet holds a representative sample in an
 * ArrayList to demonstrate the same design server-side.
 */
@WebServlet(name = "QuizServlet", urlPatterns = {"/quiz"})
public class QuizServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    /** Static in-memory question bank. */
    private static final List<Quiz> BANK = new ArrayList<>();

    static {
        // ---- Physics ----
        BANK.add(new Quiz(1, "Physics", "Vectors", "Easy",
                "Which of the following is a vector quantity?",
                Arrays.asList("Speed", "Mass", "Displacement", "Temperature"), 2,
                "Displacement has both magnitude and direction."));
        BANK.add(new Quiz(2, "Physics", "Vectors", "Medium",
                "The resultant of two forces of 3 N and 4 N acting at right angles is:",
                Arrays.asList("5 N", "7 N", "1 N", "12 N"), 0,
                "R = √(3² + 4²) = √25 = 5 N."));
        BANK.add(new Quiz(3, "Physics", "Motion", "Easy",
                "The slope of a velocity-time graph represents:",
                Arrays.asList("Displacement", "Acceleration", "Distance", "Speed"), 1,
                "Gradient of a velocity-time graph = acceleration."));
        BANK.add(new Quiz(4, "Physics", "Waves", "Easy",
                "Which of the following waves is longitudinal?",
                Arrays.asList("Light wave", "Sound wave", "Water wave", "Radio wave"), 1,
                "Sound waves are longitudinal."));
        BANK.add(new Quiz(5, "Physics", "Light", "Medium",
                "The refractive index of glass is 1.5. Speed of light in glass is:",
                Arrays.asList("3×10⁸ m/s", "2×10⁸ m/s", "4.5×10⁸ m/s", "1.5×10⁸ m/s"), 1,
                "v = c/n = (3×10⁸)/1.5 = 2×10⁸ m/s."));

        // ---- Chemistry ----
        BANK.add(new Quiz(6, "Chemistry", "Particulate Nature", "Easy",
                "The smallest particle of an element that retains its chemical properties is:",
                Arrays.asList("Molecule", "Atom", "Compound", "Ion"), 1,
                "Atoms are the smallest particles retaining chemical properties."));
        BANK.add(new Quiz(7, "Chemistry", "Periodic Table", "Easy",
                "Elements in the same group have the same number of:",
                Arrays.asList("Shells", "Atomic mass", "Valence electrons", "Neutrons"), 2,
                "Same group = same valence electrons."));
        BANK.add(new Quiz(8, "Chemistry", "Chemical Bonding", "Easy",
                "The bond formed by sharing electron pairs is:",
                Arrays.asList("Ionic", "Covalent", "Metallic", "Hydrogen"), 1,
                "Covalent bonds involve sharing of electron pairs."));
        BANK.add(new Quiz(9, "Chemistry", "Acids and Bases", "Medium",
                "What is the pH of a 0.001 M HCl solution?",
                Arrays.asList("1", "3", "11", "0.001"), 1,
                "pH = -log(10⁻³) = 3."));
        BANK.add(new Quiz(10, "Chemistry", "Organic Introduction", "Easy",
                "The general formula for alkanes is:",
                Arrays.asList("CₙH₂ₙ", "CₙH₂ₙ₊₂", "CₙH₂ₙ₋₂", "CₙHₙ"), 1,
                "Alkanes: CₙH₂ₙ₊₂."));

        // ---- Biology ----
        BANK.add(new Quiz(11, "Biology", "Cell", "Easy",
                "Which organelle is known as the powerhouse of the cell?",
                Arrays.asList("Nucleus", "Ribosome", "Mitochondrion", "Golgi body"), 2,
                "Mitochondria produce ATP via respiration."));
        BANK.add(new Quiz(12, "Biology", "Photosynthesis", "Easy",
                "The raw materials for photosynthesis are:",
                Arrays.asList("Glucose and oxygen", "Carbon dioxide and water",
                        "Nitrogen and water", "Oxygen and minerals"), 1,
                "Photosynthesis needs CO₂ and H₂O."));
        BANK.add(new Quiz(13, "Biology", "Respiratory System", "Easy",
                "During inhalation, the diaphragm:",
                Arrays.asList("Relaxes and moves up", "Contracts and moves down",
                        "Remains stationary", "Moves sideways"), 1,
                "Diaphragm contracts and flattens on inhalation."));
        BANK.add(new Quiz(14, "Biology", "Ecology", "Easy",
                "Organisms that make their own food are called:",
                Arrays.asList("Consumers", "Producers", "Decomposers", "Predators"), 1,
                "Producers (autotrophs) make their own food."));
        BANK.add(new Quiz(15, "Biology", "Tissues", "Medium",
                "Blood is classified as which type of tissue?",
                Arrays.asList("Epithelial", "Connective", "Muscular", "Nervous"), 1,
                "Blood is a fluid connective tissue."));

        // ---- Mathematics ----
        BANK.add(new Quiz(16, "Mathematics", "Logarithms", "Easy",
                "The value of log₁₀ 100 is:",
                Arrays.asList("1", "2", "10", "100"), 1,
                "10² = 100, so log₁₀ 100 = 2."));
        BANK.add(new Quiz(17, "Mathematics", "Sequences", "Easy",
                "The next term in 2, 5, 8, 11, ... is:",
                Arrays.asList("12", "13", "14", "15"), 2,
                "Common difference 3, so 11 + 3 = 14."));
        BANK.add(new Quiz(18, "Mathematics", "Trigonometry", "Easy",
                "The value of sin 30° is:",
                Arrays.asList("1/2", "√3/2", "1", "0"), 0,
                "sin 30° = 1/2."));
        BANK.add(new Quiz(19, "Mathematics", "Calculus Intro", "Easy",
                "The derivative of x² is:",
                Arrays.asList("x", "2x", "2", "x²"), 1,
                "d/dx(x²) = 2x."));
        BANK.add(new Quiz(20, "Mathematics", "Logarithms", "Hard",
                "Given log₁₀ 3 = 0.477, find log₁₀ 300.",
                Arrays.asList("2.477", "1.477", "0.477", "3.477"), 0,
                "log 300 = log 3 + log 100 = 0.477 + 2 = 2.477."));
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String subject = request.getParameter("subject");
        String idParam = request.getParameter("id");

        List<Quiz> selected = new ArrayList<>();
        for (Quiz q : BANK) {
            if (subject == null || q.getSubject().equalsIgnoreCase(subject)) {
                selected.add(q);
            }
        }

        if (idParam != null) {
            int id = Integer.parseInt(idParam);
            for (Quiz q : selected) {
                if (q.getId() == id) {
                    out.print(toJson(q));
                    return;
                }
            }
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.print("{\"error\":\"Question not found\"}");
            return;
        }

        // Shuffle for an exam-like experience.
        java.util.Collections.shuffle(selected, new Random());
        int limit = Math.min(25, selected.size());

        StringBuilder sb = new StringBuilder();
        sb.append("{\"subject\":\"").append(subject == null ? "All" : escape(subject))
          .append("\",\"count\":").append(limit).append(",\"questions\":[");
        for (int i = 0; i < limit; i++) {
            if (i > 0) sb.append(",");
            sb.append(toJson(selected.get(i)));
        }
        sb.append("]}");
        out.print(sb.toString());
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String idParam = request.getParameter("id");
        String chosenParam = request.getParameter("chosen");

        PrintWriter out = response.getWriter();
        if (idParam == null || chosenParam == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"id and chosen parameters are required\"}");
            return;
        }

        int id = Integer.parseInt(idParam);
        int chosen = Integer.parseInt(chosenParam);

        for (Quiz q : BANK) {
            if (q.getId() == id) {
                boolean correct = q.isCorrect(chosen);
                out.print("{\"id\":" + id + ",\"correct\":" + correct
                        + ",\"answer\":" + q.getAnswer()
                        + ",\"explanation\":\"" + escape(q.getExplanation()) + "\"}");
                return;
            }
        }
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        out.print("{\"error\":\"Question not found\"}");
    }

    private static String toJson(Quiz q) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"id\":").append(q.getId())
          .append(",\"subject\":\"").append(escape(q.getSubject()))
          .append("\",\"topic\":\"").append(escape(q.getTopic()))
          .append("\",\"difficulty\":\"").append(escape(q.getDifficulty()))
          .append("\",\"question\":\"").append(escape(q.getQuestion()))
          .append("\",\"options\":[");
        List<String> opts = q.getOptions();
        for (int i = 0; i < opts.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(escape(opts.get(i))).append("\"");
        }
        sb.append("],\"answer\":").append(q.getAnswer())
          .append(",\"explanation\":\"").append(escape(q.getExplanation()))
          .append("\"}");
        return sb.toString();
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
