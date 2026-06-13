

class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        nums_set = set(nums)
        result:int = 1
        for num in nums:
            currentNum:int = num
            currentLength:int = 1
            if num-1 in nums_set:
                continue
            else: 
                while currentNum+1 in nums_set:
                    currentNum+=1
                    currentLength+=1 
            result = max(currentLength,result)
        return result