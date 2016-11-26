const chalk = require('chalk');

const PREFIX = chalk.bold.red.inverse('[TYPECHECK STRICT MODE]') + ':';

function createMessage(message) {
    return `${PREFIX} ${chalk.underline(message)}`;
}

module.exports.ERROR = {
    NO_ARGUMENT_IN_JSDOC: createMessage('This argument isn\'t covered by jsDoc comment, please, provide more info.'),
    NO_RETURN_IN_JSDOC: createMessage('Return expression isn\'t covered by jsDoc comment, please, provide more info.'),
    UNUSED_ARGUMENTS_IN_JSDOC: createMessage('Parameters described in JSDoc doesn\'t appear in function signature.'),
    EMPTY_RETURN_IN_FUNCTION: createMessage('Return statement is empty, but must provide data with specified type.')
};

/**
 * @param {NodePath} path
 * @param {String} error
 */
module.exports.throwException = function callError(path, error) {
    throw path.buildCodeFrameError(error);
};
