require('core-js/fn/string/includes');

const config = require('../../config.json');

const DEFAULT_COMMENT_TOP_PADDING = -1;
const ALLOWED_COMMENT_TYPE = 'CommentBlock';
const ALLOWED_DIRECTIVES = config.doctrineConfig.tags
    .filter((tag) => tag !== 'name')
    .map((tag) => `@${tag}`);

/**
 * @param {Object} options
 * @returns {String|Boolean}
 */
function getDirective(options) {
    let directive;

    if ('useDirective' in options && options.useDirective !== true) {
        directive = options.useDirective;
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

    if (foundedComment) {
        let directive = getDirective(state.opts);

        if (typeof directive === 'string' && !hasGlobalDirective) {
            foundedComment = foundedComment.value.includes(`@${directive}`) ? foundedComment : null;
        }

        if (foundedComment) {
            let comment = foundedComment.value;


            for (let index = 0, count = ALLOWED_DIRECTIVES.length; index < count; index++) {
                if (comment.includes(ALLOWED_DIRECTIVES[index])) {
                    return comment;
                }
            }
        }
    }

    return null;
};
