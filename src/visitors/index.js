const config = require('../../config.json');

const findComment = require('../lib/find-comment');
const checkFunction = require('../lib/check-function');
const parseJsDoc = require('../lib/parse-jsdoc');
const normalizeFunctionBody = require('../lib/normalize-function-body');
const insertParametersCheck = require('../lib/insert-parameters-check');
const returnStatementVisitorFactory = require('./return-statement');

const FUNCTION_VISITORS = [
    'FunctionDeclaration',
    'ArrowFunctionExpression'
];

const helpers = {
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
 * @param {Function} typecheckFunctionCall
 * @param {Object} t
 * @param {Object} globalState
 * @returns {Object}
 */
module.exports = (typecheckFunctionCall, t, globalState) => {
    const returnTypecheckVisitor = returnStatementVisitorFactory(typecheckFunctionCall, globalState, t);

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

        insertParametersCheck(functionName, typecheckFunctionCall, path, jsDoc, globalState.useStrict, t);

        path.traverse(returnTypecheckVisitor, {
            jsDoc: jsDoc,
            functionPath: path,
            functionName: functionName
        });


        globalState.shouldInjectHelperFunction = true;
    }

    return {
        /**
         * @param {NodePath} path
         * @param {PluginPass} state
         */
        VariableDeclaration(path, state) {
            let comment = findComment(path, state, globalState.hasGlobalDirective);

            if (!comment) {
                return;
            }

            let declarations = path.get('declarations');
            let functionDeclaration = declarations.find(helpers.isDeclarationIsFunction);

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

            let comment = findComment(path, state, globalState.hasGlobalDirective);

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

            let expression = path.find(helpers.isPathIsExpression);
            let comment = findComment(expression, state, globalState.hasGlobalDirective);

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

            let comment = findComment(path, state, globalState.hasGlobalDirective);

            if (!comment) {
                return;
            }

            executeFunctionTransformation(comment, value, path.node.key.name);
        },

        ClassMethod(path, state) {
            let comment = findComment(path, state, globalState.hasGlobalDirective);

            if (!comment) {
                return;
            }

            let classDeclaration = path.find((parent) => parent.isClassDeclaration());
            let className = classDeclaration.node.id.name;
            let node = path.node;
            let kind = node.kind === 'constructor' ? '' : node.kind + ' ';

            executeFunctionTransformation(
                comment, path,
                `${node.static ? 'static ' : ''}${kind}${className}.${node.key.name}`
            );

        },

        ObjectMethod(path, state) {
            let comment = findComment(path, state, globalState.hasGlobalDirective);

            if (!comment) {
                return;
            }

            executeFunctionTransformation(comment, path, path.node.key.name);
        },

        [FUNCTION_VISITORS.join('|')](path, state) {
            let comment = findComment(path, state, globalState.hasGlobalDirective);

            if (!comment) {
                return;
            }

            executeFunctionTransformation(comment, path);
        }
    };
};
