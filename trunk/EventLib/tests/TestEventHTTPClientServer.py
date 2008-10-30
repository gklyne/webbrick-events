# $Id$
#
# Copyright (c) 2008 O2M8 Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Component testing for HTTP event router functions
#
# This performs tests similar to TestEventRouterHTTP, but uses the
# external TestEventHTTPServer module to provide the server-side functions.
# Essentially, this is a confidence test of that module, whose reral purpose
# is to provide a test server for client-side javascript event distribution
# functions.
#
# This module is very similar to TestEventHTTPClient.py, except that the 
# server component is created as a separate thread within the current process.
#

import sys
import unittest
import logging
import time
from Queue     import Queue
from threading import Thread
from traceback import print_exc

sys.path.append("../..")

from MiscLib.Functions     import compareLists
from MiscLib.Logging       import Trace, Info

from EventLib.Event        import Event, makeEvent
from EventLib.Status       import Status, StatusVal
from EventLib.SyncDeferred import makeDeferred
from EventLib.EventAgent   import EventAgent, makeEventAgent
from EventLib.EventHandler import EventHandler, makeEventHandler
from EventLib.EventRouter  import EventRouter
from EventLib.EventRouterHTTPC import EventRouterHTTPC
from TestEventHTTPServer       import TestEventHTTPServer
from TestEventRouter           import TestEventRouter

# Event handler functions
# These simply store values in the event handler object that 
# can be observed later
def subHandler(h,sts):
    h.subcount += 1
    h.dosub     = sts
    return

def unsubHandler(h,sts):
    h.subcount -= 1
    h.unsub     = sts
    return

def eventHandler(h,e):
    h.evcount += 1
    h.event    = e
    return makeDeferred(StatusVal.OK)

# Test class
class TestEventHTTPClientServer(unittest.TestCase):

    def setUp(self):
        self.server = None
        self.R2C    = None
        self.R3C    = None
        return

    def tearDown(self):
        Trace("TearDown", "TestEventHTTPClientServer")
        if self.server: self.server.close()
        if self.R2C:    self.R2C.close()
        if self.R3C:    self.R3C.close()
        return

    def setUpServer(self):
        try:
            self.server = TestEventHTTPServer()
            self.server.start()
            self.R2C = EventRouterHTTPC("R2C","localhost",8082)
            self.R3C = EventRouterHTTPC("R3C","localhost",8083)
        except Exception, e:
            print_exc()
            try:
                self.tearDown()
            except Exception:
                pass
            raise e
        return

    # Test case helper functions

    # Helper function for subscription forwarding tests
    #   r1      router for initial subscription
    #   r2      fouter for forwarded subscription
    #   evtype  event type to subscribe, or None
    #   source  event source to subscribe, or None
    #   evmatch event matching subscription
    #   evdrop  event not matching subscription
    #   delay   seconds (real value) to delay for event to be delivered
    #   
    def doSubscriptionForwarding(self, r1, r2, evtype, source, evmatch, evdrop, delay=0.0):
        R1es = makeEventAgent(uri="R1es")
        R1eh = makeEventHandler(
                uri="R1eh", handler=eventHandler, 
                initSubscription=subHandler, endSubscription=unsubHandler)
        R1eh.subcount = 0
        R1eh.evcount  = 0
        # Initial tests
        self.assertEqual(r1.getSubscriptionCount(), 0)
        self.assertEqual(r2.getSubscriptionCount(), 0)
        # subscribe
        sts = r1.subscribe(60, R1eh, evtype=evtype, source=source)
        self.assertEqual(sts.syncValue(), StatusVal.SUBSCRIBED)
        time.sleep(delay)
        self.assertEqual(R1eh.dosub, StatusVal.SUBSCRIBED)
        self.assertEqual(R1eh.subcount, 1)
        self.assertEqual(r1.getSubscriptionCount(), 1)
        self.assertEqual(r2.getSubscriptionCount(), 0)
        self.assertEqual(r1.getForwardCount(), 1)
        self.assertEqual(r2.getForwardCount(), 1)
        # publish matching event
        sts = r2.publish(R1es, evmatch)
        self.assertEqual(sts.syncValue(), StatusVal.OK)
        time.sleep(delay)
        self.assertEqual(R1eh.evcount, 1)
        self.assertEqual(R1eh.event.getType(), evmatch.getType())
        self.assertEqual(R1eh.event.getSource(), evmatch.getSource())
        # publish non-matching event
        sts = r2.publish(R1es, evdrop)
        self.assertEqual(sts.syncValue(), StatusVal.OK)
        self.assertEqual(R1eh.evcount, 1)
        self.assertEqual(R1eh.event.getType(), evmatch.getType())
        self.assertEqual(R1eh.event.getSource(), evmatch.getSource())
        # publish matching event
        sts = r2.publish(R1es, evmatch)
        self.assertEqual(sts.syncValue(), StatusVal.OK)
        time.sleep(delay)
        self.assertEqual(R1eh.evcount, 2)
        self.assertEqual(R1eh.event.getType(), evmatch.getType())
        self.assertEqual(R1eh.event.getSource(), evmatch.getSource())
        # unsubscribe
        sts = r1.unsubscribe(R1eh, evtype=evtype, source=source)
        self.assertEqual(str(sts.syncValue()), str(StatusVal.UNSUBSCRIBED))
        self.assertEqual(R1eh.unsub, StatusVal.UNSUBSCRIBED)
        self.assertEqual(R1eh.subcount, 0)
        self.assertEqual(r1.getSubscriptionCount(), 0)
        self.assertEqual(r2.getSubscriptionCount(), 0)
        self.assertEqual(r1.getForwardCount(), 1)
        self.assertEqual(r2.getForwardCount(), 1)
        return

    # Two-hop routing test: R2C -> R3C (via R1 - see method setUp)
    def doSubscriptionForwardingR2R3(self, evtype, source, evmatch, evdrop, r1fwd=0):
        self.setUpServer()
        self.doSubscriptionForwarding(self.R2C, self.R3C, evtype, source, evmatch, evdrop, delay=0.1)
        return

    # Test cases

    # Intro
    def testTestEventHTTPClientServerIntro(self):
        Info("---- testTestEventHTTPClientServerIntro: TestEventHTTPClientServer takes about 100s to run","TestEventHTTPClientServer")
        print "\n---- TestEventHTTPClientServer takes about 60s to run"
        return

    # Test routing based on event type matching
    def testSubscriptionForwarding1(self):
        Info("---- testSubscriptionForwarding1 ----","TestEventHTTPClientServer")
        evmatch = makeEvent(evtype="R3Events/ev1",source="R3Source/src1")
        evdrop  = makeEvent(evtype="R3Events/ev2",source="R3Source/src2")
        self.doSubscriptionForwardingR2R3("R3Events/ev1", None, evmatch, evdrop)
        return

    # Test routing based on event source matching
    def testSubscriptionForwarding2(self):
        Info("---- testSubscriptionForwarding2 ----","TestEventHTTPClientServer")
        evmatch = makeEvent(evtype="R3Events/ev1",source="R3Source/src1")
        evdrop  = makeEvent(evtype="R3Events/ev2",source="R3Source/src2")
        self.doSubscriptionForwardingR2R3(None, "R3Source/src1", evmatch, evdrop)
        return

    # Test routing based on event type and source matching
    def testSubscriptionForwarding3(self):
        Info("---- testSubscriptionForwarding3 ----","TestEventHTTPClientServer")
        evmatch = makeEvent(evtype="R3Events1/ev1",source="R3Source1/src1")
        evdrop  = makeEvent(evtype="R3Events1/ev2",source="R3Source1/src2")
        self.doSubscriptionForwardingR2R3("R3Events1/ev1", "R3Source1/src1", evmatch, evdrop)
        return

    # Test subscription loop doesn't cause routing loop
    def testSubscriptionForwarding4(self):
        Info("---- testSubscriptionForwarding4 ----","TestEventHTTPClientServer")
        evmatch = makeEvent(evtype="RREvents3/ev1",source="RRSource3/src1")
        evdrop  = makeEvent(evtype="RREvents3/ev2",source="RRSource3/src2")
        self.doSubscriptionForwardingR2R3("RREvents3/ev1", "RRSource3/src1", evmatch, evdrop, r1fwd=1)
        return

    # Done
    def testTestEventHTTPClientServerDone(self):
        Info("---- testTestEventHTTPClientServerDone ----","TestEventHTTPClientServer")
        print "\n---- TestEventHTTPClientServer done."
        return

    # Sentinel/placeholder tests

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
            ],
        "component":
            [ "testComponents"
            , "testTestEventHTTPClientServerIntro"
            , "testSubscriptionForwarding1"
            , "testSubscriptionForwarding2"
            , "testSubscriptionForwarding3"
            , "testSubscriptionForwarding4"
            , "testTestEventHTTPClientServerDone"
            ],
        "integration":
            [ "testIntegration"
            ],
        "pending":
            [ "testPending"
            ]
        }
    return TestUtils.getTestSuite(TestEventHTTPClientServer, testdict, select=select)

# Run unit tests directly from command line
if __name__ == "__main__":
    TestUtils.runTests("TestEventHTTPClientServer.log", getTestSuite, sys.argv)

# End.
