const config = require('../../config.json');

const DEFAULT_COMMENT_TOP_PADDING = -1;
const ALLOWED_COMMENT_TYPE = 'CommentBlock';

/**
 * @param {PluginPass} state
 * @returns {String|Boolean}
 */
function getDirective(state) {
    let directive;

    if ('useDirective' in state.opts && state.opts.useDirective !== true) {
        directive = state.opts.useDirective;
    } else {
        directive = config.default.useDirective;
    }

    return directive;
}


/**
 * @param {NodePath} path
 * @param {PluginPass} state
 * @param {Boolean} hasGlobalDirective
 * @returns {String|null}
 */
module.exports = (path, state, hasGlobalDirective) => {
    let node = path.node;

    if (!node.leadingComments) {
        return null;
    }

    let comments = node.leadingComments;

    let previousNode = path.key !== 0 ? path.getSibling(path.key - 1) : null;
    let previousNodeEnd;

    if (previousNode && previousNode.node) {
        previousNodeEnd = previousNode.node.end || DEFAULT_COMMENT_TOP_PADDING;
    } else {
        previousNodeEnd = DEFAULT_COMMENT_TOP_PADDING;
    }

    let functionDeclarationStart;

    /**
     * Fix for annoying edge case, when ObjectProperty node doesn't have start index
     * Workaround: find function body and get it's start index.
     */
    if (path.isObjectProperty()) {
        functionDeclarationStart = node.start || path.get('value.body').node.start;
    } else {
        functionDeclarationStart = node.start;
    }

    let foundedComment;

    for (let index = comments.length - 1, comment; index >= 0; index--) {
        comment = comments[index];

        if (
            comment.type === ALLOWED_COMMENT_TYPE &&
            comment.start > previousNodeEnd &&
            comment.end < functionDeclarationStart
        ) {
            foundedComment = comment;
            break;
        }
    }

    if (!foundedComment) {
        return null;
    }

    let directive = getDirective(state);

    if (typeof directive === 'string' && !hasGlobalDirective) {
        foundedComment = foundedComment.value.includes(`@${directive}`) ? foundedComment : null;
    }

    return foundedComment ? foundedComment.value : null;
};
