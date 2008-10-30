// $Id$
//
// Test basic unit test functions.
//
// Uses jsunit API for defining tests, but separated so that 
// different test runners are easily used.
//

// Without this, order of tests is incorrect
function exposeTestFunctionNames() {
    return [ 'testSetup', 'testTeardown'
           , 'testWithValidArgs', 'testWithInvalidArgs', 'testStrictReturnType'
           // , 'testFailWithValidArgs', 'testFailWithInvalidArgs', 'testFailStrictReturnType'
           ];
}

// JSUnit page setup

function setUpPage() {
    setUpPageForJSUnit(SimpleTestCases, this);
}

// Create test suite object
function SimpleTestCases() {
}

SimpleTestCases.exposeTestFunctionNames = exposeTestFunctionNames;

// Setup and teardown

SimpleTestCases.prototype.setUp = function() {
    SimpleTestCases.vsetup = "setup" ;
}

SimpleTestCases.prototype.tearDown = function() {
    SimpleTestCases.vteardown = "teardown" ;
}

// first: pass

SimpleTestCases.prototype.testSetup = function() {
    assertEquals("vsetup", "setup", SimpleTestCases.vsetup);
    assertNull("vteardown", SimpleTestCases.vteardown);
}

SimpleTestCases.prototype.testTeardown = function() {
    assertEquals("vsetup", "setup", SimpleTestCases.vsetup);
    assertEquals("vteardown", "teardown", SimpleTestCases.vteardown);
}

SimpleTestCases.prototype.testWithValidArgs = function() {
    assertEquals("2+2 is 4", 4, 2+2);
    assertNotEquals("2+2 is not 5", 5, 2+2);
}

SimpleTestCases.prototype.testWithInvalidArgs = function() {
    assertNull("Should be null", null);
}

SimpleTestCases.prototype.testStrictReturnType = function() {
    assertNotEquals("String is not a number", "11", 5+6);
}

// then: fail

SimpleTestCases.prototype.testFailWithValidArgs = function() {
    assertEquals("2+2 is 4", 4, 2+3);
    assertNotEquals("2+2 is not 5", 5, 2+3);
}

SimpleTestCases.prototype.testFailWithInvalidArgs = function() {
    assertNull("Should be null", 99);
}

SimpleTestCases.prototype.testFailStrictReturnType = function() {
    assertNotEquals("String is not a number", "11", "11");
}

// End.
