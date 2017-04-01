const chai = require('chai');
const path = require('path');
const babel = require('babel-core');
const Sandbox = require('sandbox');
const config = require('../config.json');
const utils = require('../utils');

const DATA_DIRECTORY = path.join(config.path.smokeTestData, 'runtime');
const SOURCE_DIRECTORY_ERRORS = path.join(DATA_DIRECTORY, 'src', 'exception');
const SOURCE_DIRECTORY_NO_ERRORS = path.join(DATA_DIRECTORY, 'src', 'no-exception');
const EXPECTED_DIRECTORY = path.join(DATA_DIRECTORY, 'expected');

const BABEL_CONFIG = {
    plugins: [config.path.plugin]
};

const sandbox = new Sandbox();

function createPositiveTest(filename) {
    it(`in '${filename}'`, (done) => {
        utils.readFile(path.join(SOURCE_DIRECTORY_NO_ERRORS, filename)).then((fileSource) => {
            const transformedSource = babel.transform(fileSource, BABEL_CONFIG);

            sandbox.run(transformedSource.code, ({result}) => {
                chai.assert(!result.includes('TypeError'), result);
                done();
            });
        });
    });
}

function createNegativeTest(filename) {
    it(`in '${filename}'`, (done) => {
        const expectedFile = filename.replace('.js', '.txt');

        Promise.all([
            utils.readFile(path.join(SOURCE_DIRECTORY_ERRORS, filename)),
            utils.readFile(path.join(EXPECTED_DIRECTORY, expectedFile))
        ])
            .then(([fileSource, fileExpected]) => {
                const transformedSource = babel.transform(fileSource, BABEL_CONFIG);

                sandbox.run(transformedSource.code, (output) => {
                    chai.expect(output.result.trim()).not.differentFrom(fileExpected.trim());
                    done();
                });
            });
    });
}

describe('[SMOKE] Runtime check', () => {

    describe('correctly pass validation', () => {
        utils.readDirectory(SOURCE_DIRECTORY_NO_ERRORS).then((files) => {
            files.forEach(createPositiveTest);
        });
    });

    describe('correctly throws error', () => {
        utils.readDirectory(SOURCE_DIRECTORY_ERRORS).then((files) => {
            files.forEach(createNegativeTest);
        });
    });
});
