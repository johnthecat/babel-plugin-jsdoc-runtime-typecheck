const normalizeValidator = require('./normalize-validator');
const strictMode = require('./strict-mode');

/**
 * @param {String} functionName
 * @param {Function} functionTemplate
 * @param {NodePath} functionPath
 * @param {Object} jsDoc
 * @param {Boolean} strict
 * @param t
 */
module.exports = function insertParametersAssertion(functionName, functionTemplate, functionPath, jsDoc, strict, t) {
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

        if (strict) {
            let parametesKeys = Object.keys(parameters);

            if (parametesKeys.length > nodes.length) {
                strictMode.callError(functionPath, strictMode.ERROR.UNUSED_ARGUMENTS_IN_JSDOC);
            }
        }

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
            } else if (path.isArrayPattern()) {
                iterateThroughArrayOfNodes(
                    path.get('elements')
                );
            }

            name = node.name;
            type = parameters[name];

            if (!type) {
                if (strict) {
                    strictMode.callError(path, strictMode.ERROR.NO_ARGUMENT_IN_JSDOC);
                }

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
