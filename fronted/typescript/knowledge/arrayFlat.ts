

function myFlat<T>(data: T[]): T[] {
    const result: T[] = [];
    const keySet = new Set();
    for (let item of data) {
        if (Array.isArray(item)) {
            result.push(...myFlat(item));
        } else {
            result.push(item);
        }
    }
    return result;
}

function myFlat1<T>(data: T[]): T[] {
    const result: T[] = [];
    const stack = data.map(item => item).reverse();
    while (stack.length > 0) {
        const item = stack.pop();
        if (Array.isArray(item)) {
            stack.push(...item.map(newItem => newItem));
        } else {
            result.push(item as T);
        }
    }
    return result;
}


function myFlat2(data: any[], deep: number = 1): any[] {
    const result: any[] = [];
    for (let item of data) {
        if (Array.isArray(item) && deep > 0) {
            result.push(...myFlat2(item, deep - 1));
        } else {
            result.push(item);
        }
    }
    return result;
}