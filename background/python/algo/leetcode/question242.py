'''
给定两个字符串 s 和 t ，编写一个函数来判断 t 是否是 s 的 字母异位词。
'''
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        return "".join(sorted(list(s))) == "".join(sorted(list(t)))