// $Id$
//
// Unit test for event envelope handling
//

// Create test suite object
function TestEventEnvelope() {
}

// Specify order of tests: 
TestEventEnvelope.exposeTestFunctionNames = function() {
    return [ "testUnWrap1"
           , "testUnWrap2"
           , "testUnWrap3"
           , "testUnWrap4"
           , "testUnWrap5"
           , "testFlatten1"
           , "testFlatten2"
           , "testXXX"
           ];
}

// Setup and teardown

TestEventEnvelope.prototype.setUp = function() {
    this.evt  = makeEvent("evtype","evsource","payload");
    this.env1 = new EventEnvelope(this.evt,"R1");
    this.env2 = this.env1.nextHop("R2");
    this.env3 = this.env2.nextHop("R3");
}

TestEventEnvelope.prototype.tearDown = function() {
}

// Test cases

TestEventEnvelope.prototype.testUnWrap1 = function() {
    // Unwrap regardless of envelope path
    assert("testUnWrap1", this.env3.unWrap() === this.evt);
}

TestEventEnvelope.prototype.testUnWrap2 = function() {
    // Unwrap if envelope path does not contain router id
    assert("testUnWrap2", this.env3.unWrap("R4") === this.evt);
}

TestEventEnvelope.prototype.testUnWrap3 = function() {
    // Do not un unwrap if envelope path does contain router id
    assert("testUnWrap3", this.env3.unWrap("R2") === null);
}

TestEventEnvelope.prototype.testUnWrap4 = function() {
    // Do not un unwrap if envelope path is longer than specified length
    assert("testUnWrap4", this.env3.unWrap("R4", 1) === null);
}

TestEventEnvelope.prototype.testUnWrap5 = function() {
    // Unwrap if envelope path has specified length
    assert("testUnWrap4", this.env3.unWrap("R4", 2) === this.evt);
}

TestEventEnvelope.prototype.testFlatten1 = function() {
    // Flatten the linked envelope structure
    var fe = this.env3.flatten();
    assertEquals("testFlatten1[0]", fe[0], this.evt);
    assertEquals("testFlatten1[1]", fe[1], ["R1", "R2", "R3"]);
    assertEquals("testFlatten1", this.env3.flatten(), [this.evt, ["R1", "R2", "R3"]]);
}

TestEventEnvelope.prototype.testFlatten2 = function() {
    // Second flatten call to detect bad use of static empty list initializer
    // (Bug noted in Python code - maybe not relevant to JS, but should pass anyway)
    assertEquals("testFlatten2", this.env3.flatten(), [this.evt, ["R1", "R2", "R3"]]);
}

TestEventEnvelope.prototype.testXXX = function() {
    assertEquals("testXXX", 4, 2+2);
}

// Expose functions at global level of frame for JSUnit

// JSUnit page setup
function setUpPage() {
    info("setUpPage", "TestEventEnvelope");
    setUpPageForJSUnit(TestEventEnvelope, this);
}

// Return list of tests for JSunit
exposeTestFunctionNames = TestEventEnvelope.exposeTestFunctionNames;

// End.
