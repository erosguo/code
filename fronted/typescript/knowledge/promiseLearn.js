// 定义Promise的三个状态常量（不可变）
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class myPromise {

    constructor(excutor) {
        this.status = PENDING;

        this.value = undefined;

        this.reason = undefined;

        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];
    }
}