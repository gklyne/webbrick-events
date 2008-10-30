# $Id$
#
# Copyright (c) 2008 O2M8 Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Unit testing for event handler values.
# See http://pyunit.sourceforge.net/pyunit.html
#

import sys
import unittest
import logging

sys.path.append("../..")
from EventLib.EventHandler import EventHandler, makeEventHandler
from EventLib.Event        import Event, makeEvent
from EventLib.Status       import Status, StatusVal
from EventLib.SyncDeferred import makeDeferred
from EventLib              import URI

# Callback functions
def handleEvent(handler, event):
    s = Status(URI.Status_TRIGGERED, event.getType())
    return makeDeferred(s)

def initSub(handler, status):
    s = Status(URI.Status_SUBSCRIBED, str(status))
    return makeDeferred(s)

def endSub(handler, status):
    s = Status(URI.Status_UNSUBSCRIBED, str(status))
    return makeDeferred(s)

def handleEventException(handler, event):
    raise Exception("handleEventException - exception thrown in event handler")

# Test class
class TestEventHandler(unittest.TestCase):

    def setUp(self):
        return

    def tearDown(self):
        return

    # Test cases

    def testCreateEventHandler1(self):
        eh = EventHandler("EventHandlerUri", handleEvent, initSub, endSub)
        self.assertEqual(eh.getUri(), "EventHandlerUri")
        ev = makeEvent("EventUri", source=eh.getUri())
        sh = eh.handleEvent(ev).syncValue()
        self.assertEqual(sh, Status(URI.Status_TRIGGERED, ev.getType()))
        self.assertEqual(sh.getMessage(), ev.getType())
        ss = eh.initSubscription(StatusVal.OK).syncValue()
        self.assertEqual(ss, Status(URI.Status_SUBSCRIBED, str(StatusVal.OK)))
        self.assertEqual(ss.getMessage(), str(StatusVal.OK))
        su = eh.endSubscription(StatusVal.OK).syncValue()
        self.assertEqual(su, Status(URI.Status_UNSUBSCRIBED, str(StatusVal.OK)))
        self.assertEqual(su.getMessage(), str(StatusVal.OK))
        return

    def testMakeEventHandler1(self):
        eh = makeEventHandler("EventHandlerUri", handleEvent, initSub, endSub)
        self.assertEqual(eh.getUri(), "EventHandlerUri")
        ev = makeEvent("EventUri", source=eh.getUri())
        sh = eh.handleEvent(ev).syncValue()
        self.assertEqual(sh, Status(URI.Status_TRIGGERED, ev.getType()))
        self.assertEqual(sh.getMessage(), ev.getType())
        ss = eh.initSubscription(StatusVal.OK).syncValue()
        self.assertEqual(ss, Status(URI.Status_SUBSCRIBED, str(StatusVal.OK)))
        self.assertEqual(ss.getMessage(), str(StatusVal.OK))
        su = eh.endSubscription(StatusVal.OK).syncValue()
        self.assertEqual(su, Status(URI.Status_UNSUBSCRIBED, str(StatusVal.OK)))
        self.assertEqual(su.getMessage(), str(StatusVal.OK))
        return

    def testMakeEventHandler2(self):
        eh = makeEventHandler("EventHandlerUri")
        self.assertEqual(eh.getUri(), "EventHandlerUri")
        ev = makeEvent("EventUri", source=eh.getUri())
        sh = eh.handleEvent(ev).syncValue()
        self.assertEqual(sh, StatusVal.OK)
        ss = eh.initSubscription(StatusVal.OK).syncValue()
        self.assertEqual(sh, StatusVal.OK)
        ss = eh.endSubscription(StatusVal.OK).syncValue()
        self.assertEqual(sh, StatusVal.OK)
        return

    def testMakeEventHandler3(self):
        eh = makeEventHandler()
        eu = eh.getUri()
        assert eu.startswith(URI.EventTargetBase), "testMakeEventHandler3: "+eu

    def testMakeEventHandler4(self):
        eh1 = makeEventHandler()
        eh2 = makeEventHandler()
        self.assertNotEqual(eh1.getUri(), eh2.getUri())
        # print "\neh1: %s, eh2: %s\n"%(eh1.getUri(),eh2.getUri())

    def testMakeEventHandler5(self):
        # Test response to event handler throwing an exception
        eh = makeEventHandler("EventHandlerUri", handleEventException, initSub, endSub)
        self.assertEqual(eh.getUri(), "EventHandlerUri")
        ev = makeEvent("EventUri", source=eh.getUri())
        sh = eh.handleEvent(ev).syncValue()
        self.assertEqual(sh, Status(URI.Status_OK, ev.getType()))
        # The status message value here depends on the default status value set up by 
        # EventHandler.handleEvent, which is currently the default supplied by the
        # Status object constructor.
        self.assertEqual(sh.getMessage(), "")
        return

    def testEventHandlerEqual1(self):
        eh1 = EventHandler("EventHandlerUri", handleEvent, initSub, endSub)
        eh2 = EventHandler("EventHandlerUri", handleEvent, initSub, endSub)
        self.assertEqual(eh1, eh2)

    def testEventHandlerEqual2(self):
        eh1 = EventHandler("EventHandlerUri1", handleEvent, initSub, endSub)
        eh2 = EventHandler("EventHandlerUri2", handleEvent, initSub, endSub)
        self.assertNotEqual(eh1, eh2)

    def testEventHandlerEqual3(self):
        eh1 = makeEventHandler()
        eh2 = makeEventHandler()
        self.assertNotEqual(eh1, eh2)

    def testEventHandlerEqual4(self):
        eh1 = makeEventHandler()
        eh2 = makeEventHandler(eh1.getUri(), handleEvent, initSub, endSub)
        self.assertEqual(eh1, eh2)

    def testUnits(self):
        assert (True)

    def testComponents(self):
        assert (True)

    def testIntegration(self):
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
            , "testCreateEventHandler1"
            , "testMakeEventHandler1"
            , "testMakeEventHandler2"
            , "testMakeEventHandler3"
            , "testMakeEventHandler4"
            , "testMakeEventHandler5"
            , "testEventHandlerEqual1"
            , "testEventHandlerEqual2"
            , "testEventHandlerEqual3"
            , "testEventHandlerEqual4"
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
    return TestUtils.getTestSuite(TestEventHandler, testdict, select=select)

# Run unit tests directly from command line
if __name__ == "__main__":
    TestUtils.runTests("TestEventHandler.log", getTestSuite, sys.argv)

# End.
