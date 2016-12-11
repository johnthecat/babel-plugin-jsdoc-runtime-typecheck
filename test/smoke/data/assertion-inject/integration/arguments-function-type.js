"use strict";

/**
 * @param {function()} callback
 * @returns {*}
 * @typecheck
 */
function test(callback) {
  __executeTypecheck__("test", "callback", callback, "\"Function\"");

  return callback();
}
