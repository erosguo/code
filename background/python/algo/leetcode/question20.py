class Solution:
    def isValid(self, s: str) -> bool:
        stack_s = []
        for charts in s:
            if charts in ['(', '{', '[']:
                stack_s.append(charts)
            else:
                if not stack_s:
                    return False
                if charts == ')' and stack_s[-1] == '(':
                    stack_s.pop()
                elif charts == ']' and stack_s[-1] == '[':
                    stack_s.pop()
                elif charts == '}' and stack_s[-1] == '{':
                    stack_s.pop()
                else:
                    return False
        return len(stack_s) == 0