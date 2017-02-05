/**
 * @param {Number} a
 * @returns {Number}
 * @typecheck
 */
function firstFunction(a) {
  __executeTypecheck__("firstFunction", "a", a, "\"Number\"");

  return __executeTypecheck__("firstFunction", "return", a, "\"Number\"");
}

/**
 * @param {Number} a
 * @returns {Number}
 */
function secondFunction(a) {
  return a;
}
