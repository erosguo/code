function climbStairs(n: number): number {

    let left = 1;
    let right = 2;
    if (n == 1) {
        return left;
    }
    if (n == 2) {
        return right;
    }
    let result: number = 0
    for (let index = 3; index <= n; index++) {
        result = left + right;
        left = right;
        right = result;
    }
    return result
};