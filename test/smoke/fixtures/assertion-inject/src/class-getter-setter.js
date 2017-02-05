class Test {
    constructor() {
        this._a = a;
    }

    /**
     * @returns {Number}
     * @typecheck
     */
    get a() {
        return this._a;
    }

    /**
     * @param {Number} a
     * @typecheck
     */
    set a(a) {
        this._a = a;
    }
}
