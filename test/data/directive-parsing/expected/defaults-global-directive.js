//@typecheck

/**
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 * @returns {Number}
 */
function test(a, b, c) {
  __executeTypecheck__("test", "a", a, "\"Number\"");

  __executeTypecheck__("test", "b", b, "\"Number\"");

  __executeTypecheck__("test", "c", c, "\"Number\"");

  return __executeTypecheck__("test", "return", a + b + c, "\"Number\"");
}

/**
 * @param {String} a
 * @returns {Number}
 */
function parse(a) {
  __executeTypecheck__("parse", "a", a, "\"String\"");

  return __executeTypecheck__("parse", "return", parseInt(a, 10), "\"Number\"");
}

