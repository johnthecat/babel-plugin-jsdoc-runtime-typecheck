const chai = require('chai');
const path = require('path');
const fs = require('fs');
const config = require('../config.json');

const parseJSDoc = require('../../src/lib/parse-jsdoc');

const DATA_DIRECTORY = path.join(config.path.unitTestData, 'parse-jsdoc');
const SOURCE_DIRECTORY = path.join(DATA_DIRECTORY, 'src');
const EXPECTED_DIRECTORY = path.resolve(DATA_DIRECTORY, 'expected');

const FILE_ENCODING = 'utf8';

describe('[UNIT] Parse jsDoc', () => {
    describe('correctly parse docs', () => {
        fs.readdirSync(SOURCE_DIRECTORY).forEach((filename) => {
            it(`in '${filename}'`, () => {
                const fileSource = fs.readFileSync(path.join(SOURCE_DIRECTORY, filename), FILE_ENCODING);
                const expectedJSON = require(path.join(EXPECTED_DIRECTORY, filename));
                const parsingResult = parseJSDoc(fileSource);

                chai.expect(parsingResult).to.deep.equal(expectedJSON);
            });
        });
    });
});
