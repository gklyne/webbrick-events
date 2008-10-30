// $Id$
//
// Test status object
//

// Create test suite object
function TestStatus() {
}

// Specify order of tests
TestStatus.exposeTestFunctionNames = function() {
    return [ "testStatusCreate1"
           , "testStatusCreate2"
           , "testStatusCreate3"
           , "testStatusEqual1"
           , "testStatusEqual2"
           , "testStatusEqual3"
           , "testStatusString1"
           , "testStatusString2"
           , "testStatusString3"
           , "testStatusString4"
           , "testStatusException1"
           , "testStatusException2"
           , "testStatusEvent1"
           , "testStatusEvent2"
           , "testStatusValues"
           , "testXXX"
           ];
}

// Setup and teardown

TestStatus.prototype.setUp = function() {
}

TestStatus.prototype.tearDown = function() {
}

// Test cases

TestStatus.prototype.testStatusCreate1 = function() {
    var s = new Status("StatusUri", "message", "values");
    assertEquals("testStatusCreate1, getUri",     "StatusUri", s.getUri());
    assertEquals("testStatusCreate1, getMessage", "message",   s.getMessage());
    assertEquals("testStatusCreate1, getValues",  "values",    s.getValues());
}

TestStatus.prototype.testStatusCreate2 = function() {
    var s = new Status("StatusUri", "message");
    assertEquals("testStatusCreate2, getUri",     "StatusUri", s.getUri());
    assertEquals("testStatusCreate2, getMessage", "message",   s.getMessage());
    assertEquals("testStatusCreate2, getValues",  null,        s.getValues());
}

TestStatus.prototype.testStatusCreate3 = function() {
    var s = new Status("StatusUri");
    assertEquals("testStatusCreate3, getUri",     "StatusUri", s.getUri());
    assertEquals("testStatusCreate3, getMessage", "", s.getMessage());
    assertEquals("testStatusCreate3, getValues",  null, s.getValues());
}

TestStatus.prototype.testStatusEqual1 = function() {
    var s1 = new Status("StatusUri", "message1", "values1");
    var s2 = new Status("StatusUri", "message2", "values2");
    assertEquals("testStatusEqual1", s1, s2);
}

TestStatus.prototype.testStatusEqual2 = function() {
    var s1 = new Status("StatusUri");
    var s2 = new Status("StatusUri");
    assertEquals("testStatusEqual2", s1, s2);
}

TestStatus.prototype.testStatusEqual3 = function() {
    var s1 = new Status("StatusUri1", "message", "values");
    var s2 = new Status("StatusUri2", "message", "values");
    assertNotEquals("testStatusEqual3", s1, s2);
}

TestStatus.prototype.testStatusString1 = function() {
    var s = new Status("StatusUri", "message", "values");
    assertEquals("testStatusString1", "StatusUri: message", s.toString());
}

TestStatus.prototype.testStatusString2 = function() {
    var s = new Status("StatusUri", "message");
    assertEquals( "testStatusString2", "StatusUri: message", s.toString() );
}

TestStatus.prototype.testStatusString3 = function() {
    var s = new Status("StatusUri");
    assertEquals( "testStatusString3", "StatusUri", s.toString() );
}

TestStatus.prototype.testStatusString4 = function() {
    var s = new Status("StatusUri", null);
    assertEquals( "testStatusString4", "StatusUri", s.toString() );
}

TestStatus.prototype.testStatusException1 = function() {
    var s = new Status("StatusUri", "message", "values");
    try {
        throw s.makeException();
    }
    catch (e) {
        assertEquals( "testStatusException1, str",       "StatusUri: message", e.toString());
        assertEquals( "testStatusException1, getStatus", s,                    e.getStatus());
    }
}

TestStatus.prototype.testStatusException2 = function() {
    var s = new Status("StatusUri");
    try {
        throw s.makeException();
    }
    catch (e) {
        assertEquals( "testStatusException2, toString",  "StatusUri", e.toString() );
        assertEquals( "testStatusException2, getStatus", s,           e.getStatus() );
    }
}

TestStatus.prototype.testStatusEvent1 = function() {
    var s = new Status("StatusUri", "message", "values");
    var e = s.makeEvent("SourceUri");
    var ee = new Event("StatusUri", "SourceUri", s);
    assertEquals("testStatusEvent1", ee, e);
}

TestStatus.prototype.testStatusEvent2 = function() {
    var s = new Status("StatusUri");
    var e = s.makeEvent("SourceUri");
    var ee = new Event("StatusUri", "SourceUri", s);
    assertEquals("testStatusEvent2", ee, e);
}

TestStatus.prototype.testStatusValues = function() {
    var u = StatusUri.OK;
    var m = "";
    var v = null;
    assertEquals("testStatusValues, StatusVal.OK.getUri",     u, StatusVal.OK.getUri());
    assertEquals("testStatusValues, StatusVal.OK.getMessage", m, StatusVal.OK.getMessage());
    assertEquals("testStatusValues, StatusVal.OK.getValues",  v, StatusVal.OK.getValues());
}

TestStatus.prototype.testXXX = function() {
    assertEquals( "testXXX", 4, 2+2 );
}

// Expose functions at global level of frame for JSUnit

// Specify order of tests
exposeTestFunctionNames = TestStatus.exposeTestFunctionNames;

// JSUnit page setup
function setUpPage() {
    setUpPageForJSUnit(TestStatus, this);
}

// End.
