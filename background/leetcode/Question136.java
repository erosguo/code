
public class Question136 {
    static class Solution {
    public int singleNumber(int[] nums) {
        int result = 0;
        for(int num:nums){
            result^=num;
        }
        return result;
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