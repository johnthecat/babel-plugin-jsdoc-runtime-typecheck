class Test {
    /**
     * @param {Number} a
     * @param {Number} b
     * @typecheck
     */
    constructor(a, b) {
        __executeTypecheck__("Test.constructor", "a", a, "\"Number\"");

        __executeTypecheck__("Test.constructor", "b", b, "\"Number\"");

        this._c = a + b;
    }
}
