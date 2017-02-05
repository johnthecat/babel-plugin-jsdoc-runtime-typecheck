class Test {
    constructor() {
        this._a = a;
    }

    /**
     * @returns {Number}
     * @typecheck
     */
    get a() {
        return __executeTypecheck__("get Test.a", "return", this._a, "\"Number\"");
    }

    /**
     * @param {Number} a
     * @typecheck
     */
    set a(a) {
        __executeTypecheck__("set Test.a", "a", a, "\"Number\"");

        this._a = a;
    }
}
