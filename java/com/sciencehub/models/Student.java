package com.sciencehub.models;

import java.io.Serializable;

/**
 * Student model — represents an SS2 Science student using the BrainBox app.
 *
 * NOTE: This Java layer is provided for reference / optional server-side use.
 * The GitHub Pages build runs entirely on vanilla JavaScript + JSON.
 */
public class Student implements Serializable {

    private static final long serialVersionUID = 1L;

    private int id;
    private String name;
    private String school;
    private String className;   // e.g. "SS2 Science A"
    private String department;  // always "Science"

    public Student() {
        this.department = "Science";
    }

    public Student(int id, String name, String school, String className) {
        this.id = id;
        this.name = name;
        this.school = school;
        this.className = className;
        this.department = "Science";
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSchool() { return school; }
    public void setSchool(String school) { this.school = school; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    /** Convenience factory used by LoginServlet. */
    public static Student fromLogin(String name, String school, String className) {
        Student s = new Student();
        s.setName(name);
        s.setSchool(school);
        s.setClassName(className);
        return s;
    }

    @Override
    public String toString() {
        return "Student{id=" + id + ", name='" + name + "', school='" + school +
               "', className='" + className + "', department='" + department + "'}";
    }
}
