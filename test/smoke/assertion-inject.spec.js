const path = require('path');
const utils = require('../utils');
const config = require('../config.json');
const compare = require('./helpers/compare');

const DATA_DIRECTORY = path.join(config.path.smokeTestData, 'assertion-inject');
const SOURCE_DIRECTORY = path.join(DATA_DIRECTORY, 'src');
const EXPECTED_DIRECTORY = path.join(DATA_DIRECTORY, 'expected');
const INTEGRATION_DIRECTORY = path.join(DATA_DIRECTORY, 'integration');

const BABEL_ES2015_CONFIG = {
    presets: ['es2015']
};

function createAssertionTest(filename) {
    it(`in '${filename}'`, () => {
        Promise.all([
            utils.readFile(path.join(SOURCE_DIRECTORY, filename)),
            utils.readFile(path.join(EXPECTED_DIRECTORY, filename))
        ]).then((files) => {
            compare(...files);
        });
    });
}

function createES2015IntegrationTest(filename) {
    it(`in '${filename}'`, () => {
        Promise.all([
            utils.readFile(path.join(SOURCE_DIRECTORY, filename)),
            utils.readFile(path.join(INTEGRATION_DIRECTORY, filename))
        ]).then((files) => {
            compare(...files, BABEL_ES2015_CONFIG);
        });
    });
}

describe('[SMOKE] Assertion inject', () => {
    describe('correctly adds assertions', () => {
        utils.readDirectory(SOURCE_DIRECTORY).then((files) => {
            files.forEach(createAssertionTest);
        });
    });

    describe('integration with es2015 preset', () => {
        utils.readDirectory(SOURCE_DIRECTORY).then((files) => {
            files.forEach(createES2015IntegrationTest);
        });
    });
});
