const chai = require('chai');
const path = require('path');
const fs = require('fs');
const config = require('../config.json');
const babel = require('babel-core');
const Sandbox = require('sandbox');

const SOURCE_DIRECTORY = path.join(config.path.smokeTestData, 'runtime', 'src');
const EXPECTED_DIRECTORY = path.join(config.path.smokeTestData, 'runtime', 'expected');
const FILE_ENCODING = 'utf8';

const BABEL_CONFIG = {
    plugins: [config.path.plugin]
};

describe('[SMOKE] Runtime check', () => {
    let sandbox = new Sandbox();

    describe('correctly throws error', () => {
        fs.readdirSync(SOURCE_DIRECTORY).forEach((filename) => {
            it(`in '${filename}'`, (done) => {
                let expectedFile = filename.replace('.js', '.txt');

                let fileSource = fs.readFileSync(path.join(SOURCE_DIRECTORY, filename), FILE_ENCODING);
                let fileExpected = fs.readFileSync(path.join(EXPECTED_DIRECTORY, expectedFile), FILE_ENCODING);

                let transformedSource = babel.transform(fileSource, BABEL_CONFIG);

                sandbox.run(transformedSource.code, (output) => {
                    chai.expect(output.result.trim()).not.differentFrom(fileExpected.trim());
                    done();
                });
            });
        });
    });
});
