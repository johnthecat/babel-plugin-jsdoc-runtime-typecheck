const path = require('path');
const fs = require('fs');

const config = require('../config.json');
const compare = require('./helpers/compare');

const DATA_DIRECTORY = path.join(config.path.smokeTestData, 'directive-parsing');
const SOURCE_DIRECTORY = path.join(DATA_DIRECTORY, 'src');
const EXPECTED_DIRECTORY = path.join(DATA_DIRECTORY, 'expected');

const FILE_ENCODING = 'utf8';

const read = (file) => {
    const fileSource = fs.readFileSync(path.join(SOURCE_DIRECTORY, file), FILE_ENCODING);
    const fileExpected = fs.readFileSync(path.join(EXPECTED_DIRECTORY, file), FILE_ENCODING);

    return [
        fileSource,
        fileExpected
    ];
};

describe('[SMOKE] Directive parsing', () => {
    describe('with default parameters', () => {
        it('doesn\'t transform code without directive', () => {
            compare(...read('defaults-no-directive.js'));
        });

        it('doesn\'t transform code with global directive and without jsDoc', () => {
            compare(...read('defaults-global-directive-before-function.js'));
        });

        it('transform code when directive in function', () => {
            compare(...read('defaults-directive-in-function.js'));
        });

        it('transform code when directive is global', () => {
            compare(...read('defaults-global-directive.js'));
        });

        it('transform code without collision in directives', () => {
            compare(...read('defaults-collision-between-global-and-local.js'));
        });
    });
});
