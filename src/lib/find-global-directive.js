const {defaults} = require('../../shared/config.json');

function findFirstNode(node, index) {
    return index === 0;
}

function hasGlobalDirective(comment, directive) {
    return (
        comment.value.includes(`@${directive}`) &&
        !comment.value.includes('@param') &&
        !comment.value.includes('@return')
    );
}

/**
 * @param {NodePath} path
 * @returns {Array|null}
 */
function getHeadingComments(path) {
    const firstNode = path.node.body.find(findFirstNode);

    if (!firstNode) {
        return null;
    }

    return firstNode.leadingComments;
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
        useDirective = defaults.useDirective;
    }

    const topComments = getHeadingComments(path);

    if (!topComments) {
        return false;
    }

    let globalDirective = false;

    for (let index = 0, count = topComments.length; index < count; index++) {
        if (hasGlobalDirective(topComments[index], useDirective)) {
            globalDirective = true;
            break;
        }
    }

    return globalDirective;
};
