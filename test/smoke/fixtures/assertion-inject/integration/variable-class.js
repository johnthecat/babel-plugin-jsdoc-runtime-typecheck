"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// @typecheck

var variable = function () {
    /**
     * @param {Number} a
     */
    function variable(a) {
        _classCallCheck(this, variable);

        __executeTypecheck__("Anonymous class.constructor", "a", a, "\"Number\"");

        this._a = a;
    }

    /**
     * @returns {Number}
     */


    _createClass(variable, [{
        key: "getA",
        value: function getA() {
            return __executeTypecheck__("method Anonymous class.getA", "return", this._a, "\"Number\"");
        }
    }]);

    return variable;
}();

