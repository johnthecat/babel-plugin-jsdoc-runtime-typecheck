/**
 * How it works:
 * 1. It makes initialization - gets config, called template factories, sets flag to default state.
 * 2. Plugin traverse in 3 ways:
 *      - basic function declarations (FunctionDeclaration, ArrowFunctionExpression, etc.)
 *      - variable declarations with declared function
 *      - return statement with function as argument
 * 3. It tries to find closest block comment, that can be relative to this function.
 * 4. It tries to parse it with doctrine (https://github.com/eslint/doctrine).
 * 5. It makes function body normalization (removes "(a) => a * a" cases, makes it multiline)
 * 6. It inserts type check function call for arguments.
 * 7. It makes traverse for all return statements, relative to this function.
 * 8. It adds type check function call into return statement.
 * 9. If some function were transformed by plugin, on exit of Program it adds type check function declaration to file.
 */

const config = require('../config.json');
const findComment = require('./lib/find-comment');
const parseJsDoc = require('./lib/parse-jsdoc');
const normalizeFunctionBody = require('./lib/normalize-function-body');
const insertParametersCheck = require('./lib/insert-parameters-check');
const typecheckTemplate = require('./lib/typecheck-function-template');

const VISITORS = [
    'ClassMethod',
    'ObjectMethod',
    'FunctionDeclaration',
    'ArrowFunctionExpression'
];

module.exports = function ({types: t}) {
    const typecheckFunctionDeclaration = typecheckTemplate.function(config.functionName);
    const typecheckFunctionCall = typecheckTemplate.call(config.functionName, t);

    let shouldInjectFunction = false;

    /**
     * @param {String} comment
     * @param {NodePath} path
     */
    function executeFunctionTransformation(comment, path) {
        let jsDoc = parseJsDoc(comment);

        if (!jsDoc) {
            return;
        }

        let functionName = jsDoc.name || (path.node.id ? path.node.id.name : config.defaultFunctionName);

        normalizeFunctionBody(path);
        insertParametersCheck(functionName, typecheckFunctionCall, path, jsDoc, t);

        if (jsDoc.returnStatement) {
            path.traverse(returnTypecheckVisitor, {
                jsDoc: jsDoc,
                functionPath: path,
                functionName: functionName
            });
        }

        shouldInjectFunction = true;
    }

    const returnTypecheckVisitor = {
        ReturnStatement(path) {
            if (path.getFunctionParent().node !== this.functionPath.node) {
                return;
            }

            let argument = path.get('argument');

            if (!argument.node) {
                return;
            }

            argument.replaceWith(
                typecheckFunctionCall(
                    this.functionName,
                    'return',
                    argument.node,
                    t.stringLiteral(JSON.stringify(this.jsDoc.returnStatement))
                )
            );
        }
    };

    return {
        visitor: {
            Program: {
                enter() {
                    shouldInjectFunction = false;
                },
                exit(path) {
                    if (!shouldInjectFunction) {
                        return;
                    }

                    path.pushContainer('body', typecheckFunctionDeclaration());
                }
            },

            VariableDeclaration(path, state) {
                let comment = findComment(path, state);

                if (!comment) {
                    return;
                }

                let declarations = path.get('declarations');
                let functionDeclaration = declarations.find((declaration) => declaration.get('init').isFunction());

                if (!functionDeclaration) {
                    return;
                }

                executeFunctionTransformation(comment, functionDeclaration.get('init'));
            },

            ReturnStatement(path, state) {
                let argument = path.get('argument');

                if (!argument || !argument.isFunction()) {
                    return;
                }

                let comment = findComment(path, state);

                if (!comment) {
                    return;
                }

                executeFunctionTransformation(comment, argument);
            },

            AssignmentExpression(path, state) {
                let rightPath = path.get('right');

                if (!rightPath.isFunction()) {
                    return;
                }

                let expression = path.find((parent) => parent.isExpressionStatement());
                let comment = findComment(expression, state);

                if (!comment) {
                    return;
                }

                executeFunctionTransformation(comment, rightPath);
            },

            ObjectProperty(path, state) {
                let value = path.get('value');

                if (!value.isFunction()) {
                    return;
                }

                let comment = findComment(path, state);

                if (!comment) {
                    return;
                }

                executeFunctionTransformation(comment, value);
            },

            [VISITORS.join('|')](path, state) {
                let comment = findComment(path, state);

                if (!comment) {
                    return;
                }

                executeFunctionTransformation(comment, path);
            }
        }
    };
};