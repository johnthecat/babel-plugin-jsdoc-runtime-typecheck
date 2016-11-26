const strictMode = require('../lib/strict-mode');
const normalizeValidator = require('../lib/normalize-validator');

module.exports = (typecheckFunctionCall, globalState, t) => {
    return {
        ReturnStatement(path) {
            if (path.getFunctionParent().node !== this.functionPath.node) {
                return;
            }

            let statement = this.jsDoc.returnStatement;
            let argument = path.get('argument');

            if (globalState.useStrict) {
                /**
                 * Case: function doesn't return anything, but can stop self execution with return statement.
                 */
                if (!statement && argument.node) {
                    strictMode.callError(path, strictMode.ERROR.NO_RETURN_IN_JSDOC);
                }

                /**
                 * Case: return in described in jsDoc, but real return statement in function is empty.
                 */
                if (!argument.node && statement) {
                    strictMode.callError(path, strictMode.ERROR.EMPTY_RETURN_IN_FUNCTION);
                }
            }

            if (!statement) {
                return;
            }

            let functionCall = typecheckFunctionCall(
                this.functionName,
                'return',
                argument.node || t.identifier('void 0'),
                normalizeValidator(path, statement, t)
            );

            argument.replaceWith(functionCall.expression);

            path.skip();
        }
    };

};
