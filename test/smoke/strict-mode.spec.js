const path = require('path');
const fs = require('fs');
const babel = require('babel-core');
const chai = require('chai');

const config = require('../config.json');

const DATA_DIRECTORY = path.join(config.path.smokeTestData, 'strict-mode');
const SOURCE_DIRECTORY_ERRORS = path.join(DATA_DIRECTORY, 'should-throw-exception');
const SOURCE_DIRECTORY_NO_ERRORS = path.join(DATA_DIRECTORY, 'should-not-throw-exception');

const FILE_ENCODING = 'utf8';

const EXCEPTION_NOT_THROWN = 'Cannot handle this case - exception not thrown!';
const EXCEPTION_THROWN = 'Cannot handle this case - exception thrown!';
const BABEL_CONFIG = {
    code: false,
    plugins: [
        [
            config.path.plugin,
            {
                useStrict: true
            }
        ]
    ]
};

const transform = (source) => {
    let transformed = false;

    try {
        babel.transform(source, BABEL_CONFIG);
        transformed = true;
    } catch (e) {
        // nothing to do
    }

    return transformed;
};

describe('[SMOKE] Strict mode', () => {
    describe('should throw exception', () => {
        fs.readdirSync(SOURCE_DIRECTORY_ERRORS).forEach((filename) => {
            it(`in '${filename}'`, () => {
                const fileSource = fs.readFileSync(path.join(SOURCE_DIRECTORY_ERRORS, filename), FILE_ENCODING);
                const transformed = transform(fileSource);

                chai.assert.isNotOk(transformed, EXCEPTION_NOT_THROWN);
            });
        });
    });

    describe('shouldn\'t throw exception', () => {
        fs.readdirSync(SOURCE_DIRECTORY_NO_ERRORS).forEach((filename) => {
            it(`in '${filename}'`, () => {
                const fileSource = fs.readFileSync(path.join(SOURCE_DIRECTORY_NO_ERRORS, filename), FILE_ENCODING);
                const transformed = transform(fileSource);

                chai.assert.isOk(transformed, EXCEPTION_THROWN);
            });
        });
    });
});
