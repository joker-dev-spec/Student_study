package com.sciencehub.servlets;

import com.sciencehub.models.Subject;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * ProgressServlet — tracks per-subject progress and auto-detects weak topics.
 *
 * GET  /progress                     → returns progress report + weak topics
 * POST /progress                     → records a quiz outcome
 *      params: subject, topic, score, total
 *
 * Weak topics are those where the student scored below 50%.
 * Progress is stored in the session for this reference implementation;
 * a production build would persist to MySQL.
 */
@WebServlet(name = "ProgressServlet", urlPatterns = {"/progress"})
public class ProgressServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static final double WEAK_TOPIC_THRESHOLD = 0.50;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        HttpSession session = request.getSession(false);
        Map<String, int[]> progress = getProgress(session);

        StringBuilder sb = new StringBuilder();
        sb.append("{\"subjects\":[");

        Subject[] catalog = Subject.catalog();
        for (int i = 0; i < catalog.length; i++) {
            Subject s = catalog[i];
            if (i > 0) sb.append(",");
            int[] score = progress.get(s.getId());
            int best = 0, attempts = 0;
            if (score != null) {
                best = score[1] > 0 ? (int) Math.round(score[0] * 100.0 / score[1]) : 0;
                attempts = score.length > 2 ? score[2] : 0;
            }
            sb.append("{\"id\":\"").append(s.getId())
              .append("\",\"name\":\"").append(escape(s.getName()))
              .append("\",\"icon\":\"").append(s.getIcon())
              .append("\",\"best\":").append(best)
              .append(",\"attempts\":").append(attempts)
              .append("}");
        }
        sb.append("]}");
        out.print(sb.toString());
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String subject = request.getParameter("subject");
        String topic = request.getParameter("topic");
        String scoreParam = request.getParameter("score");
        String totalParam = request.getParameter("total");

        if (subject == null || scoreParam == null || totalParam == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"subject, score and total are required\"}");
            return;
        }

        int score = Integer.parseInt(scoreParam);
        int total = Integer.parseInt(totalParam);
        if (total <= 0) total = 1;

        HttpSession session = request.getSession(true);
        Map<String, int[]> progress = getProgress(session);

        int[] record = progress.get(subject);
        if (record == null) {
            record = new int[]{0, 0, 0}; // totalCorrect, totalAnswered, attempts
            progress.put(subject, record);
        }
        record[0] += score;
        record[1] += total;
        if (record.length > 2) record[2]++;
        session.setAttribute("progress", progress);

        double pct = (score * 100.0) / total;
        boolean weak = pct < (WEAK_TOPIC_THRESHOLD * 100);

        out.print("{\"recorded\":true,\"subject\":\"" + escape(subject)
                + "\",\"topic\":\"" + escape(topic == null ? "" : topic)
                + "\",\"percentage\":" + Math.round(pct)
                + ",\"weakTopic\":" + weak + "}");
    }

    @SuppressWarnings("unchecked")
    private static Map<String, int[]> getProgress(HttpSession session) {
        if (session == null) {
            return new LinkedHashMap<>();
        }
        Object existing = session.getAttribute("progress");
        if (existing instanceof Map) {
            return (Map<String, int[]>) existing;
        }
        Map<String, int[]> fresh = new LinkedHashMap<>();
        session.setAttribute("progress", fresh);
        return fresh;
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
