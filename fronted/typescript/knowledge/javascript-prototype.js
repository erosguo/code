function myInstanceOf(obj, Consturctor) {
    if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
        return false;
    }
    if (typeof Consturctor !== 'function' || Consturctor.prototype === null) {
        throw new TypeError("Right-hand side of instanceof is not callable")
    }
    let proto = Object.getPrototypeOf(obj)   // 等价于 obj.__proto__
    const target = Constructor.prototype;
    while (proto !== null) {
        if (proto === target) {
            return true
        }
        proto = Object.getPrototypeOf(proto);
    }
    return false
}