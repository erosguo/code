'''
给你一个单链表的头节点 head ，请你判断该链表是否为回文链表。如果是，返回 true ；否则，返回 false 。
'''

# Definition for singly-linked list.
from typing import Optional


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
        
class Solution:
    def isPalindrome(self, head: Optional[ListNode]) -> bool:
        currentNode = head
        list_stack = []
        while currentNode!=None:
            list_stack.append(currentNode.val)
            currentNode = currentNode.next
        currentNode = head
        for i in range(len(list_stack)-1,-1,-1):
            if list_stack[i] == currentNode.val:
                currentNode = currentNode.next
            else:
                return False
        return True