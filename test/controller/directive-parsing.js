const path = require('path');
const fs = require('fs');

const config = require('../config.json');
const compare = require('../helpers/compare');

const SOURCE_DIRECTORY = path.join(config.path.data, '/directive-parsing/src');
const EXPECTED_DIRECTORY = path.join(config.path.data, '/directive-parsing/expected');

const FILE_ENCODING = 'utf8';

function read(file) {
    let fileSource = fs.readFileSync(path.join(SOURCE_DIRECTORY, file), FILE_ENCODING);
    let fileExpected = fs.readFileSync(path.join(EXPECTED_DIRECTORY, file), FILE_ENCODING);

    return {
        fileSource,
        fileExpected
    };
}

describe('Directive parsing', function () {
    describe('with default parameters', () => {
        it('doesn\'t transform code without directive', () => {
            let files = read('defaults-no-directive.js');

            compare(files.fileSource, files.fileExpected);
        });

        it('doesn\'t transform code with global directive and without jsDoc', () => {
            let files = read('defaults-global-directive-before-function.js');

            compare(files.fileSource, files.fileExpected);
        });

        it('transform code when directive in function', () => {
            let files = read('defaults-directive-in-function.js');

            compare(files.fileSource, files.fileExpected);
        });

        it('transform code when directive is global', () => {
            let files = read('defaults-global-directive.js');

            compare(files.fileSource, files.fileExpected);
        });

        it('transform code without collision in directives', () => {
            let files = read('defaults-collision-between-global-and-local.js');

            compare(files.fileSource, files.fileExpected);
        });
    });
});
