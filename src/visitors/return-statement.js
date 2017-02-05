const strictMode = require('../lib/strict-mode');
const normalizeValidator = require('../lib/normalize-validator');

const VALIDATOR_METHOD_NAME = 'return';

/**
 * @param {Function} typecheckFunctionCall
 * @param {Object} globalState
 * @param {Object} t
 * @returns {{ReturnStatement: Function}}
 */
module.exports = (typecheckFunctionCall, globalState, t) => {
    return {
        ReturnStatement(path) {
            /**
             * Check for valid function parent, prevents changing return statements in nested functions
             */
            if (path.getFunctionParent().node !== this.functionPath.node) {
                path.stop();
                return;
            }

            let statement = this.jsDoc.returnStatement;
            let argument = path.get('argument');

            if (globalState.useStrict) {
                /**
                 * Case: function doesn't return anything, but can stop self execution with return statement.
                 */
                if (statement === void(0) && argument.node) {
                    strictMode.throwException(path, strictMode.ERROR.NO_RETURN_IN_JSDOC);
                }

                /**
                 * Case: return in described in jsDoc, but real return statement in function is empty.
                 */
                if (statement !== void(0) && !argument.node) {
                    strictMode.throwException(path, strictMode.ERROR.EMPTY_RETURN_IN_FUNCTION);
                }
            }

            if (statement) {
                let functionCall = typecheckFunctionCall(
                    this.functionName,
                    VALIDATOR_METHOD_NAME,
                    argument.node || t.identifier('void(0)'),
                    normalizeValidator(path, statement, t)
                );

                argument.replaceWith(functionCall.expression);
            }
        }
    };
};
