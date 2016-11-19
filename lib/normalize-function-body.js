const babelTemplate = require('babel-template');

const bodyTemplate = babelTemplate(`{ return STATEMENT }`);

module.exports = (path) => {
    if (path.node.expression) {
        let body = path.get('body');

        body.replaceWith(
            bodyTemplate({
                STATEMENT: body.node
            })
        );

        path.node.expression = false;
    }
};