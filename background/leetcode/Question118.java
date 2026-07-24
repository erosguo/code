
import java.util.ArrayList;
import java.util.List;

public class Question118 {
    static class Solution {
        public List<List<Integer>> generate(int numRows) {
            List<List<Integer>> resuList = new ArrayList<List<Integer>>(); 
            for(int index=0;index<numRows;index++){
                List<Integer> simList = new ArrayList<Integer>();
                for(int simIndex=0;simIndex<index;simIndex++){
                    if(simIndex-1>0&&simIndex+1<index && index-1>0){
                        simList.add(resuList.get(index-1).get(simIndex-1)+resuList.get(index-1).get(simIndex+1));
                    }else{
                        simList.add(1);
                    }
                }
                resuList.add(simList);
            }
            return resuList;
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