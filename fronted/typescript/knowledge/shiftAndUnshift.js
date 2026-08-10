/**
 * 模拟 Array.prototype.shift
 * 删除第一个元素，返回被删除元素
 */
function myShift() {
    // 【规范第一步】判断this不能是 null/undefined
    if (this === null || this === undefined) {
        throw new TypeError("Cannot read properties of null (reading 'length')");
    }
    // 把this转为对象（支持类数组）
    const O = Object(this);
    // 获取length，转数字
    const len = Number(O.length);
    if (len === 0) {
        return undefined;
    }
    // 保存第一个元素用于返回
    const firstItem = O[0];

    // 所有元素向前移动一位
    let k = 0;
    while (k < len - 1) {
        O[k] = O[k + 1];
        k++;
    }
    // 删除最后一个空位，长度-1
    delete O[len - 1];
    O.length = len - 1;

    return firstItem;
}

/**
 * 模拟 Array.prototype.unshift
 * 头部插入一个或多个元素，返回新长度
 * @param  {...any} items 需要插入的元素
 */
function myUnshift(...items) {
    if (this === null || this === undefined) {
        throw new TypeError("Cannot read properties of null (reading 'length')");
    }
    const O = Object(this);
    const len = Number(O.length);
    const insertCount = items.length;

    // 1. 将原有元素向后挪动 insertCount 个位置，腾出前面空间
    let k = len - 1;
    while (k >= 0) {
        O[k + insertCount] = O[k];
        k--;
    }

    // 2. 在头部依次放入新增元素
    for (let i = 0; i < insertCount; i++) {
        O[i] = items[i];
    }

    // 3. 更新长度
    O.length = len + insertCount;
    return O.length;
}

// 挂载原型（面试写上，实际项目不建议扩展原生原型）
Array.prototype.myShift = myShift;
Array.prototype.myUnshift = myUnshift;