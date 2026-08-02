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


function longestConsecutive1(nums: number[]): number {
    const numsSet = new Set(nums);
    let result = 0;
    const numsList = [...numsSet].sort((a,b)=>a-b);
    for(let i=numsList.length-1,tempResult = 1;i>=0;i--){
        const num = numsList[i];
        if(numsSet.has(num-1)){
            tempResult++;
        }else{
            result = result>tempResult?result:tempResult;
            tempResult=1;
        }
    }
    return result;
};