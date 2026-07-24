'''
给定一个字符串 s ，请你找出其中不含有重复字符的 最长 子串 的长度。
'''
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        if len(s) == 0:
            return 0
        if len(s) ==1:
            return 1
        left = 0
        right =1
        tempWindow = s[0:1]
        max_length:int = 1
        while right<len(s):
            if s[right] in tempWindow:
                left+=1
            else:
                right+=1
            tempWindow = s[left:right]
            max_length = max(len(tempWindow),max_length)
        return max_length
    
solution = Solution()
solution.lengthOfLongestSubstring("pwwkew")