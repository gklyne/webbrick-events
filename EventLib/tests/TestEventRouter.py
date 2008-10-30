# $Id$
#
# Copyright (c) 2008 O2M8 Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Unit testing for event router functions (see also TestEventRouter)
# See http://pyunit.sourceforge.net/pyunit.html
#

import sys
import unittest
import logging
import time

sys.path.append("../..")

from MiscLib.Functions     import compareLists

from EventLib.Event        import Event, makeEvent
from EventLib.Status       import Status, StatusVal
from EventLib.SyncDeferred import makeDeferred
from EventLib.EventAgent   import EventAgent, makeEventAgent
from EventLib.EventHandler import EventHandler, makeEventHandler
from EventLib.EventRouter  import EventRouter

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
class TestEventRouter(unittest.TestCase):

    def setUp(self):
        self.R1 = EventRouter("R1")
        self.R2 = EventRouter("R2")
        self.R3 = EventRouter("R3")
        # Configure event routers with R1 as hub:
        #
        #      R1
        #     /  \
        #    R2  R3
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

    def tearDown(self):
        return

    # Test cases
    # Basic publish-subscribe tests are performed by TestEventRouter
    # The following tests are intended to exercise routing functions

    # Check the routing tables are as expected
    def testSubscriptionRouteTable(self):
        r1f = [ ("R2Events1/ev1", "R2Source1/src1", self.R2)
              , ("R3Events1/ev1", "R3Source1/src1", self.R3)
              , ("R2Events/ev1",  None,             self.R2)
              , ("R3Events/ev1",  None,             self.R3)
              , (None,            "R2Source/src1",  self.R2)
              , (None,            "R3Source/src1",  self.R3)
              , ("RREvents2/ev1", "RRSource2/src1", self.R2)
              , ("RREvents3/ev1", "RRSource3/src1", self.R2)
              ]
        r1cmp = compareLists(self.R1.getRouteTable(),r1f)
        assert r1cmp == None, str(r1cmp)
        r2f = [ ("R1Events/ev1",  None,             self.R1)
              , ("R3Events/ev1",  None,             self.R1)
              , (None,            "R1Source/src1",  self.R1)
              , (None,            "R3Source/src1",  self.R1)
              , ("R1Events1/ev1", "R1Source1/src1", self.R1)
              , ("R3Events1/ev1", "R3Source1/src1", self.R1)
              , ("RREvents2/ev1", "RRSource2/src1", self.R1)
              , ("RREvents3/ev1", "RRSource3/src1", self.R3)
              ]
        r2cmp = compareLists(self.R2.getRouteTable(),r2f)
        assert r2cmp == None, str(r2cmp)
        r3f = [ ("R1Events/ev1",  None,             self.R1)
              , ("R2Events/ev1",  None,             self.R1)
              , (None,            "R1Source/src1",  self.R1)
              , (None,            "R2Source/src1",  self.R1)
              , ("R1Events1/ev1", "R1Source1/src1", self.R1)
              , ("R2Events1/ev1", "R2Source1/src1", self.R1)
              , ("RREvents3/ev1", "RRSource3/src1", self.R1)
              ]
        r3cmp = compareLists(self.R3.getRouteTable(),r3f)
        assert r3cmp == None, str(r3cmp)
        return

    # Helper function for subscription forwarding tests
    #   r1      router for initial subscription
    #   r2      fouter for forwarded subscription
    #   evtype  event type to subscribe, or None
    #   source  event source to subscribe, or None
    #   evmatch event matching subscription
    #   evmatch event not matching subscription
    #   r1fwd   forwarding count for r1 (usually 0, or 1 if at end of loop)
    #   rvia    a router via which the subscription is routed
    #   r1rtr   routing/forwarding node for r1, if diufferent from r1.
    #   r2rtr   routing/forwarding node for r2, if diufferent from r2.
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
        self.assertEqual(R1eh.evcount, 0)       # Was subscribe event caught?
        self.assertEqual(r1.getSubscriptionCount(), 1)
        self.assertEqual(r1rtr.getForwardCount(), r1fwd)
        self.assertEqual(r2.getSubscriptionCount(), 0)
        self.assertEqual(r2rtr.getForwardCount(), 1)
        if rvia:
            self.assertEqual(rvia.getSubscriptionCount(), 0)
            self.assertEqual(rvia.getForwardCount(), 1)
        # publish matching event
        sts = r2.publish(R1es, evmatch)
        self.assertEqual(sts.syncValue(), StatusVal.OK)
        time.sleep(delay)
        self.assertEqual(R1eh.event.getType(), evmatch.getType())
        self.assertEqual(R1eh.event.getSource(), evmatch.getSource())
        self.assertEqual(R1eh.evcount, 1)
        # publish non-matching event
        sts = r2.publish(R1es, evdrop)
        self.assertEqual(sts.syncValue(), StatusVal.OK)
        self.assertEqual(R1eh.event.getType(), evmatch.getType())
        self.assertEqual(R1eh.event.getSource(), evmatch.getSource())
        self.assertEqual(R1eh.evcount, 1)
        # publish matching event
        sts = r2.publish(R1es, evmatch)
        self.assertEqual(sts.syncValue(), StatusVal.OK)
        time.sleep(delay)
        self.assertEqual(R1eh.event.getType(), evmatch.getType())
        self.assertEqual(R1eh.event.getSource(), evmatch.getSource())
        self.assertEqual(R1eh.evcount, 2)
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

    # One-hop routing test: R1 -> R2
    def doSubscriptionForwardingR1R2(self, evtype, source, evmatch, evdrop, r1fwd=0):
        self.doSubscriptionForwarding(self.R1, self.R2, evtype, source, evmatch, evdrop, r1fwd=r1fwd)
        return

    # Two-hop routing test: R2 -> R3 (via R3 - see method setUp)
    def doSubscriptionForwardingR2R3(self, evtype, source, evmatch, evdrop, r1fwd=0):
        self.doSubscriptionForwarding(self.R2, self.R3, evtype, source, evmatch, evdrop, 
            r1fwd=r1fwd, rvia=self.R1)
        return

    # Test simple subscription forwarding based on event type matching
    def testSubscriptionForwarding1(self):
        evmatch = makeEvent(evtype="R2Events/ev1",source="R2Source/src1")
        evdrop  = makeEvent(evtype="R2Events/ev2",source="R2Source/src2")
        self.doSubscriptionForwardingR1R2("R2Events/ev1", None, evmatch, evdrop)
        return

    # Test simple subscription forwarding based on event source matching
    def testSubscriptionForwarding2(self):
        evmatch = makeEvent(evtype="R2Events/ev1",source="R2Source/src1")
        evdrop  = makeEvent(evtype="R2Events/ev2",source="R2Source/src2")
        self.doSubscriptionForwardingR1R2(None, "R2Source/src1", evmatch, evdrop)
        return

    # Test simple subscription forwarding based on event type and source matching
    def testSubscriptionForwarding3(self):
        evmatch = makeEvent(evtype="R2Events1/ev1",source="R2Source1/src1")
        evdrop  = makeEvent(evtype="R2Events1/ev2",source="R2Source1/src2")
        self.doSubscriptionForwardingR1R2("R2Events1/ev1", "R2Source1/src1", evmatch, evdrop)
        return

    # Test cross-subscription doesn't cause subscription routing loop
    def testSubscriptionForwarding4(self):
        evmatch = makeEvent(evtype="RREvents2/ev1",source="RRSource2/src1")
        evdrop  = makeEvent(evtype="RREvents2/ev2",source="RRSource2/src2")
        self.doSubscriptionForwardingR1R2("RREvents2/ev1", "RRSource2/src1", evmatch, evdrop, r1fwd=1)
        return

    # Test 2-hop routing based on event type matching
    def testSubscriptionForwarding5(self):
        evmatch = makeEvent(evtype="R3Events/ev1",source="R3Source/src1")
        evdrop  = makeEvent(evtype="R3Events/ev2",source="R3Source/src2")
        self.doSubscriptionForwardingR2R3("R3Events/ev1", None, evmatch, evdrop)
        return

    # Test 2-hop routing based on event source matching
    def testSubscriptionForwarding6(self):
        evmatch = makeEvent(evtype="R3Events/ev1",source="R3Source/src1")
        evdrop  = makeEvent(evtype="R3Events/ev2",source="R3Source/src2")
        self.doSubscriptionForwardingR2R3(None, "R3Source/src1", evmatch, evdrop)
        return

    # Test 2-hop routing based on event type and source matching
    def testSubscriptionForwarding7(self):
        evmatch = makeEvent(evtype="R3Events1/ev1",source="R3Source1/src1")
        evdrop  = makeEvent(evtype="R3Events1/ev2",source="R3Source1/src2")
        self.doSubscriptionForwardingR2R3("R3Events1/ev1", "R3Source1/src1", evmatch, evdrop)
        return

    # Test 2-hop subscription loop doesn't cause routing loop
    def testSubscriptionForwarding8(self):
        evmatch = makeEvent(evtype="RREvents3/ev1",source="RRSource3/src1")
        evdrop  = makeEvent(evtype="RREvents3/ev2",source="RRSource3/src2")
        self.doSubscriptionForwardingR2R3("RREvents3/ev1", "RRSource3/src1", evmatch, evdrop, r1fwd=1)
        return

    # Test 2-hop watch
    def testWatchForwarding1(self):
        # watch R2 for subscription to R2Events/ev1
        Weh = makeEventHandler(uri="Weh", handler=eventHandler)
        Weh.subcount = 0
        Weh.evcount  = 0
        sts = self.R2.watch(60, Weh, evtype="R2Events/ev1")
        self.assertEqual(str(sts.syncValue()), str(StatusVal.SUBSCRIBED))
        # subscribe R3 to R2Events/ev1
        Seh = makeEventHandler(uri="Seh", handler=eventHandler)
        Seh.subcount = 0
        Seh.evcount  = 0
        sts = self.R3.subscribe(60, Seh, evtype="R2Events/ev1")
        self.assertEqual(sts.syncValue(), StatusVal.SUBSCRIBED)
        # Check watch event was delivered
        self.assertEqual(Weh.evcount, 1)
        # unsubscribe R3 from R2Events/ev1
        sts = self.R3.unsubscribe(Seh, evtype="R2Events/ev1")
        self.assertEqual(sts.syncValue(), StatusVal.UNSUBSCRIBED)
        # Check event was delivered to watcher
        self.assertEqual(Weh.evcount, 2)
        return

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
            , "testSubscriptionRouteTable"
            , "testSubscriptionForwarding1"
            , "testSubscriptionForwarding2"
            , "testSubscriptionForwarding3"
            , "testSubscriptionForwarding4"
            , "testSubscriptionForwarding5"
            , "testSubscriptionForwarding6"
            , "testSubscriptionForwarding7"
            , "testSubscriptionForwarding8"
            , "testWatchForwarding1"
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
    return TestUtils.getTestSuite(TestEventRouter, testdict, select=select)

# Run unit tests directly from command line
if __name__ == "__main__":
    TestUtils.runTests("TestEventRouter.log", getTestSuite, sys.argv)

# End.
