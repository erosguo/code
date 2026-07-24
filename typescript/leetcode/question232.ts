class MyQueue {
    private currentList:Array<number> = [];

    constructor() {
        this.currentList = []
    }

    push(x: number): void {
        this.currentList.push(x)
    }

    pop(): number {
        return this.currentList.shift() as number
    }

    peek(): number {
        return this.currentList[0]
    }

    empty(): boolean {
        return this.currentList.length ===0
    }
}

/**
 * Your MyQueue object will be instantiated and called as such:
 * var obj = new MyQueue()
 * obj.push(x)
 * var param_2 = obj.pop()
 * var param_3 = obj.peek()
 * var param_4 = obj.empty()
 */