function arrayDed<T>(data: Array<T>) {
    const array1 = [...new Set(data)];
    const array2 = data.filter((item, index) => data.indexOf(item) !== index);
    const array3 = data.reduce((pre: T[], cur: T) => {
        if (pre.indexOf(cur) === -1) {
            pre.push(cur);
        }
        return pre;
    }, []);
}

// 辅助：对对象的所有键进行排序（递归处理内部对象，但不处理数组内部顺序，这里保持原样）
function sortKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    // 如果数组里还有对象，递归排序它们
    return obj.map(item => sortKeys(item));
  }
  // 普通对象：按键名排序后重建
  const sorted: any = {};
  Object.keys(obj)
    .sort()
    .forEach(key => {
      sorted[key] = sortKeys(obj[key]); // 递归处理嵌套对象
    });
  return sorted;
}

function deepUniqueByContent<T>(arr: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of arr) {
    let key: string;

    if (Array.isArray(item)) {
      // 数组：先递归去重内部子项，再序列化
      const processedChild = deepUniqueByContent(item);
      key = JSON.stringify(processedChild);
    } else if (item && typeof item === 'object') {
      // 对象：排序键后序列化
      key = JSON.stringify(sortKeys(item));
    } else {
      // 原始类型（注意区分 1 和 '1'）
      key = typeof item === 'string' ? `s:${item}` : `n:${item}`;
    }

    if (!seen.has(key)) {
      seen.add(key);
      result.push(item); // 若对象内部有数组，因我们只比较内容，此处推原引用即可
    }
  }
  return result;
}

// 测试
const data = [{a: 1, b: 2}, {b: 2, a: 1}, [1, 2], [1, 2], 1, '1'];
console.log(deepUniqueByContent(data)); 
// 输出: [ { a: 1, b: 2 }, [ 1, 2 ], 1, '1' ]  
// 注意：1 和 '1' 被区分开了，若想忽略类型，可统一用 String(item) 作为 key