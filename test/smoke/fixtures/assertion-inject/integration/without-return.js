"use strict";

/**
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 * @typecheck
 */
function test(a, b, c) {
  __executeTypecheck__("test", "a", a, "\"Number\"");

  __executeTypecheck__("test", "b", b, "\"Number\"");

  __executeTypecheck__("test", "c", c, "\"Number\"");

  var d = a + b + c;
}
