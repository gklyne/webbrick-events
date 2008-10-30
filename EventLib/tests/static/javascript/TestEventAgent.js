// $Id$
//
// Test event source object
//

// Create test suite object
function TestEventAgent() {
}

// Specify order of tests
TestEventAgent.exposeTestFunctionNames = function() {
    return [ 'testCreateEventAgent1'
           , 'testMakeEventAgent1'
           , 'testMakeEventAgent2'
           , 'testMakeEventAgent3'
           , 'testEventAgentEqual1'
           , 'testEventAgentEqual2'
           , 'testEventAgentEqual3'
           , 'testEventAgentEqual4'
           , 'testXXX'
           ];
}

// Setup and teardown

TestEventAgent.prototype.setUp = function(r) {
}

TestEventAgent.prototype.tearDown = function(r) {
}

// Test cases

TestEventAgent.prototype.testCreateEventAgent1 = function() {
    var es = new EventAgent("EventAgentUri");
    assertEquals("testCreateEventAgent1", "EventAgentUri", es.getUri());
}

TestEventAgent.prototype.testMakeEventAgent1 = function(funct) {
    var es = makeEventAgent("EventAgentUri");
    assertEquals("testMakeEventAgent1", "EventAgentUri", es.getUri());
}

TestEventAgent.prototype.testMakeEventAgent2 = function() {
    var es = makeEventAgent();
    var eu = es.getUri();
    assert("testMakeEventAgent2: "+eu, eu.startswith(EventUriSourceBase));
}

TestEventAgent.prototype.testMakeEventAgent3 = function() {
    var es1 = makeEventAgent();
    var es2 = makeEventAgent();
    assertNotEquals("testMakeEventAgent3", es1.getUri(), es2.getUri());
}

TestEventAgent.prototype.testEventAgentEqual1 = function() {
    var es1 = new EventAgent("EventAgentUri");
    var es2 = new EventAgent("EventAgentUri");
    assertEquals("testEventAgentEqual1", es1, es2);
}

TestEventAgent.prototype.testEventAgentEqual2 = function() {
    var es1 = new EventAgent("EventAgentUri1");
    var es2 = new EventAgent("EventAgentUri2");
    assertNotEquals("testEventAgentEqual2", es1, es2);
}

TestEventAgent.prototype.testEventAgentEqual3 = function() {
    var es1 = makeEventAgent();
    var es2 = makeEventAgent();
    assertNotEquals("testEventAgentEqual3", es1, es2);
}

TestEventAgent.prototype.testEventAgentEqual4 = function() {
    var es1 = makeEventAgent();
    var es2 = makeEventAgent(es1.getUri());
    assertEquals("testEventAgentEqual4", es1, es2);
}

TestEventAgent.prototype.testXXX = function() {
    assertEquals( "testXXX", 4, 2+2 );
}

// Expose functions at global level of frame for JSUnit

// JSUnit page setup
function setUpPage() {
    setUpPageForJSUnit(TestEventAgent, this);
}

// Function returns sequence of tests
exposeTestFunctionNames = TestEventAgent.exposeTestFunctionNames;

// End.
