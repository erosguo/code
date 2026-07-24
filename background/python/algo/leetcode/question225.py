'''
请你仅使用两个队列实现一个后入先出（LIFO）的栈，并支持普通栈的全部四种操作（push、top、pop 和 empty）。

实现 MyStack 类：

void push(int x) 将元素 x 压入栈顶。
int pop() 移除并返回栈顶元素。
int top() 返回栈顶元素。
boolean empty() 如果栈是空的，返回 true ；否则，返回 false 。
'''
class MyStack:

    def __init__(self):
        self.list = []
        

    def push(self, x: int) -> None:
        self.list.append(x)
        

    def pop(self) -> int:
        if self.empty() :
            raise  Exception("数组为空")
        result = self.list.pop()
        return result

    def top(self) -> int:
        if self.empty() :
            raise  Exception("数组为空")
        return self.list[-1]

    def empty(self) -> bool:
        return len(self.list) == 0
        


# Your MyStack object will be instantiated and called as such:
# obj = MyStack()
# obj.push(x)
# param_2 = obj.pop()
# param_3 = obj.top()
# param_4 = obj.empty()