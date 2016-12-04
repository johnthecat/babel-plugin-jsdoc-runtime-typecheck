const config = require('../../config.json');

const chai = require('chai');
const babel = require('babel-core');

const DEFAULT_BABEL_PLUGIN_PARAMETER = {
    _insertHelper: false
};

const ERROR = {
    EMPTY_SOURCE: 'Source file is empty',
    EMPTY_EXPECTED: 'Expected file is empty'
};

function trimString(string) {
    return string.replace(/(\n| )/gim, '').trim();
}

/**
 * @param {String} fileSource
 * @param {String} fileExpected
 * @param {Object} [parameters]
 */
module.exports = (fileSource, fileExpected, parameters = {}) => {
    parameters.presets = Array.isArray(parameters.presets) ? parameters.presets : [];

    chai.assert.notEqual(trimString(fileSource).length, 0, ERROR.EMPTY_SOURCE);
    chai.assert.notEqual(trimString(fileExpected).length, 0, ERROR.EMPTY_EXPECTED);

    let transformationResult = babel.transform(fileSource, {
        presets: parameters.presets,
        plugins: [
            [config.path.plugin, Object.assign(DEFAULT_BABEL_PLUGIN_PARAMETER, parameters)]
        ]
    });

    chai.expect(transformationResult.code.trim()).not.differentFrom(fileExpected.trim());
};
