package com.sciencehub.models;

import java.util.ArrayList;
import java.util.List;

/**
 * Quiz model — a single multiple-choice question and its metadata.
 * Questions are normally stored in /data/*.json and loaded by the
 * JavaScript quiz engine; this model mirrors that structure for the
 * optional Java backend.
 */
public class Quiz {

    private int id;
    private String subject;
    private String topic;
    private String difficulty;   // "Easy", "Medium", "Hard"
    private String question;
    private List<String> options;
    private int answer;          // index (0-3) of the correct option
    private String explanation;

    public Quiz() {
        this.options = new ArrayList<>();
    }

    public Quiz(int id, String subject, String topic, String difficulty,
                String question, List<String> options, int answer, String explanation) {
        this.id = id;
        this.subject = subject;
        this.topic = topic;
        this.difficulty = difficulty;
        this.question = question;
        this.options = options;
        this.answer = answer;
        this.explanation = explanation;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public int getAnswer() { return answer; }
    public void setAnswer(int answer) { this.answer = answer; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    /** Returns true when the given option index is the correct answer. */
    public boolean isCorrect(int selectedIndex) {
        return selectedIndex == answer;
    }

    /** Returns the text of the correct option. */
    public String correctOptionText() {
        if (options != null && answer >= 0 && answer < options.size()) {
            return options.get(answer);
        }
        return "";
    }

    @Override
    public String toString() {
        return "Quiz{id=" + id + ", subject='" + subject + "', topic='" + topic +
               "', difficulty='" + difficulty + "', answer=" + answer + "}";
    }
}
