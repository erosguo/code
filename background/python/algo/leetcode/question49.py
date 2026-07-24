class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        strs_dict:Dict[str,List[str]] = {}
        for str in strs:
            str_sort = "".join(sorted(str))
            if str_sort in strs_dict:
                strs_dict[str_sort].append(str)
            else :
                strs_dict[str_sort] = [str]
        return list(strs_dict.values())
