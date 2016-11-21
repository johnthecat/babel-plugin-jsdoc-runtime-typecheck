const DEFAULT_TYPES = ['Object', 'Number', 'String', 'Boolean', 'Array'];

/**
 * @param {String} functionName
 * @param {Function} functionTemplate
 * @param {NodePath} functionPath
 * @param {Object} jsDoc
 * @param t
 */
module.exports = function insertParametersAssertion(functionName, functionTemplate, functionPath, jsDoc, t) {
    let parameters = jsDoc.parameters;
    let functionParameters = functionPath.get('params');
    let functionBody = functionPath.get('body');
    let functionScope = functionPath.scope;

    if (!functionBody.isBlockStatement()) {
        return;
    }

    iterateThroughArrayOfNodes(functionParameters);

    /**
     * @param {Array<NodePath>} nodes
     */
    function iterateThroughArrayOfNodes(nodes) {
        let path, node, name;
        let type, validator;

        for (let index = nodes.length - 1; index >= 0; index--) {
            path = nodes[index];
            node = path.node;

            if (path.isAssignmentPattern()) {
                node = node.left;
            } else if (path.isRestElement()) {
                node = node.argument;
            } else if (path.isObjectProperty()) {
                node = node.key;
            } else if (path.isObjectPattern()) {
                iterateThroughArrayOfNodes(
                    path.get('properties')
                );
            }

            name = node.name;
            type = parameters[name];

            if (!type) {
                continue;
            }

            if (
                typeof type === 'string' && !DEFAULT_TYPES.includes(type) &&
                functionScope.hasBinding(type)
            ) {
                validator = t.identifier(type);
            } else {
                validator = t.stringLiteral(JSON.stringify(type));
            }

            functionBody.unshiftContainer(
                'body',
                functionTemplate(
                    functionName,
                    name,
                    node,
                    validator
                )
            )
        }
    }
};
