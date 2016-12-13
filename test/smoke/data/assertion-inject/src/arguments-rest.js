/**
 * @param {Number} num
 * @param {Array<Number>} parameters
 * @returns {Number}
 * @typecheck
 */
function test(num, ...parameters) {
    return num + parameters[0];
}
