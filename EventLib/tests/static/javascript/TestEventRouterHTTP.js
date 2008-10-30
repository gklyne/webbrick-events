// $Id$
//
// Component testing for HTTP event router functions
//
// This test operates in conjunction with a Python-based server running on the
// current host, derived from the codebase for TestEventRouterHTTP.py.
// The server is provided by module TestEventHTTPServer.py
//
// To run this test suite, first start programs:
//   WebBrickLibs/EventLib/tests/JSProxy/start-jsproxy.py
//   WebBrickLibs/EventLib/tests/TestEventHTTPServer.py
//   
// Then browse to http://localhost:8080, and follow the link to:
//   http://localhost:8080/EventLib/tests/static/TestAsyncEventRouterHTTP.html
//
// (jsproxy is a customized test proxy server that serves the test code and relays 
// event propagation requests to test server, thus avoiding the normal browser
// constraints on sending HTTP requests to servers other than the original
// web site server.)
//
// See also: tests/static/TestAsyncEventRouterHTTP.html

// Create test suite object
function TestEventRouterHTTP() {
    return this;
}

// Specify order of tests
TestEventRouterHTTP.exposeTestFunctionNames = function() {
    return [ "testXXX"
           , "testSimpleSubscription1"
           , "testSimplePublication1"
           , "testSubscriptionForwarding1"
           , "testSubscriptionForwarding2"
           , "testSubscriptionForwarding3"
           , "testSubscriptionForwarding4"
/*
*/
           , "testXXX"
           ];
};

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
    return makeDeferred(StatusVal.OK);
}

// Setup and teardown

TestEventRouterHTTP.prototype.setUp = function() {
    try {
        this.R2C = new EventRouterHTTPC("R2C","localhost", 8080, "/Proxy/8082");
        this.R3C = new EventRouterHTTPC("R3C","localhost", 8080, "/Proxy/8083");
    }
    catch (e) {
        /* print_exc() */
        try {
            this.tearDown();
        }
        catch (e) {
        }
        throw e;
    }
    //
    // Configure event routers to use an externally operating hub.
    //
    //        R1                                                     EXTERNAL
    //       /  \
    //     R2    R3      -- HTTPS event routers (HTTP server)        EXTERNAL
    //     /      \
    //   R2C      R3C    -- HTTPC event routers (HTTP client)        LOCAL
    //
    // The test setup assumes that:
    // * HTTPS and HTTPC event routers work as pairs, with each 
    //   HTTPC connecting to just one HTTPS
    // * HTTP server event routers are running on the current host 
    //   ports 8082 and 8083, sending all events received on one port 
    //   to the other.  (Per TestEventRouter.py.)
    // * all events delivered to an HTTPS event router are forwarded to 
    //   the corresponding HTTPC event router.  For finer control, use an
    //   ordinary event router to filter delivery to the HTTPS event router.
    // * all events delivered to an HTTPC event router are forwarded to 
    //   the corresponding HTTPS event router.  For finer control, use an
    //   ordinary event router to filter delivery to the HTTPC event router.
    // * All subscriptions are similarly forwarded between HTTPS and HTTPC
    //   event routers.
    // * all local event delivery and routing functions operate as for an
    //   ordinary event router.
    //
    return;
};

TestEventRouterHTTP.prototype.tearDown = function() {
    this.R2C.close();
    this.R3C.close();
    return;
};

// Test cases
// Basic publish-subscribe tests are performed by TestEventPubSub
// and TestEventRouter.  The following tests are intended to exercise 
// HTTP event sending and receiving functions.

// Helper function for subscription forwarding tests
//
// The basic pattern for this test is:
// 1. create an event subscription
// 2. publish an event that matches the subscription (evmatch)
// 3. publish an event that does not match the subscription (evdrop)
// 4. publish another event that matches the subscription (evmatch)
// 5. unsubscribe
//
//   r1      router for initial subscription
//   r2      fouter for forwarded subscription
//   evtype  event type to subscribe, or null
//   source  event source to subscribe, or null
//   evmatch event matching subscription
//   evdrop  event not matching subscription
//
TestEventRouterHTTP.prototype.doSubscriptionForwarding = 
function(r1, r2, evtype, source, evmatch, evdrop) {
    // Setup event source and handler
    var m = new DeferredMonad() ;
    m.bind("R1es",
        function (m,v) {
            return makeEventAgent("R1es");
        } );
    m.bind("R1eh",
        function (m,v) {
            return makeEventHandler("R1eh", eventHandler, subHandler, unsubHandler);
        } );
    // Initial tests
    m.eval(
        function (m,v) {
            m.R1eh.subcount = 0;
            m.R1eh.evcount  = 0;
            assertEquals("r1", r1.getSubscriptionCount(), 0);
            assertEquals("r2", r2.getSubscriptionCount(), 0);
        } );
    // subscribe
    m.bind("sts",
        function (m,v) { 
            return r1.subscribe(60, m.R1eh, evtype, source);
        } );
    m.eval(
        function (m,v) {
            assertEquals("sts", m.sts, StatusVal.SUBSCRIBED);
            assertEquals("R1eh.dosub",    m.R1eh.dosub, StatusVal.SUBSCRIBED);
            assertEquals("R1eh.subcount", m.R1eh.subcount, 1);
            assertEquals("r1.getSubscriptionCount()", r1.getSubscriptionCount(), 1);
            assertEquals("r2.getSubscriptionCount()", r2.getSubscriptionCount(), 0);
            assertEquals("r1.getForwardCount()", r1.getForwardCount(), 1);
            assertEquals("r2.getForwardCount()", r2.getForwardCount(), 1);
        } );
    // publish matching event
    m.bind("sts",
        function (m,v) { 
            return r2.publish(m.R1es, evmatch);
        } );
    m.eval(
        function (m,v) {
            return MochiKit.Async.wait(1.0,v);
        } );
    m.eval(
        function (m,v) {
            assertEquals("publish: sts", m.sts, StatusVal.OK);
            assertEquals("evcount(1)",   m.R1eh.evcount, 1);
            assertEquals("event type",   m.R1eh.event.getType(), evmatch.getType());
            assertEquals("event source", m.R1eh.event.getSource(), evmatch.getSource());
        } );
    // publish non-matching event
    m.bind("sts",
        function (m,v) { 
            return r2.publish(m.R1es, evdrop);
        } );
    m.eval(
        function (m,v) {
            return MochiKit.Async.wait(1.0,v);
        } );
    m.eval(
        function (m,v) {
            assertEquals("publish: sts", m.sts, StatusVal.OK);
            assertEquals("event type",   m.R1eh.event.getType(), evmatch.getType());
            assertEquals("event source", m.R1eh.event.getSource(), evmatch.getSource());
            assertEquals("evcount(2)",   m.R1eh.evcount, 1);
        } );
    // publish matching event
    m.bind("sts",
        function (m,v) { 
            return r2.publish(m.R1es, evmatch);
        } );
    m.eval(
        function (m,v) {
            assertEquals("publish: sts", m.sts, StatusVal.OK);
            assertEquals("event type",   m.R1eh.event.getType(), evmatch.getType());
            assertEquals("event source", m.R1eh.event.getSource(), evmatch.getSource());
            assertEquals("evcount(3)",   m.R1eh.evcount, 1);
        } );
    // unsubscribe
    m.bind("sts",
        function (m,v) { 
            return r1.unsubscribe(m.R1eh, evtype, source);
        } );
    m.eval(
        function (m,v) {
            assertEquals("unsubscribe: sts", m.sts, StatusVal.UNSUBSCRIBED);
            assertEquals("R1eh.unsub",       m.R1eh.unsub, StatusVal.UNSUBSCRIBED);
            assertEquals("R1eh.subcount",    m.R1eh.subcount, 0);
            assertEquals("r1.getSubscriptionCount()", r1.getSubscriptionCount(), 0);
            assertEquals("r2.getSubscriptionCount()", r2.getSubscriptionCount(), 0);
            assertEquals("r1.getForwardCount()", r1.getForwardCount(), 1);
            assertEquals("r2.getForwardCount()", r2.getForwardCount(), 1);
        } );
    var res = m.run();
    return res;
}

// Two-hop routing test: R2 -> R3 (via R1 - see TestEventHTTPServer.py)
TestEventRouterHTTP.prototype.doSubscriptionForwardingR2R3 = 
function(evtype, source, evmatch, evdrop) {
    return this.doSubscriptionForwarding(this.R2C, this.R3C, evtype, source, evmatch, evdrop);
}

// Test very simple subscription - get this test working before worrying
// about results from the more comprehensive test cases.
TestEventRouterHTTP.prototype.testSimpleSubscription1 = function() {
    var here = this;
    var m = new DeferredMonad() ;
    m.bind("eh",
        function (m,v) {
            assertEquals("initial R2C.getSubscriptionCount()", here.R2C.getSubscriptionCount(), 0);
            assertEquals("initial R3C.getSubscriptionCount()", here.R3C.getSubscriptionCount(), 0);
            assertEquals("initial R2C.getForwardCount()",      here.R2C.getForwardCount(), 1); // fwd all to relay
            assertEquals("initial R3C.getForwardCount()",      here.R3C.getForwardCount(), 1); // fwd all to relay
            return makeEventHandler("eh", eventHandler, subHandler, unsubHandler);
        } );
    m.eval(
        function (m,v) {
            m.eh.subcount = 0;
            m.eh.evcount  = 0;
        } );
    m.bind("sts",
        function (m,v) {
            return here.R2C.subscribe(60, m.eh, "R3Events/ev1", null);
        } );
    m.eval(
        function (m,v) {
            assertEquals("sts", m.sts, StatusVal.SUBSCRIBED);
            assertEquals("eh.dosub",    m.eh.dosub, StatusVal.SUBSCRIBED);
            assertEquals("eh.subcount", m.eh.subcount, 1);
            assertEquals("R2C.getSubscriptionCount()", here.R2C.getSubscriptionCount(), 1);
            assertEquals("R3C.getSubscriptionCount()", here.R3C.getSubscriptionCount(), 0);
            assertEquals("R2C.getForwardCount()",      here.R2C.getForwardCount(), 1); // fwd all to relay
            assertEquals("R3C.getForwardCount()",      here.R3C.getForwardCount(), 1);
        } );
    // Now a simple unsubscribe
    m.bind("sts",
        function (m,v) {
            var d = here.R2C.unsubscribe(m.eh, "R3Events/ev1", null);
            return d;
        } );
    m.eval(
        function (m,v) {
            assertEquals("sts", m.sts, StatusVal.UNSUBSCRIBED);
            assertEquals("eh.unsub",            m.eh.unsub, StatusVal.UNSUBSCRIBED);
            assertEquals("eh.subcount",         m.eh.subcount, 0);
            assertEquals("R2C.subCount()", here.R2C.getSubscriptionCount(), 0);
            assertEquals("R3C.subCount()", here.R3C.getSubscriptionCount(), 0);
        } );
    var res = m.run();
    return res;
}

// Test simple event publication - get this test working before 
// worrying about results from the later test cases.
TestEventRouterHTTP.prototype.testSimplePublication1 = function() {
    var here = this;
    var m = new DeferredMonad() ;
    m.bind("eh",
        function (m,v) {
            return makeEventHandler("eh", eventHandler, subHandler, unsubHandler);
        } );
    m.eval(
        function (m,v) {
            m.eh.subcount = 0;
            m.eh.evcount  = 0;
        } );
    m.bind("es",
        function (m,v) {
            return makeEventAgent("es");
        } );
    m.bind("ev",
        function (m,v) {
            return makeEvent("R3Events/ev1","R3Source/src1","payload");
        } );
    m.bind("sts",
        function (m,v) {
            return here.R2C.subscribe(60, m.eh, "R3Events/ev1", null);
        } );
    m.eval(
        function (m,v) {
            assertEquals("sts", m.sts, StatusVal.SUBSCRIBED);
            assertEquals("eh.dosub",    m.eh.dosub, StatusVal.SUBSCRIBED);
            assertEquals("eh.subcount", m.eh.subcount, 1);
            assertEquals("R2C.getSubscriptionCount()", here.R2C.getSubscriptionCount(), 1);
            assertEquals("R3C.getSubscriptionCount()", here.R3C.getSubscriptionCount(), 0);
            assertEquals("R2C.getForwardCount()",      here.R2C.getForwardCount(), 1); // fwd all to relay
            assertEquals("R3C.getForwardCount()",      here.R3C.getForwardCount(), 1);
        } );
    // Now a simple publication
    m.bind("sts",
        function (m,v) {
            var d = here.R3C.publish(m.es, m.ev);
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
    // Now a simple unsubscribe
    m.bind("sts",
        function (m,v) {
            var d = here.R2C.unsubscribe(m.eh, "R3Events/ev1", null);
            return d;
        } );
    m.eval(
        function (m,v) {
            assertEquals("sts", m.sts, StatusVal.UNSUBSCRIBED);
            assertEquals("eh.unsub",            m.eh.unsub, StatusVal.UNSUBSCRIBED);
            assertEquals("eh.subcount",         m.eh.subcount, 0);
            assertEquals("this.R2C.subCount()", here.R2C.getSubscriptionCount(), 0);
            assertEquals("this.R3C.subCount()", here.R3C.getSubscriptionCount(), 0);
        } );
    var res = m.run();
    return res;
}

// Test routing based on event type matching
// (wildcard event source)
TestEventRouterHTTP.prototype.testSubscriptionForwarding1 = function() {
    var evmatch = makeEvent(evtype="R3Events/ev1",source="R3Source/src1");
    var evdrop  = makeEvent(evtype="R3Events/ev2",source="R3Source/src2");
    return this.doSubscriptionForwardingR2R3("R3Events/ev1", null, evmatch, evdrop);
}

// Test routing based on event source matching
// (wildcard event type)
TestEventRouterHTTP.prototype.testSubscriptionForwarding2 = function() {
    var evmatch = makeEvent(evtype="R3Events/ev1",source="R3Source/src1");
    var evdrop  = makeEvent(evtype="R3Events/ev2",source="R3Source/src2");
    return this.doSubscriptionForwardingR2R3(null, "R3Source/src1", evmatch, evdrop);
}

// Test routing based on event type and source matching
TestEventRouterHTTP.prototype.testSubscriptionForwarding3 = function() {
    var evmatch = makeEvent(evtype="R3Events1/ev1",source="R3Source1/src1");
    var evdrop  = makeEvent(evtype="R3Events1/ev2",source="R3Source1/src2");
    return this.doSubscriptionForwardingR2R3(
        "R3Events1/ev1", "R3Source1/src1", evmatch, evdrop);
}

// Test subscription loop doesn't cause routing loop
TestEventRouterHTTP.prototype.testSubscriptionForwarding4 = function() {
    var evmatch = makeEvent(evtype="RREvents3/ev1",source="RRSource3/src1");
    var evdrop  = makeEvent(evtype="RREvents3/ev2",source="RRSource3/src2");
    return this.doSubscriptionForwardingR2R3(
        "RREvents3/ev1", "RRSource3/src1", evmatch, evdrop, 1);
}

TestEventRouterHTTP.prototype.testXXX = function() {
    assertEquals( "testXXX", 4, 2+2 );
}

// End.

