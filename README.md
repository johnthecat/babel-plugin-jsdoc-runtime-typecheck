#Babel jsDoc runtime typecheck


## Overview
This plugin will add runtime typecheck, based on [jsDoc](http://usejsdoc.org/) annotation.
It transform code like this:
```javascript
// from

/**
 * @param {Number} a
 * @returns {Number}
 * @typecheck
 */
function test(a) {
    return a;
}

// to

function test(a) {
    __executeTypeCheck__('a', a, 'Number');
    
    return __executeTypeCheck__('return', a, 'Number');
}
```

Result:
<img alt="Console error example" src="https://photos-6.dropbox.com/t/2/AAB8cSiGABZKW84Iic87Fu3ES0qVUpXpUcilJq4ebgJeig/12/45281000/png/32x32/3/1479607200/0/2/console%20error.png/EOWh1yIY6hcgAigCKAU/awovWKctUcwvMtW6F9LqRHKyRkqHQB7ReoK3IoAGUUI?size_mode=3&dl=0&size=1024x768"/>

**CAUNTION: Use this plugin only in development, it will slow down your code (a lot of additional function calls).**

### How to

#### Install
`npm install babel-plugin-jsdoc-runtime-typecheck --save-dev`

#### Use
_.babelrc_
```json
{
    "plugins": ["jsdoc-runtime-typecheck"]
}
```

#### Parameters
By default, plugin will only parse docs with special directive `@typecheck`, you can change it like this:
```
{
    "plugins": [
        ["jsdoc-runtime-typecheck",
            {
                //useDirective: 'typecheck' - this is default
                //useDirective: false - if you want to check all functions with jsDoc (useful for new projects)
                useDirective: 'makeMeHappy' - your custom directive
            }
        ]
    ]
}
```
Then, use it:
```javascript
/**
 * @makeMeHappy 
 * @param {Number} a
 * @returns {Number}
 */
```

### Supports:

#### jsDoc tags
* `@params` can be optional, supported declarations:
    * `@param {*} name` - no check
    * `@param {Number=} name` - optional
    * `@param {Number} [name]` - optional
    * `@param {?Number} [name]`
    * `@param {!Number} [name]`
    * `@param {Number|String} name`
    * `@param {Array<Number>} name` - check every item in array
    * `@param {{id: Number, name: String}} name` - check defined keys in Object
* `@returns` or `@return` - type annotation are same as in params.

#### language constructions

##### Function declaration

```javascript
/**
 * @param {Number} a
 * @returns {Number}
 */
function myDeclaredFunction(a) {
    return a;
}

/**
 * @param {Number} a
 * @returns {Number}
 */
let myExpressionFunction = function(a) {
    return a;
};

/**
 * @param {Number} a
 * @returns {Number}
 */
let myArrowFunction = (a) => {
    return a;
};

/**
 * @param {Number} a
 * @returns {Number}
 * In this case it will transform body to "{ return a; }" block
 */
let myArrowExpressionFunction = (a) => a;
```

##### Object method

```javascript
let myObject = {
    /**
     * @param {Number} a
     * @returns {Number}
     */
    myMethod(a) {
        return a;
    }
}
```

##### Class method

```javascript
class MyClass {
    /**
     * @param {Number} a
     * @returns {Number}
     */
    myMethod(a) {
       return a;
    }
    
    /**
     * @param {Number} a
     * @returns {Number}
     */
    static myStaticMethod(a) {
       return a;
    }
    
    /**
     * @param {Number} a
     */
    get myGetterMethod(a) {
       return this._a = a;
    }
}
```