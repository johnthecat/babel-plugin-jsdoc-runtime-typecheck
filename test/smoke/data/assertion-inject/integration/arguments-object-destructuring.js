"use strict";

/**
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 * @returns {Number}
 * @typecheck
 */
function test(_ref) {
  var a = _ref.t,
      _ref$b = _ref.b,
      b = _ref$b === undefined ? 1 : _ref$b,
      c = _ref.c;

  __executeTypecheck__("test", "a", a, "\"Number\"");

  __executeTypecheck__("test", "b", b, "\"Number\"");

  __executeTypecheck__("test", "c", c, "\"Number\"");

  return __executeTypecheck__("test", "return", a + b + c, "\"Number\"");
}


