package com.codeinterview.repository;

import com.codeinterview.model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, String> {
    List<Problem> findByDifficulty(String difficulty);
    List<Problem> findByTagsContaining(String tag);
    List<Problem> findByDifficultyAndTagsContaining(String difficulty, String tag);
}
