'''
给定一个  无重复元素 的 有序 整数数组 nums 。

区间 [a,b] 是从 a 到 b（包含）的所有整数的集合。

返回 恰好覆盖数组中所有数字 的 最小有序 区间范围列表 。也就是说，nums 的每个元素都恰好被某个区间范围所覆盖，并且不存在属于某个区间但不属于 nums 的数字 x 。

列表中的每个区间范围 [a,b] 应该按如下格式输出：

"a->b" ，如果 a != b
"a" ，如果 a == b
'''
from typing import List


class Solution:
    def summaryRanges(self, nums: List[int]) -> List[str]:
        result: List[str] = []          # 存放最终区间列表
        i = 0                           # 扫描指针
        n = len(nums)                   # 数组长度
        while i < n:                    # 遍历每个元素
            start = nums[i]             # 当前区间起点
            while i + 1 < n and nums[i + 1] == nums[i] + 1:  # 持续找到连续序列的末尾
                i += 1                  # 指针后移
            if start != nums[i]:        # 区间有多个元素
                result.append(f"{start}->{nums[i]}")  # 格式化为 "a->b"
            else:                       # 区间只有一个元素
                result.append(str(start))             # 格式化为 "a"
            i += 1                      # 移动到下一个待处理的元素
        return result                   # 返回所有区间
