function thirdMax(nums: number[]): number {
    const distinct = [...new Set(nums)].sort((a, b) => b - a);
    return distinct.length >= 3 ? distinct[2] : distinct[0];
}
