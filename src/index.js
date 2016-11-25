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
const findGlobalDirective = require('./lib/find-global-directive');
const checkFunction = require('./lib/check-function');
const findComment = require('./lib/find-comment');
const parseJsDoc = require('./lib/parse-jsdoc');
const normalizeFunctionBody = require('./lib/normalize-function-body');
const insertParametersCheck = require('./lib/insert-parameters-check');
const normalizeValidator = require('./lib/normalize-validator');
const typecheckTemplate = require('./lib/typecheck-function-template');

const FUNCTION_VISITORS = [
    'FunctionDeclaration',
    'ArrowFunctionExpression'
];

/**
 * @param {Object} t
 * @returns {{visitor: Object}}
 */
module.exports = function ({types: t}) {
    const typecheckFunctionDeclaration = typecheckTemplate.function(config.functionName);
    const typecheckFunctionCall = typecheckTemplate.call(config.functionName, t);

    let hasGlobalDirective = false;
    let shouldInjectHelperFunction = false;

    const HELPERS = {
        isDeclarationIsFunction(declaration) {
            return declaration.get('init').isFunction();
        },

        isPathIsConstructor(path) {
            return path.node.kind === 'constructor';
        },

        isPathIsExpression(path) {
            return path.isExpressionStatement();
        }
    };

    /**
     * @param {String} comment
     * @param {NodePath} path
     * @param {String} [name]
     */
    function executeFunctionTransformation(comment, path, name) {
        let jsDoc = parseJsDoc(comment);

        if (!jsDoc) {
            return;
        }

        let functionName = name || jsDoc.name || (path.node.id ? path.node.id.name : config.defaultFunctionName);

        normalizeFunctionBody(path);

        if (!checkFunction(path)) {
            return;
        }

        insertParametersCheck(functionName, typecheckFunctionCall, path, jsDoc, t);

        if (jsDoc.returnStatement) {
            path.traverse(returnTypecheckVisitor, {
                jsDoc: jsDoc,
                functionPath: path,
                functionName: functionName
            });
        }

        shouldInjectHelperFunction = true;
    }

    const returnTypecheckVisitor = {
        ReturnStatement(path) {
            if (path.getFunctionParent().node !== this.functionPath.node) {
                return;
            }

            let statement = this.jsDoc.returnStatement;
            let argument = path.get('argument');

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

    return {
        visitor: {
            Program: {
                enter(path, state) {
                    hasGlobalDirective = findGlobalDirective(path, state);
                    shouldInjectHelperFunction = false;
                },
                exit(path, state) {
                    if (!shouldInjectHelperFunction || state.opts.insertHelper === false) {
                        return;
                    }

                    path.pushContainer('body', typecheckFunctionDeclaration());
                }
            },

            /**
             * @param {NodePath} path
             * @param {PluginPass} state
             */
            VariableDeclaration(path, state) {
                let comment = findComment(path, state, hasGlobalDirective);

                if (!comment) {
                    return;
                }

                let declarations = path.get('declarations');
                let functionDeclaration = declarations.find(HELPERS.isDeclarationIsFunction);

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

                let comment = findComment(path, state, hasGlobalDirective);

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

                let expression = path.find(HELPERS.isPathIsExpression);
                let comment = findComment(expression, state, hasGlobalDirective);

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

                let comment = findComment(path, state, hasGlobalDirective);

                if (!comment) {
                    return;
                }

                executeFunctionTransformation(comment, value);
            },

            ClassMethod(path, state) {
                let comment = findComment(path, state, hasGlobalDirective);

                if (!comment) {
                    return;
                }

                let classDeclaration = path.find((parent) => parent.isClassDeclaration());
                let className = classDeclaration.node.id.name;

                if (path.node.kind === 'constructor') {
                    executeFunctionTransformation(comment, path, `${className}.constructor`);
                } else {
                    let node = path.node;

                    executeFunctionTransformation(
                        comment, path,
                        `${node.static ? 'static ' : ''}${node.kind} ${className}.${node.key.name}`
                    );
                }
            },

            ObjectMethod(path, state) {
                let comment = findComment(path, state, hasGlobalDirective);

                if (!comment) {
                    return;
                }

                executeFunctionTransformation(comment, path, path.node.key.name);
            },

            [FUNCTION_VISITORS.join('|')](path, state) {
                let comment = findComment(path, state, hasGlobalDirective);

                if (!comment) {
                    return;
                }

                executeFunctionTransformation(comment, path);
            }
        }
    };
};
