
import java.util.HashMap;
import java.util.Map;
import java.util.Stack;

public class Question20 {
    static class Solution {
        public boolean isValid(String s) {
            Map<Character, Character> strMap = new HashMap<>();
            strMap.put(')', '(');
            strMap.put('}', '{');
            strMap.put(']', '[');
            Stack<Character> strStack = new Stack<>();
            for (int index = 0; index < s.length(); index++) {
                char current = s.charAt(index);
                if (strMap.containsKey(current)) {
                    char backChar = strMap.get(current);
                    if (!strStack.isEmpty() && strStack.peek() == backChar) {
                        strStack.pop();
                    } else {
                        strStack.add(current);
                    }
                } else {
                    strStack.add(current);

                }
            }
            return strStack.isEmpty();
        }
    }

    public static void run() {
        Solution s = new Solution();

        int[][] inputs = {};
        int[] expected = {};

        for (int i = 0; i < inputs.length; i++) {
            int result = s.method(inputs[i]);
            boolean pass = result == expected[i];
            System.out.println("Test " + (i + 1) + ": " + (pass ? "PASS" : "FAIL")
                    + " (got " + result + ", expected " + expected[i] + ")");
        }
    }

    public static void main(String[] args) {
        run();
    }
}