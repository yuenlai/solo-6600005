package com.codeinterview.controller;

import com.codeinterview.model.Submission;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @PostMapping
    public Submission submitCode(@RequestBody Submission submission) {
        submission.setStatus("pending");
        return submission;
    }

    @GetMapping("/{id}/status")
    public Submission getSubmissionStatus(@PathVariable String id) {
        return null;
    }

    @GetMapping
    public List<Submission> listSubmissions() {
        return new ArrayList<>();
    }
}
