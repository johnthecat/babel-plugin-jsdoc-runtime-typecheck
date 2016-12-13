"use strict";

/**
 * @param {Number} num
 * @param {Array<Number>} parameters
 * @returns {Number}
 * @typecheck
 */
function test(num) {
  __executeTypecheck__("test", "num", num, "\"Number\"");

  for (var _len = arguments.length, parameters = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    parameters[_key - 1] = arguments[_key];
  }

  __executeTypecheck__("test", "parameters", parameters, "{\"root\":\"Array\",\"children\":[\"Number\"]}");

  return __executeTypecheck__("test", "return", num + parameters[0], "\"Number\"");
}
