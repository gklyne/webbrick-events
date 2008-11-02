# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Unit testing for basic event type
# See http://pyunit.sourceforge.net/pyunit.html
#

import sys, logging
import unittest

sys.path.append("../..")

from EventLib.Event import Event, makeEvent
from EventLib.URI   import EventDefaultType
from MiscLib        import TestUtils

class DummyClass(object):
    def __init__(self):
        self._stuff = "abc"

# Test class
class TestEventVals(unittest.TestCase):

    def setUp(self):
        return

    def tearDown(self):
        return

    # Test cases

    def testEventCreate1(self):
        e = Event("EventTypeUri", "EventSourceUri", "payload")
        assert e.getType()    == "EventTypeUri",   "testEventCreate1, getType"
        assert e.getSource()  == "EventSourceUri", "testEventCreate1, getSource"
        assert e.getPayload() == "payload",        "testEventCreate1, getPayload"

    def testEventCreate2(self):
        e = Event("EventTypeUri", "", None)
        assert e.getType()    == "EventTypeUri",   "testEventCreate2, getType"
        assert e.getSource()  == "",               "testEventCreate2, getSource"
        assert e.getPayload() == None,             "testEventCreate2, getPayload"

    def testMakeEvent1(self):
        e = makeEvent("EventTypeUri", "EventSourceUri", "payload")
        assert e.getType()    == "EventTypeUri",   "testMakeEvent1, getType"
        assert e.getSource()  == "EventSourceUri", "testMakeEvent1, getSource"
        assert e.getPayload() == "payload",        "testMakeEvent1, getPayload"

    def testMakeEvent2(self):
        e = makeEvent(evtype="EventTypeUri", source="EventSourceUri", payload="payload")
        assert e.getType()    == "EventTypeUri",   "testMakeEvent2, getType"
        assert e.getSource()  == "EventSourceUri", "testMakeEvent2, getSource"
        assert e.getPayload() == "payload",        "testMakeEvent2, getPayload"

    def testMakeEvent3(self):
        e = makeEvent(evtype="EventTypeUri")
        assert e.getType()    == "EventTypeUri",   "testMakeEvent3, getType"
        assert e.getSource()  == "",               "testMakeEvent3, getSource"
        assert e.getPayload() == None,             "testMakeEvent3, getPayload"

    def testMakeEvent4(self):
        e = makeEvent(source="EventSourceUri")
        assert e.getType()    == EventDefaultType, "testMakeEvent4, getType"
        assert e.getSource()  == "EventSourceUri", "testMakeEvent4, getSource"
        assert e.getPayload() == None,             "testMakeEvent4, getPayload"

    def testMakeEvent5(self):
        e = makeEvent()
        assert e.getType()    == EventDefaultType, "testMakeEvent5, getType"
        assert e.getSource()  == "",               "testMakeEvent5, getSource"
        assert e.getPayload() == None,             "testMakeEvent5, getPayload"

    def testEventEqual1(self):
        e1 = Event("EventTypeUri", "EventSourceUri", "payload")
        e2 = makeEvent(evtype="EventTypeUri", source="EventSourceUri", payload="payload")
        self.assertEqual(e1, e2, "testEventEqual1")

    def testEventEqual2(self):
        e1 = Event("EventTypeUri", "", None)
        e2 = makeEvent(evtype="EventTypeUri")
        self.assertEqual(e1, e2, "testEventEqual2")

    def testEventEqual3(self):
        e1 = Event("EventTypeUri1", "EventSourceUri", "payload")
        e2 = makeEvent(evtype="EventTypeUri2", source="EventSourceUri", payload="payload")
        self.assertNotEqual(e1, e2, "testEventEqual3")

    def testEventEqual4(self):
        e1 = Event("EventTypeUri", "EventSourceUri1", "payload")
        e2 = makeEvent(evtype="EventTypeUri", source="EventSourceUri2", payload="payload")
        self.assertNotEqual(e1, e2, "testEventEqual4")

    def testEventEqual5(self):
        e1 = Event("EventTypeUri", "EventSourceUri", "payload1")
        e2 = makeEvent(evtype="EventTypeUri", source="EventSourceUri", payload="payload2")
        self.assertNotEqual(e1, e2, "testEventEqual5")

    def testEventEqual6(self):
        e2 = makeEvent(evtype="EventTypeUri", source="EventSourceUri2", payload="payload")
        self.assertNotEqual(None, e2, "testEventEqual6")

    def testEventEqual7(self):
        e1 = Event("EventTypeUri", "EventSourceUri", "payload1")
        self.assertNotEqual(e1, None, "testEventEqual7")

    def testEventEqual8(self):
        # test against object that is not an event
        e1 = Event("EventTypeUri", "EventSourceUri", "payload1")
        self.assertNotEqual(e1, DummyClass(), "testEventEqual7")

    def testEventString1(self):
        e = Event("EventTypeUri", "EventSourceUri", "payload")
        es = """Event(evtype="EventTypeUri", source="EventSourceUri")"""
        self.assertEqual(str(e), es, "testEventString1: "+str(e))

    # Sentinel/placeholder tests

    def testUnits(self):
        assert (True)

    def testComponents(self):
        assert (True)

    def testIntegration(self):
        assert (True)

    def testPending(self):
        assert (False), "Pending test"

# Assemble test suite
#
# Select is:
#   "unit"      return suite of unit tests only
#   "component" return suite of unit and component tests
#   "all"       return suite of unit, component and integration tests
#   name        a single named test to be run
#
def getTestSuite(select="unit"):
    testdict = {
        "unit": 
            [ "testEventCreate1"
            , "testEventCreate2"
            , "testMakeEvent1"
            , "testMakeEvent2"
            , "testMakeEvent3"
            , "testMakeEvent4"
            , "testMakeEvent5"
            , "testEventEqual1"
            , "testEventEqual2"
            , "testEventEqual3"
            , "testEventEqual4"
            , "testEventEqual5"
            , "testEventEqual6"
            , "testEventEqual7"
            , "testEventEqual8"
            , "testEventString1"
            , "testUnits"
            ],
        "component":
            [ "testComponents"
            ],
        "integration":
            [ "testIntegration"
            ],
        "pending":
            [ "testPending"
            ]
        }
    return TestUtils.getTestSuite(TestEventVals, testdict, select=select)

# Run unit tests directly from command line
if __name__ == "__main__":
    TestUtils.runTests("TestEvent.log", getTestSuite, sys.argv)

# End.
