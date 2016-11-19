const babelTemplate = require('babel-template');

/**
 * @param {String} name
 * @param {Object} t
 */
module.exports = (name, t) => {
    let template = babelTemplate(`${name}(FUNCTION_NAME, NAME, ARGUMENT, VALIDATOR);`);

    return (functionName, name, argument, validator) => {
        return template({
            FUNCTION_NAME: functionName ? t.stringLiteral(functionName) : t.stringLiteral('Unnamed function'),
            NAME: t.stringLiteral(name),
            ARGUMENT: argument,
            VALIDATOR: validator
        })
    };
};