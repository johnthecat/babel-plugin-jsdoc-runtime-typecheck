const chalk = require('chalk');

const SEPARATOR = chalk.gray('➞');
const PREFIX = chalk.bold.red.inverse('[TYPECHECK STRICT MODE]') + ' ' + SEPARATOR;

function createMessage(message) {
    return `${PREFIX} ${chalk.underline(message)}`;
}

module.exports.ERROR = {
    NO_RETURN_IN_JSDOC: createMessage('Return statement type annotation missing.'),
    NO_ARGUMENT_IN_JSDOC: createMessage('Function argument type annotation missing.'),
    UNUSED_ARGUMENTS_IN_JSDOC: createMessage('Arguments described in type annotation doesn\'t appear in function signature.'),
    EMPTY_RETURN_IN_FUNCTION: createMessage('Return statement must return something.')
};

/**
 * @param {NodePath} path
 * @param {String} error
 */
module.exports.throwException = (path, error) => {
    let errorAnchorPath = path;

    if (path.node) {
        if (path.node.loc || path.node._loc) {
            errorAnchorPath = path;
        } else if (path.isReturnStatement() && path.node.argument) {
            errorAnchorPath = path.get('argument');
        }
    }

    throw errorAnchorPath.buildCodeFrameError(error);
};

/**
 * @param {NodePath} path
 * @param {String} component
 * @param {String} error
 */
module.exports.throwSpecificException = (path, component, error) => {
    const componentName = chalk.bold.yellow.inverse(`[${component}]`);
    const normalizedError = `${PREFIX} ${componentName} ${SEPARATOR} ${chalk.underline(error)}`;

    module.exports.throwException(path, normalizedError);
};
