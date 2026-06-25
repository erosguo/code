class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        nums = sorted(nums)
        index =0
        while index<len(nums)-1:
            if nums[index]!=nums[index+1]:
                return nums[index]
            index+=2
        return nums[len(nums)-1]