function groupAnagrams(strs: string[]): string[][] {
    const strs_dict = new Map<string, string[]>();
    for (let index = 0; index < strs.length; index++) {
        const sortedStr = strs[index].split("").sort().join("");
        if (strs_dict.has(sortedStr)){
            strs_dict.get(sortedStr)?.push(strs[index]);
        }else{
            strs_dict.set(sortedStr,[strs[index]]);
        }
    }
    return Array.from(strs_dict.values());
};