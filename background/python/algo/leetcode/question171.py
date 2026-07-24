'''
给你一个字符串 columnTitle ，表示 Excel 表格中的列名称。返回 该列名称对应的列序号 。

例如：

A -> 1
B -> 2
C -> 3
...
Z -> 26
AA -> 27
AB -> 28 
...
'''

class Solution:
    def titleToNumber(self, columnTitle: str) -> int:
        result = 0
        base_as = ord("A")
        for s in columnTitle:
            result = result * 26 +ord(s)-base_as+1;
        return result