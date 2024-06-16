function plus1(x) {
    return x + 1;
}

function multi5(x) {
    return 5 * x;
}

function compose(f, g) {
    return function (x) {
        return f(g(x));
    }
} 
