// $Id$
//
// A simple test harness for verifying expected event handling by the 
// panel widgets test server

// Create test suite object

function TestTestEventResponder() {
    return;
}

// Specify order of tests
TestTestEventResponder.exposeTestFunctionNames = function() {
    return [ "testXXX"
           , "testSimpleSubscription1"
           , "testSimplePublication1"
           , "testResponse1"
/*
*/
           , "testXXX"
           ];
}

// Event handler functions
// These simply store values in the event handler object that 
// can be observed later
//
function subHandler(h,sts) {
    h.subcount += 1;
    h.dosub     = sts;
}

function unsubHandler(h,sts) {
    h.subcount -= 1;
    h.unsub     = sts;
}

function eventHandler(h,e) {
    h.evcount += 1;
    h.event    = e;
    h.eventlist.push(e);
    return makeDeferred(StatusVal.OK);
}

// Setup and teardown
testEventType   = "http://id.webbrick.co.uk/events/ButtonClickEvent"
testEventSource = "zzz:testEventSource"
localRouter     = "R1C"

TestTestEventResponder.prototype.setUp = function() {
    try {
        this.R1C = new EventRouterHTTPC(localRouter,"localhost", 8080, "/Proxy/8081");
    }
    catch (e) {
        /* print_exc() */
        try {
            self.tearDown();
        }
        catch (e) {
        }
        throw e;
    }
    return;
}

TestTestEventResponder.prototype.tearDown = function() {
    this.R1C.close();
    return;
}


// Test very simple subscription - get this test working before worrying
// about results from the more comprehensive test cases.
TestTestEventResponder.prototype.testSimpleSubscription1 = function() {
    var here = this;
    var m = new DeferredMonad() ;
    m.bind("eh",
        function (m,v) {
            assertEquals("initial R1C.getSubscriptionCount()", here.R1C.getSubscriptionCount(), 0);
            assertEquals("initial R1C.getForwardCount()",      here.R1C.getForwardCount(), 1); // fwd all to relay
            return makeEventHandler("eh", eventHandler, subHandler, unsubHandler);
        } );
    m.eval(
        function (m,v) {
            m.eh.subcount  = 0;
            m.eh.evcount   = 0;
            m.eh.eventlist = []
        } );
    m.bind("sts",
        function (m,v) {
            return here.R1C.subscribe(60, m.eh, testEventType, null);
        } );
    m.eval(
        function (m,v) {
            assertEquals("sts", m.sts, StatusVal.SUBSCRIBED);
            assertEquals("eh.dosub",    m.eh.dosub, StatusVal.SUBSCRIBED);
            assertEquals("eh.subcount", m.eh.subcount, 1);
            assertEquals("R1C.getSubscriptionCount()", here.R1C.getSubscriptionCount(), 1);
            assertEquals("R1C.getForwardCount()",      here.R1C.getForwardCount(), 1); // fwd all to relay
        } );
    // Now a simple unsubscribe
    m.bind("sts",
        function (m,v) {
            var d = here.R1C.unsubscribe(m.eh, testEventType, null);
            return d;
        } );
    m.eval(
        function (m,v) {
            assertEquals("sts", m.sts, StatusVal.UNSUBSCRIBED);
            assertEquals("eh.unsub",            m.eh.unsub, StatusVal.UNSUBSCRIBED);
            assertEquals("eh.subcount",         m.eh.subcount, 0);
            assertEquals("R1C.subCount()", here.R1C.getSubscriptionCount(), 0);
        } );
    var res = m.run();
    return res;
}


// Test simple event publication - get this test working before 
// worrying about results from the later test cases.
TestTestEventResponder.prototype.testSimplePublication1 = function() {
    var here = this;
    var m = new DeferredMonad() ;
    m.bind("eh",
        function (m,v) {
            return makeEventHandler("eh", eventHandler, subHandler, unsubHandler);
        } );
    m.eval(
        function (m,v) {
            m.eh.subcount  = 0;
            m.eh.evcount   = 0;
            m.eh.eventlist = []
        } );
    m.bind("es",
        function (m,v) {
            return makeEventAgent("es");
        } );
    m.bind("ev",
        function (m,v) {
            return makeEvent(testEventType, testEventSource, "payload");
        } );
    m.bind("sts",
        function (m,v) {
            return here.R1C.subscribe(60, m.eh, testEventType, null);
        } );
    m.eval(
        function (m,v) {
            assertEquals("sts",         m.sts, StatusVal.SUBSCRIBED);
            assertEquals("eh.dosub",    m.eh.dosub, StatusVal.SUBSCRIBED);
            assertEquals("eh.subcount", m.eh.subcount, 1);
            assertEquals("R1C.getSubscriptionCount()", here.R1C.getSubscriptionCount(), 1);
            assertEquals("R1C.getForwardCount()",      here.R1C.getForwardCount(), 1); // fwd all to relay
        } );
    // Now a simple publication
    m.bind("sts",
        function (m,v) {
            var d = here.R1C.publish(m.es, m.ev);
            return d;
        } );
    m.eval(
        function (m,v) {
            return MochiKit.Async.wait(1.0,v);
        } );
    m.eval(
        function (m,v) {
            assertEquals("publish: sts", m.sts, StatusVal.OK);
            assertEquals("event type",   m.eh.event.getType(), m.ev.getType());
            assertEquals("event source", m.eh.event.getSource(), m.ev.getSource());
            assertEquals("evcount",      m.eh.evcount, 1);
        } );
    m.eval(
        function (m,v) {
            assertEquals("eventlist type",   m.eh.eventlist[0].getType(), m.ev.getType());
            assertEquals("eventlist source", m.eh.eventlist[0].getSource(), m.ev.getSource());
        } );
    // Now a simple unsubscribe
    m.bind("sts",
        function (m,v) {
            var d = here.R1C.unsubscribe(m.eh, testEventType, null);
            return d;
        } );
    m.eval(
        function (m,v) {
            assertEquals("sts",                 m.sts, StatusVal.UNSUBSCRIBED);
            assertEquals("eh.unsub",            m.eh.unsub, StatusVal.UNSUBSCRIBED);
            assertEquals("eh.subcount",         m.eh.subcount, 0);
            assertEquals("this.R1C.subCount()", here.R1C.getSubscriptionCount(), 0);
        } );
    var res = m.run();
    return res;
}

// Test event publication, listening for response from server
TestTestEventResponder.prototype.testResponse1 = function() {
    var here = this;
    var m = new DeferredMonad() ;
    // Set up local event handler
    m.bind("eh",
        function (m,v) {
            return makeEventHandler("eh", eventHandler, subHandler, unsubHandler);
        } );
    m.eval(
        function (m,v) {
            m.eh.subcount  = 0;
            m.eh.evcount   = 0;
            m.eh.eventlist = []
        } );
    m.bind("es",
        function (m,v) {
            return makeEventAgent("es");
        } );
    m.bind("ev",
        function (m,v) {
            return makeEvent(testEventType, testEventSource, "payload");
        } );
    m.bind("sts",
        function (m,v) {
            return here.R1C.subscribe(60, m.eh, null, null);
        } );
    // Subscribe to all events
    m.eval(
        function (m,v) {
            assertEquals("sts",         m.sts, StatusVal.SUBSCRIBED);
            assertEquals("eh.dosub",    m.eh.dosub, StatusVal.SUBSCRIBED);
            assertEquals("eh.subcount", m.eh.subcount, 1);
            assertEquals("R1C.getSubscriptionCount()", here.R1C.getSubscriptionCount(), 1);
            assertEquals("R1C.getForwardCount()",      here.R1C.getForwardCount(), 1); // fwd all to relay
        } );
    // Now a simple publication
    m.bind("sts",
        function (m,v) {
            var d = here.R1C.publish(m.es, m.ev);
            return d;
        } );
    m.eval(
        function (m,v) {
            return MochiKit.Async.wait(1.0,v);
        } );
    m.eval(
        function (m,v) {
            assertEquals("publish: sts", m.sts, StatusVal.OK);
            assertEquals("evcount",      m.eh.evcount, 5);
            assertEquals("eventlist[0] type",   m.eh.eventlist[0].getType(),   m.ev.getType());
            assertEquals("eventlist[0] source", m.eh.eventlist[0].getSource(), m.ev.getSource());
            assertEquals("eventlist[1] type",   m.eh.eventlist[1].getType(),   "http://id.webbrick.co.uk/events/SetButtonText");
            assertEquals("eventlist[1] source", m.eh.eventlist[1].getSource(), "TestButtonClickResponder");
            assertEquals("eventlist[2] type",   m.eh.eventlist[2].getType(),   "http://id.webbrick.co.uk/events/SetButtonState");
            assertEquals("eventlist[2] source", m.eh.eventlist[2].getSource(), "TestButtonClickResponder");
            assertEquals("eventlist[3] type",   m.eh.eventlist[3].getType(),   "http://id.webbrick.co.uk/events/SetNumericDisplayValue");
            assertEquals("eventlist[3] source", m.eh.eventlist[3].getSource(), "TestButtonClickResponder");
            assertEquals("eventlist[4] type",   m.eh.eventlist[4].getType(),   "http://id.webbrick.co.uk/events/SetNumericDisplayState");
            assertEquals("eventlist[4] source", m.eh.eventlist[4].getSource(), "TestButtonClickResponder");
        } );
    // Now a simple unsubscribe
    m.bind("sts",
        function (m,v) {
            var d = here.R1C.unsubscribe(m.eh, null, null);
            return d;
        } );
    m.eval(
        function (m,v) {
            assertEquals("sts",                 m.sts, StatusVal.UNSUBSCRIBED);
        } );
    var res = m.run();
    return res;
}

TestTestEventResponder.prototype.testXXX = function() {
    assertEquals( "testXXX", 4, 2+2 );
}

// End.

