const path = require('path');
const fs = require('fs');
const babel = require('babel-core');

const config = require('../config.json');

const SOURCE_DIRECTORY = path.join(config.path.data, '/strict-mode');
const FILE_ENCODING = 'utf8';
const EXCEPTION = 'Cannot handle this case - exception not throwed!';
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

describe('Strict mode', function () {
    fs.readdirSync(SOURCE_DIRECTORY).forEach((filename) => {
        it(`throws exception in '${filename}'`, () => {
            let fileSource = fs.readFileSync(path.join(SOURCE_DIRECTORY, filename), FILE_ENCODING);
            let transformed = false;

            try {
                babel.transform(fileSource, BABEL_CONFIG);
                transformed = true;
            } catch(e) {
                // if exception was thrown - it's okay, test passed
            }

            if (transformed) {
                throw new Error(EXCEPTION);
            }
        });
    });
});
