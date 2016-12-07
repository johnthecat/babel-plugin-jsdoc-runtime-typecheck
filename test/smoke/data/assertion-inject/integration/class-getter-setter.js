"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Test = function () {
    function Test() {
        _classCallCheck(this, Test);

        this._a = a;
    }

    /**
     * @returns {Number}
     * @typecheck
     */


    _createClass(Test, [{
        key: "a",
        get: function get() {
            return __executeTypecheck__("get Test.a", "return", this._a, "\"Number\"");
        }

        /**
         * @param {Number} a
         * @typecheck
         */
        ,
        set: function set(a) {
            __executeTypecheck__("set Test.a", "a", a, "\"Number\"");

            this._a = a;
        }
    }]);

    return Test;
}();
