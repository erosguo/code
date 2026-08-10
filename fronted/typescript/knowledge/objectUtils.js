
// new 
function myCreate(Constructor, ...args) {
    // 1. 创建新对象，原型指向 Constructor.prototype
    const obj = Object.create(Constructor.prototype)
    // 2. 执行构造函数，绑定 this
    const result = Constructor.apply(obj, args)
    // 3. 构造函数返回对象则用之，否则返回新对象
    return result instanceof Object ? result : obj
}