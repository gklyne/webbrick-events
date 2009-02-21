// $Id$
//
// Copyright (c) 2008 WebBrick Systems Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php
//
// Unit test helper functions - mainly for use with jsUnit
//

function setUpPageForJSUnit(testgroup, testframe) {
    // Copy functions to global namespace for frame
    testframe.setUp                   = testgroup.prototype.setUp;
    testframe.tearDown                = testgroup.prototype.tearDown;
    var fs = testgroup.exposeTestFunctionNames();
    for (var n in fs) {
        var f = fs[n];
        info("setUpPageForJSUnit f", f);
        info("setUpPageForJSUnit f", typeof(testgroup.prototype[f]));
        testframe[f] = testgroup.prototype[f];
    }
    testgroup.vsetup          = null ;
    testgroup.vteardown       = null ;
    testframe.setUpPageStatus = 'complete';
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

function assertNe(msg,a,b) {
    assert(msg+": expected other than <"+a+">.", a!==b);
}

function assertEq(msg,a,b) {
    assert(msg+": expected <"+a+">, found <"+b+">.", a===b);
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

// End.
