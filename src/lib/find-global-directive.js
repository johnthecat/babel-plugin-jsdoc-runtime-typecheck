const config = require('../../config.json');

function findFirstNode(node, index) {
    return index === 0;
}

/**
 * @param {NodePath} path
 * @param {Object} state
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
    let topComments = firstNode.leadingComments;

    if (!topComments) {
        return false;
    }

    return topComments.find((comment) => comment.value.includes(`@${useDirective}`));
};
