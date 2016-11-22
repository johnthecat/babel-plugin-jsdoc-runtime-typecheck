const chai = require('chai');

const config = require('../config.json');
const babel = require('babel-core');
const path = require('path');
const fs = require('fs');

const SOURCE_DIRECTORY = path.join(config.path.data, '/assertion-inject/src');
const EXPECTED_DIRECTORY = path.join(config.path.data, '/assertion-inject/expected');

const ERROR = {
    EMPTY_SOURCE: 'Source file is empty',
    EMPTY_EXPECTED: 'Expected file is empty'
};

function trimString(string) {
    return string.replace(/(\n| )/gim, '').trim();
}


describe('Assertion inject', function () {
    fs.readdirSync(SOURCE_DIRECTORY).forEach((filename) => {
        it(`correctly adds assertions in ${filename}`, () => {
            let fileSource = fs.readFileSync(path.join(SOURCE_DIRECTORY, filename), 'utf8');
            let fileExpected = fs.readFileSync(path.join(EXPECTED_DIRECTORY, filename), 'utf8');

            chai.assert.notEqual(trimString(fileSource).length, 0, ERROR.EMPTY_SOURCE);
            chai.assert.notEqual(trimString(fileExpected).length, 0, ERROR.EMPTY_EXPECTED);

            let transformationResult = babel.transform(fileSource, {
                plugins: [
                    [config.path.plugin, {
                        insertHelper: false
                    }]
                ]
            });

            chai.expect(transformationResult.code.trim()).not.differentFrom(fileExpected.trim());
        });
    });
});
