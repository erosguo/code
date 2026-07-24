function lengthOfLongestSubstring(s: string): number {
    let sLen: number = s.length
    if (sLen === 0 || sLen === 1) {
        return sLen
    }
    let left = 0;
    let right = 1;
    let result = 1;
    let window = s.slice(left, right)
    while (right < sLen) {
        if (window.indexOf(s.charAt(right)) !== -1) {
            left++;

        } else {
            right++;
        }
        window = s.slice(left, right)
        result = Math.max(window.length, result)
    }
    return result

};