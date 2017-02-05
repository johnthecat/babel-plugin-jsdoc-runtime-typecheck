class Test {
    /**
     * @returns {Number}
     * @typecheck
     */
    myMethod() {
        if (true) {
            return __executeTypecheck__("method Test.myMethod", "return", 1, "\"Number\"");
        } else {
            return __executeTypecheck__("method Test.myMethod", "return", 2, "\"Number\"");
        }
    }
}
