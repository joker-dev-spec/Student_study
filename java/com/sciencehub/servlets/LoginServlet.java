package com.sciencehub.servlets;

import com.sciencehub.models.Student;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;

/**
 * LoginServlet — handles student login for the BrainBox.
 *
 * Deploy on localhost:8080 (e.g. Apache Tomcat / Jetty).
 * The static GitHub Pages build does not require this servlet; the login
 * is handled entirely client-side by /js/auth.js using localStorage.
 *
 * POST /login
 *   params: name, school, scienceClass
 */
@WebServlet(name = "LoginServlet", urlPatterns = {"/login"})
public class LoginServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String name = trim(request.getParameter("name"));
        String school = trim(request.getParameter("school"));
        String className = trim(request.getParameter("scienceClass"));

        PrintWriter out = response.getWriter();

        if (name.isEmpty() || school.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"success\":false,\"message\":\"Name and school are required.\"}");
            return;
        }

        if (className == null || className.isEmpty()) {
            className = "SS2 Science A";
        }

        Student student = Student.fromLogin(name, school, className);
        student.setId(generateId(name, school));

        HttpSession session = request.getSession(true);
        session.setAttribute("student", student);
        session.setMaxInactiveInterval(60 * 60); // 1 hour

        String json = "{"
                + "\"success\":true,"
                + "\"message\":\"Login successful\","
                + "\"student\":{"
                + "\"id\":" + student.getId() + ","
                + "\"name\":\"" + escape(name) + "\","
                + "\"school\":\"" + escape(school) + "\","
                + "\"className\":\"" + escape(className) + "\","
                + "\"department\":\"Science\""
                + "}}";

        out.print(json);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Return the currently logged-in student, if any.
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        HttpSession session = request.getSession(false);
        PrintWriter out = response.getWriter();
        if (session != null && session.getAttribute("student") != null) {
            Student s = (Student) session.getAttribute("student");
            out.print("{\"loggedIn\":true,\"name\":\"" + escape(s.getName()) + "\"}");
        } else {
            out.print("{\"loggedIn\":false}");
        }
    }

    private static String trim(String s) {
        return s == null ? "" : s.trim();
    }

    private static int generateId(String name, String school) {
        return Math.abs((name + "|" + school).hashCode());
    }

    private static String escape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
