// @typecheck

let variable = class {
    /**
     * @param {Number} a
     */
    constructor(a) {
        __executeTypecheck__("Anonymous class.constructor", "a", a, "\"Number\"");

        this._a = a;
    }

    /**
     * @returns {Number}
     */
    getA() {
        return __executeTypecheck__("method Anonymous class.getA", "return", this._a, "\"Number\"");
    }
};

