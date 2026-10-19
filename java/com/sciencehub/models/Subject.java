package com.sciencehub.models;

/**
 * Subject model — one of the nine SS2 Science Department subjects.
 *
 * Science subjects:
 *  Mathematics, Further Mathematics, English, Physics, Chemistry,
 *  Biology, Computer Science, Geography, Civic Education.
 */
public class Subject {

    private String id;        // e.g. "physics"
    private String name;      // e.g. "Physics"
    private String icon;      // emoji icon used in the UI
    private int totalTopics;  // number of note topics available

    public Subject() { }

    public Subject(String id, String name, String icon) {
        this.id = id;
        this.name = name;
        this.icon = icon;
    }

    public Subject(String id, String name, String icon, int totalTopics) {
        this(id, name, icon);
        this.totalTopics = totalTopics;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public int getTotalTopics() { return totalTopics; }
    public void setTotalTopics(int totalTopics) { this.totalTopics = totalTopics; }

    /** Static catalog of the SS2 Science Department subjects. */
    public static Subject[] catalog() {
        return new Subject[] {
            new Subject("mathematics",          "Mathematics",          "\uD83D\uDCD0", 4),
            new Subject("further-mathematics",  "Further Mathematics",  "\uD83D\uDCCA", 5),
            new Subject("english",              "English",              "\uD83D\uDCD6", 3),
            new Subject("physics",              "Physics",              "\u269B", 5),
            new Subject("chemistry",            "Chemistry",            "\uD83E\uDDEA", 5),
            new Subject("biology",              "Biology",              "\uD83D\uDD2C", 5),
            new Subject("computer-science",     "Computer Science",     "\uD83D\uDCBB", 4),
            new Subject("geography",            "Geography",            "\uD83C\uDF0D", 4),
            new Subject("civic-education",      "Civic Education",      "\uD83C\uDFDB", 4)
        };
    }

    @Override
    public String toString() {
        return "Subject{id='" + id + "', name='" + name + "', topics=" + totalTopics + "}";
    }
}
