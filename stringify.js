"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright 2014, 2016 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)
//
// Modified to add maxDepth + minDepth options
//  - when depth>maxDepth, no more multi-lining is done ...
//  - when depth<minDepth, always multi-lining (should be a lot lot more efficient for huge datasets)
//    - depth starts at 0 ...
//
exports.stringify = (obj, options) => {
    options = options || {};
    //console.log("Stringify - options: ", options);
    var indent = JSON.stringify([1], null, get(options, 'indent', 2)).slice(2, -3);
    var maxLength = (indent === '' ? Infinity : get(options, 'maxLength', 80));
    var maxDepth = get(options, 'maxDepth', 9999);
    var minDepth = get(options, 'minDepth', -1);
    var doPrettify = get(options, 'prettify', true);
    //console.log("Stringify - options: ", options);
    return (function _stringify(obj, currentIndent, currentDepth, reserved) {
        if (obj instanceof Set) {
            obj = Array.from(obj);
        }
        if (obj && typeof obj.toJSON === 'function') {
            obj = obj.toJSON();
        }
        var result = undefined;
        if (currentDepth >= minDepth || obj == undefined) {
            result = JSON.stringify(obj);
            if (result === undefined) {
                return result;
            }
            var length = maxLength - currentIndent.length - reserved;
            if (result.length <= length || currentDepth > maxDepth) {
                if (!doPrettify) {
                    return result;
                }
                var prettified = prettify(result);
                if (prettified.length <= length || currentDepth > maxDepth) {
                    return prettified;
                }
            }
        }
        if (typeof obj === 'object' && obj !== null) {
            var nextIndent = currentIndent + indent;
            var nextDepth = currentDepth + 1;
            var items = [];
            var delimiters;
            var comma = function (array, index) {
                return (index === array.length - 1 ? 0 : 1);
            };
            if (Array.isArray(obj)) {
                for (var index = 0; index < obj.length; index++) {
                    items.push(_stringify(obj[index], nextIndent, nextDepth, comma(obj, index)) || 'null');
                }
                delimiters = '[]';
            }
            else {
                Object.keys(obj).forEach(function (key, index, array) {
                    var keyPart = JSON.stringify(key) + ': ';
                    var value = _stringify(obj[key], nextIndent, nextDepth, keyPart.length + comma(array, index));
                    if (value !== undefined) {
                        items.push(keyPart + value);
                    }
                });
                delimiters = '{}';
            }
            if (items.length > 0) {
                return [
                    delimiters[0],
                    indent + items.join(',\n' + nextIndent),
                    delimiters[1]
                ].join('\n' + currentIndent);
            }
        }
        return result;
    }(obj, '', 0, 0));
};
// Note: This regex matches even invalid JSON strings, but since we’re
// working on the output of `JSON.stringify` we know that only valid strings
// are present (unless the user supplied a weird `options.indent` but in
// that case we don’t care since the output would be invalid anyway).
var stringOrChar = /("(?:[^\\"]|\\.)*")|[:,]/g;
function prettify(string) {
    return string.replace(stringOrChar, function (match, string) {
        return string ? match : match + ' ';
    });
}
function get(options, name, defaultValue) {
    return (name in options ? options[name] : defaultValue);
}
exports.stringifyFAST = (obj, options = {}) => {
    //console.log("Stringify - options: ", options);
    var indent = JSON.stringify([1], null, get(options, 'indent', 2)).slice(2, -3);
    var maxLength = (indent === '' ? Infinity : get(options, 'maxLength', 80));
    var maxDepth = get(options, 'maxDepth', 9999);
    var minDepth = get(options, 'minDepth', -1);
    var doPrettify = get(options, 'prettify', true);
    //console.log("Stringify - options: ", options);
    return (function _stringify(obj, currentIndent, currentDepth, reserved) {
        if (obj instanceof Set) {
            obj = Array.from(obj);
        }
        if (obj && typeof obj.toJSON === 'function') {
            obj = obj.toJSON();
        }
        var result = undefined;
        if (currentDepth >= minDepth || obj == undefined) {
            result = JSON.stringify(obj);
            if (result === undefined) {
                return result;
            }
            var length = maxLength - currentIndent.length - reserved;
            if (result.length <= length || currentDepth > maxDepth) {
                if (!doPrettify) {
                    return result;
                }
                var prettified = prettify(result);
                if (prettified.length <= length || currentDepth > maxDepth) {
                    return prettified;
                }
            }
        }
        if (typeof obj === 'object' && obj !== null) {
            var nextIndent = currentIndent + indent;
            var nextDepth = currentDepth + 1;
            let result = "";
            var comma = function (array, index) {
                return (index === array.length - 1 ? 0 : 1);
            };
            if (Array.isArray(obj)) {
                result += "[";
                let sz = obj.length;
                for (var index = 0; index < sz; index++) {
                    if (index > 0)
                        result += ",";
                    result += "\n" + nextIndent +
                        _stringify(obj[index], nextIndent, nextDepth, comma(obj, index)) || 'null';
                }
                result += "\n" + currentIndent + "]";
                return result;
            }
            else {
                result += "{";
                let n = 0;
                Object.keys(obj).forEach(function (key, index, array) {
                    if (!obj.hasOwnProperty(key))
                        return;
                    var keyPart = JSON.stringify(key) + ': ';
                    var value = _stringify(obj[key], nextIndent, nextDepth, keyPart.length + comma(array, index));
                    if (value !== undefined) {
                        if (n > 0)
                            result += ",";
                        result += "\n" + nextIndent + keyPart + value;
                        n++;
                    }
                });
                result += "\n" + currentIndent + "}";
                return result;
            }
        }
        if (result === undefined) {
            result = JSON.stringify(obj);
        }
        return result; // undefined ...
    }(obj, '', 0, 0));
};
//module.exports = stringify
//# sourceMappingURL=stringify.js.map