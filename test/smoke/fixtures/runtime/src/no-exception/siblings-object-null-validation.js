// @typecheck

/**
 * @param {{id: Number, name: String}|null} data
 * @returns {Number}
 */
function test(data) {
    if (data) {
        return data.id;
    } else {
        return 1;
    }
}

test({id: 2, name: 'test'});
test(null);
