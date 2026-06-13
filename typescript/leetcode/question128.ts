function longestConsecutive(nums: number[]): number {
    let result :number = 0;
    const nums_set = new Set(nums);
    nums_set.forEach(num=>{
        if(nums_set.has(num-1)){
            return
        }
        let currentNum = num;
        let currentLength = 1;
        while( nums_set.has(currentNum+1)){
            currentNum+=1;
            currentLength+=1;
        }
        result = currentLength>result?currentLength:result;
    })
    return result;
};