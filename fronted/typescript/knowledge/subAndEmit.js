class EventEmitter {

    constructor() {
        this.handler = {};
    }

    on(type, handler, once = true) {
        const newHandler = {
            once: once,
            handler
        }
        if (this.handler[type]) {
            this.handler[type] = this.handler[type].filter(item => item.handler === handler);
            this.handler[type].push(newHandler);
        } else {
            this.handler[type] = [newHandler];
        }
    }

    emmit(type) {
        const deletedList = []
        this.handler[type]?.forEach(item => {
            item.handler();
            if (item.once) {
                deletedList.push([type, item.handler])
            }
        })
        deletedList.forEach(item => {
            this.off(...item)
        })

    }

    off(type, handler) {
        if (this.handler[type]) {
            this.handler[type] = this.handler[type]?.filter(item => item.handler === handler);
            if (this.handler[type].length === 0) {
                delete this.handler[type];
            }
        }
    }
}