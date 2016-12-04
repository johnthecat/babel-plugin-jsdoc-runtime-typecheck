// @typecheck

let variable = class {
    /**
     * @param {Number} a
     */
    constructor(a) {
        this._a = a;
    }

    /**
     * @returns {Number}
     */
    getA() {
        return this._a;
    }
};
