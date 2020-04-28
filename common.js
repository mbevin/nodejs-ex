'use strict';

/**
 Map helpers
*/
global.addToMapArr = (map, key, value) => {
    if(!map[key]) {
        map[key] = [];
    }
    map[key].push(value);
}
global.addToMapNumber = (map, key, value) => {
    map[key] = (map[key] || 0) + value;
}
/**
 == addToMapArr
 If an object has a property that is to be an array, add value to this property,
 creating the array if necessary ...
*/
global.addToMMap = (map, key, value) => {
    if(!map[key]) {
        map[key] = [];
    }
    map[key].push(value);
}


/**
 Object helpers - scared to add any/many to Object.prototype .... seems almost
 less scarily polluting to have as global functions ....
*/


// ownKeys + ownEntries - preferring over Object.keys + Object.entries ...
global.ownKeys = function(obj) { 
    return Object.keys(obj).filter(k => obj.hasOwnProperty(k));
}
global.ownEntries = function(obj) { 
    return Object.entries(obj).filter(k => obj.hasOwnProperty(k[0]));
}
global.ownValues = function(obj) { 
    return Object.keys(obj).filter(k => obj.hasOwnProperty(k)).map(k => obj[k]);
}

/**
 Returns length/size for both arrays and objects, and also handles undefined by returning 0 ...
*/
global.size = function(obj) {
    if(!obj) {
        return 0;
    }
    if(Array.isArray(obj)) {
        return obj.length;
    }
    else if(typeof(obj) === 'string') {
        return obj.length;
    }
    else {
        return ownKeys(obj).length;
    }
}
global.ownLength = (obj) => size(obj);



// Returning a new object with selected properties 
global.pick = function(_this, arr, assertThatAllExist=true) { //Object.prototype.pick = function(arr) {
    global.obj = {};
    arr.forEach(function(key){
        if(assertThatAllExist) {
            assert(_this.hasOwnProperty(key));
        }
        obj[key] = _this[key];
    });

    return obj;
};

global.pickFromProperties = function(_this, arr, assertThatAllExist=true) { //Object.prototype.pick = function(arr) {
    global.obj = {};

    for(let [k,v] of ownEntries(_this)) {
        obj[k] = pick(v, arr, assertThatAllExist);
    }

    return obj;
};

global.flipIndexing = function(_this) { //Object.prototype.pick = function(arr) {
    global.obj = {};

    for(let [k,v] of ownEntries(_this)) {
        for(let [k2, v2] of ownEntries(v)) {
            if(!obj[k2]) {
                obj[k2] = {};
            }
            obj[k2][k] = v2;
        }
    }

    return obj;
};

// Returning a new object minus selected properties
global.omit = function(_this, arr) {
    global.obj = clone(_this);
    remove(obj, arr);
    return obj;
};

// Remove an array of keys from object
global.remove = function(_this, keys) { //Object.prototype.remove = function(arr) {
    if(Array.isArray(keys)) {
        keys.forEach(function(key) {
            delete(_this[key]);
        });
    }
    else {
        delete _this[keys];
    }
    return _this;
};

/**
  Adds obj's entries to this - changing the passed '_this' object (tho also returns this, so safe to use
  in the form obj = extend(obj, otherObj), just not neccessary ...

  - note, I know see there is also Object.assign that does this job:
     "The Object.assign() method is used to copy the values of all enumerable own properties from one 
      or more source objects to a target object. It will return the target object."
    - Object.assign(target, ...sources)
    - i.e. global.copy = Object.assign({}, obj);
 */
global.extend = function(_this, obj) { //Object.prototype.extend = function(obj) {
    for (global.i in obj) {
        if (obj.hasOwnProperty(i)) {
            _this[i] = obj[i];
        }
    }
    return _this;
};
// 'Shallow' clone, I guess you'd call it ...
global.clone = function(_this) {
    global.obj = {};
    obj = extend(obj, _this);
    return obj;
}



/**
 Array helpers
*/
Array.prototype.sortAsc = function(fn) {
    return this.sort((a,b) => {

        // this is simpler, and works fine for numbers, but not for strings .....
        //return fn(a) - fn(b);

        let aV = fn(a);
        let bV = fn(b);

        if(aV == undefined) {
            return bV == undefined ? 0 : 1;
        }
        if(bV == undefined) {
            return -1;
        }

        if(aV > bV)
            return 1;
        if(aV < bV)
            return -1;
        return 0;
    });
}
Array.prototype.sortDesc = function(fn) {
    return this.sort((a,b) => {

        // this is simpler, and works fine for numbers, but not for strings .....
        //return fn(b) - fn(a);

        let aV = fn(a);
        let bV = fn(b);

        if(aV == undefined) {
            return bV == undefined ? 0 : -1;
        }
        if(bV == undefined) {
            return 1;
        }


        if(bV > aV)
            return 1;
        if(bV < aV)
            return -1;
        return 0;
    });
}

Array.prototype.addIfNotContains = function(e) {
    if(!this.some(ee => e == ee)) {
        this.push(e);
    }
}
Array.prototype.last = function() {
    return this.length>0 ? this[this.length-1] : undefined;
}
Array.prototype.reversed = function() {
    return this.slice(0).reverse();
}
Array.prototype.indexOfMax = function(mapping) {
    if(mapping == undefined) {
        return this.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    }
    else {
        return this.reduce((iMax, x, i, arr) => mapping(x) > mapping(arr[iMax]) ? i : iMax, 0);
    }
}
Array.prototype.maxElement = function(mapping) {
    return this[this.indexOfMax(mapping)];
}

let myMax = function(a, b) {
    return a > b ? a : b;
}
Array.prototype.maxOld = function(mapping) {
    if(mapping !== undefined) {
        return this.map(mapping).reduce((p, c) => Math.max(p, c));
    }
    else {
        return this.reduce((p, c) => Math.max(p, c));
    }
}
Array.prototype.max = function(mapping) {
    if(mapping !== undefined) {
        return this.map(mapping).reduce((p, c) => myMax(p, c));
    }
    else {
        return this.reduce((p, c) => myMax(p, c));
    }
}

let myMin = function(a, b) {
    return a < b ? a : b;
}
Array.prototype.minOld = function(mapping) {
    if(mapping !== undefined) {
        return this.map(mapping).reduce((p, c) => Math.min(p, c));
    }
    else {
        return this.reduce((p, c) => Math.min(p, c));
    }
}

Array.prototype.min = function(mapping) {
    if(mapping !== undefined) {
        return this.map(mapping).reduce((p, c) => myMin(p, c));
    }
    else {
        return this.reduce((p, c) => myMin(p, c));
    }
}

Array.prototype.avg = function(mapping) {
    let arr = this;
    if(mapping !== undefined) {
        arr = this.map(mapping);
    }

    if(!size(arr)) {
        return 0;
    }
    return arr.reduce((p, c) => p + c) / this.length;
}
Array.prototype.average = Array.prototype.avg;

Array.prototype.sum = function(mapping) {
    let arr = this;
    if(mapping !== undefined) {
        arr = this.map(mapping);
    }
    if(!size(arr)) {
        return 0;
    }
    return arr.reduce((p, c) => p + c); 
}
Array.prototype.count = function(filter) {
    if(filter == undefined) {
        return size(this);
    }

    //return this.filter(filter).length;
    let result=0;
    for(let idx=0; idx<this.length; idx++) {
        if(filter(this[idx]))
            result++;
    }
    return result;
}

String.prototype.count = function(filter) {
    let result=0;
    for(let idx=0; idx<this.length; idx++) {
        if(filter(this[idx]))
            result++;
    }
    return result;
}


Array.prototype.toObjectIndexedBy = function(keyField) {
   return this.reduce((obj, item) => {
     obj[item[keyField]] = item
     return obj
   }, {});
}

/**
 to use instead of includes, as uses == instead of === - not sure, but i was having issues with includes and
 so got scared to use it, alwasy using this some workaround instead, so encapsulating that here ...
*/
Array.prototype.contains = function(element) {
    return this.some(e => e == element);
}

global.uniqueArray = (arrArg) => {
  return arrArg.filter((elem, pos, arr) => {
    return arr.indexOf(elem) == pos;
  });
}
global.arraysShareAnyElements = (haystack, arr) => {
    return arr.some(function (v) {
        return haystack.indexOf(v) >= 0;
    });
};

/**
String formatting helpers
*/

global.isAlpha = (c) => {
    return c.length === 1 && c.match(/[a-z]/i);
}

//pads left
String.prototype.lpad = function(length, padString=" ") {
    var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
}
 
//pads right
String.prototype.rpad = function(length, padString=" ") {
    var str = this;
    //log.info("this: " + str, typeof(this), str.toString());
    while (str.length < length)
        str = str + padString;
    return str;
}
Number.prototype.rpad = function(length, fixedPoints, padString=" ") {
    var num = this;
    //log.info("this1: " + num, num, num.toString());    

    return num.toString().rpad(length, padString);
}
Number.prototype.lpad = function(length, padString=" ") {
    var num = this;
    //log.info("this1: " + num, num, num.toString());    
    return num.toString().lpad(length, padString);
}

global.equalsIgnoringCase = (str1, str2) => {
    if(str1 === undefined || str2 === undefined) {
        return str1 == str2;
    }
    else {
        assert(typeof(str1) == 'string', prettyPrint(str1));
        assert(typeof(str2) == 'string', prettyPrint(str2));

        return str1.toUpperCase() == str2.toUpperCase();
    }
}

global.commafy = (num, numDecimals) => {
    if(num === undefined) {
        return undefined;
    }
    if(numDecimals != undefined) {
        num = num.toFixed(numDecimals);
    }
    
    if(typeof num.toLocaleString === 'function') {
        return num.toLocaleString();
    }
    return num;
}

/**
HTML
*/
global.tdify = (content, tdClass=undefined) => tdClass ? 
    "<td class='"+tdClass+">"+content+"</td>" :
    "<td>" + content + "</td>";
global.boldify = (b, txt) => b ? "<b>" + txt + "</b>" : txt;

global.dimmify = (b, txt) => b ? 
    "<span class='dim'>" + txt + "</span>" : txt;

global.settingsToHtml = (settings) => ownEntries(settings).map(e => " " + e[0] + "=" + e[1] + " ").join('');
global.headify = (settings, txt, secondaryTxt="") => 
    "<td " + settingsToHtml(settings) + " align='center'><b>"+txt+"</b>"
    +(secondaryTxt?"<br/>"+secondaryTxt:"")+"</td>";


global.beginHtml = (refreshTime=10) => `
    <html>
    <body>
    <HEAD>
        <LINK href="style.css" rel="stylesheet" type="text/css">
        <script type="text/javascript" src="js/jquery.min.js"></script>
        <script type="text/javascript" src="js/jquery-ui.min.js"></script>
        <meta http-equiv="refresh" content="${refreshTime}">
    </HEAD>
    <script>
    let formatSeconds = (seconds) => {
        seconds = parseInt(seconds);

        if(seconds < 60) {
            return seconds.toFixed() + "s";
        }

        let minutes = seconds/60;
        if(minutes < 5) {
            return minutes.toFixed() + "m" + (seconds%60).toFixed() + "s";
        }
        if(minutes < 60) {
            return minutes.toFixed() + "m";
        }

        let hours = minutes/60;
        if(hours < 24) {
            return hours.toFixed() + "h";
        }
        else {
            let days = hours/24;
            if(days < 5) {
                return days.toFixed() + "d";
            }
            else {}
                return days.toFixed() + "d" + (hours%24).toFixed() + "h";
        }
    }
    function refreshDate() {
        let date = $("#age-invisible").html();
        let timeDiffS = ((new Date()) - (new Date(date))) / 1000;

        $("#age").html("Age: " + formatSeconds(timeDiffS));
        $("#age").show();
        //$("#example-table").tabulator("setData","http://localhost:3000/children");
    }
    setInterval(refreshDate, 1000);

    $(document).ready(function() {
        refreshDate()
    });

    </script>
    `;

global.endHtmlWithTimestamp = (extraText) => {
    return "<div class='topcorner'><i><font color='#666666'><span id='age-invisible' class='invisible'>" + Date()
         + "</span><span id='age' class='invisible'>" + Date() + "</font></i></div></body></html>";
}


/**
 Misc
*/

function pad(text, length) {
    while (text.length < length) { text += ' '; }
    return text;
}

function zpad(v, length) {
    v = String(v);
    while (v.length < length) { v = '0' + v; }
    return v;
}
function formatDate(seconds) {
    var date = new Date(1512199025 * 1000);
    return [
        [ date.getFullYear(), zpad(date.getMonth() + 1, 2), zpad(date.getDate(), 2) ].join('-'),
        [ zpad(date.getHours(), 2), zpad(date.getMinutes(), 2), zpad(date.getSeconds(), 2) ].join(':')
    ].join(' ');
}

global.indented = function(data) {
    var maxLength = 0;
    for (const key in data) {
        if (key.length > maxLength) { maxLength = key.length; }
    } 
    for (const key in data) {
        log.info('  ' + pad(key + ': ', maxLength + 3) + data[key]);
    }
}

/**
 Converts x to JSON string.
*/
global.prettyPrint = (x, multiline=true, limit=undefined, maxDepth=undefined) => {
    let result = //JSON.stringify(x);
        multiline ? 
            stringify(x, { /*maxLength: 120,*/ maxDepth:maxDepth }) :
            JSON.stringify(x);
    
    if(limit) {
        result = result.slice(0, limit);
    }
    return result;
}
global.required = () => {
    throw new Error('Missing parameter');
}

/**
 The maximum is exclusive and the minimum is inclusive
*/
global.getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; 
}

global.getRandomArrIdx = (arr) => {
    if(!arr.length) {
        assert(false);
        return undefined;
    }
    return getRandomInt(0, arr.length);
}
global.getRandomArrElement = (arr) => {
    if(!arr.length) {
        assert(false);
        return undefined;
    }
    return arr[getRandomArrIdx(arr)];
}


global.sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}


global.formatSeconds = (seconds, padHours=false) => {
    seconds = parseInt(seconds);

    if(seconds < 60) {
        return seconds.toFixed() + "s";
    }
    let minutes = Math.floor(seconds/60);
    
    if(minutes < 5) {
        return minutes.toFixed() + "m" + (seconds%60).toFixed() + "s";
    }
    if(minutes < 60) {
        return minutes.toFixed() + "m";
    }

    let hours = Math.floor(minutes/60);
    if(hours < 24) {
        return hours + "h";
    }
    else {
        let d = Math.floor(hours/24);
        let rem = hours - d*24;
        return d + "d" 
            + rem.toFixed().lpad(padHours ? 2 : 0, '0') + "h";
    } 
}


var lookup = {
  '0': '0000',
  '1': '0001',
  '2': '0010',
  '3': '0011',
  '4': '0100',
  '5': '0101',
  '6': '0110',
  '7': '0111',
  '8': '1000',
  '9': '1001',
  'a': '1010',
  'b': '1011',
  'c': '1100',
  'd': '1101',
  'e': '1110',
  'f': '1111',
  'A': '1010',
  'B': '1011',
  'C': '1100',
  'D': '1101',
  'E': '1110',
  'F': '1111'
};
global.hexToBinary = (s)=> {
    var ret = '';
    for (var i = 0, len = s.length; i < len; i++) {
        let v = lookup[s[i]];
        assert(v !== undefined, () => prettyPrint({v, s, i}));
        ret += v;
    }
    return ret;
}

var lookup32 = {
  '00000' :'0',
  '00001' :'1',
  '00010' :'2',
  '00011' :'3',
  '00100' :'4',
  '00101' :'5',
  '00110' :'6',
  '00111' :'7',
  '01000' :'8',
  '01001' :'9',
  '01010' :'a',
  '01011' :'b',
  '01100' :'c',
  '01101' :'d',
  '01110' :'e',
  '01111' :'f',
  '10000' :'g',
  '10001' :'h',
  '10010' :'i',
  '10011' :'j',
  '10100' :'k',
  '10101' :'l',
  '10110' :'m',
  '10111' :'n',
  '11000' :'o',
  '11001' :'p',
  '11010' :'q',
  '11011' :'r',
  '11100' :'s',
  '11101' :'t',
  '11110' :'u',
  '11111' :'v',
};

global.binaryToBase32 = (s)=> {
    assert.equal(s.length % 5, 0, s.length);

    var ret = '';
    for (var i = 0, len = s.length; i < len; i+=5) {
        let v = lookup32[s.substring(i, i+5)];
        assert(v !== undefined, () => prettyPrint({s, v:v, ss:s.substring(i, i+5)}));
        ret += v;
    }
    return ret;
}

global.hexToBase32 = (s)=> {
    return binaryToBase32(hexToBinary(s));
}



global.toPrice = (v)=> {
    return +(parseFloat(v) / 1000000000000000000).toFixed(4);
}


global.logResult = (valueToLogAndReturn, extraStuffToLog) => {
    log.info(valueToLogAndReturn, extraStuffToLog);
    return valueToLogAndReturn;
}


/**
promises - must be an array of functions that return promises, not the promises themselves! (else we couldn't
retry them).

i.e. promises.push(async function() { return await manager.getKitty(k.id); });
*/
global.getBatched = async function(promises, 
                                   retryTillHaveAll = false, 
                                   groupSize = undefined, 
                                   condition = r=>r!==undefined) {
    let myLog = getLogger("getBatched");

    let allResults = [];

    let count = 0;
    let promisesRemaining = promises;
    let successes = 0, failures = 0;

    for(let repeat=0;;repeat++) {
        let failures = 0;
        let results = undefined;

        let promisesThisTime = [];
        while(promisesRemaining.length && (!groupSize || promisesThisTime.length < groupSize)) {
            let p = promisesRemaining.pop();
            let pp = async function() {
                let failed = false;
                let r = undefined;
                try {
                    if(p && typeof p.then == 'function') {
                        assert(false, "promises contains a promise, but needs to contain function calls (that return a promise)!");
                    }

                    r = await p();

                    //TEMP
                    //log.info("r: " + prettyPrint(r));
                }
                catch(error) {
                    failed = true;
                    log.error(error);
                }

                if(!failed && condition(r)) {
                    successes++;
                }
                else {
                    failures++;
                    if(retryTillHaveAll) {
                        promisesRemaining.push(p);
                    }
                }

                count++;
                if(!(count % 100)) {
                    myLog.info("processed: " + count + ", successes: " + successes + ", failures: " + failures);
                }

                return r;
            };
            //console.log("n");
            promisesThisTime.push(pp());
            //promisesThisTime.push((asdf)=>async function() { console.log("hello world"); });
        }
        
        //let t = await promisesThisTime[0]();
        //console.log(t());

        myLog.info("Repeat: " + repeat 
            + ", promisesThisTime: " + promisesThisTime.length 
            + " / " + promisesRemaining.length 
            + ", allResults: " + allResults.length);

        try {
            results = await Promise.all(promisesThisTime);
        }
        catch(error) {
            log.error(error);
        }

        if(!results) {
            myLog.error("results undefined");
            return undefined;
        }
        results = results.filter(r => condition(r));

        //TEMP DEBUG
        //if(results.length) {
        //    log.info(results[0]);
        //}
        
        allResults = allResults.concat(results);

        myLog.info("  received: " + results.length 
            + " / " + promisesThisTime.length 
            + ", allResults: " + allResults.length
            + ", promisesRemainiing: " + promisesRemaining.length);

        if(!promisesRemaining.length) {
            return allResults;
        }

        await sleep(1000);
    }
}

global.Average = class {
    constructor() {
        this.count = 0;
        this.total = 0;
    }
    add(x) {
        count += x;
        total += 1;
    }
    avg() {
        if(!count)
            return -1;
        
        return total/count;
    }
} 

global.timeCall = (key, fn) => {
    let t = new Date();
    fn();
    let timeTaken = ((new Date()) - t) / 1000;
    log.info("timedCall '" + key + "': " + timeTaken.toFixed(2) + "s" /*formatSeconds(timeTaken)*/);
}


global.assert = (condition, message=undefined) => {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}

global.toFixed = (num, numDecimals=2, defaultIfNull=-1) => {
    if(num === undefined) {
        return -1;
    }
    return num.toFixed(numDecimals);
}




//
// copied from stringify.js (!?)
//
global.stringify = (obj, options) => {
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