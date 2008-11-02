# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Unit testing for HTTP event router functions
#
# Uses TestEventRouter as a base class, but substututes setUp,
# tearDown and other functions to use the EventRouterThreaded class.
#

import sys
import unittest
import logging
import time
from Queue     import Queue
from threading import Thread
from traceback import print_exc

sys.path.append("../..")

from MiscLib.Functions         import compareLists
from MiscLib.Logging           import Trace, Info, Warn

from EventLib.Event            import Event, makeEvent
from EventLib.Status           import Status, StatusVal
from EventLib.SyncDeferred     import makeDeferred
from EventLib.EventAgent       import EventAgent, makeEventAgent
from EventLib.EventHandler     import EventHandler, makeEventHandler
from EventLib.EventRouter      import EventRouter
from EventLib.EventRouterHTTPS import EventRouterHTTPS
from EventLib.EventRouterHTTPC import EventRouterHTTPC
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
class TestEventRouterHTTP(unittest.TestCase):

    def setUp(self):
        self.R1  = None
        self.R2  = None
        self.R3  = None
        self.R2C = None
        self.R3C = None
        return

    def tearDown(self):
        Trace("TearDown", "TestEventRouterHTTP")
        if self.R1:  self.R1.close()
        if self.R2:  self.R2.close()
        if self.R3:  self.R3.close()
        if self.R2C: self.R2C.close()
        if self.R3C: self.R3C.close()
        return

    def setUpRouter(self):
        try:
            self.R1  = EventRouter("R1")
            self.R2  = EventRouterHTTPS("R2S","localhost",8082)
            self.R2C = EventRouterHTTPC("R2C","localhost",8082)
            self.R3  = EventRouterHTTPS("R3S","localhost",8083)
            self.R3C = EventRouterHTTPC("R3C","localhost",8083)
        except Exception, e:
            print_exc()
            try:
                self.tearDown()
            except Exception:
                pass
            raise e
        #
        # Configure event routers with R1 as hub:
        #
        #        R1
        #       /  \
        #     R2    R3      -- HTTPS event routers (HTTP server)
        #     /      \
        #   R2C      R3C    -- HTTPC event routers (HTTP client)
        #
        # The test setup assumes that:
        # * HTTPS and HTTPC event routers work as pairs, with just one 
        #   HTTPC connecting to each HTTPS
        # * all events delivered to an HTTPS event router are forwarded to 
        #   the corresponding HTTPC event router.  For finer control, use an
        #   ordinary event router to filter delivery to the HTTPS event router.
        # * all events delivered to an HTTPC event router are forwarded to 
        #   the corresponding HTTPS event router.  For finer control, use an
        #   ordinary event router to filter delivery to the HTTPC event router.
        # * All subscriptions are similarly forwarded between HTTPS and HTTPC
        #   event routers.
        # * all local event delivery and routing functions operate as for an
        #   ordinary event router.
        #
        # Wildcard event source
        self.R1.routeEventFrom(evtype="R2Events/ev1",router=self.R2)
        self.R1.routeEventFrom(evtype="R3Events/ev1",router=self.R3)
        self.R2.routeEventFrom(evtype="R1Events/ev1",router=self.R1)
        self.R2.routeEventFrom(evtype="R3Events/ev1",router=self.R1)
        self.R3.routeEventFrom(evtype="R1Events/ev1",router=self.R1)
        self.R3.routeEventFrom(evtype="R2Events/ev1",router=self.R1)
        # Wildcard event type
        self.R1.routeEventFrom(source="R2Source/src1",router=self.R2)
        self.R1.routeEventFrom(source="R3Source/src1",router=self.R3)
        self.R2.routeEventFrom(source="R1Source/src1",router=self.R1)
        self.R2.routeEventFrom(source="R3Source/src1",router=self.R1)
        self.R3.routeEventFrom(source="R1Source/src1",router=self.R1)
        self.R3.routeEventFrom(source="R2Source/src1",router=self.R1)
        # Wildcard none
        self.R1.routeEventFrom(evtype="R2Events1/ev1",source="R2Source1/src1",router=self.R2)
        self.R1.routeEventFrom(evtype="R3Events1/ev1",source="R3Source1/src1",router=self.R3)
        self.R2.routeEventFrom(evtype="R1Events1/ev1",source="R1Source1/src1",router=self.R1)
        self.R2.routeEventFrom(evtype="R3Events1/ev1",source="R3Source1/src1",router=self.R1)
        self.R3.routeEventFrom(evtype="R1Events1/ev1",source="R1Source1/src1",router=self.R1)
        self.R3.routeEventFrom(evtype="R2Events1/ev1",source="R2Source1/src1",router=self.R1)
        # Cross routing event
        self.R1.routeEventFrom(evtype="RREvents2/ev1",source="RRSource2/src1",router=self.R2)
        self.R2.routeEventFrom(evtype="RREvents2/ev1",source="RRSource2/src1",router=self.R1)
        # 3-way loop routing event
        self.R1.routeEventFrom(evtype="RREvents3/ev1",source="RRSource3/src1",router=self.R2)
        self.R2.routeEventFrom(evtype="RREvents3/ev1",source="RRSource3/src1",router=self.R3)
        self.R3.routeEventFrom(evtype="RREvents3/ev1",source="RRSource3/src1",router=self.R1)
        return

    # Test case helper functions

    # Helper function for subscription forwarding tests
    #   r1      router for initial subscription
    #   r2      fouter for forwarded subscription
    #   evtype  event type to subscribe, or None
    #   source  event source to subscribe, or None
    #   evmatch event matching subscription
    #   evmatch event not matching subscription
    #   r1fwd   forwarding count for r1 (usually 0, or 1 if at end of loop)
    #   rvia    a router via which the subscription is routed
    #   r1rtr   routing/forwarding node for r1, if different from r1.
    #   r2rtr   routing/forwarding node for r2, if different from r2.
    #   delay   seconds (real value) to delay for event to be delivered
    #   
    def doSubscriptionForwarding(self, r1, r2, evtype, source, evmatch, evdrop, 
                                 r1fwd=0, rvia=None, r1rtr=None, r2rtr=None, delay=0.0):
        R1es = makeEventAgent(uri="R1es")
        R1eh = makeEventHandler(
                uri="R1eh", handler=eventHandler, 
                initSubscription=subHandler, endSubscription=unsubHandler)
        R1eh.subcount = 0
        R1eh.evcount  = 0
        r1rtr = r1rtr or r1
        r2rtr = r2rtr or r2
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
        if rvia:
            self.assertEqual(rvia.getSubscriptionCount(), 0)
            self.assertEqual(rvia.getForwardCount(), 1)
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
        if rvia:
            self.assertEqual(rvia.getSubscriptionCount(), 0)
        return

    # One-hop routing test: R1 -> R2C
    def doSubscriptionForwardingR1R2(self, evtype, source, evmatch, evdrop, r1fwd=0):
        self.setUpRouter()
        self.doSubscriptionForwarding(self.R1, self.R2C, evtype, source, evmatch, evdrop, 
            r1fwd=r1fwd, r2rtr=self.R2, delay=0.1)
        return

    # One-hop routing test: R2C -> R1
    def doSubscriptionForwardingR2R1(self, evtype, source, evmatch, evdrop, r1fwd=0):
        self.setUpRouter()
        self.doSubscriptionForwarding(self.R2C, self.R1, evtype, source, evmatch, evdrop, 
            r1fwd=r1fwd, r1rtr=self.R2, delay=0.1)
        return

    # Two-hop routing test: R2C -> R3C (via R1 - see method setUp)
    def doSubscriptionForwardingR2R3(self, evtype, source, evmatch, evdrop, r1fwd=0):
        self.setUpRouter()
        self.doSubscriptionForwarding(self.R2C, self.R3C, evtype, source, evmatch, evdrop, 
            r1fwd=r1fwd, rvia=self.R1, r1rtr=self.R2, r2rtr=self.R3, delay=0.1)
        return

    # Test cases

    # Intro
    def testTestEventRouterHTTPIntro(self):
        Info("---- testTestEventRouterHTTPIntro: TestEventRouterHTTP component tests take about 100s to run","TestEventRouterHTTP")
        print "\n---- TestEventRouterHTTP component tests take about 100s to run"
        return

    # Test simple S->C subscription forwarding based on event type matching
    def testSubscriptionForwarding1(self):
        Info("---- testSubscriptionForwarding1 ----------","TestEventRouterHTTP")
        evmatch = makeEvent(evtype="R2Events/ev1",source="R2Source/src1")
        evdrop  = makeEvent(evtype="R2Events/ev2",source="R2Source/src2")
        self.doSubscriptionForwardingR1R2("R2Events/ev1", None, evmatch, evdrop)
        return

    # Test simple S->C subscription forwarding based on event source matching
    def testSubscriptionForwarding2(self):
        Info("---- testSubscriptionForwarding2 ----","TestEventRouterHTTP")
        evmatch = makeEvent(evtype="R2Events/ev1",source="R2Source/src1")
        evdrop  = makeEvent(evtype="R2Events/ev2",source="R2Source/src2")
        self.doSubscriptionForwardingR1R2(None, "R2Source/src1", evmatch, evdrop)
        return

    # Test simple S->C subscription forwarding based on event type and source matching
    def testSubscriptionForwarding3(self):
        Info("---- testSubscriptionForwarding3 ----","TestEventRouterHTTP")
        evmatch = makeEvent(evtype="R2Events1/ev1",source="R2Source1/src1")
        evdrop  = makeEvent(evtype="R2Events1/ev2",source="R2Source1/src2")
        self.doSubscriptionForwardingR1R2("R2Events1/ev1", "R2Source1/src1", evmatch, evdrop)
        return

    # Test cross-subscription doesn't cause S->C subscription routing loop
    def testSubscriptionForwarding4(self):
        Info("---- testSubscriptionForwarding4 ----","TestEventRouterHTTP")
        evmatch = makeEvent(evtype="RREvents2/ev1",source="RRSource2/src1")
        evdrop  = makeEvent(evtype="RREvents2/ev2",source="RRSource2/src2")
        self.doSubscriptionForwardingR1R2("RREvents2/ev1", "RRSource2/src1", evmatch, evdrop, r1fwd=1)
        return

    # Test simple C->S subscription forwarding based on event type matching
    def testSubscriptionForwarding5(self):
        Info("---- testSubscriptionForwarding5 ----","TestEventRouterHTTP")
        evmatch = makeEvent(evtype="R1Events/ev1",source="R1Source/src1")
        evdrop  = makeEvent(evtype="R1Events/ev2",source="R1Source/src2")
        self.doSubscriptionForwardingR2R1("R1Events/ev1", None, evmatch, evdrop)
        return

    # Test simple C->S subscription forwarding based on event source matching
    def testSubscriptionForwarding6(self):
        Info("---- testSubscriptionForwarding6 ----","TestEventRouterHTTP")
        evmatch = makeEvent(evtype="R1Events/ev1",source="R1Source/src1")
        evdrop  = makeEvent(evtype="R1Events/ev2",source="R1Source/src2")
        self.doSubscriptionForwardingR2R1(None, "R1Source/src1", evmatch, evdrop)
        return

    # Test simple C->S subscription forwarding based on event type and source matching
    def testSubscriptionForwarding7(self):
        Info("---- testSubscriptionForwarding7 ----","TestEventRouterHTTP")
        evmatch = makeEvent(evtype="R1Events1/ev1",source="R1Source1/src1")
        evdrop  = makeEvent(evtype="R1Events1/ev2",source="R1Source1/src2")
        self.doSubscriptionForwardingR2R1("R1Events1/ev1", "R1Source1/src1", evmatch, evdrop)
        return

    # Test cross-subscription doesn't cause C->S subscription routing loop
    def testSubscriptionForwarding8(self):
        Info("---- testSubscriptionForwarding8 ----","TestEventRouterHTTP")
        evmatch = makeEvent(evtype="RREvents2/ev1",source="RRSource2/src1")
        evdrop  = makeEvent(evtype="RREvents2/ev2",source="RRSource2/src2")
        self.doSubscriptionForwardingR2R1("RREvents2/ev1", "RRSource2/src1", evmatch, evdrop, r1fwd=1)
        return

    # Test 2-hop routing based on event type matching
    def testSubscriptionForwarding9(self):
        Info("---- testSubscriptionForwarding9 ----","TestEventRouterHTTP")
        evmatch = makeEvent(evtype="R3Events/ev1",source="R3Source/src1")
        evdrop  = makeEvent(evtype="R3Events/ev2",source="R3Source/src2")
        self.doSubscriptionForwardingR2R3("R3Events/ev1", None, evmatch, evdrop)
        return

    # Test 2-hop routing based on event source matching
    def testSubscriptionForwarding10(self):
        Info("---- testSubscriptionForwarding10 ----","TestEventRouterHTTP")
        evmatch = makeEvent(evtype="R3Events/ev1",source="R3Source/src1")
        evdrop  = makeEvent(evtype="R3Events/ev2",source="R3Source/src2")
        self.doSubscriptionForwardingR2R3(None, "R3Source/src1", evmatch, evdrop)
        return

    # Test 2-hop routing based on event type and source matching
    def testSubscriptionForwarding11(self):
        Info("---- testSubscriptionForwarding11 ----","TestEventRouterHTTP")
        evmatch = makeEvent(evtype="R3Events1/ev1",source="R3Source1/src1")
        evdrop  = makeEvent(evtype="R3Events1/ev2",source="R3Source1/src2")
        self.doSubscriptionForwardingR2R3("R3Events1/ev1", "R3Source1/src1", evmatch, evdrop)
        return

    # Test 2-hop subscription loop doesn't cause routing loop
    def testSubscriptionForwarding12(self):
        Info("---- testSubscriptionForwarding12 ----","TestEventRouterHTTP")
        evmatch = makeEvent(evtype="RREvents3/ev1",source="RRSource3/src1")
        evdrop  = makeEvent(evtype="RREvents3/ev2",source="RRSource3/src2")
        self.doSubscriptionForwardingR2R3("RREvents3/ev1", "RRSource3/src1", evmatch, evdrop, r1fwd=1)
        return

    # Done
    def testTestEventRouterHTTPDone(self):
        Info("---- testTestEventRouterHTTPDone TestEventRouterHTTP component tests done ----","TestEventRouterHTTP")
        print "\n---- TestEventRouterHTTP component tests done"
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
            , "testSubscriptionForwarding1"
            ],
        "component":
            [ "testComponents"
            , "testTestEventRouterHTTPIntro"
            , "testSubscriptionForwarding2"
            , "testSubscriptionForwarding3"
            , "testSubscriptionForwarding4"
            , "testSubscriptionForwarding5"
            , "testSubscriptionForwarding6"
            , "testSubscriptionForwarding7"
            , "testSubscriptionForwarding8"
            , "testSubscriptionForwarding9"
            , "testSubscriptionForwarding10"
            , "testSubscriptionForwarding11"
            , "testSubscriptionForwarding12"
            , "testTestEventRouterHTTPDone"
            ],
        "integration":
            [ "testIntegration"
            ],
        "pending":
            [ "testPending"
            ]
        }
    return TestUtils.getTestSuite(TestEventRouterHTTP, testdict, select=select)

# Run unit tests directly from command line
if __name__ == "__main__":
    TestUtils.runTests("TestEventRouterHTTP.log", getTestSuite, sys.argv)

# End.
