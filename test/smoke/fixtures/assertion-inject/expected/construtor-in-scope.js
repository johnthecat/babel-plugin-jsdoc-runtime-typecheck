class Test {}

/**
 * @param {Test} a
 * @returns {Test}
 * @typecheck
 */
function test(a) {
  __executeTypecheck__("test", "a", a, Test);

  return __executeTypecheck__("test", "return", a, Test);
}
