# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Unit testing for threaded event router functions
#
# This TestEventRouter as a base class, but substututes setUp and 
# tearDown functions to use the EventRouterThreaded class, and adds 
# some text cases to confirm expected multithreading behaviour.
#

import sys
import unittest
import logging
import time
from Queue     import Queue
from threading import Thread

sys.path.append("../..")

from MiscLib.Functions     import compareLists
from MiscLib.Logging       import Trace, Info

from EventLib.Event        import Event, makeEvent
from EventLib.Status       import Status, StatusVal
from EventLib.SyncDeferred import makeDeferred
from EventLib.EventAgent   import EventAgent, makeEventAgent
from EventLib.EventHandler import EventHandler, makeEventHandler
from EventLib.EventRouterThreaded import EventRouterThreaded
from TestEventRouter              import TestEventRouter

# Event handler functions
# These simply store values in the event handler object that 
# can be observed later
def subHandler(h,sts):
    Trace("%s subHandler %s"%(h,str(sts)), "EventLib.TestEventRouterThreaded")
    h.subcount += 1
    h.dosub     = sts
    return

def unsubHandler(h,sts):
    Trace("%s unsubHandler %s"%(h,str(sts)), "EventLib.TestEventRouterThreaded")
    h.subcount -= 1
    h.unsub     = sts
    return

def eventHandler(h,e):
    Trace("%s eventHandler %s"%(h,str(e)), "EventLib.TestEventRouterThreaded")
    h.evcount += 1
    h.event    = e
    return makeDeferred(StatusVal.OK)

def eventHandlerBlocking(h,e):
    Trace("%s eventHandlerBlocking %s"%(h,str(e)), "EventLib.TestEventRouterThreaded")
    time.sleep(1.0)
    h.evcount += 1
    h.event    = e
    Trace("%s eventHandlerBlocking - return"%(h), "EventLib.TestEventRouterThreaded")
    return makeDeferred(StatusVal.OK)

def eventHandlerQueueing(h,e):
    Trace("%s eventHandlerQueueing %s"%(h,str(e)), "EventLib.TestEventRouterThreaded")
    h.evcount += 1
    h.event    = e
    h.queue.append(e)
    return makeDeferred(StatusVal.OK)

# Test class
class TestEventRouterThreaded(TestEventRouter):

    def setUp(self):
        self.R1 = EventRouterThreaded("R1")
        self.R2 = EventRouterThreaded("R2")
        self.R3 = EventRouterThreaded("R3")
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
        self.R1.close()
        self.R2.close()
        self.R3.close()
        return


    # Test support functions

    # One-hop routing test: R1 -> R2
    def doSubscriptionForwardingR1R2(self, evtype, source, evmatch, evdrop, r1fwd=0):
        self.doSubscriptionForwarding(self.R1, self.R2, evtype, source, evmatch, evdrop, 
            r1fwd=r1fwd, delay=0.1)
        return

    # Two-hop routing test: R2 -> R3 (via R3 - see method setUp)
    def doSubscriptionForwardingR2R3(self, evtype, source, evmatch, evdrop, r1fwd=0):
        self.doSubscriptionForwarding(self.R2, self.R3, evtype, source, evmatch, evdrop, 
            r1fwd=r1fwd, rvia=self.R1, delay=0.1)
        return

    # Test cases

    # Test behaviour of blocking in event delivery
    def testBlockingEventDelivery(self):
        es = makeEventAgent(uri="es")
        eh = makeEventHandler(
                uri="eh", handler=eventHandlerBlocking, 
                initSubscription=subHandler, endSubscription=unsubHandler)
        eh.subcount = 0
        eh.evcount  = 0
        evtyp = "R3Events1/ev1"             # Select event routed R3 -> R1 -> R2 ..
        evsrc = "R3Source1/src1"            # .. (see setUp)
        ev  = makeEvent(evtype=evtyp, source=evsrc)
        sts = self.R2.subscribe(60, eh, evtype=evtyp, source=evsrc)
        Trace("Subscribe returned", "EventLib.TestEventRouterThreaded")
        time.sleep(0.1)                     # Allow subscribe time to propagate
        Trace("Subscribed", "EventLib.TestEventRouterThreaded")
        self.assertEqual(eh.evcount, 0)
        sts = self.R3.publish(es, ev)
        self.assertEqual(eh.evcount, 0)     # Not delivered immediately ...
        Trace("Before sleep", "EventLib.TestEventRouterThreaded")
        time.sleep(1.5)                     # Note: evcent handler blocks for 1 sec
        Trace("After sleep: eh.evcount %d"%(eh.evcount), "EventLib.TestEventRouterThreaded")
        self.assertEqual(eh.evcount, 1)     # ... but  sometime after a second
        self.assertEqual(eh.event.getType(), evtyp)
        self.assertEqual(eh.event.getSource(), evsrc)
        Trace("testBlockingEventDelivery OK", "EventLib.TestEventRouterThreaded")
        return

    # Test event publication by two concurrent threads
    def testInterleavedEventDelivery(self):
        # Helpers
        def makePublishThread( es, cq, wait0, wait1, evlist):
            t = Thread(name=es, target=publishFromThread, args=(es, cq, wait0, wait1, evlist))
            t.start()
            return
        def publishFromThread( es, cq, wait0, wait1, evlist):
            n = 0
            for (et,es) in evlist:
                n += 1
                time.sleep(wait0)
                wait0 = wait1
                ev = makeEvent(evtype=et, source=es)
                sts = self.R3.publish(es, ev)
            cq.put(n)
            return
        # Main test case
        evtyp = "R3Events/ev1"              # Select event type routed R3 -> R1 -> R2
        eh = makeEventHandler(
                uri="eh", handler=eventHandlerQueueing, 
                initSubscription=subHandler, endSubscription=unsubHandler)
        eh.subcount = 0
        eh.evcount  = 0
        eh.event    = None
        eh.queue    = []
        self.R2.subscribe(60, eh, evtype=evtyp, source=None)
        time.sleep(0.1)                     # Allow subscribe time to propagate
        completionQueue = Queue()
        makePublishThread( "es1", completionQueue, 0.0, 1.0, ((evtyp,"Pub11"),(evtyp,"Pub12")) )
        makePublishThread( "es2", completionQueue, 0.5, 1.0, ((evtyp,"Pub21"),(evtyp,"Pub22")) )
        c = completionQueue.get()   # Wait for both threads to complete
        c = completionQueue.get()
        # Check state of handler
        time.sleep(0.1)                     # Allow events time to propagate
        self.assertEqual(eh.evcount, 4)
        self.assertEqual(eh.queue[0].getType(), evtyp)
        self.assertEqual(eh.queue[0].getSource(), "Pub11")
        self.assertEqual(eh.queue[1].getType(), evtyp)
        self.assertEqual(eh.queue[1].getSource(), "Pub21")
        self.assertEqual(eh.queue[2].getType(), evtyp)
        self.assertEqual(eh.queue[2].getSource(), "Pub12")
        self.assertEqual(eh.queue[3].getType(), evtyp)
        self.assertEqual(eh.queue[3].getSource(), "Pub22")
        return
        
    # Test behaviour of watching an event subscription
    def testWatch(self):
        es = makeEventAgent(uri="es")
        eh1 = makeEventHandler(
                uri="eh1", handler=eventHandlerBlocking, 
                initSubscription=subHandler, endSubscription=unsubHandler)
        eh2 = makeEventHandler(
                uri="eh2", handler=eventHandlerBlocking, 
                initSubscription=subHandler, endSubscription=unsubHandler)
        eh3 = makeEventHandler(
                uri="eh3", handler=eventHandlerBlocking, 
                initSubscription=subHandler, endSubscription=unsubHandler)
                
        eh1.subcount = 0
        eh1.evcount  = 0
        eh2.subcount = 0
        eh2.evcount  = 0
        eh3.subcount = 0
        eh3.evcount  = 0
        
        self.R1.subscribe( 30, eh3, '' )
        self.R1.watch( 30, eh1, 'http://id.webbrick.co.uk/events/config/get' )
#        self.R1.subscribe( 30, eh1, 'http://id.webbrick.co.uk/events/config/set' )
#        self.R1.subscribe( 30, eh2, 'http://id.webbrick.co.uk/events/time/minute' )
        self.R1.subscribe( 30, eh2, 'http://id.webbrick.co.uk/events/config/get' )

        self.R1.unsubscribe( eh3, '' )
        self.R1.endWatch( eh1, 'http://id.webbrick.co.uk/events/config/get' )
#        self.R1.unsubscribe( eh1, 'http://id.webbrick.co.uk/events/config/set' )
#        self.R1.unsubscribe( eh2, 'http://id.webbrick.co.uk/events/time/minute' )
        self.R1.unsubscribe( eh2, 'http://id.webbrick.co.uk/events/config/get' )
        
        self.assertEqual(eh1.subcount, 0)
        self.assertEqual(eh2.subcount, 0)
        self.assertEqual(eh3.subcount, 0)
        
        time.sleep(1.5)                     # Note: evcent handler blocks for 1 sec
        return

    def testShutdown(self):
        # ensure test harness shutsdown if no close called
        Rlocal = EventRouterThreaded("Rlocal")
        assert (True)

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
            , "testShutdown"
            , "testSubscriptionRouteTable"
            , "testSubscriptionForwarding1"
            , "testSubscriptionForwarding2"
            , "testSubscriptionForwarding3"
            , "testSubscriptionForwarding4"
            , "testSubscriptionForwarding5"
            , "testSubscriptionForwarding6"
            , "testSubscriptionForwarding7"
            , "testSubscriptionForwarding8"
            , "testBlockingEventDelivery"
            , "testInterleavedEventDelivery"
            ],
        "component":
            [ "testComponents"
            ],
        "integration":
            [ "testIntegration"
            ],
        "pending":
            [ "testPending"
            , "testWatch"
            ]
        }
    return TestUtils.getTestSuite(TestEventRouterThreaded, testdict, select=select)

# Run unit tests directly from command line
if __name__ == "__main__":
    TestUtils.runTests("TestEventRouterThreaded.log", getTestSuite, sys.argv)

# End.

