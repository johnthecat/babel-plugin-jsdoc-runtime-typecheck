// @typecheck

/**
 * @param {{a: Number, b: Number}} record
 * @returns {Number}
 */
function test(record) {
    return record.a + record.b;
}

test({
    a: 1,
    b: '2'
});
