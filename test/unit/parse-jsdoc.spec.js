const chai = require('chai');
const path = require('path');
const fs = require('fs');
const config = require('../config.json');

const parseJSDoc = require('../../src/lib/parse-jsdoc');


const SOURCE_DIRECTORY = path.join(config.path.unitTestData, 'parse-jsdoc', 'src');
const EXPECTED_DIRECTORY = path.resolve(config.path.unitTestData, 'parse-jsdoc', 'expected');
const FILE_ENCODING = 'utf8';

describe('[UNIT] Parse jsDoc', () => {
    describe('correctly parse docs', () => {
        fs.readdirSync(SOURCE_DIRECTORY).forEach((filename) => {
            it(`in '${filename}'`, () => {
                let fileSource = fs.readFileSync(path.join(SOURCE_DIRECTORY, filename), FILE_ENCODING);
                let expectedJSON = require(path.join(EXPECTED_DIRECTORY, filename));

                let parsingResult = parseJSDoc(fileSource);

                try {
                    chai.expect(parsingResult).to.deep.equal(expectedJSON);
                } catch (error) {
                    global.console.log(parsingResult);
                    throw error;
                }
            });
        });
    });
});
