const config = require('../../shared/config.json');
const doctrine = require('doctrine');

const NESTED_PARAMETER_SEPARATOR = '.';
const WRONG_TYPES = {
    'function': 'Function',
    'object': 'Object',
    'array': 'Array',
    'number': 'Number',
    'string': 'String',
    'boolean': 'Boolean',
    'bool': 'Boolean',
    'any': '*'
};

/**
 * @param {String} name
 * @returns {String}
 */
function normalizeConstructorName(name) {
    if (WRONG_TYPES[name]) {
        return WRONG_TYPES[name];
    }

    return name;
}

/**
 * @param {Object|null} type
 * @returns {String|Array|Object|null|undefined}
 */
function normalizeTypes(type) {
    if (!type) {
        return void(0);
    }

    switch (type.type) {
        case doctrine.Syntax.AllLiteral:
            return null;

        case doctrine.Syntax.NullLiteral:
            return normalizeConstructorName('null');

        case doctrine.Syntax.UndefinedLiteral:
            return normalizeConstructorName('undefined');

        case doctrine.Syntax.NameExpression:
            return normalizeConstructorName(type.name);

        case doctrine.Syntax.UnionType:
            return type.elements.map(normalizeTypes);

        case doctrine.Syntax.TypeApplication:
            return {
                root: normalizeConstructorName(type.expression.name),
                children: type.applications.map(normalizeTypes)
            };

        case doctrine.Syntax.OptionalType:
            return {
                parameter: normalizeTypes(type.expression),
                optional: true
            };

        case doctrine.Syntax.RecordType:
            return {
                record: normalizeConstructorName('Object'),
                fields: type.fields.reduce((map, fieldType) => {
                    map[fieldType.key] = normalizeTypes(fieldType);

                    return map;
                }, {})
            };

        case doctrine.Syntax.FieldType:
            return normalizeTypes(type.value);

        case doctrine.Syntax.FunctionType:
            return normalizeConstructorName('Function');

        case doctrine.Syntax.NonNullableType:
        case doctrine.Syntax.NullableType:
            return normalizeTypes(type.expression);

        default:
            return void(0);
    }
}

function findNameTag(tag) {
    return tag.title === 'name';
}

function findParameterTag(tag) {
    return tag.title === 'param';
}

function findReturnTag(tag) {
    return tag.title === 'return' || tag.title === 'returns';
}

/**
 * @param {String} comment - comment with jsDoc
 * @param {Boolean} useStrict
 * @returns {{parameters: Object, returnStatement: Object, name: String}|null}
 */
module.exports = (comment, useStrict) => {
    /**
     * @type {{tags: Array<Object>, description: String}}
     */
    let commentAst = doctrine.parse(comment, config.doctrineConfig);

    if (!commentAst.tags.length) {
        return null;
    }

    let tags = commentAst.tags;
    let nameDescription = tags.find(findNameTag);
    let paramsDescriptions = tags.filter(findParameterTag);
    let returnDescription = tags.find(findReturnTag);

    let parameters = {};
    let parameter;
    let parameterName;
    let parameterRoot;
    let parameterField;

    for (let index = 0, count = paramsDescriptions.length; index < count; index++) {
        parameter = paramsDescriptions[index];
        parameterName = parameter.name.split(NESTED_PARAMETER_SEPARATOR);

        if (parameterName.length === 1) {
            parameters[parameter.name] = normalizeTypes(parameter.type);
            continue;
        }

        parameterRoot = parameterName[0];
        parameterField = parameterName[1];

        if (
            typeof parameters[parameterRoot] === 'object' &&
            parameters[parameterRoot] !== null &&
            'fields' in parameters[parameterRoot]
        ) {
            parameters[parameterRoot].fields[parameterField] = normalizeTypes(parameter.type);
        } else if (parameters[parameterRoot] !== void(0) || !useStrict) {
            parameters[parameterRoot] = {
                record: parameters[parameterRoot],
                fields: {
                    [parameterField]: normalizeTypes(parameter.type)
                }
            };
        } else {
            if (useStrict) {
                throw `Can't parse field "${parameterField}" in "${parameterRoot}" descriptor: "${parameterRoot}" is undefined.`;
            }
        }
    }

    let returnStatement;

    if (returnDescription) {
        returnStatement = normalizeTypes(returnDescription.type);
    }

    let name;

    if (nameDescription) {
        name = nameDescription.name;
    }

    return {
        name,
        parameters,
        returnStatement
    };
};
