"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Test = function Test() {
  _classCallCheck(this, Test);
};

/**
 * @param {Test} a
 * @returns {Test}
 * @typecheck
 */


function test(a) {
  __executeTypecheck__("test", "a", a, Test);

  return __executeTypecheck__("test", "return", a, Test);
}
