from typing import List

class TreeNode:
    def __init__(self):
        self.node:int|None = None
        self.left: TreeNode|None = None
        self.right: TreeNode|None = None

def breadth_first_traversal(root:TreeNode|None)->List[int]:
    if root is None:
        return []
    result:List[int] = []
    
    result.append(root.node)
    if root.left is not None:
        result.append(...breadth_first_traversal(root.left))
    if  root.right is not None:
        result.append(...breadth_first_traversal(root.right))
    return result   