const DEFAULT_TYPES = ['Object', 'Number', 'String', 'Boolean', 'Array'];

/**
 * @param {String} functionName
 * @param {Function} functionTemplate
 * @param {Object} functionPath
 * @param {Object} jsDoc
 * @param t
 */
module.exports = function insertTypecheck(functionName, functionTemplate, functionPath, jsDoc, t) {
    let parameters = jsDoc.parameters;
    let functionParameters = functionPath.get('params');
    let functionBody = functionPath.get('body');

    let node, name;
    let type, validator;

    for (let index = functionParameters.length - 1; index >= 0; index--) {
        node = functionParameters[index]['node'];
        name = node.name;

        if (node.argument) {
            node = node.argument;
            name = node.name;
        }

        if (!parameters[name]) {
            continue;
        }

        if (!functionBody.isBlockStatement()) {
            continue;
        }

        type = parameters[name];

        if (
            typeof type === 'string' && !DEFAULT_TYPES.includes(type) &&
            functionPath.scope.hasBinding(type)
        ) {
            validator = t.identifier(type);
        } else {
            validator = t.stringLiteral(JSON.stringify(type));
        }

        functionBody.unshiftContainer(
            'body',
            functionTemplate(
                functionName,
                node.name,
                node,
                validator
            )
        );

    }
};
