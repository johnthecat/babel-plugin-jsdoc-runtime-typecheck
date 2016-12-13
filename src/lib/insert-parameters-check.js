const normalizeValidator = require('./normalize-validator');
const strictMode = require('./strict-mode');

/**
 * @param {String} functionName
 * @param {Function} functionTemplate
 * @param {NodePath} functionPath
 * @param {Object} jsDoc
 * @param {Boolean} useStrict
 * @param {Object} t
 */
module.exports = (functionName, functionTemplate, functionPath, jsDoc, useStrict, t) => {
    let parameters = jsDoc.parameters;
    let functionParameters = functionPath.get('params');
    let functionBody = functionPath.get('body');

    if (!functionBody.isBlockStatement()) return;

    let countOfInsertedArguments = insertAssertionBasedOn(functionParameters);

    if (useStrict) {
        let parametersKeys = Object.keys(parameters);

        if (parametersKeys.length > countOfInsertedArguments) {
            strictMode.throwException(functionPath, strictMode.ERROR.UNUSED_ARGUMENTS_IN_JSDOC);
        }
    }

    /**
     * @param {Array<NodePath>} nodes
     * @returns {Number}
     */
    function insertAssertionBasedOn(nodes) {
        let shouldThrowException = true;
        let count = 0;
        let path, node, name;
        let type;

        for (let index = nodes.length - 1; index >= 0; index--) {
            shouldThrowException = true;
            path = nodes[index];

            if (path.isAssignmentPattern()) {
                shouldThrowException = false;
                count += insertAssertionBasedOn(
                    [path.get('left')]
                );
            } else
            if (path.isRestElement()) {
                shouldThrowException = false;
                count += insertAssertionBasedOn(
                    [path.get('argument')]
                );
            } else
            if (path.isObjectProperty()) {
                shouldThrowException = false;
                count += insertAssertionBasedOn(
                    [path.get('value')]
                );
            } else
            if (path.isObjectPattern()) {
                shouldThrowException = false;
                count += insertAssertionBasedOn(
                    path.get('properties')
                );
            } else
            if (path.isArrayPattern()) {
                shouldThrowException = false;
                count += insertAssertionBasedOn(
                    path.get('elements')
                );
            }

            node = path.node;
            name = node.name;
            type = parameters[name];

            if (!(name in parameters) || type === void(0)) {
                if (useStrict && shouldThrowException) {
                    strictMode.throwException(path, strictMode.ERROR.NO_ARGUMENT_IN_JSDOC);
                }

                continue;
            }

            ++count;

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

        return count;
    }
};
