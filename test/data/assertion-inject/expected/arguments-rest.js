/**
 * @param {Array<Number>} parameters
 * @returns {Number}
 * @typecheck
 */
function test(...parameters) {
  __executeTypecheck__("test", "parameters", parameters, "{\"root\":\"Array\",\"children\":[\"Number\"]}");

  return __executeTypecheck__("test", "return", parameters[0], "\"Number\"");
}

