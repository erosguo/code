'''
给你一个非空数组，返回此数组中 第三大的数 。如果不存在，则返回数组中最大的数。
'''

class Solution:
    def thirdMax(self, nums: List[int]) -> int:
        nums_list = sorted(list(set(nums)))
        if len(nums_list) < 3:
            return nums_list[-1]
        else:
            return nums_list[3]