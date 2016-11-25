class Test {
    /**
     * @param {Number} a
     * @param {Number} b
     * @returns {Number}
     * @typecheck
     */
    myMethod(a, b) {
        __executeTypecheck__("method Test.myMethod", "a", a, "\"Number\"");

        __executeTypecheck__("method Test.myMethod", "b", b, "\"Number\"");

        return __executeTypecheck__("method Test.myMethod", "return", a + b, "\"Number\"");
    }
}
