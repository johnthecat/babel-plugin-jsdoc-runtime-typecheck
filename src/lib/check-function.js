const config = require('../../shared/config.json');

const ALLOWED_NODE_TYPE = 'CallExpression';
const FUNCTION_NAME = config.functionName;

/**
 * @param {NodePath} path
 * @return {Boolean}
 */
function traverseToReturnStatement(path) {
    let found = false;

    path.traverse({
        ReturnStatement(returnPath) {
            if (
                returnPath.node.argument &&
                returnPath.node.argument.type === ALLOWED_NODE_TYPE &&
                returnPath.node.argument.callee.name === FUNCTION_NAME
            ) {
                found = true;
                path.stop();
            }
        }
    });

    return found;
}

/**
 * @param {NodePath} path
 * @returns {Boolean}
 */
function findInsertedExpression(path) {
    if (path.isExpressionStatement()) {
        return (
            path.node.expression.type === ALLOWED_NODE_TYPE &&
            path.node.expression.callee.name === FUNCTION_NAME
        );
    }

    if (path.isReturnStatement()) {
        return (
            path.node.argument &&
            path.node.argument.type === ALLOWED_NODE_TYPE &&
            path.node.argument.callee.name === FUNCTION_NAME
        );
    }

    return traverseToReturnStatement(path);
}

/**
 * @param {NodePath} path
 * @returns {Boolean}
 */
module.exports = (path) => {
    /**
     * @type {Array<NodePath>}
     */
    let innerPaths = path.get('body.body');

    for (let index = 0, count = innerPaths.length; index < count; index++) {
        if (findInsertedExpression(innerPaths[index])) {
            return false;
        }
    }

    return true;
};
