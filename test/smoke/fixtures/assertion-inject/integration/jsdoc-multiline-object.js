"use strict";

/**
 * @param {Object} data
 * @param {Number} data.a
 * @param {Number} data.b
 * @returns {Number}
 * @typecheck
 */
function test(data) {
  __executeTypecheck__("test", "data", data, "{\"record\":\"Object\",\"fields\":{\"a\":\"Number\",\"b\":\"Number\"}}");

  return __executeTypecheck__("test", "return", data.a + data.b, "\"Number\"");
}
