require('core-js/fn/string/includes');

const {defaults, doctrineConfig} = require('../../shared/config.json');

const DEFAULT_COMMENT_TOP_PADDING = -1;
const ALLOWED_COMMENT_TYPE = 'CommentBlock';
const ALLOWED_DIRECTIVES = doctrineConfig.tags.filter(tag => tag !== 'name').map(tag => `@${tag}`);
const ALLOWED_DIRECTIVES_COUNT = ALLOWED_DIRECTIVES.length;

/**
 * @param {Object} options
 * @returns {String|Boolean}
 */
function getDirective(options) {
    let directive;

    if ('useDirective' in options && options.useDirective !== true) {
        directive = options.useDirective;
    } else {
        directive = defaults.useDirective;
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

    let result = null;

    if (!comments) {
        return result;
    }

    const functionDeclarationStart = getFunctionDecrarationStart(path);
    const previousNodeEnd = path.key !== 0 ?
                            getPathEnd(path.getPrevSibling()) :
                            DEFAULT_COMMENT_TOP_PADDING;

    const comment = findComment(comments, previousNodeEnd, functionDeclarationStart);

    if (!comment) {
        return result;
    }

    const directive = getDirective(state.opts);

    if (
        typeof directive === 'string' &&
       !hasGlobalDirective &&
       !comment.value.includes(`@${directive}`)
    ) {
        return result;
    }

    const commentValue = comment.value;

    for (let index = 0; index < ALLOWED_DIRECTIVES_COUNT; index++) {
        if (commentValue.includes(ALLOWED_DIRECTIVES[index])) {
            result = commentValue;
            break;
        }
    }

    return result;
};
