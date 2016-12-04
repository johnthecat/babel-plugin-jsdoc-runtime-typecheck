"use strict";

/**
 * @param {Number} a
 * @returns {Number}
 * @typecheck
 */
var arrowFunctionExpression = function arrowFunctionExpression(a) {
  __executeTypecheck__("Anonymous function", "a", a, "\"Number\"");

  return __executeTypecheck__("Anonymous function", "return", a * 2, "\"Number\"");
};
