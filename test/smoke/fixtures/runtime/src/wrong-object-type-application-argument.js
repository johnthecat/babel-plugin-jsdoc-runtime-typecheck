// @typecheck

/**
 * @param {Object<Number>} obj
 * @returns {Number}
 */
function test(obj) {
    return obj.a + obj.b;
}

test({a: 1, b: '2'});
