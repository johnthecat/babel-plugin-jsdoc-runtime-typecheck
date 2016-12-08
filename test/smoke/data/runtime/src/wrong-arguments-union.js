// @typecheck

/**
 * @param {{id: Number, name: String}|null} data
 * @returns {Number}
 */
function test(data) {
    if (data) {
        return data.id;
    }
}

test({id: '2'});
