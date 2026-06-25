'''
给定两个字符串 s 和 t ，它们只包含小写字母。

字符串 t 由字符串 s 随机重排，然后在随机位置添加一个字母。

请找出在 t 中被添加的字母。
'''
class Solution:
    def findTheDifference(self, s: str, t: str) -> str:
        char_dict = {}
        for char in s:
            if char in char_dict:
                char_dict[char] +=1
            else:
                char_dict[char] = 1
        for char in t:
            if char in char_dict:
                char_dict[char] -=1
                if char_dict[char] < 0:
                    return char
            else:
                return char