class Test {
    /**
     * @returns {Number}
     * @typecheck
     */
    myMethod() {
        if (true) {
            return __executeTypecheck__("method Test.myMethod", "return", 1, "\"Number\"");
        }
    }
}
