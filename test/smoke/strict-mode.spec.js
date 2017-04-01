const path = require('path');
const babel = require('babel-core');
const chai = require('chai');

const config = require('../config.json');
const utils = require('../utils');

const DATA_DIRECTORY = path.join(config.path.smokeTestData, 'strict-mode');
const SOURCE_DIRECTORY_ERRORS = path.join(DATA_DIRECTORY, 'exception');
const SOURCE_DIRECTORY_NO_ERRORS = path.join(DATA_DIRECTORY, 'no-exception');

const EXCEPTION_NOT_THROWN = 'Cannot handle this case - exception not thrown!';
const EXCEPTION_THROWN = 'Cannot handle this case - exception thrown!';
const BABEL_CONFIG = {
    code: false,
    plugins: [
        [
            config.path.plugin,
            {
                useStrict: true
            }
        ]
    ]
};

function transform (source) {
    let transformed = false;

    try {
        babel.transform(source, BABEL_CONFIG);
        transformed = true;
    } catch (e) {
        // nothing to do here
    }

    return transformed;
}

function createPositiveTest(filename) {
    it(`in '${filename}'`, (done) => {
        utils.readFile(path.join(SOURCE_DIRECTORY_NO_ERRORS, filename)).then((fileSource) => {
            const transformed = transform(fileSource);

            chai.assert.isOk(transformed, EXCEPTION_THROWN);
            done();
        });
    });
}

function createNegativeTest(filename) {
    it(`in '${filename}'`, (done) => {
        utils.readFile(path.join(SOURCE_DIRECTORY_ERRORS, filename)).then((fileSource) => {
            const transformed = transform(fileSource);

            chai.assert.isNotOk(transformed, EXCEPTION_NOT_THROWN);
            done();
        });
    });
}

Promise.all([
    utils.readDirectory(SOURCE_DIRECTORY_NO_ERRORS),
    utils.readDirectory(SOURCE_DIRECTORY_ERRORS)
]).then(([positiveTestCases, negativeTestCases]) => {

    describe('[SMOKE] Strict mode', () => {

        describe('shouldn\'t throw exception', () => {
            positiveTestCases.forEach(createPositiveTest);
        });

        describe('should throw exception', () => {
            negativeTestCases.forEach(createNegativeTest);
        });

    });

});
