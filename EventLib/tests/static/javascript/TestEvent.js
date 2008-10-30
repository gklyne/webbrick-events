// $Id$
//
// Test event object
//

// Create test suite object
function TestEvent() {
}

// Specify order of tests
TestEvent.exposeTestFunctionNames = function() {
    return [ 'testEventCreate1'
           , 'testEventCreate2'
           , 'testMakeEvent1'
           , 'testMakeEvent2'
           , 'testMakeEvent3'
           , 'testMakeEvent4'
           , 'testMakeEvent5'
           , 'testEventEqual1'
           , 'testEventEqual2'
           , 'testEventEqual3'
           , 'testEventEqual4'
           , 'testEventEqual5'
           , 'testEventString1'
           ];
}

// Setup and teardown

TestEvent.prototype.setUp = function() {
}

TestEvent.prototype.tearDown = function() {
}

// Test cases

TestEvent.prototype.testEventCreate1 = function() {
    var e = new Event("EventTypeUri", "EventSourceUri", "payload");
    assertEquals("testEventCreate1, getType",    "EventTypeUri", e.getType())
    assertEquals("testEventCreate1, getSource",  "EventSourceUri", e.getSource());
    assertEquals("testEventCreate1, getPayload", "payload", e.getPayload());
}

TestEvent.prototype.testEventCreate2 = function() {
    var e = new Event("EventTypeUri", "", null);
    assertEquals("testEventCreate2, getType",    "EventTypeUri", e.getType());
    assertEquals("testEventCreate2, getSource",  "", e.getSource());
    assertEquals("testEventCreate2, getPayload", null, e.getPayload());
}

TestEvent.prototype.testMakeEvent1 = function() {
    var e = makeEvent("EventTypeUri", "EventSourceUri", "payload");
    assertEquals("testMakeEvent1, getType",    "EventTypeUri", e.getType());
    assertEquals("testMakeEvent1, getSource",  "EventSourceUri", e.getSource());
    assertEquals("testMakeEvent1, getPayload", "payload", e.getPayload());
}

TestEvent.prototype.testMakeEvent2 = function() {
    var e = makeEvent("EventTypeUri", "EventSourceUri", "payload");
    assertEquals("testMakeEvent2, getType",    "EventTypeUri", e.getType());
    assertEquals("testMakeEvent2, getSource",  "EventSourceUri", e.getSource());
    assertEquals("testMakeEvent2, getPayload", "payload", e.getPayload());
}

TestEvent.prototype.testMakeEvent3 = function() {
    var e = makeEvent("EventTypeUri");
    assertEquals("testMakeEvent3, getType", "EventTypeUri", e.getType());
    assertEquals("testMakeEvent3, getSource", "", e.getSource());
    assertEquals("testMakeEvent3, getPayload", null, e.getPayload());
}

TestEvent.prototype.testMakeEvent4 = function() {
    var e = makeEvent(null, "EventSourceUri");
    assertEquals("testMakeEvent4, getType", EventUri.DefaultType, e.getType());
    assertEquals("testMakeEvent4, getSource", "EventSourceUri", e.getSource());
    assertEquals("testMakeEvent4, getPayload", null, e.getPayload());
}

TestEvent.prototype.testMakeEvent5 = function() {
    var e = makeEvent();
    assertEquals("testMakeEvent5, getType", EventUri.DefaultType, e.getType());
    assertEquals("testMakeEvent5, getSource", "", e.getSource());
    assertEquals("testMakeEvent5, getPayload", null, e.getPayload());
}

TestEvent.prototype.testEventEqual1 = function() {
    var e1 = new Event("EventTypeUri", "EventSourceUri", "payload");;
    var e2 = makeEvent("EventTypeUri", "EventSourceUri", "payload");
    assertEquals("testEventEqual1", e1, e2);
}

TestEvent.prototype.testEventEqual2 = function() {
    var e1 = new Event("EventTypeUri", "", null);
    var e2 = makeEvent("EventTypeUri");
    assertEquals("testEventEqual2", e1, e2);
}

TestEvent.prototype.testEventEqual3 = function() {
    var e1 = new Event("EventTypeUri1", "EventSourceUri", "payload");
    var e2 = makeEvent("EventTypeUri2", "EventSourceUri", "payload");
    assertNotEquals("testEventEqual3", e1, e2);
}

TestEvent.prototype.testEventEqual4 = function() {
    var e1 = new Event("EventTypeUri", "EventSourceUri1", "payload");
    var e2 = makeEvent("EventTypeUri", "EventSourceUri2", "payload");
    assertNotEquals("testEventEqual4", e1, e2);
}

TestEvent.prototype.testEventEqual5 = function() {
    var e1 = new Event("EventTypeUri", "EventSourceUri", "payload1");
    var e2 = makeEvent("EventTypeUri", "EventSourceUri", "payload2");
    assertNotEquals("testEventEqual5", e1, e2);
}

TestEvent.prototype.testEventString1 = function() {
    var e = new Event("EventTypeUri", "EventSourceUri", "payload");
    var es = "Event(evtype=\"EventTypeUri\", source=\"EventSourceUri\")";
    assertEquals("testEventString1: "+e, es, e.toString());
}

// Expose functions at global level of frame for JSUnit

// Specify order of tests
exposeTestFunctionNames = TestEvent.exposeTestFunctionNames;

// JSUnit page setup
function setUpPage() {
    setUpPageForJSUnit(TestEvent, this);
}

// End.
