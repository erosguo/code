
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;

public class Question169 {
    static class Solution {
        public int majorityElement(int[] nums) {
            List<Integer> aList = new ArrayList<>();
            for (int num : nums) {
                aList.add(num);
            }
            aList.sort((a, b) -> a - b);
            return aList.get(aList.size() / 2);
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