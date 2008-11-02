// $Id$
//
// Copyright (c) 2008 WebBrick Systems Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php
//
// Asynchronous unit testing interface framework
//
// This module provides a unified interface for running suites of synchronous 
// and asynchronous unit tests.  It is intended to cope with unit tests written 
// for a variety of test frameworks (e.g. JSUnit, Test.Simple, MochiKit, etc.)
// and allow the results to be presented via any asynchronous test runner.
//
// The module defines a simple AsyncTestSuite and an AsyncTestRunner to
// compose multiple test suites into a single suite.  It also defines a wrapper
// for test suites that define JSUnit-style unit tests returning synchronous 
// and MochiKit deferred values.
//

/**
 * @fileoverview
 * ...
 *
 * @version $Id$
 * @author Graham Klyne.
 *
 * @requires MochiKit.Base
 * @requires MochiKit.tests.SimpleTest
 */

// Create namespace
webbrick.namespace("webbrick.AsyncUnitTest");

// Shortcuts
var logInfo    = MochiKit.Logging.log;
var logError   = MochiKit.Logging.logError;

// Helper function used in callback chains to call some given function
//
// If the function returns a value when invoked, that value is passed along 
// the callback chain, otherwise the supplied parameter is passed along.
// This allows non-value-returning functions to be used without losing the
// original callback parameter value.
//
// Errors from the called function are logged for diagnostic purposes,
// then propagated along the callback chain.
//
function passparam(f) {
    return function(p) { 
        try {
            var r = f(p);
            if (r !== undefined) return r;
            //if (typeof(r) != 'undefined') return r;
        }
        catch(e) {
            ok(false, e.toString());
            throw(e);
        }
        return p ;
    };
}

// Helper function to get value from Deferred, assuming it has fired
//
// If the supplied parameter is a Deferred object, its return value is
// extracted (or null if the Deferred has not been fired), otherwise
// the value is returned.
//
function syncDeferred(val) {
    var res = null;
    function rescb(r) {
        res = r;
    }
    if (val instanceof MochiKit.Async.Deferred) {
        val.addBoth(rescb);
    }
    else {
        res = val;
    }
    return res;
}

// ---------------------------------
// Asynchronous test suite interface
// ---------------------------------

// Constructor for asynchronous test suite
function AsyncTestSuite() {
    this._report   = null;
    this._complete = null;
    this._numTests = 0;
    this._status   = 'empty';
}

// Initiate the tests and return a Deferred that receives the results of the tests
//
// p        is the number of tests run previously
// report   a function called to report progress for each completed test,
//          called with arguments per 'reportProgress' below.
//
// Returns a Deferred object that activates its callback with a triple
// containing the arguments supplied to 'testsComplete'.
AsyncTestSuite.prototype.runTests = function(p,report) {
    var d    = new MochiKit.Async.Deferred(); 
    complete = function(p,n,r) { d.callback([p,n,r]) };
    this.initiateTests(p,report,complete);
    return d;
}

// Function to start running tests
//
// p        is the number of tests run previously
// report   a function called to report progress for each completed test,
//          called with arguments per 'reportProgress' below.
// complete a function called to indicate completion of all tests,
//          called with arguments per 'testsComplete' below.
AsyncTestSuite.prototype.initiateTests = function(p,report,complete) {
    this._report   = report;
    this._complete = complete;
    throw "AsyncTestSuite.initiateTests function must be overridden";
}

// Function called to report progress at completion of a test
//
// p        is the number of tests run previously
// n        is the test number within this suite, 
//          incremented by 1 for each test executed
// nam      is the name of the completed test
// msg      is null if the test succeeded, or is a message describing the 
//          failure condition.
//
AsyncTestSuite.prototype.reportProgress = function(p,n,nam,msg) {
    // ok(false,"reportProgress p:"+p+", n:"+n+", nam:"+nam+", msg:"+msg);
    if (typeof(this._report) == 'function') {
        this._report(p,n,nam,msg);
    }
}

// Function called to report completion of all tests to the caller.
//
// p        is the number of tests run previously
// n        is the total number of tests in this suite
// results  is an array of test results for this suite,
//          indexed 1..n, where each entry is a pair
//          (name,msg) per 'reportProgress' parameters.
//
AsyncTestSuite.prototype.testsComplete = function(p,n,results) {
    if (typeof(this._complete) == 'function') {
        this._complete(p,n,results);
    }
}

// Function that returns number of tests in this suite
AsyncTestSuite.prototype.numTests = function() {
    return this._numTests;
}


// -----------------
// Test case wrapper
// -----------------
//
// Wrapper for a set of test cases that are presented as an object 
// with the following interface:
//
// exposeTestFunctionNames()
//          returns a list of test case function names
// setUp() setup function called before each test case - if response is
//         a MochiKit Deferred object, wait for it to be fired before
//         executing each test case.
// tearDown()
//          teardown function called following each test case has completed.
//          If the response is a MochiKit Deferred object, wait for it to be 
//          fired before reporting completion and initiating the next test case.
// testXXX()
//          Each test case is conventionally given a name starting with 'test'.
//          If the test case returns a MochiKit Deferred object, the waits for 
//          the result of that Deferred.  If the test case result is undefined
//          or null, this is taken to indicate success.  A string result is
//          taken to be a reason for failure.  Any exception is considered to 
//          indicate a test failure.
//
// The resulting object implements the AsyncTestSuite interface described above,
// and also a method runTests that returns the test results as [p,n,results]
// in a Deferred wrapper.

arrayToString = function(a) {
    var s = "";
    for (i in a) {
        if (i != 0) s += ", ";
        s += a[i].toString()
    }
    return "["+s+"]";
}

objectToString = function(o) {
    var s = "";
    for (var k in o) {
        if (typeof(o[k])!="function") {
            s += k.toString()+": "+o[k].toString()+"; "
        }
        else {
            s += k.toString()+": "+"(function); "
        }
    }
    return "{ "+s+"}";
}

// Create an AsyncTestSuite from a test case object
//
// Hint:
//   Having problems with a test suite?
//   Did you invoke new on its constructor?
//
function AsyncTestWrapper(tests) {
    this._tests     = tests;                                        // Test suite
    this._testnames = tests.constructor.exposeTestFunctionNames();  // List of test names
    this._numTests  = this._testnames.length;                       // Number of tests
    this._results   = [];                                           // Accumulates test results returned
    this._status    = 'initial';                                    // Initial status
}

AsyncTestWrapper.prototype = new AsyncTestSuite();

// Start running the tests.  When complete, callbacks are invoked.
// Also returns deferred object used to activate callbacks
AsyncTestWrapper.prototype.initiateTests = function(p,report,complete) {
    // Build tests into sequencer of callbacks on a new Deferred object 
    this._report   = report;
    this._complete = complete;
    this._status   = 'active';
    var d = new MochiKit.Async.Deferred();
    for (var n in this._testnames) {
        var testname = this._testnames[n];
        this._performTest(d,p,Number(n),testname,this._tests);
    }
    // Add completion callback and fire the Deferred to run the tests via its callback chain
    d.addBoth(MochiKit.Base.bind(this._doneCallback,this,p));
    ok(true, "Initiate callback - start tests");
    d.callback(null);
    // ok(false,"Abort test: "+arrayToString(this._testnames));
    // throw "Abort test: "+arrayToString(this._testnames);
    return d;
}

// Local function performs a single test, wrapped with setUp, tearDown, etc.
AsyncTestWrapper.prototype._performTest = function(d,p,n,testname,testobj) {
    //--ok(true,"_performTest "+d.toString()+", "+p.toString()+":"+n.toString()+": "+testname);
    //--ok(true,"testobj: "+objectToString(testobj));
    if (typeof(testobj.setUp) == 'function') {
        d.addBoth(passparam(MochiKit.Base.bind(testobj.setUp,testobj)));
    }
    d.addBoth(passparam(MochiKit.Base.bind(testname,testobj)));
    if (typeof(testobj.tearDown) == 'function') {
        d.addBoth(passparam(MochiKit.Base.bind(testobj.tearDown,testobj)));
    }
    d.addBoth(passparam(MochiKit.Base.bind(this._testCallback,this,p,n,testname)));
}

// Local callback function called when each test completes
AsyncTestWrapper.prototype._testCallback = function(p,n,nam,res) {
    //--ok(false,"_testCallback p:"+p+", n:"+n+", nam:"+nam+", res:"+res);
    var msg = null;
    if (res != null) {
        msg = (typeof res == "string" ? res : res.toString());
    }
    this._results[n] = [nam,msg];
    this.reportProgress(p,n,nam,msg);
    return null;    // Continue callback chain with non-error value
}

// Local callback function called when all tests complete
AsyncTestWrapper.prototype._doneCallback = function(p,res) {
    //--ok(true,"_doneCallback "+res+", _status "+this._status);
    //--ok(true,"_doneCallback "+arrayToString(arguments));
    try {
        //ok(true,"_doneCallback "+objectToString(this));
    } catch(e) {
        ok(false,"Error: "+e);
    }
    this._status    = 'complete';
    this.testsComplete(p,this._testnames.length,this._results);
    return null;    // End callback chain with non-error value
}


// ------------------
// Test suite wrapper
// ------------------
//
// Wrapper to run multiple test suites as a single test suite.
//

// Create an empty AsyncSuiteWrapper
function AsyncSuiteWrapper() {
    this._numTests = 0;                 // Number of tests in this suite of suites
    this._suites   = [];                // List of suites
    this._results  = [];                // Accumulates results from all suites
    this._status   = 'initial';         // Initial status
}

AsyncSuiteWrapper.prototype = new AsyncTestSuite();

// Add a new test suite
AsyncSuiteWrapper.prototype.addTestSuite = function(s) {
    this._suites.push(s);
    this._numTests += s.numTests();
}

// Run tests
AsyncSuiteWrapper.prototype.initiateTests = function(p,report,complete) {
    this._report   = report;
    this._complete = complete;
    this._status   = 'active';
    var d = new MochiKit.Async.Deferred();
    for (var i in this._suites) {
        s = this._suites[i];
        this.performSuite(d,s,p,report);
        p += s.numTests();
    }
    // Finish up and fire the deferred to run the tests via its callback chain
    d.addCallback(MochiKit.Base.partial(this._doneCallback,p));
    d.callback(null);
}

// Lodge a single suite execution and gather the results in the callback chain 
// for the supplied deferred, 
AsyncSuiteWrapper.prototype.performSuite = function(d,s,p,report) {
    var runtests = function () { s.runTests(p,report) };
    d.addCallback(runtests);                // Execute tests, return Deferred
    d.addCallback(this._suiteCallback);     // Callback to gather results freom suite
}

// Callback when suite is finished
// Argument is array of p,n,results
AsyncSuiteWrapper.prototype._suiteCallback = function(args) {
    //var p  = args[0];
    //var n  = args[1];
    //var rs = args[2];
    this._results.concat(args[2]);
    return null;
};

// Callback when all suites have been run
AsyncSuiteWrapper.prototype._doneCallback = function(p) {
    this._status    = 'complete';
    this.testsComplete(p,this._numtests,this._results);
    return null;    // End callback chain with non-error value
};

// -------------------------------------
// Functions for JSUnit-style test cases
// -------------------------------------

function assertFail(msg){
    logError("FAIL: "+msg);
    throw(msg);
}

function assert(msg,c) {
    //ok(c, msg);
    if (!c) assertFail(msg);
}

function assertTrue(msg,a,c) {
    assert(msg+": <"+a+">.", c);
}

function assertFalse(msg,a,c) {
    assert(msg+": <"+a+">.", !c);
}

function assertNot(msg,a,c) {
    assert(msg+": expected not <"+a+">.", !c);
}

function assertNotUndefined(msg,a,v) {
    assert(msg+": expected defined <"+a+">.", v!==undefined);
}

function assertNe(msg,a,b) {
    assert(msg+": expected NOT EQ <"+a+">.", a!==b);
}

function assertEq(msg,a,b) {
    assert(msg+": <"+a+"> NOT EQ <"+b+">.", a===b);
}

// Assert equality function using array element comparison and eq method if defined
function assertEquals(msg,a,b) {
    if ((a instanceof Array) && (b instanceof Array)) {
        if (a.length != b.length) {
            assertEq(msg,a,b);
        }
        else {
            for (var i = 0; i < a.length; i++) {
                assertEquals(msg,a[i],b[i]);
            }
        }
    }
    else {
        if ((a instanceof Object) && ("eq" in a)) {
            //ok(true,"eqm-"+msg);
            //ok(true,"eqa-"+a);
            //ok(true,"eqb-"+b);
            if (!a.eq(b)) assertEq(msg,a,b);
        }
        else {
            //ok(true,"nom-"+msg);
            //ok(true,"noa-"+a);
            //ok(true,"nob-"+b);
            assertEq(msg,a,b);
        }
    }
}

// Assert inequality function using eq method if defined
function assertNotEquals(msg,a,b) {
    if ((a instanceof Object) && ("eq" in a)) {
        if (a.eq(b)) assertNot(msg, a, true);
    }
    else {
        assertNot(msg, a, a===b);
    }
}

// String prefix-testing operation
new String();
String.prototype.startswith = function (pre) {
    return this.substr(0,pre.length) == pre;
}

// -------------------------------------------------------------
// Function to run synchronous test suite in asynchronous runner
// -------------------------------------------------------------

runTestSuite = function(suite,report,done) {
    try {
        var cb_report = report || function(p,n,nam,msg) {
            var tn = p+n;
            if (msg != null) {
                logError("Test failed: "+tn.toString()+": "+nam+": "+msg);
            } else {
                logInfo("Test complete: "+tn.toString()+": "+nam);
                ok(msg == null,"Test complete: "+tn.toString()+": "+nam+": "+msg);
            }
            //assert("Test complete: "+tn.toString()+": "+nam+": "+msg, msg == null);
        };

        var cb_complete = done || function(p,n,res) {
            logInfo("All tests complete: "+n.toString());
            ok(true,"All tests complete: "+n.toString());
            SimpleTest.finish();
        };

        var t0 = new AsyncTestWrapper(new suite());
        SimpleTest.waitForExplicitFinish();
        t0.initiateTests(0, cb_report, MochiKit.Base.bind(cb_complete,t0));
        //ok(false, "Trivial initiateTests return");

    } catch (err) {
        var s = "test suite failure!\n";
        var o = {};
        var k = null;
        for (k in err) {
            // ensure unique keys?!
            if (!o[k]) {
                s +=  k + ": " + err[k] + "\n";
                o[k] = err[k];
            }
        }
        ok(false, s);
        SimpleTest.finish();
    }
};

// End.
