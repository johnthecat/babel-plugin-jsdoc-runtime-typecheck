// @typecheck

/**
 * @param {Object} data
 * @param {Number} data.a
 * @param {Number} data.b
 * @returns {Number}
 */
function test(data) {
    return data.a + data.b;
}

test({
    a: 1,
    c: '2'
});
