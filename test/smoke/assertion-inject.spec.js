const path = require('path');
const fs = require('fs');

const config = require('../config.json');
const compare = require('./helpers/compare');

const DATA_DIRECTORY = path.join(config.path.smokeTestData, 'assertion-inject');
const SOURCE_DIRECTORY = path.join(DATA_DIRECTORY, 'src');
const EXPECTED_DIRECTORY = path.join(DATA_DIRECTORY, 'expected');
const INTEGRATION_DIRECTORY = path.join(DATA_DIRECTORY, 'integration');

const FILE_ENCODING = 'utf8';

describe('[SMOKE] Assertion inject', () => {
    describe('correctly adds assertions', () => {
        fs.readdirSync(SOURCE_DIRECTORY).forEach((filename) => {
            it(`in '${filename}'`, () => {
                let fileSource = fs.readFileSync(path.join(SOURCE_DIRECTORY, filename), FILE_ENCODING);
                let fileExpected = fs.readFileSync(path.join(EXPECTED_DIRECTORY, filename), FILE_ENCODING);

                compare(fileSource, fileExpected);
            });
        });
    });

    describe('integration with es2015 preset', () => {
        fs.readdirSync(SOURCE_DIRECTORY).forEach((filename) => {
            it(`in '${filename}'`, () => {
                let fileSource = fs.readFileSync(path.join(SOURCE_DIRECTORY, filename), FILE_ENCODING);
                let fileExpected = fs.readFileSync(path.join(INTEGRATION_DIRECTORY, filename), FILE_ENCODING);

                compare(fileSource, fileExpected, {
                    presets: ['es2015']
                });
            });
        });
    });
});
