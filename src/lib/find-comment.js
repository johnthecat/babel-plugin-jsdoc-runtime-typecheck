require('core-js/fn/string/includes');

const config = require('../../shared/config.json');

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

function getPathEnd(path) {
    if (path && path.node) {
        return path.node.end || DEFAULT_COMMENT_TOP_PADDING;
    } else {
        return DEFAULT_COMMENT_TOP_PADDING;
    }
}

/**
 * Fix for annoying edge case, when ObjectProperty node doesn't have start index
 * Workaround: find function body and get it's start index.
 *
 * @param {Path} path
 * @returns {Number}
 */
function getFunctionDecrarationStart(path) {
    if (path.isObjectProperty()) {
        return path.node.start || path.get('value.body').node.start;
    } else {
        return path.node.start;
    }
}

function findComment(comments, startPosition, endPosition) {
    let comment;

    for (let index = comments.length - 1; index >= 0; index--) {
        comment = comments[index];

        if (
            comment.type === ALLOWED_COMMENT_TYPE &&
            comment.start > startPosition &&
            comment.end < endPosition
        ) {
            break;
        }
    }

    return comment;
}

/**
 * @param {NodePath} path
 * @param {PluginPass} state
 * @param {Boolean} hasGlobalDirective
 * @returns {String|null}
 */
module.exports = (path, state, hasGlobalDirective) => {
    const node = path.node;
    const comments = node.leadingComments;

    if (!comments) {
        return null;
    }

    const functionDeclarationStart = getFunctionDecrarationStart(path);
    const previousNodeEnd = path.key !== 0 ?
                            getPathEnd(path.getSibling(path.key - 1)) :
                            DEFAULT_COMMENT_TOP_PADDING;

    const comment = findComment(comments, previousNodeEnd, functionDeclarationStart);

    if (!comment) {
        return null;
    }

    const directive = getDirective(state.opts);

    if (
        typeof directive === 'string' &&
       !hasGlobalDirective &&
       !comment.value.includes(`@${directive}`)
    ) {
        return null;
    }

    const commentValue = comment.value;
    let result = null;

    for (let index = 0, count = ALLOWED_DIRECTIVES.length; index < count; index++) {
        if (commentValue.includes(ALLOWED_DIRECTIVES[index])) {
            result = commentValue;
            break;
        }
    }

    return result;
};
