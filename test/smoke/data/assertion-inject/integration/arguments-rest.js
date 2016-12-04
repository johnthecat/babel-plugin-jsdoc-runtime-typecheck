"use strict";

/**
 * @param {Array<Number>} parameters
 * @returns {Number}
 * @typecheck
 */
function test() {
  for (var _len = arguments.length, parameters = Array(_len), _key = 0; _key < _len; _key++) {
    parameters[_key] = arguments[_key];
  }

  __executeTypecheck__("test", "parameters", parameters, "{\"root\":\"Array\",\"children\":[\"Number\"]}");

  return __executeTypecheck__("test", "return", parameters[0], "\"Number\"");
}
