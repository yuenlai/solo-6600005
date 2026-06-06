package com.codeinterview.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
public class Submission {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String problemId;
    private String language;
    @Column(columnDefinition = "TEXT")
    private String code;
    private String status;
    private Integer runtime;
    private Integer memory;
    @Column(columnDefinition = "TEXT")
    private String testResults;
    private LocalDateTime submittedAt = LocalDateTime.now();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getProblemId() { return problemId; }
    public void setProblemId(String problemId) { this.problemId = problemId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
