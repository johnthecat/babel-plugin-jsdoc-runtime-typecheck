"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Test =
/**
 * @param {Number} a
 * @param {Number} b
 * @typecheck
 */
function Test(a, b) {
    _classCallCheck(this, Test);

    __executeTypecheck__("Test.constructor", "a", a, "\"Number\"");

    __executeTypecheck__("Test.constructor", "b", b, "\"Number\"");

    this._c = a + b;
};

