class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        nums_dict ={}
        for i,num in enumerate(nums):
            if num in nums_dict:
                if i -nums_dict[num] <=k:
                    return True
                else:
                    nums_dict[num] = i
            else:
                nums_dict[num] = i
        return False