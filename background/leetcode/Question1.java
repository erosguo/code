import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class Question1 {
    static class Solution {
        public int[] twoSum(int[] nums, int target) {
            Map<Integer, Integer> map = new HashMap<>();
            for (int i = 0; i < nums.length; i++) {
                int complement = target - nums[i];
                if (map.containsKey(complement)) {
                    return new int[]{map.get(complement), i};
                }
                map.put(nums[i], i);
            }
            return null;
        }
    }

    public static void run() {
        Solution s = new Solution();

        int[][] testCases = {
            {2, 7, 11, 15},
            {3, 2, 4},
            {3, 3}
        };
        int[] targets = {9, 6, 6};
        int[][] expected = {
            {0, 1},
            {1, 2},
            {0, 1}
        };

        for (int i = 0; i < testCases.length; i++) {
            int[] result = s.twoSum(testCases[i], targets[i]);
            boolean pass = Arrays.equals(result, expected[i]);
            System.out.println("Test " + (i + 1) + ": " + (pass ? "PASS" : "FAIL")
                    + " " + Arrays.toString(result));
        }
    }

    public static void main(String[] args) {
        run();
    }
}