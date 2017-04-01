const config = require('../../shared/config.json');

const FUNCTION_NODE_DESCRIPTOR = 'init';
const CLASS_NODE_DESCRIPTOR = 'init';
const CONSTRUCTOR_NODE_TYPE = 'constructor';

/**
 * @param {Array<NodePath>} declarations
 * @returns {NodePath|null}
 */
module.exports.declarationIsFunction = (declarations) => {
    let result = null;
    let declaration;

    for (let index = 0, count = declarations.length; index < count; index++) {
        declaration = declarations[index].get(FUNCTION_NODE_DESCRIPTOR);

        if (declaration.isFunction()) {
            result = declaration;
            break;
        }
    }

    return result;
};

/**
 * @param {Array<NodePath>} declarations
 * @returns {NodePath|null}
 */
module.exports.declarationIsClassExpression = (declarations) => {
    let result = null;
    let declaration;

    for (let index = 0, count = declarations.length; index < count; index++) {
        declaration = declarations[index].get(CLASS_NODE_DESCRIPTOR);

        if (declaration.isClassExpression()) {
            result = declaration;
            break;
        }
    }

    return result;
};

/**
 * @param {NodePath} path
 * @returns {Boolean}
 */
module.exports.pathIsConstructor = (path) => {
    return path.node.kind === CONSTRUCTOR_NODE_TYPE;
};

/**
 * @param {NodePath} path
 * @returns {Boolean}
 */
module.exports.pathIsExpression = (path) => {
    return path.isExpressionStatement();
};

/**
 * @param {NodePath} path
 * @returns {Boolean}
 */
module.exports.pathIsClassDeclaration = (path) => {
    return path.isClassDeclaration();
};

/**
 * @param {NodePath} classMethod
 * @param {NodePath} classExpression
 * @return {String}
 */
module.exports.createClassMethodName = (classMethod, classExpression) => {
    const node = classMethod.node;
    const className = classExpression.node.id ? classExpression.node.id.name : config.defaultClassName;
    const kind = node.kind === CONSTRUCTOR_NODE_TYPE ? '' : node.kind + ' ';

    return `${node.static ? 'static ' : ''}${kind}${className}.${node.key.name}`;
};
