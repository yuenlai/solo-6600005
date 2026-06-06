package com.codeinterview.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "problems")
public class Problem {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Column(nullable = false)
    private String title;
    private String difficulty;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(columnDefinition = "TEXT")
    private String examples;
    @Column(columnDefinition = "TEXT")
    private String testCases;
    private String tags;
    private int timeLimit = 2000;
    private int memoryLimit = 256;
    private LocalDateTime createdAt = LocalDateTime.now();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getExamples() { return examples; }
    public void setExamples(String examples) { this.examples = examples; }
    public String getTestCases() { return testCases; }
    public void setTestCases(String testCases) { this.testCases = testCases; }
}
