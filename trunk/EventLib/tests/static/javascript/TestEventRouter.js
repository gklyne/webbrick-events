// $Id$
//
// Unit testing for event router functions (see also TestEventPubSub)
//

// Create test suite class
function TestEventRouter() {
}

// Specify order of tests
TestEventRouter.exposeTestFunctionNames = function() {
    return [ "testSubscriptionRouteTable"
           , "testSubscribeEvent"
           , "testSimpleSubscription1"
           , "testSimplePublication1"
           , "testSubscriptionForwarding1"
           , "testSubscriptionForwarding2"
           , "testSubscriptionForwarding3"
           , "testSubscriptionForwarding4"
           , "testSubscriptionForwarding5"
           , "testSubscriptionForwarding6"
           , "testSubscriptionForwarding7"
           , "testSubscriptionForwarding8"
           , "testSubscriptionSpecial1"
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

TestEventRouter.prototype.setUp = function() {
    this.R1 = new EventRouter("R1");
    this.R2 = new EventRouter("R2");
    this.R3 = new EventRouter("R3");
    // Configure event routers with R1 as hub:
    //
    //      R1
    //     /  \
    //    R2  R3
    //
    // Wildcard event source
    // routeEventFrom(evtyp,evsrc,router)
    this.R1.routeEventFrom("R2Events/ev1",null,this.R2);
    this.R1.routeEventFrom("R3Events/ev1",null,this.R3);
    this.R2.routeEventFrom("R1Events/ev1",null,this.R1);
    this.R2.routeEventFrom("R3Events/ev1",null,this.R1);
    this.R3.routeEventFrom("R1Events/ev1",null,this.R1);
    this.R3.routeEventFrom("R2Events/ev1",null,this.R1);
    // Wildcard event type
    this.R1.routeEventFrom(null,"R2Source/src1",this.R2);
    this.R1.routeEventFrom(null,"R3Source/src1",this.R3);
    this.R2.routeEventFrom(null,"R1Source/src1",this.R1);
    this.R2.routeEventFrom(null,"R3Source/src1",this.R1);
    this.R3.routeEventFrom(null,"R1Source/src1",this.R1);
    this.R3.routeEventFrom(null,"R2Source/src1",this.R1);
    // Wildcard none
    this.R1.routeEventFrom("R2Events1/ev1","R2Source1/src1",this.R2);
    this.R1.routeEventFrom("R3Events1/ev1","R3Source1/src1",this.R3);
    this.R2.routeEventFrom("R1Events1/ev1","R1Source1/src1",this.R1);
    this.R2.routeEventFrom("R3Events1/ev1","R3Source1/src1",this.R1);
    this.R3.routeEventFrom("R1Events1/ev1","R1Source1/src1",this.R1);
    this.R3.routeEventFrom("R2Events1/ev1","R2Source1/src1",this.R1);
    // Cross routing event
    this.R1.routeEventFrom("RREvents2/ev1","RRSource2/src1",this.R2);
    this.R2.routeEventFrom("RREvents2/ev1","RRSource2/src1",this.R1);
    // 3-way loop routing event
    this.R1.routeEventFrom("RREvents3/ev1","RRSource3/src1",this.R2);
    this.R2.routeEventFrom("RREvents3/ev1","RRSource3/src1",this.R3);
    this.R3.routeEventFrom("RREvents3/ev1","RRSource3/src1",this.R1);
    return;
}

TestEventRouter.prototype.tearDown = function() {
}

// Test cases
// Basic publish-subscribe tests are performed by TestEventPubSub
// The following tests are intended to exercise routing functions

// Check the routing tables are as expected
TestEventRouter.prototype.testSubscriptionRouteTable = function() {
    var r1f, r1cmp;
    r1f = [ ["R2Events1/ev1", "R2Source1/src1", this.R2]
          , ["R3Events1/ev1", "R3Source1/src1", this.R3]
          , ["R2Events/ev1",  null,             this.R2]
          , ["R3Events/ev1",  null,             this.R3]
          , [null,            "R2Source/src1",  this.R2]
          , [null,            "R3Source/src1",  this.R3]
          , ["RREvents2/ev1", "RRSource2/src1", this.R2]
          , ["RREvents3/ev1", "RRSource3/src1", this.R2]
          ]
    r1cmp = compareLists(this.R1.getRouteTable(),r1f);
    assertEquals("r1cmp", null, r1cmp);
    var r2f, r2cmp;
    r2f = [ ["R1Events/ev1",  null,             this.R1]
          , ["R3Events/ev1",  null,             this.R1]
          , [null,            "R1Source/src1",  this.R1]
          , [null,            "R3Source/src1",  this.R1]
          , ["R1Events1/ev1", "R1Source1/src1", this.R1]
          , ["R3Events1/ev1", "R3Source1/src1", this.R1]
          , ["RREvents2/ev1", "RRSource2/src1", this.R1]
          , ["RREvents3/ev1", "RRSource3/src1", this.R3]
          ]
    r2cmp = compareLists(this.R2.getRouteTable(),r2f);
    assertEquals("r2cmp", null, r2cmp);
    var r3f, r3cmp;
    r3f = [ ["R1Events/ev1",  null,             this.R1]
          , ["R2Events/ev1",  null,             this.R1]
          , [null,            "R1Source/src1",  this.R1]
          , [null,            "R2Source/src1",  this.R1]
          , ["R1Events1/ev1", "R1Source1/src1", this.R1]
          , ["R2Events1/ev1", "R2Source1/src1", this.R1]
          , ["RREvents3/ev1", "RRSource3/src1", this.R1]
          ]
    r3cmp = compareLists(this.R3.getRouteTable(),r3f);
    assertEquals("r1cmp", null, r1cmp);
    return
}

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
//   r1fwd   forwarding count for r1 (usually 0, or 1 if at end of loop)
//   rvia    a router via which the subscription is routed
//   r1rtr   routing/forwarding node for r1, if different from r1.
//   r2rtr   routing/forwarding node for r2, if different from r2.
//
TestEventRouter.prototype.doSubscriptionForwarding = 
function(r1, r2, evtype, source, evmatch, evdrop, 
        r1fwd, rvia, r1rtr, r2rtr) {
    if (r1fwd === undefined) r1fwd = 0;
    if (rvia  === undefined) rvia  = null;
    if (r1rtr === undefined) r1rtr = null;
    if (r2rtr === undefined) r2rtr = null;
    var sts ;
    var R1es = makeEventAgent("R1es");
    var R1eh = makeEventHandler("R1eh", eventHandler, subHandler, unsubHandler);
    R1eh.subcount = 0;
    R1eh.evcount  = 0;
    if (!r1rtr) r1rtr = r1;
    if (!r2rtr) r2rtr = r2;
    // Initial tests
    assertEquals("r1", r1.getSubscriptionCount(), 0);
    assertEquals("r2", r2.getSubscriptionCount(), 0);
    // subscribe
    sts = r1.subscribe(60, R1eh, evtype, source);
    assertEquals("sts", syncDeferred(sts), StatusVal.SUBSCRIBED);
    assertEquals("R1eh.dosub",    R1eh.dosub, StatusVal.SUBSCRIBED);
    assertEquals("R1eh.subcount", R1eh.subcount, 1);
    assertEquals("r1.getSubscriptionCount()", r1.getSubscriptionCount(), 1);
    assertEquals("r1rtr.getForwardCount()",   r1rtr.getForwardCount(), r1fwd);
    assertEquals("r2.getSubscriptionCount()", r2.getSubscriptionCount(), 0);
    assertEquals("r2rtr.getForwardCount()",   r2rtr.getForwardCount(), 1);
    if (rvia) {
        assertEquals("rvia.subCount", rvia.getSubscriptionCount(), 0);
        assertEquals("rvia.fwdCount", rvia.getForwardCount(), 1);
    }
    // publish matching event
    sts = r2.publish(R1es, evmatch);
    assertEquals("publish: sts", syncDeferred(sts), StatusVal.OK);
    assertEquals("event type",   R1eh.event.getType(), evmatch.getType());
    assertEquals("event source", R1eh.event.getSource(), evmatch.getSource());
    assertEquals("evcount",      R1eh.evcount, 1);
    // publish non-matching event
    sts = r2.publish(R1es, evdrop)
    assertEquals("publish: sts", syncDeferred(sts), StatusVal.OK);
    assertEquals("event type",   R1eh.event.getType(), evmatch.getType());
    assertEquals("event source", R1eh.event.getSource(), evmatch.getSource());
    assertEquals("evcount",      R1eh.evcount, 1);
    // publish matching event
    sts = r2.publish(R1es, evmatch)
    assertEquals("publish: sts", syncDeferred(sts), StatusVal.OK);
    assertEquals("event type",   R1eh.event.getType(), evmatch.getType());
    assertEquals("event source", R1eh.event.getSource(), evmatch.getSource());
    assertEquals("evcount",      R1eh.evcount, 2);
    // unsubscribe
    sts = r1.unsubscribe(R1eh, evtype=evtype, source=source)
    assertEquals("unsubscribe: sts", syncDeferred(sts), StatusVal.UNSUBSCRIBED);
    assertEquals("R1eh.unsub",       R1eh.unsub, StatusVal.UNSUBSCRIBED);
    assertEquals("R1eh.subcount",    R1eh.subcount, 0);
    assertEquals("r1.subCount()",    r1.getSubscriptionCount(), 0);
    assertEquals("r2.subCount()",    r2.getSubscriptionCount(), 0);
    if (rvia) {
        assertEquals("rvia.subCount()", rvia.getSubscriptionCount(), 0);
    }
}

// One-hop routing test: R1 -> R2
TestEventRouter.prototype.doSubscriptionForwardingR1R2 = 
function(evtype, source, evmatch, evdrop, r1fwd) {
    this.doSubscriptionForwarding(
        this.R1, this.R2, evtype, source, evmatch, evdrop, 
        r1fwd);
}

// Two-hop routing test: R2 -> R3 (via R3 - see method setUp)
TestEventRouter.prototype.doSubscriptionForwardingR2R3 = 
function(evtype, source, evmatch, evdrop, r1fwd) {
    this.doSubscriptionForwarding(
        this.R2, this.R3, evtype, source, evmatch, evdrop, 
        r1fwd, this.R1);
}

// Test construction and disassembly of a subscription event
TestEventRouter.prototype.testSubscribeEvent = function() {
    var ev = makeSubscribeEvent(
        EventUri.SubscribeType, "testSubscribeEvent", 60, "evtyp","evsrc");
    var ep = openSubscribeEvent(isSubscribeEvent, ev);
    assertEquals("ep[0]", ep[0], EventUri.SubscribeType);
    assertEquals("ep[1]", ep[1], "testSubscribeEvent");
    assertEquals("ep[2]", ep[2], 60);
    assertEquals("ep[3]", ep[3], "evtyp");
    assertEquals("ep[4]", ep[4], "evsrc");
}

// Test very simple subscription - get this test working before worrying
// about results from the more comprehensive test cases.
TestEventRouter.prototype.testSimpleSubscription1 = function() {
    var eh = makeEventHandler("eh", eventHandler, subHandler, unsubHandler);
    eh.subcount = 0;
    eh.evcount  = 0;
    var sts = this.R1.subscribe(60, eh, "R2Events/ev1", null);
    assertEquals("sts", syncDeferred(sts), StatusVal.SUBSCRIBED);
    assertEquals("eh.dosub",    eh.dosub, StatusVal.SUBSCRIBED);
    assertEquals("eh.subcount", eh.subcount, 1);
    assertEquals("this.R1.getSubscriptionCount()", this.R1.getSubscriptionCount(), 1);
    assertEquals("this.R1.getForwardCount()",      this.R1.getForwardCount(), 0);
    assertEquals("this.R2.getSubscriptionCount()", this.R2.getSubscriptionCount(), 0);
    assertEquals("this.R2.getForwardCount()",      this.R2.getForwardCount(), 1);
    // Now a simple unsubscribe
    sts = this.R1.unsubscribe(eh, "R2Events/ev1", null);
    assertEquals("sts", syncDeferred(sts), StatusVal.UNSUBSCRIBED);
    assertEquals("eh.unsub",           eh.unsub, StatusVal.UNSUBSCRIBED);
    assertEquals("eh.subcount",        eh.subcount, 0);
    assertEquals("this.R1.subCount()", this.R1.getSubscriptionCount(), 0);
    assertEquals("this.R2.subCount()", this.R2.getSubscriptionCount(), 0);
}

// Test very simple event publucation - get this test working before worrying
// about results from the more comprehensive test cases.
TestEventRouter.prototype.testSimplePublication1 = function() {
    var eh = makeEventHandler("eh", eventHandler, subHandler, unsubHandler);
    var es = makeEventAgent("es");
    var ev = makeEvent("R2Events/ev1","R2Source/src1","payload");
    eh.subcount = 0;
    eh.evcount  = 0;
    var sts = this.R1.subscribe(60, eh, "R2Events/ev1", null);
    assertEquals("sts", syncDeferred(sts), StatusVal.SUBSCRIBED);
    assertEquals("eh.dosub",    eh.dosub, StatusVal.SUBSCRIBED);
    assertEquals("eh.subcount", eh.subcount, 1);
    assertEquals("this.R1.getSubscriptionCount()", this.R1.getSubscriptionCount(), 1);
    assertEquals("this.R1.getForwardCount()",      this.R1.getForwardCount(), 0);
    assertEquals("this.R2.getSubscriptionCount()", this.R2.getSubscriptionCount(), 0);
    assertEquals("this.R2.getForwardCount()",      this.R2.getForwardCount(), 1);
    // Now a simple publication
    sts = this.R2.publish(es, ev);
    assertEquals("publish: sts", syncDeferred(sts), StatusVal.OK);
    assertEquals("event type",   eh.event.getType(), ev.getType());
    assertEquals("event source", eh.event.getSource(), ev.getSource());
    assertEquals("evcount",      eh.evcount, 1);
    // Now a simple unsubscribe
    sts = this.R1.unsubscribe(eh, "R2Events/ev1", null);
    assertEquals("sts", syncDeferred(sts), StatusVal.UNSUBSCRIBED);
    assertEquals("eh.unsub",           eh.unsub, StatusVal.UNSUBSCRIBED);
    assertEquals("eh.subcount",        eh.subcount, 0);
    assertEquals("this.R1.subCount()", this.R1.getSubscriptionCount(), 0);
    assertEquals("this.R2.subCount()", this.R2.getSubscriptionCount(), 0);
}

// Test simple subscription forwarding based on event type matching
// (wildcard event source)
TestEventRouter.prototype.testSubscriptionForwarding1 = function() {
    var evmatch = makeEvent("R2Events/ev1","R2Source/src1","payload");
    var evdrop  = makeEvent("R2Events/ev2","R2Source/src2","payload");
    this.doSubscriptionForwardingR1R2("R2Events/ev1", null, evmatch, evdrop);
}

// Test simple subscription forwarding based on event source matching
// (wildcard event type)
TestEventRouter.prototype.testSubscriptionForwarding2 = function() {
    var evmatch = makeEvent(evtype="R2Events/ev1",source="R2Source/src1");
    var evdrop  = makeEvent(evtype="R2Events/ev2",source="R2Source/src2");
    this.doSubscriptionForwardingR1R2(null, "R2Source/src1", evmatch, evdrop);
}

// Test simple subscription forwarding based on event type and source matching
TestEventRouter.prototype.testSubscriptionForwarding3 = function() {
    var evmatch = makeEvent(evtype="R2Events1/ev1",source="R2Source1/src1");
    var evdrop  = makeEvent(evtype="R2Events1/ev2",source="R2Source1/src2");
    this.doSubscriptionForwardingR1R2(
        "R2Events1/ev1", "R2Source1/src1", evmatch, evdrop);
}

// Test cross-subscription doesn't cause subscription routing loop
TestEventRouter.prototype.testSubscriptionForwarding4 = function() {
    var evmatch = makeEvent(evtype="RREvents2/ev1",source="RRSource2/src1");
    var evdrop  = makeEvent(evtype="RREvents2/ev2",source="RRSource2/src2");
    this.doSubscriptionForwardingR1R2(
        "RREvents2/ev1", "RRSource2/src1", evmatch, evdrop, 1);
}

// Test 2-hop routing based on event type matching
// (wildcard event source)
TestEventRouter.prototype.testSubscriptionForwarding5 = function() {
    var evmatch = makeEvent(evtype="R3Events/ev1",source="R3Source/src1");
    var evdrop  = makeEvent(evtype="R3Events/ev2",source="R3Source/src2");
    this.doSubscriptionForwardingR2R3("R3Events/ev1", null, evmatch, evdrop);
}

// Test 2-hop routing based on event source matching
// (wildcard event type)
TestEventRouter.prototype.testSubscriptionForwarding6 = function() {
    var evmatch = makeEvent(evtype="R3Events/ev1",source="R3Source/src1");
    var evdrop  = makeEvent(evtype="R3Events/ev2",source="R3Source/src2");
    this.doSubscriptionForwardingR2R3(null, "R3Source/src1", evmatch, evdrop);
}

// Test 2-hop routing based on event type and source matching
TestEventRouter.prototype.testSubscriptionForwarding7 = function() {
    var evmatch = makeEvent(evtype="R3Events1/ev1",source="R3Source1/src1");
    var evdrop  = makeEvent(evtype="R3Events1/ev2",source="R3Source1/src2");
    this.doSubscriptionForwardingR2R3(
        "R3Events1/ev1", "R3Source1/src1", evmatch, evdrop);
}

// Test 2-hop subscription loop doesn't cause routing loop
TestEventRouter.prototype.testSubscriptionForwarding8 = function() {
    var evmatch = makeEvent(evtype="RREvents3/ev1",source="RRSource3/src1");
    var evdrop  = makeEvent(evtype="RREvents3/ev2",source="RRSource3/src2");
    this.doSubscriptionForwardingR2R3(
        "RREvents3/ev1", "RRSource3/src1", evmatch, evdrop, 1);
}

// Test subscribe event delivery
// A wildcard event subscription should not receive subscribe events
TestEventRouter.prototype.testSubscriptionSpecial1 = function() {
    // Initialize
    var sts ;
    var S1es = makeEventAgent("S1es");
    var S1eh = makeEventHandler("S1eh", eventHandler, subHandler, unsubHandler);
    S1eh.subcount = 0;
    S1eh.evcount  = 0;
    // wildcard subscribe
    sts = this.R1.subscribe(60, S1eh, null, null);
    assertEquals("sts", syncDeferred(sts), StatusVal.SUBSCRIBED);
    assertEquals("S1eh.dosub",    S1eh.dosub, StatusVal.SUBSCRIBED);
    assertEquals("S1eh.subcount", S1eh.subcount, 1);
    // publish subscribe event
    var evsub = makeEvent(EventUri.SubscribeType, "S1es/src1", "[60, 'evtyp', 'evsrc']");
    sts = this.R1.publish(S1es, evsub);
    //assertEquals("publish: sts", syncDeferred(sts), StatusVal.OK);
    assertEquals("evcount",      S1eh.evcount, 0);
}


TestEventRouter.prototype.testXXX = function() {
    assertEquals( "testXXX", 4, 2+2 );
}

// Helper to compare a pair of lists.
//
// Returns null if the lists are identical, or a pair of lists containing:
// (1) elements of first list not in second, and
// (2) elements of second list not in first list.
//
function compareLists(c1,c2) {
    if (c1 === undefined) c1 = [];
    if (c2 === undefined) c2 = [];
    var c1d = [];
    var c2d = [];
    for (var i in c1) {
        if (!inList(c1[i], c2)) c1d.push(c1[i]);
    }
    for (var j in c2) {
        if (!inList(c2[j], c1)) c2d.push(c2[j]);
    }
    if (c1d.length != 0 || c2d.length != 0) return [c1d,c2d];
    return null ;
}

function inList(c, cs) {
    for (var i in cs) {
        if (MochiKit.Base.compare(cs[i],c) === 0) return true;
    }
    return false;
}

// End.

