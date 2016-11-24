const normalizeValidator = require('./normalize-validator');

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

    if (!functionBody.isBlockStatement()) {
        return;
    }

    iterateThroughArrayOfNodes(functionParameters);

    /**
     * @param {Array<NodePath>} nodes
     */
    function iterateThroughArrayOfNodes(nodes) {
        let path, node, name;
        let type;

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

            functionBody.unshiftContainer(
                'body',
                functionTemplate(
                    functionName,
                    name,
                    node,
                    normalizeValidator(functionPath, type, t)
                )
            );
        }
    }
};
