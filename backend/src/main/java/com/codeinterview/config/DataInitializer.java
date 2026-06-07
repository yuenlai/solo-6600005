package com.codeinterview.config;

import com.codeinterview.model.Problem;
import com.codeinterview.repository.ProblemRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProblemRepository problemRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void run(String... args) throws Exception {
        if (problemRepository.count() == 0) {
            initializeProblems();
        }
    }

    private void initializeProblems() throws JsonProcessingException {
        Problem p1 = new Problem();
        p1.setTitle("两数之和");
        p1.setDifficulty("easy");
        p1.setDescription("给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。你可以按任意顺序返回答案。");
        p1.setExamples(objectMapper.writeValueAsString(List.of(
            new ExampleExample("[2,7,11,15], target = 9", "[0,1]", "因为 nums[0] + nums[1] == 9 ，返回 [0, 1]"),
            new ExampleExample("[3,2,4], target = 6", "[1,2]", "因为 nums[1] + nums[2] == 6 ，返回 [1, 2]")
        )));
        p1.setTestCases(objectMapper.writeValueAsString(List.of(
            new TestCaseExample("[2,7,11,15]\n9", "[0,1]", false),
            new TestCaseExample("[3,2,4]\n6", "[1,2]", false),
            new TestCaseExample("[3,3]\n6", "[0,1]", true),
            new TestCaseExample("[-1,-2,-3,-4,-5]\n-8", "[2,4]", true)
        )));
        p1.setTags(objectMapper.writeValueAsString(List.of("数组", "哈希表")));
        p1.setTimeLimit(2000);
        p1.setMemoryLimit(256);
        p1.setCreatedBy("system");
        problemRepository.save(p1);

        Problem p2 = new Problem();
        p2.setTitle("有效的括号");
        p2.setDifficulty("easy");
        p2.setDescription("给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s ，判断字符串是否有效。有效字符串需满足：左括号必须用相同类型的右括号闭合。左括号必须以正确的顺序闭合。每个右括号都有一个对应的相同类型的左括号。");
        p2.setExamples(objectMapper.writeValueAsString(List.of(
            new ExampleExample("s = \"()\"", "true", "输入: \"()\"\n输出: true"),
            new ExampleExample("s = \"(){}\"", "true", "输入: \"(){}\"\n输出: true"),
            new ExampleExample("s = \"(]\"", "false", "输入: \"(]\"\n输出: false")
        )));
        p2.setTestCases(objectMapper.writeValueAsString(List.of(
            new TestCaseExample("\"()\"", "true", false),
            new TestCaseExample("\"(){}\"", "true", false),
            new TestCaseExample("\"(]\"", "false", false),
            new TestCaseExample("\"([)]\"", "false", true),
            new TestCaseExample("\"{[]}\"", "true", true)
        )));
        p2.setTags(objectMapper.writeValueAsString(List.of("栈", "字符串")));
        p2.setTimeLimit(2000);
        p2.setMemoryLimit(256);
        p2.setCreatedBy("system");
        problemRepository.save(p2);

        Problem p3 = new Problem();
        p3.setTitle("无重复字符的最长子串");
        p3.setDifficulty("medium");
        p3.setDescription("给定一个字符串 s ，请你找出其中不含有重复字符的最长子串的长度。");
        p3.setExamples(objectMapper.writeValueAsString(List.of(
            new ExampleExample("s = \"abcabcbb\"", "3", "输入: s = \"abcabcbb\"\n输出: 3 \n解释: 因为无重复字符的最长子串是 \"abc\"，所以其长度为 3。"),
            new ExampleExample("s = \"bbbbb\"", "1", "输入: s = \"bbbbb\"\n输出: 1\n解释: 因为无重复字符的最长子串是 \"b\"，所以其长度为 1。"),
            new ExampleExample("s = \"pwwkew\"", "3", "输入: s = \"pwwkew\"\n输出: 3\n解释: 因为无重复字符的最长子串是 \"wke\"，所以其长度为 3。")
        )));
        p3.setTestCases(objectMapper.writeValueAsString(List.of(
            new TestCaseExample("\"abcabcbb\"", "3", false),
            new TestCaseExample("\"bbbbb\"", "1", false),
            new TestCaseExample("\"pwwkew\"", "3", false),
            new TestCaseExample("\"\"", "0", true),
            new TestCaseExample("\"au\"", "2", true),
            new TestCaseExample("\"abba\"", "2", true)
        )));
        p3.setTags(objectMapper.writeValueAsString(List.of("字符串", "滑动窗口", "哈希表")));
        p3.setTimeLimit(2000);
        p3.setMemoryLimit(256);
        p3.setCreatedBy("system");
        problemRepository.save(p3);

        Problem p4 = new Problem();
        p4.setTitle("两数相加");
        p4.setDifficulty("medium");
        p4.setDescription("给你两个非空的链表，表示两个非负的整数。它们每位数字都是按照逆序的方式存储的，并且每个节点只能存储一位数字。请你将两个数相加，并以相同形式返回一个表示和的链表。你可以假设除了数字 0 之外，这两个数都不会以 0 开头。");
        p4.setExamples(objectMapper.writeValueAsString(List.of(
            new ExampleExample("l1 = [2,4,3], l2 = [5,6,4]", "[7,0,8]", "输入：l1 = [2,4,3], l2 = [5,6,4]\n输出：[7,0,8]\n解释：342 + 465 = 807.")
        )));
        p4.setTestCases(objectMapper.writeValueAsString(List.of(
            new TestCaseExample("[2,4,3]\n[5,6,4]", "[7,0,8]", false),
            new TestCaseExample("[0]\n[0]", "[0]", false),
            new TestCaseExample("[9,9,9,9,9,9,9]\n[9,9,9,9]", "[8,9,9,9,0,0,0,1]", true)
        )));
        p4.setTags(objectMapper.writeValueAsString(List.of("链表", "数学", "递归")));
        p4.setTimeLimit(2000);
        p4.setMemoryLimit(256);
        p4.setCreatedBy("system");
        problemRepository.save(p4);

        Problem p5 = new Problem();
        p5.setTitle("合并K个升序链表");
        p5.setDifficulty("hard");
        p5.setDescription("给你一个链表数组，每个链表都已经按升序排列。请你将所有链表合并到一个升序链表中，返回合并后的链表。");
        p5.setExamples(objectMapper.writeValueAsString(List.of(
            new ExampleExample("lists = [[1,4,5],[1,3,4],[2,6]]", "[1,1,2,3,4,4,5,6]", "输入：lists = [[1,4,5],[1,3,4],[2,6]]\n输出：[1,1,2,3,4,4,5,6]\n解释：链表数组如下：\n[\n  1->4->5,\n  1->3->4,\n  2->6\n]\n将它们合并到一个有序链表中得到。\n1->1->2->3->4->4->5->6")
        )));
        p5.setTestCases(objectMapper.writeValueAsString(List.of(
            new TestCaseExample("[[1,4,5],[1,3,4],[2,6]]", "[1,1,2,3,4,4,5,6]", false),
            new TestCaseExample("[]", "[]", false),
            new TestCaseExample("[[]]", "[]", true),
            new TestCaseExample("[[1],[2],[3],[4],[5]]", "[1,2,3,4,5]", true)
        )));
        p5.setTags(objectMapper.writeValueAsString(List.of("链表", "分治", "堆（优先队列）", "归并排序")));
        p5.setTimeLimit(2000);
        p5.setMemoryLimit(256);
        p5.setCreatedBy("system");
        problemRepository.save(p5);

        System.out.println("========================================");
        System.out.println("数据初始化完成，共创建 " + problemRepository.count() + " 道题目");
        System.out.println("H2 控制台: http://localhost:8080/h2-console");
        System.out.println("JDBC URL: jdbc:h2:mem:codeinterview");
        System.out.println("用户名: sa");
        System.out.println("密码: (空)");
        System.out.println("========================================");
    }

    private static class ExampleExample {
        public Object input;
        public Object output;
        public String explanation;

        public ExampleExample(Object input, Object output, String explanation) {
            this.input = input;
            this.output = output;
            this.explanation = explanation;
        }
    }

    private static class TestCaseExample {
        public String input;
        public String expectedOutput;
        public boolean hidden;

        public TestCaseExample(String input, String expectedOutput, boolean hidden) {
            this.input = input;
            this.expectedOutput = expectedOutput;
            this.hidden = hidden;
        }
    }
}
