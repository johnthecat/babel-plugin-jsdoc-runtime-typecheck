/**
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 * @returns {Number}
 * @typecheck
 */
function functionDeclaration(a, b, c) {
  __executeTypecheck__("functionDeclaration", "a", a, "\"Number\"");

  __executeTypecheck__("functionDeclaration", "b", b, "\"Number\"");

  __executeTypecheck__("functionDeclaration", "c", c, "\"Number\"");

  return __executeTypecheck__("functionDeclaration", "return", a + b + c, "\"Number\"");
}
