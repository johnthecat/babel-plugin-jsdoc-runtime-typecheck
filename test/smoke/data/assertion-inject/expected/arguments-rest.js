/**
 * @param {Number} num
 * @param {Array<Number>} parameters
 * @returns {Number}
 * @typecheck
 */
function test(num, ...parameters) {
  __executeTypecheck__("test", "num", num, "\"Number\"");

  __executeTypecheck__("test", "parameters", parameters, "{\"root\":\"Array\",\"children\":[\"Number\"]}");

  return __executeTypecheck__("test", "return", num + parameters[0], "\"Number\"");
}

