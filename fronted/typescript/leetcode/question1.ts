function twoSum(nums: number[], target: number): number[] {
    const nums_dict = new Map();
    for(let index=0;index<nums.length;index++){
        const tempNum= target - nums[index];
        if(nums_dict.has(tempNum)){
            return [index,nums_dict.get(tempNum)]
        }
        nums_dict.set(nums[index],index)
    }
    return [];
};