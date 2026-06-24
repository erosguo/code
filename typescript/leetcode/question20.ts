function isValid(s: string): boolean {
    const stack_s = [];
    const s_map = new Map([[')', '('],
    [']', '['],
    ['}', '{']])
    for (let charts of s) {
        if (!s_map.has(charts)) {
            stack_s.push(charts);
        } else {
            if (stack_s.length !== 0 && stack_s[stack_s.length - 1] === s_map.get(charts)) {
                stack_s.pop();
            } else {
                return false;
            }
        }
    }
    return stack_s.length === 0;
};