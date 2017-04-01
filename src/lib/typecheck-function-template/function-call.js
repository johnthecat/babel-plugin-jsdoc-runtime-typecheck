const babelTemplate = require('babel-template');

/**
 * @param {String} name
 * @param {Object} t
 */
module.exports = (name, t) => {
    const template = babelTemplate(`${name}(FUNCTION_NAME, NAME, ARGUMENT, VALIDATOR);`);

    /**
     * @param {String} functionName
     * @param {String} name
     * @param {Node} argument
     * @param {Node} validator
     */
    return (functionName, name, argument, validator) => {
        return template({
            FUNCTION_NAME: t.stringLiteral(functionName),
            NAME: t.stringLiteral(name),
            ARGUMENT: argument,
            VALIDATOR: validator
        });
    };
};
