const chai = require('chai');
const path = require('path');
const babel = require('babel-core');
const {VM} = require('vm2');
const config = require('../config.json');
const utils = require('../utils');

const DATA_DIRECTORY = path.join(config.path.smokeTestData, 'runtime');
const SOURCE_DIRECTORY_ERRORS = path.join(DATA_DIRECTORY, 'src', 'exception');
const SOURCE_DIRECTORY_NO_ERRORS = path.join(DATA_DIRECTORY, 'src', 'no-exception');
const EXPECTED_DIRECTORY = path.join(DATA_DIRECTORY, 'expected');

const BABEL_CONFIG = {
    plugins: [config.path.plugin]
};

const sandbox = new VM();

function createPositiveTest(filename) {
    it(`in '${filename}'`, (done) => {
        utils.readFile(path.join(SOURCE_DIRECTORY_NO_ERRORS, filename)).then((fileSource) => {
            const transformedSource = babel.transform(fileSource, BABEL_CONFIG);

            try {
                sandbox.run(transformedSource.code);
                done();
            } catch (e) {
                done(e);
            }
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

                try {
                    sandbox.run(transformedSource.code);
                    done('Exception not throwed');
                } catch (exception) {
                    chai.expect(exception.message.trim()).not.differentFrom(fileExpected.trim());
                    done();
                }
            });
    });
}

Promise.all([
    utils.readDirectory(SOURCE_DIRECTORY_NO_ERRORS),
    utils.readDirectory(SOURCE_DIRECTORY_ERRORS)
]).then(([positiveTestCases, negativeTestCases]) => {

    describe('[SMOKE] Runtime check', () => {

        describe('correctly pass validation', () => {
            positiveTestCases.forEach(createPositiveTest);
        });

        describe('correctly throws error', () => {
            negativeTestCases.forEach(createNegativeTest);
        });

    });

});


