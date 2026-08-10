// 获取指定范围的随机数
function getRandow(min: number, max: number) {
    // Math.random() 的返回值非常明确：一个浮点伪随机数，范围从 0（包含）到 1（不包含）
    // Math.floor 
    // (min,max)
    let num1 = Math.round(Math.random() * (max - min - 2) + min + 1);
    // [min,max]
    let num2 = Math.round(Math.random() * (max - min) + min);
    // (min,max]
    let num3 = Math.ceil(Math.random() * (max - min) + min);
    // [min,max)
    let num4 = Math.floor(Math.random() * (max - min) + min);
}