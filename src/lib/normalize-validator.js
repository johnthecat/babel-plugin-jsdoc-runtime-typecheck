const DEFAULT_TYPES = ['Object', 'Number', 'String', 'Boolean', 'Array'];

/**
 * @param {NodePath} path
 * @param {String|Object|Array} type
 * @param {Object} t
 * @returns {Node}
 */
module.exports = (path, type, t) => {
    let validator;

    if (
        typeof type === 'string' && !DEFAULT_TYPES.includes(type) &&
        path.scope.hasBinding(type)
    ) {
        validator = t.identifier(type);
    } else {
        validator = t.stringLiteral(JSON.stringify(type));
    }

    return validator;
};
