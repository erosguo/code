'''
给你一个整数 columnNumber ，返回它在 Excel 表中相对应的列名称。

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
    def convertToTitle(self, columnNumber: int) -> str:
        result = []
        while columnNumber > 0:
            columnNumber -=1
            currentChar = columnNumber % 26
            result.append(chr(currentChar+ord("A")))
            columnNumber = columnNumber//26 
        return "".join(reversed(result))