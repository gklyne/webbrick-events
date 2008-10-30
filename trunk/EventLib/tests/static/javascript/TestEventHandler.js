// $Id$
//
// Test Suite for EventHandler operations
//

// Local callback functions - return deferred status objects

function handleEvent(handler, event) {
    var s = new Status(StatusUri.TRIGGERED, event.getType());
    return makeDeferred(s)
}

function initSub(handler, status) {
    ok(true, "initSub: "+status);
    var s = new Status(StatusUri.SUBSCRIBED, str(status));
    return makeDeferred(s)
}

function endSub(handler, status) {
    ok(true, "endSub: "+status);
    var s = new Status(StatusUri.UNSUBSCRIBED, str(status));
    return makeDeferred(s)
}

// Create test suite object
function TestEventHandler() {
}

// Specify order of tests: 

TestEventHandler.exposeTestFunctionNames = function() {
    return [ 'testDeferredMonad1'
           , 'testDeferredMonad2'
           , 'testDeferredMonad3'
           , 'testCreateEventHandler1'
           , 'testMakeEventHandler1'
           , 'testMakeEventHandler2'
           , 'testMakeEventHandler3'
           , 'testMakeEventHandler4'
           , 'testEventHandlerEqual1'
           , 'testEventHandlerEqual2'
           , 'testEventHandlerEqual3'
           , 'testEventHandlerEqual4'
           , 'testEventHandlerEqual5'
           , 'testXXX'
           ];
}

// Setup and teardown

TestEventHandler.prototype.setUp = function() {
}

TestEventHandler.prototype.tearDown = function() {
}

// Test cases
//
// Asynchronous test cases return a deferred object whose eventual result
// is null for success, or a value describing the error condition.

// Tests for defereed execution support - DeferredMonad

TestEventHandler.prototype.testDeferredMonad1 = function() {
    var here = this;                                // Keep ref test object
    var m    = new DeferredMonad() ;
    // Check run value is received OK
    m.eval(      function (m,v) {assertEquals("v0", 1, v); return v;});
    // Bind result from previous step, and check
    m.bind("v1", function (m,v) {return v} );
    m.eval(      function (m,v) {assertEquals("v1", 1, m.v1)} );
    // Check no-value propagation
    m.eval(      function (m,v) {assertEquals("vu", undefined, v)} );
    // Bind a new value, make sure is probagates as result and bound value
    m.bind("v2", function (m,v) {return 2} );
    m.eval(      function (m,v) {assertEquals("v2v", 2, v)} );
    m.eval(      function (m,v) {assertEquals("v2m", 2, m.v2)} );
    // Last step returns final value of Deferred object
    m.eval(      function (m,v) {return m.v2} );
    // Now execute and test the final result
    var res = m.run(1);
    var val = null;
    res.addCallback(function (v) {val = v});
    assertEquals("val", 2, val);
    return;
}

TestEventHandler.prototype.testDeferredMonad2 = function() {
    // Same as above, but different syntax used:
    var here = this;                                // Keep ref test object
    var res = (new DeferredMonad())
        // Check run value is received OK
        .eval(      function (m,v) {assertEquals("v0", 11, v); return v;})
        // Bind result from previous step, and check
        .bind("v1", function (m,v) {return v} )
        .eval(      function (m,v) {assertEquals("v1", 11, m.v1)} )
        // Check no-value propagation
        .eval(      function (m,v) {assertEquals("vu", undefined, v)} )
        // Bind a new value, make sure is probagates as result and bound value
        .bind("v2", function (m,v) {return 22} )
        .eval(      function (m,v) {assertEquals("v2v", 22, v)} )
        .eval(      function (m,v) {assertEquals("v2m", 22, m.v2)} )
        // Last step returns final value of Deferred object
        .eval(      function (m,v) {return m.v2} )
        // Now execute and test the final result
        .run(11);
    var val = null;
    res.addCallback(function (v) {val = v});
    assertEquals("val", 22, val);
    return;
}

TestEventHandler.prototype.testDeferredMonad3 = function() {
    // Test that initial value is returned if no functions in monad
    var res = (new DeferredMonad()).run(33);
    res.addCallback(function (v) {val = v});
    assertEquals("val", 33, val);
    return;
}

// Event handler tests

TestEventHandler.prototype.testCreateEventHandler1 = function() {
    var m = new DeferredMonad() ;
    m.bind("eh", function (m) {return new EventHandler("EventHandlerUri", handleEvent, initSub, endSub)} );
    m.eval(      function (m) {assertEquals("EventHandler.getUri()", "EventHandlerUri", m.eh.getUri())} );
    m.bind("ev", function (m) {return makeEvent("EventUri", null, m.eh.getUri())} );
    m.bind("sh", function (m) {return m.eh.handleEvent(m.ev)} );
    m.eval(      function (m) {assertEquals("sh",   m.sh, new Status(StatusUri.TRIGGERED, m.ev.getType()))} );
    m.eval(      function (m) {assertEquals("sh-m", m.sh.getMessage(), m.ev.getType())} );
    m.bind("ss", function (m) {return m.eh.initSubscription(StatusVal.OK)} );
    m.eval(      function (m) {assertEquals("ss",   m.ss, new Status(StatusUri.SUBSCRIBED, str(StatusVal.OK)))} );
    m.eval(      function (m) {assertEquals("ss-m", m.ss.getMessage(), str(StatusVal.OK))} );
    m.bind("su", function (m) {return m.eh.endSubscription(StatusVal.OK)} );
    m.eval(      function (m) {assertEquals("su",   m.su, new Status(StatusUri.UNSUBSCRIBED, str(StatusVal.OK)))} );
    m.eval(      function (m) {assertEquals("su-m", m.su.getMessage(), str(StatusVal.OK))} );
    var res = m.run();
    return;
}

TestEventHandler.prototype.testMakeEventHandler1 = function() {
    var m = new DeferredMonad() ;
    m.bind("eh", function (m) {return makeEventHandler("EventHandlerUri", handleEvent, initSub, endSub)} );
    m.eval(      function (m) {assertEquals("EventHandler.getUri()", "EventHandlerUri", m.eh.getUri())} );
    m.bind("ev", function (m) {return makeEvent("EventUri", null, m.eh.getUri())} );
    m.bind("sh", function (m) {return m.eh.handleEvent(m.ev)} );
    m.eval(      function (m) {assertEquals("sh",   m.sh, new Status(StatusUri.TRIGGERED, m.ev.getType()))} );
    m.eval(      function (m) {assertEquals("sh-m", m.sh.getMessage(), m.ev.getType())} );
    m.bind("ss", function (m) {return m.eh.initSubscription(StatusVal.OK)} );
    m.eval(      function (m) {assertEquals("ss",   m.ss, new Status(StatusUri.SUBSCRIBED, str(StatusVal.OK)))} );
    m.eval(      function (m) {assertEquals("ss-m", m.ss.getMessage(), str(StatusVal.OK))} );
    m.bind("su", function (m) {return m.eh.endSubscription(StatusVal.OK)} );
    m.eval(      function (m) {assertEquals("su",   m.su, new Status(StatusUri.UNSUBSCRIBED, str(StatusVal.OK)))} );
    m.eval(      function (m) {assertEquals("su-m", m.su.getMessage(), str(StatusVal.OK))} );
    var res = m.run();
    return;
}

TestEventHandler.prototype.testMakeEventHandler2 = function() {
    // makeEventHandler with default callbacks
    var m = new DeferredMonad() ;
    m.bind("eh", function (m) {return makeEventHandler("EventHandlerUri")} );
    m.eval(      function (m) {assertEquals("EventHandler.getUri()", "EventHandlerUri", m.eh.getUri())} );
    m.bind("ev", function (m) {return makeEvent("EventUri", null, m.eh.getUri())} );
    m.bind("sh", function (m) {return m.eh.handleEvent(m.ev)} );
    m.eval(      function (m) {assertEquals("sh",   m.sh, StatusVal.OK)} );
    m.bind("ss", function (m) {return m.eh.initSubscription(StatusVal.OK)} );
    m.eval(      function (m) {assertEquals("ss",   m.ss, StatusVal.OK)} );
    m.bind("su", function (m) {return m.eh.endSubscription(StatusVal.OK)} );
    m.eval(      function (m) {assertEquals("su",   m.su, StatusVal.OK)} );
    var res = m.run();
    return;
}

TestEventHandler.prototype.testMakeEventHandler3 = function() {
    // makeEventHandler with default URI
    var m = new DeferredMonad() ;
    m.bind("eh", function (m) {return makeEventHandler()} );
    m.eval(      function (m) {assert("eh", m.eh.getUri().startswith(EventUriTargetBase))} );
    var res = m.run();
    return;
}

TestEventHandler.prototype.testMakeEventHandler4 = function() {
    // makeEventHandler with default URI
    var m = new DeferredMonad() ;
    m.bind("eh1", function (m) {return makeEventHandler()} );
    m.bind("eh2", function (m) {return makeEventHandler()} );
    m.eval(       function (m) {assertNotEquals("eh",   m.eh1, m.eh2)} );
    m.eval(       function (m) {ok(true,"eh1: "+m.eh1.getUri()+", eh2: "+m.eh2.getUri())} );
    var res = m.run();
    return;
}

TestEventHandler.prototype.testEventHandlerEqual1 = function() {
    var m = new DeferredMonad() ;
    m.bind("eh1", function (m) {return new EventHandler("EventHandlerUri", handleEvent, initSub, endSub)} );
    m.bind("eh2", function (m) {return new EventHandler("EventHandlerUri", handleEvent, initSub, endSub)} );
    m.eval(       function (m) {assertEquals("eh",   m.eh1, m.eh2)} );
    var res = m.run();
    return;
}

TestEventHandler.prototype.testEventHandlerEqual2 = function() {
    var m = new DeferredMonad() ;
    m.bind("eh1", function (m) {return new EventHandler("EventHandlerUri1", handleEvent, initSub, endSub)} );
    m.bind("eh2", function (m) {return new EventHandler("EventHandlerUri2", handleEvent, initSub, endSub)} );
    m.eval(       function (m) {assertNotEquals("eh",   m.eh1, m.eh2)} );
    var res = m.run();
    return;
}

TestEventHandler.prototype.testEventHandlerEqual3 = function() {
    var m = new DeferredMonad() ;
    m.bind("eh1", function (m) {return makeEventHandler()} );
    m.bind("eh2", function (m) {return makeEventHandler()} );
    m.eval(       function (m) {assertNotEquals("eh",   m.eh1, m.eh2)} );
    var res = m.run();
    return;
}

TestEventHandler.prototype.testEventHandlerEqual4 = function() {
    var m = new DeferredMonad() ;
    m.bind("eh1", function (m) {return makeEventHandler()} );
    m.bind("eh2", function (m) {return makeEventHandler(m.eh1.getUri(), handleEvent, initSub, endSub)} );
    m.eval(       function (m) {assertEquals("eh",   m.eh1, m.eh2)} );
    var res = m.run();
    return;
}

TestEventHandler.prototype.testEventHandlerEqual5 = function() {
    // Testing a more functional monad invocation style...
    var res = (new DeferredMonad())
     .bind("eh1", function (m) {return makeEventHandler()} )
     .bind("eh2", function (m) {return makeEventHandler(m.eh1.getUri(), handleEvent, initSub, endSub)} )
     .eval(       function (m) {assertEquals("eh",   m.eh1, m.eh2)} )
     .run();
    return;
}

TestEventHandler.prototype.testXXX = function() {
    assertEquals( "testXXX", 4, 2+2 );
}
