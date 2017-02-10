const chai = require('chai');
const path = require('path');
const fs = require('fs');
const config = require('../config.json');
const babel = require('babel-core');
const Sandbox = require('sandbox');

const DATA_DIRECTORY = path.join(config.path.smokeTestData, 'runtime');
const SOURCE_DIRECTORY_ERRORS = path.join(DATA_DIRECTORY, 'src', 'exception');
// const SOURCE_DIRECTORY_NO_ERRORS = path.join(DATA_DIRECTORY, 'src', 'no-exception');
const EXPECTED_DIRECTORY = path.join(DATA_DIRECTORY, 'expected');

const FILE_ENCODING = 'utf8';

const BABEL_CONFIG = {
    plugins: [config.path.plugin]
};

describe('[SMOKE] Runtime check', () => {
    const sandbox = new Sandbox();

    describe('correctly throws error', () => {
        fs.readdirSync(SOURCE_DIRECTORY_ERRORS).forEach((filename) => {
            it(`in '${filename}'`, (done) => {
                const expectedFile = filename.replace('.js', '.txt');

                const fileSource = fs.readFileSync(path.join(SOURCE_DIRECTORY_ERRORS, filename), FILE_ENCODING);
                const fileExpected = fs.readFileSync(path.join(EXPECTED_DIRECTORY, expectedFile), FILE_ENCODING);

                const transformedSource = babel.transform(fileSource, BABEL_CONFIG);

                sandbox.run(transformedSource.code, (output) => {
                    chai.expect(output.result.trim()).not.differentFrom(fileExpected.trim());
                    done();
                });
            });
        });
    });
});
