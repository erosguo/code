"""
给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出 和为目标值 target  的那 两个 整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。

你可以按任意顺序返回答案。
"""

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        nums_dict: Dict[int, int] = {}
        for i, num in enumerate(nums):
            nextNum = target - num
            if nextNum in nums_dict:
                return [i, nums_dict[nextNum]]
            nums_dict[num] = i
        return []
