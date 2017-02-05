const config = require('../../shared/config.json');

function findFirstNode(node, index) {
    return index === 0;
}

/**
 * @param {NodePath} path
 * @param {PluginPass} state
 * @returns {Boolean}
 */
module.exports = (path, state) => {
    let useDirective = state.opts.useDirective;

    if (useDirective === false) {
        return false;
    }

    if (!useDirective) {
        useDirective = config.default.useDirective;
    }

    let firstNode = path.node.body.find(findFirstNode);

    if (!firstNode) {
        return false;
    }

    let topComments = firstNode.leadingComments;

    if (!topComments) {
        return false;
    }

    return topComments.some((comment) => (
        comment.value.includes(`@${useDirective}`) &&
       !comment.value.includes('@param') &&
       !comment.value.includes('@return')
    ));
};
