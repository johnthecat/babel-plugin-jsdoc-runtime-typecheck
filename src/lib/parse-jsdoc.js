const config = require('../../config.json');
const doctrine = require('doctrine');

const WRONG_TYPES = {
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
 * @returns {String|Array|Object|null}
 */
function normalizeTypes(type) {
    if (!type) {
        return null;
    }

    switch (type.type) {
        case 'AllLiteral':
            return void(0);

        case 'NullLiteral':
            return 'null';

        case 'UndefinedLiteral':
            return 'undefined';

        case 'NameExpression':
            return normalizeConstructorName(type.name);

        case 'UnionType':
            return type.elements.map(normalizeTypes);

        case 'TypeApplication':
            return {
                root: normalizeConstructorName(type.expression.name),
                children: type.applications.map(normalizeTypes)
            };

        case 'OptionalType':
            return {
                parameter: normalizeTypes(type.expression),
                optional: true
            };

        case 'RecordType':
            return {
                record: normalizeConstructorName('Object'),
                fields: type.fields.reduce((map, fieldType) => {
                    map[fieldType.key] = normalizeTypes(fieldType);

                    return map;
                }, {})
            };

        case 'FieldType':
            return normalizeTypes(type.value);

        case 'NonNullableType':
        case 'NullableType':
            return normalizeTypes(type.expression);

        default:
            throw new Error('can\'t parse type ' + type.toString());
    }
}

/**
 * @param {String} comment - comment with jsDoc
 * @returns {{parameters: Object, returnStatement: Object, name: String}|null}
 */
module.exports = (comment) => {
    /**
     * @type {{tags: Array<Object>, description: String}}
     */
    let commentAst = doctrine.parse(comment, config.doctrineConfig);

    if (!commentAst.tags.length) {
        return null;
    }

    let tags = commentAst.tags;
    let nameDescription = tags.find((tag) => tag.title === 'name');
    let paramsDescriptions = tags.filter((tag) => tag.title === 'param');
    let returnDescription = tags.find((tag) => tag.title === 'return' || tag.title === 'returns');

    let parameters = Object.create(null);
    let parameter;

    for (let index = 0, count = paramsDescriptions.length; index < count; index++) {
        parameter = paramsDescriptions[index];

        parameters[parameter.name] = normalizeTypes(parameter.type);
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
