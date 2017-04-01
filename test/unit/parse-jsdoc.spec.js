const chai = require('chai');
const path = require('path');
const utils = require('../utils');
const config = require('../config.json');

const {parseFunctionDeclaration} = require('../../src/lib/parse-jsdoc');

const DATA_DIRECTORY = path.join(config.path.unitTestData, 'parse-jsdoc');
const SOURCE_DIRECTORY = path.join(DATA_DIRECTORY, 'src');
const EXPECTED_DIRECTORY = path.resolve(DATA_DIRECTORY, 'expected');

function createTest(filename) {
    it(`in '${filename}'`, () => {
        utils.readFile(path.join(SOURCE_DIRECTORY, filename)).then((fileSource) => {
            const expectedJSON = require(path.join(EXPECTED_DIRECTORY, filename));
            const parsingResult = parseFunctionDeclaration(fileSource);

            chai.expect(parsingResult).to.deep.equal(expectedJSON);
        });
    });
}

utils.readDirectory(SOURCE_DIRECTORY).then((sources) => {

    describe('[UNIT] Parse jsDoc', () => {

        describe('correctly parse docs', () => {
            sources.forEach(createTest);
        });

    });

});
