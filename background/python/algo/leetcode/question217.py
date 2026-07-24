class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        nums_dict = []
        for num in nums:
            if num in nums_dict:
                return True
            else:
                nums_dict.append(num)
        return False