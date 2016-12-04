/**
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 * @returns {Number}
 * @typecheck
 */
function test({t: a, b = 1, c}) {
    return a + b + c;
}
