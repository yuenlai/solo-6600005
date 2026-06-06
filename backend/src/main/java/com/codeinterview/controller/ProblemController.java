package com.codeinterview.controller;

import com.codeinterview.model.Problem;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    @GetMapping
    public List<Problem> listProblems() {
        return new ArrayList<>();
    }

    @GetMapping("/{id}")
    public Problem getProblem(@PathVariable String id) {
        return null;
    }

    @PostMapping
    public Problem createProblem(@RequestBody Problem problem) {
        return problem;
    }
}
