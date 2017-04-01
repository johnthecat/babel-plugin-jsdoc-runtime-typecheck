const config = require('../../shared/config.json');

const {parseFunctionDeclaration} = require('../lib/parse-jsdoc');
const canInjectIntoFunction = require('../lib/check-function');
const normalizeFunctionBody = require('../lib/normalize-function-body');
const insertParametersCheck = require('../lib/insert-parameters-check');
const findComment = require('../lib/find-comment');
const strictMode = require('../lib/strict-mode');
const returnStatementVisitorFactory = require('./return-statement');
const helpers = require('./helpers');


/**
 * @param {Function} typecheckFunctionCall
 * @param {Object} globalState
 * @param {Object} t
 * @returns {Object}
 */
module.exports = (typecheckFunctionCall, globalState, t) => {
    const returnTypecheckVisitor = returnStatementVisitorFactory(typecheckFunctionCall, globalState, t);

    /**
     * @param {String} comment
     * @param {NodePath} path
     * @param {String} [name]
     */
    function executeFunctionTransformation(comment, path, name) {
        let jsDoc;

        try {
            jsDoc = parseFunctionDeclaration(comment, globalState.useStrict);
        } catch (error) {
            strictMode.throwSpecificException(path, 'jsDoc parser', error);
        }

        if (!jsDoc) {
            path.stop();
            return;
        }

        const functionName = name || jsDoc.name || (path.node.id ? path.node.id.name : config.defaultFunctionName);

        normalizeFunctionBody(path);

        if (canInjectIntoFunction(path)) {
            insertParametersCheck(functionName, typecheckFunctionCall, path, jsDoc, globalState.useStrict, t);

            if (jsDoc.returnStatement || globalState.useStrict) {
                path.traverse(returnTypecheckVisitor, {
                    jsDoc: jsDoc,
                    functionPath: path,
                    functionName: functionName
                });
            }

            globalState.shouldInjectHelperFunction = true;
        }
    }

    /**
     * @param {NodePath} classDeclaration
     * @param {PluginPass} state
     */
    function executeTraverseForNestedClass(classDeclaration, state) {
        classDeclaration.traverse({
            ClassMethod(classPath) {
                const comment = findComment(classPath, state, globalState.hasGlobalDirective);

                if (!comment) return;

                executeFunctionTransformation(
                    comment, classPath,
                    helpers.createClassMethodName(classPath, classDeclaration)
                );
            }
        });
    }

    return {
        /**
         * @param {NodePath} path
         * @param {PluginPass} state
         */
        VariableDeclaration(path, state) {
            const declarations = path.get('declarations');
            const functionDeclaration = helpers.declarationIsFunction(declarations);

            if (functionDeclaration) {
                const comment = findComment(path, state, globalState.hasGlobalDirective);

                if (comment) {
                    executeFunctionTransformation(comment, functionDeclaration);
                }
            } else {
                const classExpressionDeclaration = helpers.declarationIsClassExpression(declarations);

                if (classExpressionDeclaration) {
                    executeTraverseForNestedClass(classExpressionDeclaration, state);
                }
            }
        },

        /**
         * @param {NodePath} path
         * @param {PluginPass} state
         */
        ReturnStatement(path, state) {
            const argument = path.get('argument');

            if (!argument || !argument.isFunction()) return;

            const comment = findComment(path, state, globalState.hasGlobalDirective);

            if (!comment) return;

            executeFunctionTransformation(comment, argument);
        },

        /**
         * @param {NodePath} path
         * @param {PluginPass} state
         */
        AssignmentExpression(path, state) {
            const rightPath = path.get('right');

            if (!rightPath.isFunction()) return;

            const expression = path.find(helpers.pathIsExpression);
            const comment = findComment(expression, state, globalState.hasGlobalDirective);

            if (!comment) return;

            executeFunctionTransformation(comment, rightPath);
        },

        /**
         * @param {NodePath} path
         * @param {PluginPass} state
         */
        ObjectProperty(path, state) {
            const value = path.get('value');

            if (!value.isFunction()) return;

            const comment = findComment(path, state, globalState.hasGlobalDirective);

            if (!comment) return;

            executeFunctionTransformation(comment, value, path.node.key.name);
        },

        /**
         * @param {NodePath} path
         * @param {PluginPass} state
         */
        ClassMethod(path, state) {
            const comment = findComment(path, state, globalState.hasGlobalDirective);

            if (!comment) return;

            const classDeclaration = path.find(helpers.pathIsClassDeclaration);

            if (!classDeclaration) return;

            executeFunctionTransformation(
                comment, path,
                helpers.createClassMethodName(path, classDeclaration)
            );
        },

        /**
         * @param {NodePath} path
         * @param {PluginPass} state
         */
        ObjectMethod(path, state) {
            const comment = findComment(path, state, globalState.hasGlobalDirective);

            if (!comment) return;

            executeFunctionTransformation(comment, path, path.node.key.name);
        },

        /**
         * @param {NodePath} path
         * @param {PluginPass} state
         */
        'FunctionDeclaration|ArrowFunctionExpression'(path, state) {
            const comment = findComment(path, state, globalState.hasGlobalDirective);

            if (!comment) return;

            executeFunctionTransformation(comment, path);
        }
    };
};
