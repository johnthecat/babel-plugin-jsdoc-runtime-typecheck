/**
 * How it works:
 * 1. It makes initialization - gets config, called template factories, sets flags to default state.
 * 2. Plugin traverse in 3 ways:
 *      - basic function declarations (FunctionDeclaration, ArrowFunctionExpression, etc.)
 *      - variable declarations with declared function
 *      - return statement with function as argument
 * 3. It tries to find closest block comment, that can be relative to this function.
 * 4. It tries to parse it with doctrine (https://github.com/eslint/doctrine).
 * 5. It makes function body normalization (removes "(a) => a * a" cases, makes it multiline)
 * 6. It inserts type check function call for arguments.
 * 7. It makes traverse for all return statements, relative to this function.
 * 8. It adds typecheck function call into return statement.
 * 9. If some function were transformed by plugin, on exit of Program it adds typecheck function declaration to file.
 */

require('core-js/fn/object/assign');
require('core-js/fn/array/includes');
require('core-js/fn/string/includes');

const config = require('../shared/config.json');
const typecheckTemplate = require('./lib/typecheck-function-template');
const findGlobalDirective = require('./lib/find-global-directive');
const functionVisitorsFactory = require('./visitors');


/**
 * @param {Object} t
 * @returns {{visitor: Object}}
 */
module.exports = function ({types: t}) {
    const typecheckFunctionDeclaration = typecheckTemplate.function(config.functionName);
    const typecheckFunctionCall = typecheckTemplate.call(config.functionName, t);

    const globalState = Object.create(null);
    const basicStateControlVisitor = {
        Program: {
            /**
             * @param {NodePath} path
             * @param {PluginPass} state
             */
            enter(path, state) {
                globalState.hasGlobalDirective = findGlobalDirective(path, state);
                globalState.shouldInjectHelperFunction = false;
                globalState.useStrict = state.opts.useStrict || config.default.useStrict;
            },

            /**
             * @param {NodePath} path
             * @param {PluginPass} state
             */
            exit(path, state) {
                if (!globalState.shouldInjectHelperFunction || state.opts._insertHelper === false) {
                    return;
                }

                path.pushContainer('body', typecheckFunctionDeclaration());
            }
        }
    };

    return {
        visitor: Object.assign(
            basicStateControlVisitor,
            functionVisitorsFactory(typecheckFunctionCall, globalState, t)
        )
    };
};
