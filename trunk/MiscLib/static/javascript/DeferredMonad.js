// $Id$
//
// Copyright (c) 2008 O2M8 Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php
//
// Asynchronous operation sequencing support
//
// This module provides a framework for constructing composite deferred
// operations from separate computations, any of which may themselves
// be asynchronous operations returning deferred values.
//
// Example of use (from TestEventHandler.js):
//
// TestEventHandler.prototype.testEventHandlerEqual5 = function() {
//     return (new DeferredMonad())
//      .bind("eh1", function (m) {return makeEventHandler()} )
//      .bind("eh2", function (m) {return makeEventHandler(m.eh1.getUri(), handleEvent, initSub, endSub)} )
//      .eval(       function (m) {assertEquals("eh", m.eh1, m.eh2)} )
//      .run();
// }

// ---------------------------------------------------------
// Class to sequence a number of tests with deferred results
// ---------------------------------------------------------
//
// This class constructs a callback function that sequences a number of operations with
// Deferred intermediate values.  The structure is based loosely on Haskell's IO monad,
// with some extra logic in the bind function to pass the deferred result values
// along the callback chain (very loosely like an 'Either' monad).
// 

// Create a new DeferredMonad object.
// A single Deferred object is allocated to sequence value callbacks within the monad.
function DeferredMonad(annot) {
    this._deferred = new MochiKit.Async.Deferred() ;
    this._label    = annot;
    this._deferred._label   = annot;
    this._deferred.toString = this.deferredString;
}

DeferredMonad.prototype.toString = function() {
    return "DeferredMonad("+this._label+")";
};

DeferredMonad.prototype.deferredString = function() {
    return "Deferred("+this._label+
        ", id="+this.id+", fired="+this.fired+", res="+this.results+")";
};

// bind operation: when previous values have been bound into the monad, the
// supplied function is called with the monad as its argument, and is expected
// to return a value which is bound to a named field of the monad object. If the
// field name is null, the returned value is ignored.
DeferredMonad.prototype.bind = function(fieldname, valfunc) {
    var here = this;
    function dobind(fn,val) {
        if (fn) here[fn] = val;
        return val;
    }
    //this._deferred.addBoth(MochiKit.Base.partial(valfunc,this));
    this._deferred.addCallback(MochiKit.Base.partial(valfunc,this));
    this._deferred.addCallback(MochiKit.Base.bind(dobind,this,fieldname));
    return this;
};

// Evaluate a function but don't bind the result.
DeferredMonad.prototype.eval = function(func) {
    return this.bind(null, func);
};

// Initiate an asynchronous sequence, and return a deferred object that yields the final 
// result of  that sequence.  This can be used to return the result of a test case in a 
// test suite.
DeferredMonad.prototype.run = function(val) {
    //function eb(err) {
    //    debugger;
    //}
    //this._deferred.addErrback(eb);
    this._deferred.callback(val);
    return this._deferred;
};

// End.
