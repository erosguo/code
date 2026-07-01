class ListNode {
    val: number
    next: ListNode | null
    constructor(val?: number, next?: ListNode | null) {
        this.val = (val === undefined ? 0 : val)
        this.next = (next === undefined ? null : next)
    }
}

function isPalindrome(head: ListNode | null): boolean {
    let currentNode: ListNode | null = head
    let list_stack: number[] = []
    while (currentNode != null) {
        list_stack.push(currentNode.val)
        currentNode = currentNode.next
    }

    currentNode = head
    for (let i = list_stack.length - 1; i >= 0; i--) {
        if (list_stack[i] == currentNode?.val) {
            currentNode = currentNode.next
        }

        else
            return false
    }
    return true
}
