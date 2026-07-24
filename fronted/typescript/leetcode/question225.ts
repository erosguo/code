class MyStack {
    private list: Array<number>;

    constructor() {
        this.list = []
    }

    push(x: number): void {
        this.list.push(x)
    }

    pop(): number {
        if (this.list.length === 0) {
            throw new Error("数组不存在")
        }
        return this.list.pop() as number
    }

    top(): number {
        if (this.list.length === 0) {
            throw new Error("数组不存在")
        }
        return this.list[this.list.length - 1]
    }

    empty(): boolean {
        return this.list.length === 0
    }
}

/**
 * Your MyStack object will be instantiated and called as such:
 * var obj = new MyStack()
 * obj.push(x)
 * var param_2 = obj.pop()
 * var param_3 = obj.top()
 * var param_4 = obj.empty()
 */