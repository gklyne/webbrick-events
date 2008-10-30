// $Id$
//
// Unit test for event serialization and parsing
//

// Create test suite object
function TestEventSerializer() {
}

// Specify order of tests: 
TestEventSerializer.exposeTestFunctionNames = function() {
    return [ "TestEventSerializer1"
           , "testMakeSubscribeData1"
           , "testMakeSubscribeData2"
           , "testMakeSubscribeData3"
           , "testMakeSubscribeData4"
           , "testMakeUnsubscribeData"
           , "testMakeEnvelopeData1"
           , "testMakeEnvelopeData2"
           , "testMakeClosedownData"
           , "testMakeIdleData"
           , "testParseSubscribeData1"
           , "testParseSubscribeData2"
           , "testParseSubscribeData3"
           , "testParseSubscribeData4"
           , "testParseUnsubscribeData1"
           , "testParseUnsubscribeData2"
           , "testParseUnsubscribeData3"
           , "testParseUnsubscribeData4"
           , "testParseUnsubscribeData5"
           , "testParseEnvelopeData1"
           , "testParseEnvelopeData2"
           , "testParseEnvelopeData3"
           , "testParseEnvelopeData4"
           , "testParseMessageData1"
           , "testParseMessageData2"
           , "testParseMessageData3"
           , "testParseMessageData4"
           , "testParseMessageData5"
           , "testParseMessageData6"
           , "testParseMessageData7"
           , "testParseMessageData8"
           , "testParseMessageData9"
           , "testParseMessageData10"
           , "testParseMessageData11"
           , "testParseMessageData12"
           , "TestEventSerializer2"
           , "testXXX"
           ];
}

// Setup and teardown

TestEventSerializer.prototype.setUp = function() {
    this.ev  = makeEvent("s://auth.b/path/type/d#frag", 
                         "s://auth.b/path/source/d#frag", 
                         "--- payload ---");
    this.env = new EventEnvelope(this.ev,"R1").nextHop("R2").nextHop("R3");
}

TestEventSerializer.prototype.tearDown = function() {
    this.ev  = null;
    this.env = null;
}

// Test cases

TestEventSerializer.prototype.TestEventSerializer1 = function() {
    assertEquals("TestEventSerializer1", this.env.flatten(), [this.ev, ['R1', 'R2', 'R3']]);
}

TestEventSerializer.prototype.TestEventSerializer2 = function() {
    assertEquals("TestEventSerializer2", this.env.flatten(), [this.ev, ['R1', 'R2', 'R3']]);
}

// makeSubscribeData

TestEventSerializer.prototype.testMakeSubscribeData1 = function() {
    assertEquals("testMakeSubscribeData1", 
        makeSubscribeData(11, this.ev.getType(), this.ev.getSource()),
        [11, "s://auth.b/path/type/d#frag", "s://auth.b/path/source/d#frag"]);
}

TestEventSerializer.prototype.testMakeSubscribeData2 = function() {
    assertEquals("testMakeSubscribeData2", 
        makeSubscribeData(22, null, this.ev.getSource()),
        [22, null, "s://auth.b/path/source/d#frag"]);
}

TestEventSerializer.prototype.testMakeSubscribeData3 = function() {
    assertEquals("testMakeSubscribeData3", 
        makeSubscribeData(33, this.ev.getType(), null),
        [33, "s://auth.b/path/type/d#frag", null]);
}

TestEventSerializer.prototype.testMakeSubscribeData4 = function() {
    assertEquals("testMakeSubscribeData4", 
        makeSubscribeData(44, null, null),
        [44, null, null]);
}

// makeUnsubscribeData, makeEnvelopeData

TestEventSerializer.prototype.testMakeUnsubscribeData = function() {
    assertEquals("testMakeUnsubscribeData", 
        makeUnsubscribeData(this.ev.getType(), this.ev.getSource()),
        [0, "s://auth.b/path/type/d#frag", "s://auth.b/path/source/d#frag"]);
}

TestEventSerializer.prototype.testMakeEnvelopeData1 = function() {
    assertEquals("testMakeEnvelopeData1",
        makeEnvelopeData(this.env),
        '["forward", '+
        '[["R1", "R2", "R3"], '+
         '"s://auth.b/path/type/d#frag", '+
         '"s://auth.b/path/source/d#frag", '+
         '"--- payload ---"]]' );
}

TestEventSerializer.prototype.testMakeEnvelopeData2 = function() {
    this.ev2  = makeEvent("s://auth.b/path/type/d#frag", "s://auth.b/path/source/d#frag", null);
    this.env2 = new EventEnvelope(this.ev2,"R1").nextHop("R2").nextHop("R3")
    assertEquals("testMakeEnvelopeData2",
        makeEnvelopeData(this.env2),
        '["forward", '+
        '[["R1", "R2", "R3"], '+
         '"s://auth.b/path/type/d#frag", '+
         '"s://auth.b/path/source/d#frag", '+
         'null]]');
}

// makeClosedownData, makeIdleData

TestEventSerializer.prototype.testMakeClosedownData = function() {
    assertEquals("testMakeClosedownData", makeClosedownData(), '["closedown", []]');
}

TestEventSerializer.prototype.testMakeIdleData = function() {
    assertEquals("testMakeIdleData", makeIdleData(), '["idle", []]');
}

// parseSubscribeData

TestEventSerializer.prototype.testParseSubscribeData1 = function() {
    var s = [11, null, null];
    var testps1 = parseSubscribeData(s);
    assertEquals("testParseSubscribeData1",
        [11, null, null],
        testps1);
}

TestEventSerializer.prototype.testParseSubscribeData2 = function() {
    var s = [22, "s://auth.b/path/type/d#frag", "s://auth.b/path/source/d#frag"];
    var testps2 = parseSubscribeData(s);
    assertEquals("testParseSubscribeData2",
        [22, 's://auth.b/path/type/d#frag', 's://auth.b/path/source/d#frag'],
        testps2);
}

TestEventSerializer.prototype.testParseSubscribeData3 = function() {
    var s = [33, null, "s:\\/\\/auth.b\\/path\\/source\\/d#frag"];
    var testps3 = parseSubscribeData(s);
    assertEquals("testParseSubscribeData3", 
        testps3,
        [33, null, 's:\\/\\/auth.b\\/path\\/source\\/d#frag']);
}

TestEventSerializer.prototype.testParseSubscribeData4 = function() {
    var s = [44, 999, "s:\\/\\/auth.b\\/path\\/source\\/d#frag"];
    var testps4 = parseSubscribeData(s);
    assertEquals("testParseSubscribeData4", testps4, null);
}

// parseUnsubscribeData

TestEventSerializer.prototype.testParseUnsubscribeData1 = function() {
    var s = [0, "s://auth.b/path/type/d#frag", "s://auth.b/path/source/d#frag"];
    var testpu1 = parseUnsubscribeData(s);
    assertEquals("testParseUnsubscribeData1",
        testpu1,
        ['s://auth.b/path/type/d#frag', 's://auth.b/path/source/d#frag']);
}

TestEventSerializer.prototype.testParseUnsubscribeData2 = function() {
    var s = [0, null, "s:\\/\\/auth.b\\/path\\/source\\/d#frag"];
    var testpu2 = parseUnsubscribeData(s);
    assertEquals("testParseUnsubscribeData2",
        testpu2, 
        [null, 's:\\/\\/auth.b\\/path\\/source\\/d#frag']);
}

TestEventSerializer.prototype.testParseUnsubscribeData3 = function() {
    var s = [0, "s://auth.b/path/type/d#frag", null];
    var testpu3 = parseUnsubscribeData(s);
    assertEquals("testParseUnsubscribeData3", testpu3, ['s://auth.b/path/type/d#frag', null]);
}

TestEventSerializer.prototype.testParseUnsubscribeData4 = function() {
    var s = [0, 999, "s:\\/\\/auth.b\\/path\\/source\\/d#frag"];
    var testpu4 = parseUnsubscribeData(s);
    assertEquals("testParseUnsubscribeData4", testpu4, null);
}

TestEventSerializer.prototype.testParseUnsubscribeData5 = function() {
    var s = [0, "s:\\/\\/auth.b\\/path\\/type\\/d#frag", 999];
    var testpu5 = parseUnsubscribeData(s);
    assertEquals("testParseUnsubscribeData5", testpu5, null);
}

// parseEnvelopeData

TestEventSerializer.prototype.testParseEnvelopeData1 = function() {
    var s = '["forward", [["R1","R2","R3"],"ev:typ","ev:src","payload"]]';
    var testpe1 = parseEnvelopeData(s);
    assertEquals("testParseEnvelopeData1", 
        testpe1,
        [["R1","R2","R3"], "ev:typ", "ev:src", "payload"]);
}

TestEventSerializer.prototype.testParseEnvelopeData2 = function() {
    var s = '["forward", [["R1",null,"R3"], null, "ev:src", null]]';
    var testpe2 = parseEnvelopeData(s);
    assertEquals("testParseEnvelopeData2", 
        testpe2,
        [["R1",null,"R3"], null, "ev:src", null]);
}

TestEventSerializer.prototype.testParseEnvelopeData3 = function() {
    var s = '["forward", [(<R1>,<R2>,<R3>),**,<ev:src>,"payload"]]';
    var testpe3 = parseEnvelopeData(s);
    assertEquals("testParseEnvelopeData3", testpe3, null);
}

TestEventSerializer.prototype.testParseEnvelopeData4 = function() {
    var s = '["forward", [(<R1>,<R2>,<R3>),<ev:typ>,**,"payload"]]';
    var testpe4 = parseEnvelopeData(s);
    assertEquals("testParseEnvelopeData4", testpe4, null);
}

// parseMessageData

TestEventSerializer.prototype.testParseMessageData1 = function() {
    var s = '["forward", '+
             '[["R1","R2","R3"], '+
              '"http://id.webbrick.co.uk/events/subscribe", '+
              '"ev:type", '+
              '[11, "s://auth.b/path/type/d#frag", "s://auth.b/path/source/d#frag"]]]';
    var r = [ "forward", 
              [["R1","R2","R3"], 
              "http://id.webbrick.co.uk/events/subscribe",
              "ev:type", 
              [11, 's://auth.b/path/type/d#frag', 's://auth.b/path/source/d#frag']]];
    assertEquals("testParseMessageData1", parseMessageData(s), r);
}

TestEventSerializer.prototype.testParseMessageData2 = function() {
    var s = '["forward", '+
             '[[], '+
              '"s://auth.b/path/type/d#frag", '+
              '"s://auth.b/path/source/d#frag", '+
              'null]]';
    var r = [ 'forward', 
              [ [], 's://auth.b/path/type/d#frag', 's://auth.b/path/source/d#frag',
                null]];
    assertEquals("testParseMessageData2", parseMessageData(s), r);
}

TestEventSerializer.prototype.testParseMessageData3 = function() {
    var s = '["forward", '+
             '[["R1","R2","R3"], '+
              '"ev:typ", '+
              '"ev:src", '+
              '"payload"]]';
    var r = [ 'forward', 
              [ ['R1', 'R2', 'R3'], 'ev:typ', 'ev:src', 
                'payload']];
    assertEquals("testParseMessageData3", parseMessageData(s), r);
}

TestEventSerializer.prototype.testParseMessageData4 = function() {
    var s = '["forward", '+
             '[["R1","R2","R3"], '+
              '"ev:typ", '+
              '**, '+
              '"payload"]]';
    var r = null;
    assertEquals("testParseMessageData4", parseMessageData(s), r);
}

TestEventSerializer.prototype.testParseMessageData5 = function() {
    var s = '["forward", '+
             '[["R1","R2","R3"], '+
              '"ev:typ", '+
              'null, '+
              '"payload"]]';
    var r = [ 'forward', 
              [ ['R1', 'R2', 'R3'], 'ev:typ', null, 
                'payload']];
    assertEquals("testParseMessageData5", parseMessageData(s), r);
}

TestEventSerializer.prototype.testParseMessageData6 = function() {
    var s = '["closedown", []]';
    var r = [ "closedown", [] ];
    assertEquals("testParseMessageData6", parseMessageData(s), r);
}

TestEventSerializer.prototype.testParseMessageData7 = function() {
    var s = '["closedown", ["foobar"]]';
    var r = null;
    assertEquals("testParseMessageData7", parseMessageData(s), r);
};

TestEventSerializer.prototype.testParseMessageData8 = function() {
    var s = '["idle", []]';
    var r = [ "idle", [] ];
    assertEquals("testParseMessageData8", parseMessageData(s), r);
;}

TestEventSerializer.prototype.testParseMessageData9 = function() {
    var s = '["idle", ["foobar"]]';
    var r = null;
    assertEquals("testParseMessageData9", parseMessageData(s), r);
};

TestEventSerializer.prototype.testParseMessageData10 = function() {
    var s = '["idle"]';
    var r = null;
    assertEquals("testParseMessageData10", parseMessageData(s), r);
};

TestEventSerializer.prototype.testParseMessageData11 = function() {
    var s = '["idle", 666]';
    var r = null;
    assertEquals("testParseMessageData11", parseMessageData(s), r);
};

TestEventSerializer.prototype.testParseMessageData12 = function() {
    var s = '["foobar", []]';
    var r = null;
    assertEquals("testParseMessageData12", parseMessageData(s), r);
};

// XXX

TestEventSerializer.prototype.testXXX = function() {
    assertEquals("testXXX", 4, 2+2);
};

// Expose functions at global level of frame for JSUnit

// JSUnit page setup
function setUpPage() {
    info("setUpPage", "TestEventSerializer");
    setUpPageForJSUnit(TestEventSerializer, this);
}

// Return list of tests for JSunit
exposeTestFunctionNames = TestEventSerializer.exposeTestFunctionNames;

// End.
