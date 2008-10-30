// $Id$
//
// Test basic publish/subscribe functions
//

// Create test suite class
function TestEventPubSub() {
}

// Specify order of tests
TestEventPubSub.exposeTestFunctionNames = function() {
    return [ "testFunctional"
           , "testWildDict"
           , "testWildDictIterators"
           , "testEventTypeSourceDict"
           , "testEventTypeSourceDictIterators"
           , "testSubscribeInfo"
           , "testPublishT1S1"
           , "testPublishT2S1"
           , "testPublishT1S2"
           , "testPublishT2S2"
           , "testPublishT1S3"
           , "testPublishT3S1"
           , "testPublishT3S3"
           , "testUnsubscribe1"
           , "testUnsubscribe2"
           , "testUnsubscribe3"
           , "testUnsubscribe4"
           , "testUnsubscribe5"
/*
*/
           , "testXXX"
           ];
}

// Local event handler class for testing
function MyEventHandler(target) {
    this._target    = target;
    this._triggered = false;
    this._status    = StatusVal.NONE;
}

MyEventHandler.prototype.eq = function(other) {
    return this._target == other._target;
}

MyEventHandler.prototype.getUri = function() {
    return "MyEventHandler:"+this._target;
}

MyEventHandler.prototype.toString = function() {
    return "MyEventHandler("+this._target+")";
}

MyEventHandler.prototype.getTarget = function() {
    return this._target
}

MyEventHandler.prototype.handleEvent = function(event) {
    if (isSubscribeEvent(event.getType())) {
        this._watched = true;
    }
    else {
        this._triggered = true;
        this._status    = StatusVal.TRIGGERED;
    }
    return makeDeferred(StatusVal.OK);
}

MyEventHandler.prototype.initSubscription = function(status) {
    this._triggered = false;
    this._status    = StatusVal.SUBSCRIBED;
    return makeDeferred(StatusVal.OK);
}

MyEventHandler.prototype.endSubscription = function(status) {
    this._status    = StatusVal.UNSUBSCRIBED;
    return makeDeferred(StatusVal.OK);
}

MyEventHandler.prototype.isTriggered = function() {
    return this._triggered;
}


// Helper to test if event handler is triggered as expected
function evTriggerEq(handler,expect) {
    return handler.isTriggered() == expect;
}

// Helper to map assertion over a pair of lists
function mapAssert(f, as, bs, msg) {
    var rs = MochiKit.Base.map(f, as, bs);
    for (var i in rs) assert(msg+", as["+i+"]="+as[i]+", bs["+i+"]="+bs[i]+"]", rs[i]);
}

// Setup and teardown

TestEventPubSub.prototype.setUp = function() {
    var a = new MyEventHandler("A");
    var b = new MyEventHandler("B");
    var c = new MyEventHandler("C");
    var d = new MyEventHandler("D");
    var e = new MyEventHandler("E");
    var f = new MyEventHandler("F");
    var g = new MyEventHandler("G");
    this.handlers = [a, b, c, d, e, f, g];
    this.router = new EventPubSub("LocalRouter");
    this.router.subscribe(60, a, "t1", "s1");   // evtype, source
    this.router.subscribe(60, b, "t2", "s1");
    this.router.subscribe(60, c, "t1", "s2");
    this.router.subscribe(60, d, "t2", "s2");
    this.router.subscribe(60, e, "t1");
    this.router.subscribe(60, f, null, "s1");
    this.router.subscribe(60, g);
}

TestEventPubSub.prototype.tearDown = function() {
    this.router.unsubscribe(this.handlers[0], "t1", "s1");
    this.router.unsubscribe(this.handlers[1], "t2", "s1");
    this.router.unsubscribe(this.handlers[2], "t1", "s2");
    this.router.unsubscribe(this.handlers[3], "t2", "s2");
    this.router.unsubscribe(this.handlers[4], "t1");
    this.router.unsubscribe(this.handlers[5], null, "s1");
    this.router.unsubscribe(this.handlers[6]);
}

TestEventPubSub.prototype.doTestPublish = function(typid,srcid,expectTriggered) {
    var src = makeEventAgent(typid+srcid);
    var evt = makeEvent(typid,srcid);
    var sts = this.router.publish(src, evt);
    assertEquals("doTestPublish", syncDeferred(sts), StatusVal.OK);
    mapAssert(evTriggerEq, this.handlers, expectTriggered, "Trigger "+typid+srcid);
}

// Test cases

TestEventPubSub.prototype.testFunctional = function () {
        var v1 = MochiKit.Base.map(MochiKit.Base.operator.add,["a","b","c"],["1","2","3"]);
        assertEquals("map operator.add", v1, ["a1","b2","c3"]);
        //var v2 = MochiKit.Base.reduce(MochiKit.Base.operator.add,v1);
        //assertEquals("reduce operator.add", v2, "a1b2c3");
        var v3 = filterSplit(isEq("X"),["X","Y","Z","Z","Y","X","Y","Z","Z","Y"]);
        assertEquals("filterSplit.eq", v3[0], ["X","X"]);
        assertEquals("filterSplit.ne", v3[1], ["Y","Z","Z","Y","Y","Z","Z","Y"]);
    }

TestEventPubSub.prototype.testWildDict = function() {
    var wd = new WildDict()
    // Basic insertion tests
    assertEquals("testWildDict-a-1", wd.find("a"), []);
    assertEquals("testWildDict-b-1", wd.find("b"), []);
    wd.insert("a","A1");
    wd.insert(null,"N1");
    assertEquals("testWildDict-a-2", wd.find("a"), ["A1","N1"]);
    assertEquals("testWildDict-b-2", wd.find("b"), ["N1"]);
    wd.insert("a","A2");
    wd.insert("b","B1");
    wd.insert("b","B2");
    wd.insert(null,"N2");
    assertEquals("testWildDict-a-3", wd.find("a"), ["A1","A2","N1","N2"]);
    assertEquals("testWildDict-b-3", wd.find("b"), ["B1","B2","N1","N2"]);
    // Scan contents
    var kvs = [["a","A1"], ["a","A2"], ["b","B1"], ["b","B2"], [null,"N1"], [null,"N2"]];
    assertEquals("testWildDict-kvs", wd.list(), kvs);
    assertEquals("testWildDict-cnt", wd.count(), 6);
    // Basic removal tests
    var b1 = wd.remove("b","B1");
    assertEquals("testWildDict-b1",  b1, ["B1"]);
    assertEquals("testWildDict-b-4", wd.find("b"), ["B2","N1","N2"]);
    var b2 = wd.remove("b","B2");
    assertEquals("testWildDict-b2",  b2, ["B2"]);
    assertEquals("testWildDict-b-5", wd.find("b"), ["N1","N2"]);
    var n2 = wd.remove(null,"N2");
    assertEquals("testWildDict-n2",  n2, ["N2"]);
    assertEquals("testWildDict-a-6", wd.find("a"), ["A1","A2","N1"]);
    assertEquals("testWildDict-b-6", wd.find("b"), ["N1"]);
    var n1 = wd.remove(null,"N1");
    assertEquals("testWildDict-n1",  n1, ["N1"]);
    assertEquals("testWildDict-a-7", wd.find("a"), ["A1","A2"]);
    assertEquals("testWildDict-b-7", wd.find("b"), []);
    // Multiple-value insertion tests
    wd.insert("c","C");
    wd.insert(null,"N");
    wd.insert("c","C");
    wd.insert(null,"N");
    assertEquals("testWildDict-c", wd.find("c"), ["C","C","N","N"]);
    // Multiple-value removal tests
    var el = wd.remove("c","C1");
    assertEquals("testWildDict-el-8", el, []);
    assertEquals("testWildDict-c-8",  wd.find("c"), ["C","C","N","N"]);
    var cc = wd.remove("c","C");
    assertEquals("testWildDict-cc-9", cc, ["C","C"]);
    assertEquals("testWildDict-c-9",  wd.find("c"), ["N","N"]);
    var e2 = wd.remove("c","C");
    assertEquals("testWildDict-el-10", e2, []);
    assertEquals("testWildDict-c-10",  wd.find("c"), ["N","N"]);
    var e3 = wd.remove(null,"C");
    assertEquals("testWildDict-el-11", e3, []);
    assertEquals("testWildDict-c-11",  wd.find("c"), ["N","N"]);
    var nn = wd.remove(null,"N");
    assertEquals("testWildDict-nn-12", nn, ["N","N"]);
    assertEquals("testWildDict-c-12",  wd.find("c"), []);
    var e4 = wd.remove(null,"N");
    assertEquals("testWildDict-el-13", e4, []);
    assertEquals("testWildDict-a-13",  wd.find("a"), ["A1","A2"]);
    assertEquals("testWildDict-b-13",  wd.find("b"), []);
    assertEquals("testWildDict-c-13",  wd.find("c"), []);
    return;
};

TestEventPubSub.prototype.testWildDictIterators = function() {
    function iterlist(list) {
        function addlist(a1,a2,a3) {
            if (arguments.length == 1) {
                list.push(a1);
            }
            else if (arguments.length == 2) {
                list.push([a1,a2]);
            }
            else {
                list.push([a1,a2,a3]);
            }
        }
        return addlist;
    }
    var wd = new WildDict()
    wd.insert("a","A1");
    wd.insert("a","A2");
    wd.insert("b","B1");
    wd.insert("b","B2");
    wd.insert(null,"N1");
    wd.insert(null,"N2");
    var as1 = [];
    wd.iterate("a",iterlist(as1));
    assertEquals("iterate-1", as1, ["A1", "A2", "N1", "N2"]);
    var as2 = [];
    wd.iterate(null,iterlist(as2));
    assertEquals("iterate-2", as2, ["N1", "N2"]);
    var bs1 = [];
    wd.iterateKey("b",iterlist(bs1));
    assertEquals("iterateKey-1", bs1, [["b","B1"], ["b","B2"], [null,"N1"], [null,"N2"]]);
    var bs2 = [];
    wd.iterateKey(null,iterlist(bs2));
    assertEquals("iterateKey-2", bs2, [[null,"N1"], [null,"N2"]]);
    var cs1 = [];
    wd.iterateWild("a",iterlist(cs1));
    assertEquals("iterateWild-1", cs1, [["a","A1"], ["a","A2"], [null,"N1"], [null,"N2"]]);
    var cs2 = [];
    wd.iterateWild(null,iterlist(cs2));
    assertEquals("iterateWild-2", cs2, [["a","A1"], ["a","A2"], ["b","B1"], ["b","B2"], [null,"N1"], [null,"N2"]]);
    var ds1 = [];
    wd.iterateAll(iterlist(ds1));
    assertEquals("iterateAll-1", ds1, [["a","A1"], ["a","A2"], ["b","B1"], ["b","B2"], [null,"N1"], [null,"N2"]]);
    return;
}

TestEventPubSub.prototype.testEventTypeSourceDict = function() {
    var ed = new EventTypeSourceDict()
    // Basic insertion tests
    assertEquals("testEventTypeSourceDict-ats-1", ed.find("at","as"), []);
    assertEquals("testEventTypeSourceDict-bts-1", ed.find("bt","bs"), []);
    ed.insert("at","as","A1");
    ed.insert(null,null,"N1");
    assertEquals("testEventTypeSourceDict-ats-2", ed.find("at","as"), ["A1","N1"]);
    assertEquals("testEventTypeSourceDict-bts-2", ed.find("bt","bs"), ["N1"]);
    ed.insert("at","as","A2");
    ed.insert("bt","bs","B1");
    ed.insert("bt","bs","B2");
    ed.insert(null,null,"N2");
    assertEquals("testEventTypeSourceDict-ats-3", ed.find("at","as"), ["A1","A2","N1","N2"]);
    assertEquals("testEventTypeSourceDict-bts-3", ed.find("bt","bs"), ["B1","B2","N1","N2"]);
    // Scan contents
    var tsvs;
    tsvs = [ ["at","as","A1"], ["at","as","A2"]
           , ["bt","bs","B1"], ["bt","bs","B2"]
           , [null,null,"N1"], [null,null,"N2"]
           ];
    //var debug = ed.list();
    //debugger;
    assertEquals("testEventTypeSourceDict-edscn-1", ed.list(), tsvs);
    assertEquals("testEventTypeSourceDict-edcnt-1", ed.count(), 6);
    // Basic removal tests
    var b1 = ed.remove("bt","bs","B1");
    assertEquals("testEventTypeSourceDict-b1", b1, ["B1"]);
    assertEquals("testEventTypeSourceDict-bts-4", ed.find("bt","bs"), ["B2","N1","N2"]);
    var b2 = ed.remove("bt","bs","B2");
    assertEquals("testEventTypeSourceDict-b2", b2, ["B2"]);
    assertEquals("testEventTypeSourceDict-bts-5", ed.find("bt","bs"), ["N1","N2"]);
    var n2 = ed.remove(null,null,"N2");
    assertEquals("testEventTypeSourceDict-n2", n2, ["N2"]);
    assertEquals("testEventTypeSourceDict-ats-6", ed.find("at","as"), ["A1","A2","N1"]);
    assertEquals("testEventTypeSourceDict-bts-6", ed.find("bt","bs"), ["N1"]);
    var n1 = ed.remove(null,null,"N1");
    assertEquals("testEventTypeSourceDict-n1", n1, ["N1"]);
    assertEquals("testEventTypeSourceDict-ats-7", ed.find("at","as"), ["A1","A2"]);
    assertEquals("testEventTypeSourceDict-bts-7", ed.find("bt","bs"), []);
    // Scan contents
    tsvs = [ ["at","as","A1"], ["at","as","A2"] ];
    assertEquals("testEventTypeSourceDict-edscn-2", ed.list(), tsvs);
    assertEquals("testEventTypeSourceDict-edcnt-2", ed.count(), 2);
    // Multiple-value insertion tests
    ed.insert("ct","cs","C");
    ed.insert(null,null,"N");
    ed.insert("ct","cs","C");
    ed.insert(null,null,"N");
    assertEquals("testEventTypeSourceDict-cts-8", ed.find("ct","cs"), ["C","C","N","N"]);
    // Scan contents
    tsvs = [ ["at","as","A1"], ["at","as","A2"]
           , ["ct","cs","C"],  ["ct","cs","C"]
           , [null,null,"N"],  [null,null,"N"]
           ];
    assertEquals("testEventTypeSourceDict-edscn-3", ed.list(), tsvs);
    assertEquals("testEventTypeSourceDict-edcnt-3", ed.count(), 6);
    // Multiple-value removal tests
    var el = ed.remove("ct","cs","C1");
    assertEquals("testEventTypeSourceDict-el-9",  el, []);
    assertEquals("testEventTypeSourceDict-cts-9", ed.find("ct","cs"), ["C","C","N","N"]);
    var cc = ed.remove("ct","cs","C");
    assertEquals("testEventTypeSourceDict-cc-10",  cc, ["C","C"]);
    assertEquals("testEventTypeSourceDict-cts-10", ed.find("ct","cs"), ["N","N"]);
    el = ed.remove("ct","cs","C");
    assertEquals("testEventTypeSourceDict-el-11",  el, []);
    assertEquals("testEventTypeSourceDict-cts-11", ed.find("ct","cs"), ["N","N"]);
    el = ed.remove(null,null,"C");
    assertEquals("testEventTypeSourceDict-el-12",  el, []);
    assertEquals("testEventTypeSourceDict-cts-12", ed.find("ct","cs"), ["N","N"]);
    var nn = ed.remove(null,null,"N");
    assertEquals("testEventTypeSourceDict-nn-13",  nn, ["N","N"]);
    assertEquals("testEventTypeSourceDict-cts-13", ed.find("ct","cs"), []);
    el = ed.remove(null,null,"N");
    assertEquals("testEventTypeSourceDict-el-14",  el, []);
    assertEquals("testEventTypeSourceDict-ats-14", ed.find("at","as"), ["A1","A2"]);
    assertEquals("testEventTypeSourceDict-bts-14", ed.find("bt","bs"), []);
    assertEquals("testEventTypeSourceDict-cts-14", ed.find("ct","cs"), []);
    // Scan contents
    tsvs = [ ["at","as","A1"], ["at","as","A2"] ];
    assertEquals("testEventTypeSourceDict-edscn-15", ed.list(), tsvs);
    assertEquals("testEventTypeSourceDict-edcnt-15", ed.count(), 2);
    // Partial wildcard tests
    ed.insert("dt","ds","D1ts");
    ed.insert("dt","ds","D2ts");
    ed.insert("dt",null,"D1tn");
    ed.insert(null,"ds","D1ns");
    ed.insert(null,null,"D1nn");
    assertEquals("testEventTypeSourceDict-dts-16", ed.find("dt","ds"), ["D1ts","D2ts","D1tn","D1ns","D1nn"]);
    // Scan contents
    tsvs = [ ["at","as","A1"],   ["at","as","A2"]
           , ["dt","ds","D1ts"], ["dt","ds","D2ts"]
           , ["dt",null,"D1tn"]
           , [null,"ds","D1ns"]
           , [null,null,"D1nn"]
           ];
    //var debug = ed.list();
    //debugger;
    assertEquals("testEventTypeSourceDict-edscn-17", ed.list(), tsvs);
    assertEquals("testEventTypeSourceDict-edcnt-17", ed.count(), 7);
    // Partial wildcard tests in opposite order of insertion
    ed.insert(null,null,"E3nn");
    ed.insert(null,"es","E3ns");
    ed.insert("et",null,"E3tn");
    ed.insert("et","es","E4ts");
    ed.insert("et","es","E3ts");
    assertEquals("testEventTypeSourceDict-ets-18", 
                 ed.find("et","es"), ["E4ts","E3ts","E3tn","E3ns","D1nn","E3nn"]);
}

TestEventPubSub.prototype.testEventTypeSourceDictIterators = function() {
    function iterlist(list) {
        function addlist(a1,a2,a3) {
            if (arguments.length == 1) {
                list.push(a1);
            }
            else if (arguments.length == 2) {
                list.push([a1,a2]);
            }
            else {
                list.push([a1,a2,a3]);
            }
        }
        return addlist;
    }
    var ed = new EventTypeSourceDict()
    // Basic insertion tests
    ed.insert("at","as","A1");
    ed.insert("at","as","A2");
    ed.insert("bt","bs","B1");
    ed.insert("bt","bs","B2");
    ed.insert(null,null,"N1");
    ed.insert(null,null,"N2");
    ed.insert("dt","ds","D1ts");
    ed.insert("dt","ds","D2ts");
    ed.insert("dt",null,"D1tn");
    ed.insert(null,"ds","D1ns");
    ed.insert(null,null,"D1nn");
    var as1 = [];
    ed.iterate("at", "as", iterlist(as1));
    assertEquals("iterate-1", as1, ["A1", "A2", "N1", "N2", "D1nn"]);
    var as2 = [];
    ed.iterate(null, null, iterlist(as2));
    assertEquals("iterate-2", as2, ["N1", "N2", "D1nn"]);
    var bs1 = [];
    ed.iterateKey("bt", "bs", iterlist(bs1));
    assertEquals("iterateKey-1", bs1, 
        [ ["bt", "bs", "B1"]
        , ["bt", "bs", "B2"]
        , [null, null, "N1"]
        , [null, null, "N2"]
        , [null, null, "D1nn"]
        ]);
    var bs2 = [];
    ed.iterateKey(null, "bs", iterlist(bs2));
    assertEquals("iterateKey-2", bs2, 
        [ [null, null, "N1"]
        , [null, null, "N2"]
        , [null, null, "D1nn"]
        ]);
    var cs1 = [];
    ed.iterateWild("at", "as", iterlist(cs1));
    assertEquals("iterateWild-1", cs1, 
        [ ["at", "as", "A1"]
        , ["at", "as", "A2"]
        , [null, null, "N1"]
        , [null, null, "N2"]
        , [null, null, "D1nn"]
        ]);
    var cs2 = [];
    ed.iterateWild("dt", null, iterlist(cs2));
    assertEquals("iterateWild-2", cs2,
        [ ["dt", "ds", "D1ts"]
        , ["dt", "ds", "D2ts"]
        , ["dt", null, "D1tn"]
        , [null, "ds", "D1ns"]
        , [null, null, "N1"]
        , [null, null, "N2"]
        , [null, null, "D1nn"]
        ]);
    var cs3 = [];
    ed.iterateWild(null, "ds", iterlist(cs3));
    assertEquals("iterateWild-3", cs3,
        [ ["dt", "ds", "D1ts"]
        , ["dt", "ds", "D2ts"]
        , ["dt", null, "D1tn"]
        , [null, "ds", "D1ns"]
        , [null, null, "N1"]
        , [null, null, "N2"]
        , [null, null, "D1nn"]
        ]);
    var ds1 = [];
    ed.iterateAll(iterlist(ds1));
    assertEquals("iterateAll-1", ds1,
        [ ["at", "as", "A1"]
        , ["at", "as", "A2"]
        , ["bt", "bs", "B1"]
        , ["bt", "bs", "B2"]
        , ["dt", "ds", "D1ts"]
        , ["dt", "ds", "D2ts"]
        , ["dt", null, "D1tn"]
        , [null, "ds", "D1ns"]
        , [null, null, "N1"]
        , [null, null, "N2"]
        , [null, null, "D1nn"]
        ]);
}

TestEventPubSub.prototype.testSubscribeInfo = function() {
    assertEquals("testSubscribeInfo", this.router.getSubscriptionCount(), 7);
}

TestEventPubSub.prototype.testPublishT1S1 = function() {
    //                 A      B      C      D      E      F      G
    assertEquals("testPublishT1S1", typeof this, "object");
    // debugger;
    assertEquals("testPublishT1S1", typeof this.doTestPublish, "function");
    expectTriggered = [true,  false, false, false, true,  true,  true];
    this.doTestPublish("t1","s1",expectTriggered);
}

TestEventPubSub.prototype.testPublishT2S1 = function() {
    //                 A      B      C      D      E      F      G
    expectTriggered = [false, true,  false, false, false, true,  true];
    this.doTestPublish("t2","s1",expectTriggered);
}

TestEventPubSub.prototype.testPublishT1S2 = function() {
    //                 A      B      C      D      E      F      G
    expectTriggered = [false, false, true,  false, true,  false, true];
    this.doTestPublish("t1","s2",expectTriggered);
}

TestEventPubSub.prototype.testPublishT2S2 = function() {
    //                 A      B      C      D      E      F      G
    expectTriggered = [false, false, false, true,  false, false, true];
    this.doTestPublish("t2","s2",expectTriggered);
}

TestEventPubSub.prototype.testPublishT1S3 = function() {
    //                 A      B      C      D      E      F      G
    expectTriggered = [false, false, false, false, true,  false, true];
    this.doTestPublish("t1","s3",expectTriggered);
}

TestEventPubSub.prototype.testPublishT3S1 = function() {
    //                 A      B      C      D      E      F      G
    expectTriggered = [false, false, false, false, false, true,  true];
    this.doTestPublish("t3","s1",expectTriggered);
}

TestEventPubSub.prototype.testPublishT3S3 = function() {
    //                 A      B      C      D      E      F      G
    expectTriggered = [false, false, false, false, false, false, true];
    this.doTestPublish("t3","s3",expectTriggered);
}

TestEventPubSub.prototype.testUnsubscribe1 = function() {
    this.router.unsubscribe(this.handlers[0], "t1", "s1");
    //                 A      B      C      D      E      F      G
    expectTriggered = [false, false, false, false, true,  true,  true];
    this.doTestPublish("t1","s1",expectTriggered);
}

TestEventPubSub.prototype.testUnsubscribe2 = function() {
    this.router.unsubscribe(this.handlers[6], null, null);
    //                 A      B      C      D      E      F      G
    expectTriggered = [true, false, false, false, true,  true,  false];
    this.doTestPublish("t1","s1",expectTriggered);
}

TestEventPubSub.prototype.testUnsubscribe3 = function() {
    this.router.unsubscribe(this.handlers[0], "t1", "s1");
    this.router.unsubscribe(this.handlers[6], null, null);
    //                 A      B      C      D      E      F      G
    expectTriggered = [false, false, false, false, true,  true,  false];
    this.doTestPublish("t1","s1",expectTriggered);
}

TestEventPubSub.prototype.testUnsubscribe4 = function() {
    this.router.unsubscribe(this.handlers[4], "t1");
    this.router.unsubscribe(this.handlers[5], null, "s1");
    //                 A      B      C      D      E      F      G
    expectTriggered = [true,  false, false, false, false, false, true];
    this.doTestPublish("t1","s1",expectTriggered);
}

TestEventPubSub.prototype.testUnsubscribe5 = function() {
    this.router.unsubscribe(this.handlers[6]);
    this.router.unsubscribe(this.handlers[4], "t1");
    this.router.unsubscribe(this.handlers[5], null, "s1");
    this.router.unsubscribe(this.handlers[0], "t1", "s1");
    //                 A      B      C      D      E      F      G
    expectTriggered = [false, false, false, false, false, false, false];
    this.doTestPublish("t1","s1",expectTriggered);
}

TestEventPubSub.prototype.testXXX = function() {
    assertEquals( "testXXX", 4, 2+2 );
}

// Expose functions at global level of frame for JSUnit

// Specify order of tests
exposeTestFunctionNames = TestEventPubSub.exposeTestFunctionNames;

// JSUnit page setup
function setUpPage() {
    setUpPageForJSUnit(TestEventPubSub, this);
    // Helper functions to current frame
    this.doTestPublish = TestEventPubSub.prototype.doTestPublish
}

// End.
