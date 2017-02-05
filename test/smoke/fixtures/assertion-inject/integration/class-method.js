"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Test = function () {
    function Test() {
        _classCallCheck(this, Test);
    }

    _createClass(Test, [{
        key: "myMethod",

        /**
         * @param {Number} a
         * @param {Number} b
         * @returns {Number}
         * @typecheck
         */
        value: function myMethod(a, b) {
            __executeTypecheck__("method Test.myMethod", "a", a, "\"Number\"");

            __executeTypecheck__("method Test.myMethod", "b", b, "\"Number\"");

            return __executeTypecheck__("method Test.myMethod", "return", a + b, "\"Number\"");
        }
    }]);

    return Test;
}();

