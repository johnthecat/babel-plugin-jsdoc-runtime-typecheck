const path = require('path');
const fs = require('fs');

const config = require('../config.json');
const compare = require('./compare');

const SOURCE_DIRECTORY = path.join(config.path.data, '/assertion-inject/src');
const EXPECTED_DIRECTORY = path.join(config.path.data, '/assertion-inject/expected');

const FILE_ENCODING = 'utf8';

describe('Assertion inject', function () {
    fs.readdirSync(SOURCE_DIRECTORY).forEach((filename) => {
        it(`correctly adds assertions in '${filename}'`, () => {
            let fileSource = fs.readFileSync(path.join(SOURCE_DIRECTORY, filename), FILE_ENCODING);
            let fileExpected = fs.readFileSync(path.join(EXPECTED_DIRECTORY, filename), FILE_ENCODING);

            compare(fileSource, fileExpected);
        });
    });
});
