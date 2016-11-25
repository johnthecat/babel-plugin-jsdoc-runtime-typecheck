let myObject = {
    /**
     * @param {Number} a
     * @param {Number} b
     * @returns {Number}
     * @typecheck
     */
    myMethod(a, b) {
        __executeTypecheck__("myMethod", "a", a, "\"Number\"");

        __executeTypecheck__("myMethod", "b", b, "\"Number\"");

        return __executeTypecheck__("myMethod", "return", a + b, "\"Number\"");
    }
};
