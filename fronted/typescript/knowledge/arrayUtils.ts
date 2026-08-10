function arrayRandomSort() {
    var a = [1, 2, 3, 4];
    for (let i = 0; i < a.length; i++) {
        let randomIndex = Math.floor(Math.random() * a.length);
        const cur = a[i];
        a[i] = a[randomIndex];
        a[randomIndex] = cur;
    }
    a.sort((a, b) => Math.random() - 0.5);
}
