
import java.util.ArrayList;


public class Question70 {
    static class Solution {
        public int climbStairs(int n) {
            // if (n == 1 || n == 2) {
            //     return n;
            // }
            // return climbStairs(n - 1) + climbStairs(n - 2);
            if (n == 1 || n == 2) {
                return n;
            }
            int[] nList = new int[n+1];
            nList[0] = 0;
            nList[1]=1;
            nList[2]=2;
            for(int index=3;index<n+1;index++){
                nList[index] = nList[index-1]+nList[index-2];
            }
            return nList[n];
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