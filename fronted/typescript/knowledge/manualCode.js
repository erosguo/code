function myShift() {
    if (!Array.isArray(this)) {
        return undefined;
    }
    const value = this.splice(0, 1);
    return value.length ? value[0] : undefined;
}

/** unshift */
function myUnShift() {
    if (!Array.isArray(this)) {
        return false;
    }
    const len = arguments.length;
    this.splice(0, 0, ...arguments);
    return this.length;
}

Array.prototype.myShift = myShift;
Array.prototype.myUnShift = myUnShift;

const a = [1, 2, 3];

a.myShift();

const current_url = "https://www.com/a?b=1"

function getUrlParams(url) {
    const params = new URLSearchParams(url);
    return Object.fromEntries(params.entries())
}

