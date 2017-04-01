const path = require('path');

const config = require('../config.json');
const utils = require('../utils');
const compare = require('./helpers/compare');

const DATA_DIRECTORY = path.join(config.path.smokeTestData, 'directive-parsing');
const SOURCE_DIRECTORY = path.join(DATA_DIRECTORY, 'src');
const EXPECTED_DIRECTORY = path.join(DATA_DIRECTORY, 'expected');

const read = (file) => {
    return Promise.all([
        utils.readFile(path.join(SOURCE_DIRECTORY, file)),
        utils.readFile(path.join(EXPECTED_DIRECTORY, file))
    ]);
};

const executeTest = (file, done) => {
    read(file)
        .then((files) => compare(...files))
        .then(() => done())
        .catch((exception) => done(exception));
};

describe('[SMOKE] Directive parsing', () => {
    describe('with default parameters', () => {
        it('doesn\'t transform code without directive', (done) => {
            executeTest('defaults-no-directive.js', done);
        });

        it('doesn\'t transform code with global directive and without jsDoc', (done) => {
            executeTest('defaults-global-directive-before-function.js', done);
        });

        it('transform code when directive in function', (done) => {
            executeTest('defaults-directive-in-function.js', done);
        });

        it('transform code when directive is global', (done) => {
            executeTest('defaults-global-directive.js', done);
        });

        it('transform code without collision in directives', (done) => {
            executeTest('defaults-collision-between-global-and-local.js', done);
        });
    });
});
