#Babel jsDoc runtime typecheck

[![npm](https://img.shields.io/npm/v/babel-plugin-jsdoc-runtime-typecheck.svg)](https://www.npmjs.com/package/babel-plugin-jsdoc-runtime-typecheck)
[![license](https://img.shields.io/github/license/johnthecat/babel-plugin-jsdoc-runtime-typecheck.svg)](https://github.com/johnthecat/babel-plugin-jsdoc-runtime-typecheck/blob/master/LICENSE)

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
    __executeTypeCheck__('test', 'a', a, 'Number');
    
    return __executeTypeCheck__('test', 'return', a, 'Number');
}
```

Result:
<img alt="Console error example" src="https://cloud.githubusercontent.com/assets/5618341/20533157/a42210de-b0ed-11e6-818f-c91fe8866678.png"/>


**CAUTION: Use this plugin only in development, it will slow down your code (a lot of additional function calls and large helper function).**

## Motivation
Flow is good solution, but it adds custom syntax to javascript code and adding it to existing project is quite hard.
IDE's like Webstorm has good support of jsDoc and can add cool code completion tips, based on users comments.
So, with this plugin, you can easy start to use benefits of strong typing in javascript code without any pain. 
Using this plugin in development also will speed up development, because it will reduce number of weird errors and behaviors.


## How to

### Install
`npm install babel-plugin-jsdoc-runtime-typecheck --save-dev`

### Use
_.babelrc_
```json
{
    "plugins": ["jsdoc-runtime-typecheck"]
}
```
_js code - global directive_
```javascript
// @typecheck

/**
 * @param {String} str
 * @returns {String}
 */
function makeMeLaugh(str) {
    return str + ' - ha-ha-ha!';
}
```
_js code - local directive_
```javascript
/**
 * @param {String} str
 * @returns {String}
 * @typecheck
 */
function makeMeLaugh(str) {
    return str + ' - ha-ha-ha!';
}
```

### Configure
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
// @makeMeHappy 

// or

/**
 * @makeMeHappy 
 * @param {Number} a
 * @returns {Number}
 */
```

## Supports:

### jsDoc tags
* `@params` can be optional, supported declarations:
    * `@param {*} name` - no check
    * `@param {Number=} name` - optional
    * `@param {Number} [name]` - optional
    * `@param {?Number} name`
    * `@param {!Number} name`
    * `@param {Number|String} name`
    * `@param {Array<Number>} name` - check every item in array
    * `@param {{id: Number, name: String}} name` - check defined keys in Object
* `@returns` or `@return` - type annotation are same as in params.

### Language constructions

#### Function declaration

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

#### Object method

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

#### Class constructor and method

```javascript
class MyClass {
    /**
     * @param {Number} a
     */
    constructor(a) {
        this._a = a;
    }
    
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
    set mySetterMethod(a) {
       return this._a = a;
    }
}
```
