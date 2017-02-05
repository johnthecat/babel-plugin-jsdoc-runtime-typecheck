const config = require('../../shared/config.json');

const findComment = require('../lib/find-comment');
const canInjectIntoFunction = require('../lib/check-function');
const parseJsDoc = require('../lib/parse-jsdoc');
const normalizeFunctionBody = require('../lib/normalize-function-body');
const insertParametersCheck = require('../lib/insert-parameters-check');
const returnStatementVisitorFactory = require('./return-statement');
const strictMode = require('../lib/strict-mode');

const helpers = {
    /**
     * @param {Array<NodePath>} declarations
     * @returns {NodePath|null}
     */
    declarationIsFunction(declarations) {
        let functionNodeDescriptor = 'init';
        let declaration;

        for (let index = 0, count = declarations.length; index < count; index++) {
            declaration = declarations[index].get(functionNodeDescriptor);

            if (declaration.isFunction()) {
                return declaration;
            }
        }

        return null;
    },

    /**
     * @param {Array<NodePath>} declarations
     * @returns {NodePath|null}
     */
    declarationIsClassExpression(declarations) {
        let classNodeDescriptor = 'init';
        let declaration;

        for (let index = 0, count = declarations.length; index < count; index++) {
            declaration = declarations[index].get(classNodeDescriptor);

            if (declaration.isClassExpression()) {
                return declaration;
            }
        }

        return null;
    },

    /**
     * @param {NodePath} path
     * @returns {Boolean}
     */
    pathIsConstructor(path) {
        return path.node.kind === 'constructor';
    },

    /**
     * @param {NodePath} path
     * @returns {Boolean}
     */
    pathIsExpression(path) {
        return path.isExpressionStatement();
    },

    /**
     * @param {NodePath} path
     * @returns {Boolean}
     */
    pathIsClassDeclaration(path) {
        return path.isClassDeclaration();
    },

    /**
     * @param {NodePath} classMethod
     * @param {NodePath} classExpression
     * @return {String}
     */
    createClassMethodName(classMethod, classExpression) {
        let node = classMethod.node;
        let className = classExpression.node.id ? classExpression.node.id.name : config.defaultClassName;
        let kind = node.kind === 'constructor' ? '' : node.kind + ' ';

        return `${node.static ? 'static ' : ''}${kind}${className}.${node.key.name}`;
    }
};

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
            jsDoc = parseJsDoc(comment, globalState.useStrict);
        } catch (error) {
            strictMode.throwSpecificException(path, 'jsDoc parser', error);
        }

        if (!jsDoc) {
            path.stop();
            return;
        }

        let functionName = name || jsDoc.name || (path.node.id ? path.node.id.name : config.defaultFunctionName);

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
                let comment = findComment(classPath, state, globalState.hasGlobalDirective);

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
            let declarations = path.get('declarations');
            let functionDeclaration = helpers.declarationIsFunction(declarations);

            if (functionDeclaration) {
                let comment = findComment(path, state, globalState.hasGlobalDirective);

                if (comment) {
                    executeFunctionTransformation(comment, functionDeclaration);
                }
            } else {
                let classExpressionDeclaration = helpers.declarationIsClassExpression(declarations);

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
            let argument = path.get('argument');

            if (!argument || !argument.isFunction()) return;

            let comment = findComment(path, state, globalState.hasGlobalDirective);

            if (!comment) return;

            executeFunctionTransformation(comment, argument);
        },

        /**
         * @param {NodePath} path
         * @param {PluginPass} state
         */
        AssignmentExpression(path, state) {
            let rightPath = path.get('right');

            if (!rightPath.isFunction()) return;

            let expression = path.find(helpers.pathIsExpression);
            let comment = findComment(expression, state, globalState.hasGlobalDirective);

            if (!comment) return;

            executeFunctionTransformation(comment, rightPath);
        },

        /**
         * @param {NodePath} path
         * @param {PluginPass} state
         */
        ObjectProperty(path, state) {
            let value = path.get('value');

            if (!value.isFunction()) return;

            let comment = findComment(path, state, globalState.hasGlobalDirective);

            if (!comment) return;

            executeFunctionTransformation(comment, value, path.node.key.name);
        },

        /**
         * @param {NodePath} path
         * @param {PluginPass} state
         */
        ClassMethod(path, state) {
            let comment = findComment(path, state, globalState.hasGlobalDirective);

            if (!comment) return;

            let classDeclaration = path.find(helpers.pathIsClassDeclaration);

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
            let comment = findComment(path, state, globalState.hasGlobalDirective);

            if (!comment) return;

            executeFunctionTransformation(comment, path, path.node.key.name);
        },

        /**
         * @param {NodePath} path
         * @param {PluginPass} state
         */
        'FunctionDeclaration|ArrowFunctionExpression'(path, state) {
            let comment = findComment(path, state, globalState.hasGlobalDirective);

            if (!comment) return;

            executeFunctionTransformation(comment, path);
        }
    };
};
