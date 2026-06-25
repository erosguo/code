# Definition for singly-linked list.

from typing import Optional

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        if not list1.next:
            return list2
        if not list2.next:
            return list1
        headNode = null
        currentNode = headNode
        while list1.next or list2.next:
            if list1.val<list2.val:
                currentNode = ListNode


        