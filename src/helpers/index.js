function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const sleep = async (fn, s = 1, ...args) => {
    await timeout(s * 1000);
    return fn(...args);
}

export { sleep };