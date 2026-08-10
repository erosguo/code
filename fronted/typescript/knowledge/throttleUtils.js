function myThrottle(fn, delay) {
    let timer;
    return function (...args) {
        if (timer) {
            return
        }
        timer = setTimeout(() => {
            fn.apply(this, args);
            clearTimeout(timer);
        }, delay)
    }
}