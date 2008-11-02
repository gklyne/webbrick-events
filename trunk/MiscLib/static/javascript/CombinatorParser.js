// $Id$
//
// Copyright (c) 2008 WebBrick Systems Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php
//
// Combinator parsing library
//
// This is a parsing library inspired by the PyParsing (Python) and Parsec 
// (Haskell) libraries, but stripped back to try and keep it really simple.
//
// The basic idea is that parsers are Javascript functionas/objects that can 
// be combined in various ways by parser combinators to mimic the kinds
// of structures normally encountered in BNF-style grammars.  Parsing is by
// top-down recursive descent, normally with one-symbol look-ahead. but with 
// possibilities for combinators that implement some kind of look-ahead.
//
// Results are returned as a list of decoded values, which themselves may be 
// strings, other values of lists of values.  I have decided to not implement 
// dictionary-style result values (ala PyParsing) because I don't believe 
// that Javascript-based parsers will be sufficiently comlex to warrant the 
// overhead of doing that.
//
// (True combinators are functions that modify other functions.  I decided
// not to represent parsers are pure functions, but rather exploit a duality 
// between higher order functions and objects (each can be used to implement 
// the other), a style that is easier for non-functional-programmers to follow.

// Base class for all parsers
// Also constructs a parser object given a parse function.
//
// 'n'  = parser type name, for debugging only
// 'p'  = parser function, overrides parse function (see below)
//
function Parser(n,p) {
    this._pname = n;
    this._parse = p;
}

new Parser("dummy", null);

// Main parse function: parse string and return results, or null
Parser.prototype.parseString = function(inp) {
    var res = parseSeq([this,CombinatorParsers.end()]).parseWorker(inp,0);
    return res[1];
};

// Internal parser function that looks after whitespace and other common housekeeping.
// Uses same interface as 'parse' method
// 'inp'    the string from which to parse a value.
// 'pos'    is the position at which to start parsing.
// returns: a 2-element array inidicating:
//          (a) the position of the remaining input following the parsed value, and
//          (b) a list of parsed values (which may be empty), or null to indicate
//              the parser was not matched by the supplied input (in which case, the
//              remaining input indicates the point at which the match failed.
//
Parser.prototype.parseWorker = function(inp,pos) {
    return this.parse(inp,this.skipWS(inp,pos));
};

// Function to skip white space in the input string
// returns a new input position with leading white space skipped.
Parser.prototype.skipWS = function(inp,pos) {
    while (this.isWS(inp[pos])) pos++;
    return pos;
};

// Function to test for white space character
Parser.prototype.isWS = function(c) {
    return ((c==' ') || (c=='\t') || (c=='\n'));
};

// Parser-specific parse function: parse string from supplied input 
// Uses same interface as 'parseWorker' method (SEE ABOVE).
Parser.prototype.parse = function(inp,pos) {
    if (this._parse) {
        return this._parse(inp, pos);
    }
    else {
        throw new Error("parse must be overridden by Parser instance");
    }
};

// Short-name parser functions as members of object CombinatorParsers 
// to avoid polluting global scope

CombinatorParsers = {
    // Primitives
    val:
        // Return suppied values to result list.
        // If a non-array value is supplied, it is wrapped as a singleton array.
        function(v) {
            var p = function (inp, pos) {
                if (v instanceof Array)
                    return [pos,v];
                return [pos,[v]];
            };
            return new Parser("val",p);
        },

    empty:
        // Return parser that matches anything and inserts the supplied value 
        // into the results list
        function() {
            return CombinatorParsers.val([]);
        },

    end:
        // Return parser that matches end of input
        function() {
            var p = function (inp, pos) {
                return [pos,(pos==inp.length ? [] : null)];
            }
            return new Parser("end",p);
        },

    text:
        function(txt) {
            return parseText(txt);
        },

    regex:
        function(rex) {
            return parseRegex(rex);
        },

    // Value conversion
    // TODO: refactored version with abstracted conversion function
    // TODO: change name as 'int' is reserved
    int:
        function(p) {
            var pc = function (inp,pos) {
                //Parse-and-convert result
                var r = p.parseWorker(inp,pos);
                if (r[1] != null) {
                    r[1][0] = parseInt(r[1][0]);
                }
                return r;
            };
            return new Parser("int",pc);
        },

    grp:
        function() {
            var ps = parseSeq(sliceArguments(0,arguments));
            var pg = function (inp,pos) {
                //Parse-and-group result
                var r = ps.parseWorker(inp,pos);
                if (r[1] != null) {
                    r[1] = [r[1]];
                }
                return r;
            };
            return new Parser("grp",pg);
        },

    sup:
        function() {
            var ps = parseSeq(sliceArguments(0,arguments));
            var pg = function (inp,pos) {
                //Parse-and-suppress result
                var r = ps.parseWorker(inp,pos);
                if (r[1] != null) {
                    r[1] = [];
                }
                return r;
            };
            return new Parser("sup",pg);
        },

    // Combinators
    seq:
        function() {
            return parseSeq(sliceArguments(0,arguments));
        },

    alt:
        function() {
            return parseAlt(sliceArguments(0,arguments));
        },

    rpt:
        function(num) {
            return parseRepeat(num,sliceArguments(1,arguments));
        },

    opt:
        function() {
            return parseAlt([parseSeq(sliceArguments(0,arguments)),
                             CombinatorParsers.val(null)]);
        },

    fwd:
        function(o,pn) {
            // Forward reference to a parser not yet defined:
            // Creates a new parser containing a reference to the supplied variable,
            // which it assumed will be assigned a new value later.
            // 'o'  is reference to object scope in which parser is defined
            // 'pn' is the name of a field that will be assigned the Parser value
            var pf = function (inp,pos) {
                // Parse using forward parser definition
                return o[pn].parseWorker(inp,pos);
            };
            return new Parser("fwd",pf);
        }

};

// Return a parser that matches an exact text value, 
// and returns it as the parsed value.
function parseText(str) {
    var p = function (inp,pos) {
        if (inp.substr(pos,str.length) == str) {
            return [pos+(str.length),[str]];
        }
        return [pos,null];
    };
    return new Parser("parseText", p);
}

// Return a parser that matches a regular expression, 
// and returns the matched text as the parsed value.
function parseRegex(rex) {
    if (typeof rex == 'string') {
        rex = new RegExp("^"+rex);
    }
    var p = function (inp,pos) {
        var i = inp.slice(pos);
        var r = rex.exec(i);
        if (r) {
            return [pos+r[0].length,[r[0]]];
        }
        return [pos,null];
    };
    return new Parser("parseRegex", p);
}

// Helper function to create an array of argument values
function sliceArguments(start,args) {
    var res = [];
    for (var i = start ; i < args.length ; i++) {
        res.push(args[i]);
    }
    return res;
}

// Helper function top create a parser from a supplied value:
function makeParser(v) {
    if (v instanceof Parser)  return v;
    if (typeof v == 'string') return new parseText(v);
    if (v instanceof RegExp)  return new parseRegex(v);
    if (v instanceof Array)   return parseSeq(v);
    debugger;
    throw new Error("Unrecognized value type for makeParser");
}

// Helper function to create a sequence parser from a supplied array
// containing parsers to be applied sequentially.
function parseSeq(ps) {
    var ps1 = [];
    var p = function (inp,pos) {
        var v = [];
        var r = [pos,[]];
        for (var i = 0 ; (i < ps1.length) && (v !== null) ; i++) {
            r = ps1[i].parseWorker(inp,r[0]);
            if (r[1] === null) {
                v = null;
            }
            else {
                // Concatenate elements to list
                for (var j = 0 ; j < r[1].length ; j++) v.push(r[1][j]);
            }                    
        }
        return [r[0], v];
    };
    for (var i = 0 ; i < ps.length ; i++) {
        ps1.push(makeParser(ps[i]));
    }
    return new Parser("parseSeq", p);
};

// Helper function to create an alternative parser from a supplied array 
// of alternative parsers.  The first matching parser in the list is
// selected.
function parseAlt(ps) {
    var ps1 = [];
    var p = function (inp,pos) {
        for (var i = 0 ; (i < ps1.length) ; i++) {
            var r = ps1[i].parseWorker(inp,pos);
            if (r[1] !== null) return r;
        }
        return [pos,null];
    };
    for (var i = 0 ; i < ps.length ; i++) {
        ps1.push(makeParser(ps[i]));
    }
    return new Parser("parseAlt", p);
}

// Helper function that applies a parser or parse sequence repeatedly,
// returning an array of values thus obtained.
function parseRepeat(num,ps) {
    var min = 0;
    var max = undefined;
    var p = function (inp,pos) {
        if (max === undefined) max = inp.length;
        var v = [];
        var r = [pos,[]];
        for (var i = 0 ; (i < max) && (r[1] !== null) ; i++) {
            r = ps1.parseWorker(inp,r[0]);
            if (r[1] === null) {
                if (i < min) v = null;
            }
            else {
                for (var j = 0 ; j < r[1].length ; j++) v.push(r[1][j]);
                //v.push(r[1]);
            }                    
        }
        return [r[0], v];
    };
    if (num instanceof Array) {
        min = num[0];
        max = num[1];
    }
    var ps1 = makeParser(ps);
    return new Parser("parseRepeat", p);
}

// End.