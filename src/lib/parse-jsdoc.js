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
            return 'null';

        case doctrine.Syntax.UndefinedLiteral:
            return 'undefined';

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

        case doctrine.Syntax.NonNullableType:
        case doctrine.Syntax.NullableType:
            return normalizeTypes(type.expression);

        default:
            return void(0);
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
