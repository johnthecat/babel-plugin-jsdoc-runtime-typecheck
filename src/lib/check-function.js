const config = require('../../config.json');

/**
 * @param {NodePath} path
 * @returns {Boolean}
 */
module.exports = (path) => {
    /**
     * @type {Array<NodePath>}
     */
    let innerPaths = path.get('body').get('body');

    /**
     * @type {Array<NodePath>}
     */
    let expressions = innerPaths.filter((innerPath) => {
        if (!innerPath.isExpressionStatement()) {
            return false;
        }

        return (
            innerPath.node.expression.type === 'CallExpression' &&
            innerPath.node.expression.callee.name === config.functionName
        );
    });

    return expressions.length === 0;
};
