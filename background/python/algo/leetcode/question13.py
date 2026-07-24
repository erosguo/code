class Solution:
    def romanToInt(self, s: str) -> int:
        roma_dict: dict[str, int] = {
            'I': 1,
            'V': 5,
            'X': 10,
            'L': 50,
            'C': 100,
            'D': 500,
            'M': 1000,
        }
        index = len(s) - 1
        result = roma_dict[s[index]]
        index -= 1
        while index >= 0:
            if roma_dict[s[index]] < roma_dict[s[index + 1]]:
                result -= roma_dict[s[index]]
            else:
                result += roma_dict[s[index]]
            index -= 1
        return result