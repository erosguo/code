
function makeGood(s: string): string {
    let s_stack: string[] = []
    for (let i = 0; i < s.length; i++) {
        if (s_stack.length !== 0 && s_stack[s_stack.length - 1] !== s.charAt(i) && s_stack[s_stack.length - 1].toLocaleLowerCase() === s.charAt(i).toLowerCase()) {
            s_stack.pop()
        } else {
            s_stack.push(s.charAt(i))
        }
    }
    return s_stack.join("");
};



