# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Unit test for event serialization and parsing
# See http://pyunit.sourceforge.net/pyunit.html
#

import sys
import unittest
import re

sys.path.append("../..")

from EventLib.Event           import Event, makeEvent
from EventLib.EventEnvelope   import EventEnvelope
from EventLib.EventSerializer import makeEnvelopeData, makeClosedownData, makeIdleData
from EventLib.EventSerializer import parseEnvelopeData, parseMessageData
from EventLib                 import URI

es = re.compile(r"\\/")    # match escaped slash in string

# Test class
class TestEventSerializer(unittest.TestCase):

    def setUp(self):
        self.ev  = makeEvent("s://auth.b/path/type/d#frag", "s://auth.b/path/source/d#frag", "--- payload ---")
        self.env = EventEnvelope(self.ev,"R1").nextHop("R2").nextHop("R3")
        return

    def tearDown(self):
        self.ev  = None
        self.env = None
        return

    # Test cases
    # NOTE: simplejson escapes forward slashes to prevent </script> attacks.

    def testEventEnvelope1(self):
        self.assertEqual( self.env.flatten(), (self.ev, ['R1', 'R2', 'R3']) )

    def testEventEnvelope2(self):
        self.assertEqual( self.env.flatten(), (self.ev, ['R1', 'R2', 'R3']) )

    def testMakeEnvelopeData1(self):
        self.assertEqual( es.sub("/", makeEnvelopeData(self.env)),
            '["forward", '+
            '[["R1", "R2", "R3"], '+
             '"s://auth.b/path/type/d#frag", '+
             '"s://auth.b/path/source/d#frag", '+
             '"--- payload ---"]]' )

    def testMakeEnvelopeData2(self):
        self.ev2  = makeEvent("s://auth.b/path/type/d#frag", "s://auth.b/path/source/d#frag", None)
        self.env2 = EventEnvelope(self.ev2,"R1").nextHop("R2").nextHop("R3")
        self.assertEqual( es.sub("/", makeEnvelopeData(self.env2)),
            '["forward", '+
            '[["R1", "R2", "R3"], '+
             '"s://auth.b/path/type/d#frag", '+
             '"s://auth.b/path/source/d#frag", '+
             'null]]' )

    def testMakeEnvSubscribeData1(self):
        payload = [11, self.ev.getType(), self.ev.getSource()]
        ev      = makeEvent(URI.EventSubscribeType, "agent", payload)
        env     = EventEnvelope(ev, "router")
        self.assertEqual( es.sub("/", makeEnvelopeData(env)),
            '["forward", '+
            '[["router"], '+
             '"http://id.webbrick.co.uk/events/subscribe", '+
             '"agent", '+
             '[11, "s://auth.b/path/type/d#frag", "s://auth.b/path/source/d#frag"]]]' )

    def testMakeEnvSubscribeData2(self):
        payload = [22, None, self.ev.getSource()]
        ev      = makeEvent(URI.EventSubscribeType, "agent", payload)
        env     = EventEnvelope(ev, "router")
        self.assertEqual( es.sub("/", makeEnvelopeData(env)),
            '["forward", '+
            '[["router"], '+
             '"http://id.webbrick.co.uk/events/subscribe", '+
             '"agent", '+
             '[22, null, "s://auth.b/path/source/d#frag"]]]' )

    def testMakeEnvSubscribeData3(self):
        payload = [33, self.ev.getType(), None]
        ev      = makeEvent(URI.EventSubscribeType, "agent", payload)
        env     = EventEnvelope(ev, "router")
        self.assertEqual( es.sub("/", makeEnvelopeData(env)),
            '["forward", '+
            '[["router"], '+
             '"http://id.webbrick.co.uk/events/subscribe", '+
             '"agent", '+
             '[33, "s://auth.b/path/type/d#frag", null]]]' )

    def testMakeEnvSubscribeData4(self):
        payload = [44, None, None]
        ev      = makeEvent(URI.EventSubscribeType, "agent", payload)
        env     = EventEnvelope(ev, "router")
        self.assertEqual( es.sub("/", makeEnvelopeData(env)),
            '["forward", '+
            '[["router"], '+
             '"http://id.webbrick.co.uk/events/subscribe", '+
             '"agent", '+
             '[44, null, null]]]' )

    def testMakeEnvUnsubscribeData(self):
        payload = [0, self.ev.getType(), self.ev.getSource()]
        ev      = makeEvent(URI.EventSubscribeType, "agent", payload)
        env     = EventEnvelope(ev, "router")
        self.assertEqual( es.sub("/", makeEnvelopeData(env)),
            '["forward", '+
            '[["router"], '+
             '"http://id.webbrick.co.uk/events/subscribe", '+
             '"agent", '+
             '[0, "s://auth.b/path/type/d#frag", "s://auth.b/path/source/d#frag"]]]' )

    def testMakeClosedownData(self):
        self.assertEqual( makeClosedownData(), '["closedown", []]' )

    def testMakeIdleData(self):
        self.assertEqual( makeIdleData(), '["idle", []]' )

    def testParseEnvelopeData1(self):
        testpe1 = parseEnvelopeData('["forward", [["R1","R2","R3"],"ev:typ","ev:src","payload"]]')
        self.assertEqual(testpe1, [["R1","R2","R3"], "ev:typ", "ev:src", "payload"])

    def testParseEnvelopeData2(self):
        testpe2 = parseEnvelopeData('["forward", [["R1",null,"R3"], null, "ev:src", null]]')
        self.assertEqual(testpe2, [["R1",None,"R3"], None, "ev:src", None])

    def testParseEnvelopeData3(self):
        testpe3 = parseEnvelopeData('["forward", [(<R1>,<R2>,<R3>),**,<ev:src>,"payload"]]')
        assert testpe3 is None

    def testParseEnvelopeData4(self):
        testpe4 = parseEnvelopeData('["forward", [(<R1>,<R2>,<R3>),<ev:typ>,**,"payload"]]')
        assert testpe4 is None

    def testParseEnvSubscribeData1(self):
        testps = parseEnvelopeData(
            '["forward", '+
             '[["R1","R2","R3"], '+
              '"http://id.webbrick.co.uk/events/subscribe", "agent", '+
              '[11, "s://auth.b/path/type/d#frag", "s://auth.b/path/source/d#frag"]]]')
        self.assertEqual(testps, 
            [["R1","R2","R3"], URI.EventSubscribeType, "agent",
             [11, 's://auth.b/path/type/d#frag', 's://auth.b/path/source/d#frag']] )

    def testParseEnvSubscribeData2(self):
        testps = parseEnvelopeData(
            '["forward", '+
             '[["R1","R2"], '+
              '"http:\\/\\/id.webbrick.co.uk\\/events\\/subscribe","agent", '+
              '[22, null, "s:\\/\\/auth.b\\/path\\/source\\/d#frag"]]]')
        self.assertEqual(testps, 
            [["R1","R2"], URI.EventSubscribeType, "agent",
             [22, None, 's://auth.b/path/source/d#frag']] )

    def testParseEnvSubscribeData3(self):
        testps = parseEnvelopeData(
            '["forward", '+
             '[["R1","R2","R3"], '+
              '"http://id.webbrick.co.uk/events/subscribe", "agent", '+
              '[11, **, "s:\\/\\/auth.b\\/path\\/source\\/d#frag"]]]')
        assert testps is None

    def testParseEnvUnsubscribeData1(self):
        testpu = parseEnvelopeData(
            '["forward", '+
             '[["R1","R2","R3"], '+
              '"http://id.webbrick.co.uk/events/subscribe", "agent", '+
              '[0, "s://auth.b/path/type/d#frag", "s://auth.b/path/source/d#frag"]]]')
        self.assertEqual(testpu, 
            [["R1","R2","R3"], URI.EventSubscribeType, "agent",
             [0, 's://auth.b/path/type/d#frag', 's://auth.b/path/source/d#frag']] )

    def testParseEnvUnsubscribeData2(self):
        testpu = parseEnvelopeData(
            '["forward", '+
             '[["R1","R2","R3"], '+
              '"http://id.webbrick.co.uk/events/subscribe", "agent", '+
              '[0, null, "s:\\/\\/auth.b\\/path\\/source\\/d#frag"]]]')
        self.assertEqual(testpu, 
            [["R1","R2","R3"], URI.EventSubscribeType, "agent",
             [0, None, 's://auth.b/path/source/d#frag']] )

    def testParseEnvUnsubscribeData3(self):
        testpu = parseEnvelopeData(
            '["forward", '+
             '[["R1","R2","R3"], '+
              '"http://id.webbrick.co.uk/events/subscribe", "agent", '+
              '[0, "s://auth.b/path/type/d#frag", null]]]')
        self.assertEqual(testpu, 
            [["R1","R2","R3"], URI.EventSubscribeType, "agent",
             [0, 's://auth.b/path/type/d#frag', None]] )

    def testParseEnvUnsubscribeData4(self):
        testpu = parseEnvelopeData(
            '["forward", '+
             '[["R1","R2","R3"], '+
              '"http://id.webbrick.co.uk/events/subscribe", "agent", '+
              '[0, **, "s:\\/\\/auth.b\\/path\\/source\\/d#frag"]]]')
        assert testpu is None

    def testParseEnvUnsubscribeData5(self):
        testpu = parseEnvelopeData('[0, "s:\\/\\/auth.b\\/path\\/type\\/d#frag", **]')
        testpu = parseEnvelopeData(
            '["forward", '+
             '[["R1","R2","R3"], '+
              '"http://id.webbrick.co.uk/events/subscribe", "agent", '+
              '[0, "s:\\/\\/auth.b\\/path\\/type\\/d#frag", **]]]')
        assert testpu is None

    def testParseMessageData1(self):
        testpm1 = parseMessageData(
            '["forward", '+
             '[["R1","R2","R3"], '+
              '"http://id.webbrick.co.uk/events/subscribe", '+
              '"ev:type", '+
              '[11, "s://auth.b/path/type/d#frag", "s://auth.b/path/source/d#frag"]]]')
        self.assertEqual(testpm1, 
            [ "forward", 
              [["R1","R2","R3"], 
              "http://id.webbrick.co.uk/events/subscribe",
              "ev:type", 
              [11, 's://auth.b/path/type/d#frag', 's://auth.b/path/source/d#frag']]])

    def testParseMessageData2(self):
        testpm2 = parseMessageData(
            '["forward", '+
             '[[], '+
              '"s://auth.b/path/type/d#frag", '+
              '"s://auth.b/path/source/d#frag", '+
              'null]]')
        self.assertEqual(testpm2, 
            ['forward', [[], 's://auth.b/path/type/d#frag', 's://auth.b/path/source/d#frag', None]])

    def testParseMessageData3(self):
        testpm3 = parseMessageData(
            '["forward", '+
             '[["R1","R2","R3"], '+
              '"ev:typ", '+
              '"ev:src", '+
              '"payload"]]')
        self.assertEqual(testpm3, ['forward', [['R1', 'R2', 'R3'], 'ev:typ', 'ev:src', 'payload']])

    def testParseMessageData4(self):
        testpm4 = parseMessageData(
            '["forward", '+
             '[["R1","R2","R3"], '+
              '"ev:typ", '+
              '**, '+
              '"payload"]]')
        assert testpm4 is None

    def testParseMessageData5(self):
        testpm5 = parseMessageData(
            '["forward", '+
             '[["R1","R2","R3"], '+
              '"ev:typ", '+
              'null, '+
              '"payload"]]')
        self.assertEqual(testpm5, ['forward', [['R1', 'R2', 'R3'], 'ev:typ', None, 'payload']])

    def testParseMessageData6(self):
        testpm6 = parseMessageData('["closedown", []]')
        self.assertEqual(testpm6, ['closedown',[]])
        self.assertEqual(testpm6, ['closedown',[]])

    def testParseMessageData7(self):
        testpm7 = parseMessageData('["closedown", ["foobar"]]')
        assert testpm7 is None

    def testParseMessageData8(self):
        testpm8 = parseMessageData('["idle", []]')
        self.assertEqual(testpm8, ['idle',[]])

    def testParseMessageData9(self):
        testpm9 = parseMessageData('["idle", ["foobar"]]')
        assert testpm9 is None

    def testParseMessageData10(self):
        testpm10 = parseMessageData('["idle"]')
        assert testpm10 is None

    def testParseMessageData11(self):
        testpm11 = parseMessageData('["idle", 666]')
        assert testpm11 is None

    def testParseMessageData12(self):
        testpm12 = parseMessageData('["foobar", []]')
        assert testpm12 is None

    # Sentinel/placeholder tests

    def testUnits(self):
        assert (True)

    def testComponents(self):
        assert (True)

    def testIntegration(self):
        assert (True)

    def testPending(self):
        assert (True)

# Assemble test suite
from MiscLib import TestUtils

def getTestSuite(select="unit"):
    """
    Get test suite

    select  is one of the following:
            "unit"      return suite of unit tests only
            "component" return suite of unit and component tests
            "all"       return suite of unit, component and integration tests
            "pending"   return suite of pending tests
            name        a single named test to be run
    """
    testdict = {
        "unit": 
            [ "testUnits"
            , "testEventEnvelope1"
            , "testMakeEnvelopeData1"
            , "testMakeEnvelopeData2"
            , "testMakeEnvSubscribeData1"
            , "testMakeEnvSubscribeData2"
            , "testMakeEnvSubscribeData3"
            , "testMakeEnvSubscribeData4"
            , "testMakeEnvUnsubscribeData"
            , "testMakeClosedownData"
            , "testMakeIdleData"
            , "testParseEnvelopeData1"
            , "testParseEnvelopeData2"
            , "testParseEnvelopeData3"
            , "testParseEnvelopeData4"
            , "testParseEnvSubscribeData1"
            , "testParseEnvSubscribeData2"
            , "testParseEnvSubscribeData3"
            , "testParseEnvUnsubscribeData1"
            , "testParseEnvUnsubscribeData2"
            , "testParseEnvUnsubscribeData3"
            , "testParseEnvUnsubscribeData4"
            , "testParseEnvUnsubscribeData5"
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
            , "testEventEnvelope2"
            ],
        "component":
            [ "testComponents"
            ],
        "integration":
            [ "testIntegration"
            ],
        "zzpending":
            [ "testPending"
            ]
        }
    return TestUtils.getTestSuite(TestEventSerializer, testdict, select=select)

# Run unit tests directly from command line
if __name__ == "__main__":
    TestUtils.runTests("TestEventSerializer.log", getTestSuite, sys.argv)

# End.
