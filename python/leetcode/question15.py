class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        left =0
        right = len(nums)-1
        nums.sort()
        result = []
        while left < right:
            nextNum = 0-nums[left] - nums[right]
            if nextNum in nums:
                try:
                    temp = nums.index(nextNum,left+1,max(left+1,right-1))
                    result.append([nums[left],nextNum,nums[right]])
                except e:
                    pass
                
                    
            if nextNum <= 0:
                left+=1
            else:
                right-=1
        return result