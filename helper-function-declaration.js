/**
 * CAUTION! This file must be written in ES5 syntax, because it will be included in final client code.
 * It also shouldn't be transformed via babel, because es2015 preset will add helpers, that breaks code.
 * TODO add documentation
 */

var babelTemplate = require('babel-template');

/**
 * @param {String} [functionName]
 * @param {String} parameterName
 * @param {*} parameter
 * @param {String} validatorSource
 * @returns {*} parameter
 */
function __TYPECHECK_HELPER_FUNCTION__(functionName, parameterName, parameter, validatorSource) {
    var isRootValid = false;
    var invalidType = null;
    var valid = false;

    if (typeof validatorSource === 'string') {
        var validator = JSON.parse(validatorSource);

        valid = validateByType(parameter, validator);
    } else {
        if (typeof validator === 'function') {
            valid = parameter instanceof validatorSource;
        } else {
            valid = parameter === validator;
        }
    }

    if (!valid) {
        var error = (
            (parameterName === 'return' ? 'Return statement' : 'Parameter "' + parameterName + '"') +
            ' in function "' + functionName + '" has wrong type. ' +
            'It\'s "' + (invalidType || parameter) + '" now, but must have ' + makeTypeReadable(validator) + ' type.'
        );

        throw new TypeError(error);
    }

    return parameter;

    // HELPERS

    function makeTypeReadable(validator, dontWrap) {
        let typeDeclaration;

        if (typeof validator === 'string') {
            typeDeclaration = validator;
        }

        if (Array.isArray(validator)) {
            typeDeclaration = validator.join('|');
        }

        if (typeof validator === 'object') {
            if ('root' in validator) {
                typeDeclaration = validator.root + '<' + makeTypeReadable(validator.children, true) + '>';
            }

            if ('record' in validator) {
                typeDeclaration = JSON.stringify(validator.fields);
            }

            if ('optional' in validator) {
                typeDeclaration = makeTypeReadable(validator.parameter, true) + '=';
            }
        }

        return dontWrap ? typeDeclaration : '{' + typeDeclaration + '}';
    }


    function instanceOf(instance, constructorName) {
        while (instance !== null && instance !== void(0)) {
            if (instance.constructor.name === constructorName) {
                return true;
            }

            instance = Object.getPrototypeOf(instance);
        }

        return false;
    }


    function validateByType(parameter, type) {
        var isValid;
        var field;

        switch (type) {
            case void(0):
                return false;

            case 'null':
                return parameter === null;

            case 'undefined':
                return parameter === void(0);

            case 'Function':
            case 'Object':
            case 'String':
            case 'Number':
                return typeof parameter === type.toLowerCase();

            case 'Array':
                return Array.isArray(parameter);
        }


        if (Array.isArray(type)) {
            return type.some(function (innerType) {
                return validateByType(parameter, innerType);
            });
        }

        if (typeof type === 'object') {
            if ('root' in type) {
                isRootValid = validateByType(parameter, type.root);

                if (type.root === 'Promise') {
                    return isRootValid;
                }

                var isChildrenValid = true;
                var isThisChildrenValid;

                for (field in parameter) {
                    if (!parameter.hasOwnProperty(field)) continue;

                    isThisChildrenValid = type.children.some(function (childType) {
                        return validateByType(parameter[field], childType);
                    });

                    if (!isThisChildrenValid) {
                        isChildrenValid = false;
                    }
                }

                isValid = isRootValid && isChildrenValid;

                if (!isValid && isRootValid) {
                    invalidType = type.root + '<*>';
                }

                return isValid;
            }

            if ('optional' in type) {
                if (parameter === void(0)) {
                    return true;
                } else {
                    return validateByType(parameter, type.parameter);
                }
            }

            if ('record' in type) {
                isRootValid = validateByType(parameter, type.record);
                var isRecordValid = true;
                var isThisRecordValid;

                for (field in parameter) {
                    if (!parameter.hasOwnProperty(field)) continue;

                    isThisRecordValid = validateByType(parameter[field], type.fields[field]);

                    if (!isThisRecordValid) {
                        isRecordValid = false;
                    }
                }

                isValid = isRootValid && isRecordValid;

                if (!isValid) {
                    if (isRootValid) {
                        try {
                            invalidType = JSON.stringify(parameter);
                        } catch (e) {
                            invalidType = type.record + '<*>';
                        }
                    }
                }

                return isValid;
            }
        }

        if (type in this) {
            return parameter instanceof this[type];
        }

        return instanceOf(parameter, type);
    }
}

/**
 * @param {String} name
 */
module.exports = function (name) {
    return babelTemplate(__TYPECHECK_HELPER_FUNCTION__.toString().replace('__TYPECHECK_HELPER_FUNCTION__', name));
};
