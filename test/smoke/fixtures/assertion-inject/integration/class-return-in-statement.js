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
         * @returns {Number}
         * @typecheck
         */
        value: function myMethod() {
            if (true) {
                return __executeTypecheck__("method Test.myMethod", "return", 1, "\"Number\"");
            } else {
                return __executeTypecheck__("method Test.myMethod", "return", 2, "\"Number\"");
            }
        }
    }]);

    return Test;
}();

