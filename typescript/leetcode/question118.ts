function generate(numRows: number): number[][] {
    let result = [] as number[][];
    for (let indexI = 0; indexI < numRows; indexI++) {
        result[indexI] = new Array(indexI + 1).fill(1);
        for (let indexJ = 1; indexJ < indexI; indexJ++) {
            result[indexI][indexJ] = result[indexI - 1][indexJ - 1] + result[indexI - 1][indexJ]
        }

    }
    return result;
};