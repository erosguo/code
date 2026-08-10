function isPrimeNumber(num: number): boolean {

    if (num <= 1 || !Number.isInteger(num)) { return false; }
    let result = true;

    for (let cur = 2; cur < num; cur++) {
        if (num % cur === 0) {
            return false;
        }
    }
    return result;
}

function getPrimeNumberList(num: number): number[] {
    const numberList: number[] = [];
    if (num <= 2) {
        return numberList;
    }
    for (let cur = 2; cur < num; cur++) {
        if (isPrimeNumber(cur)) {
            numberList.push(cur);
        }
    }
    return numberList;
}