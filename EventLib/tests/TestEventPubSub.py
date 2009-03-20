# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Unit testing for basic event publish/subscribe mechanism
# See http://pyunit.sourceforge.net/pyunit.html
#

import sys
import unittest
import logging

sys.path.append("../..")
from MiscLib.Logging       import Trace
from EventLib.Event        import Event, makeEvent
from EventLib.Status       import Status, StatusVal
from EventLib.SyncDeferred import makeDeferred
from EventLib.EventAgent   import EventAgent, makeEventAgent
from EventLib.EventHandler import EventHandler, makeEventHandler
from EventLib.EventRouter  import EventPubSub, EventTypeSourceDict, WildDict, isSubscribeEvent
from EventLib              import URI

# Local event handler class for testing
class MyEventHandler:

    def __init__(self, target):
        self._target    = target
        self._triggered = False
        self._watched   = False
        self._status    = StatusVal.NONE

    def __eq__(self, other):
        return self._target == other._target

    def __str__(self):
        return "MyEventHandler(%s)"%(str(self._target))

    def getUri(self):
        return "MyEventHandler/%s"%(str(self._target))

    def getTarget(self):
        return self._target

    def handleEvent(self, event):
        # Treat subscribe-related events differently
        if not isSubscribeEvent(event.getType()):
            self._triggered = True
            self._status    = StatusVal.TRIGGERED
        else:
            self._watched = True
            self._event   = event
        return makeDeferred(StatusVal.OK)

    def initSubscription(self, status):
        self._triggered = False
        self._status    = StatusVal.SUBSCRIBED
        return makeDeferred(StatusVal.OK)

    def endSubscription(self, status):
        self._status    = StatusVal.UNSUBSCRIBED
        return makeDeferred(StatusVal.OK)

    def isTriggered(self):
        return self._triggered

    def isWatched(self):
        return self._watched

    def resetWatched(self):
        self._watched = False

    def getSubEvent(self):
        return self._event

# Helper to test if event handler is triggered as expected
def evTriggerEq(handler,expect):
    return handler.isTriggered() == expect

# Helper to map assertion over a pair of lists
def mapAssert(f, als, bls, msg):
    rls = map(f, als, bls)
    for r in rls: assert r, msg

# Test class
class TestEventPubSub(unittest.TestCase):

    def setUpRouter(self):
        Trace("setUp","TestEventPubSub")
        a = MyEventHandler("A")
        b = MyEventHandler("B")
        c = MyEventHandler("C")
        d = MyEventHandler("D")
        e = MyEventHandler("E")
        f = MyEventHandler("F")
        g = MyEventHandler("G")
        h = MyEventHandler("H")
        self.handlers = (a, b, c, d, e, f, g, h)
        self.router   = EventPubSub(uri="LocalRouter")
        self.router.subscribe(60, a, evtype="t1", source="s1")
        self.router.subscribe(60, b, evtype="t2", source="s1")
        self.router.subscribe(60, c, evtype="t1", source="s2")
        self.router.subscribe(60, d, evtype="t2", source="s2")
        self.router.subscribe(60, e, evtype="t1")
        self.router.subscribe(60, f, evtype="", source="s1")
        self.router.subscribe(60, g, source="")
        self.router.subscribe(60, h, evtype="t2", source="s1")  # same as b
        Trace("setUp exit","TestEventPubSub")
        return

    def setUp(self):
        self.a = None
        self.b = None
        self.c = None
        self.d = None
        self.e = None
        self.f = None
        self.g = None
        self.h = None
        return

    def tearDown(self):
        Trace("tearDown","TestEventPubSub")
        if self.a: self.router.unsubscribe(self.a, evtype="t1", source="s1")
        if self.b: self.router.unsubscribe(self.b, evtype="t2", source="s1")
        if self.c: self.router.unsubscribe(self.c, evtype="t1", source="s2")
        if self.d: self.router.unsubscribe(self.d, evtype="t2", source="s2")
        if self.e: self.router.unsubscribe(self.e, evtype="t1")
        if self.f: self.router.unsubscribe(self.f, source="s1")
        if self.g: self.router.unsubscribe(self.g)
        if self.h: self.router.unsubscribe(self.h, evtype="t2", source="s1")
        Trace("tearDown exit","TestEventPubSub")
        return

    def doTestPublish(self,typid,srcid,expectTriggered):
        src = makeEventAgent(typid+srcid)
        evt = makeEvent(evtype=typid,source=srcid)
        sts = self.router.publish(src, evt)
        self.assertEqual( sts.syncValue(), StatusVal.OK, str(sts.syncValue())+" is not StatusVal.OK" )
        mapAssert(evTriggerEq, self.handlers, expectTriggered, "Trigger "+typid+srcid)
        return

    # Test cases

    # Test basic Wil;dDict functions
    def testWildDict1(self):
        Trace("testWildDict1","TestEventPubSub")
        wd = WildDict()
        # Basic insertion tests
        self.assertEqual(wd.find("a"), [])
        self.assertEqual(wd.find("b"), [])
        wd.insert("a","A1")
        wd.insert(None,"N1")
        self.assertEqual(wd.find("a"), ["A1","N1"])
        self.assertEqual(wd.find("b"), ["N1"])
        wd.insert("a","A2")
        wd.insert("b","B1")
        wd.insert("b","B2")
        wd.insert(None,"N2")
        self.assertEqual(wd.find("a"), ["A1","A2","N1","N2"])
        self.assertEqual(wd.find("b"), ["B1","B2","N1","N2"])
        # Scan contents
        kvs = [("a","A1"), ("a","A2"), ("b","B1"), ("b","B2"), (None,"N1"), (None,"N2")]
        self.assertEqual(list(wd.iterateAll()), kvs)
        self.assertEqual(wd.count(), 6)
        # Basic removal tests
        b1 = wd.remove("b","B1")
        self.assertEqual(b1, ["B1"])
        self.assertEqual(wd.find("b"), ["B2","N1","N2"])
        b2 = wd.remove("b","B2")
        self.assertEqual(b2, ["B2"])
        self.assertEqual(wd.find("b"), ["N1","N2"])
        n2 = wd.remove(None,"N2")
        self.assertEqual(n2, ["N2"])
        self.assertEqual(wd.find("a"), ["A1","A2","N1"])
        self.assertEqual(wd.find("b"), ["N1"])
        n1 = wd.remove(None,"N1")
        self.assertEqual(n1, ["N1"])
        self.assertEqual(wd.find("a"), ["A1","A2"])
        self.assertEqual(wd.find("b"), [])
        # Multiple-value insertion tests
        wd.insert("c","C")
        wd.insert(None,"N")
        wd.insert("c","C")
        wd.insert(None,"N")
        self.assertEqual(wd.find("c"), ["C","C","N","N"])
        # Multiple-value removal tests
        el = wd.remove("c","C1")
        self.assertEqual(el, [])
        self.assertEqual(wd.find("c"), ["C","C","N","N"])
        cc = wd.remove("c","C")
        self.assertEqual(cc, ["C","C"])
        self.assertEqual(wd.find("c"), ["N","N"])
        el = wd.remove("c","C")
        self.assertEqual(el, [])
        self.assertEqual(wd.find("c"), ["N","N"])
        el = wd.remove(None,"C")
        self.assertEqual(el, [])
        self.assertEqual(wd.find("c"), ["N","N"])
        nn = wd.remove(None,"N")
        self.assertEqual(nn, ["N","N"])
        self.assertEqual(wd.find("c"), [])
        el = wd.remove(None,"N")
        self.assertEqual(el, [])
        self.assertEqual(wd.find("a"), ["A1","A2"])
        self.assertEqual(wd.find("b"), [])
        self.assertEqual(wd.find("c"), [])
        return

    # Additional WildDict test for special wildcard-matching search
    def testWildDict2(self):
        Trace("testWildDict1","TestEventPubSub")
        # Create and test dictionary
        wd = WildDict()
        kvs = [("a","A1"), ("a","A2"), ("b","B1"), ("b","B2"), (None,"N1"), (None,"N2")]
        for (k,v) in kvs: wd.insert(k,v)
        self.assertEqual(list(wd.iterateAll()), kvs)
        self.assertEqual(wd.count(), 6)
        # Now test iterateWild functions
        self.assertEqual(list(wd.iterateWild(None)), kvs)
        self.assertEqual(list(wd.iterateWild("a")), [("a","A1"), ("a","A2"), (None,"N1"), (None,"N2")])
        self.assertEqual(list(wd.iterateWild("b")), [("b","B1"), ("b","B2"), (None,"N1"), (None,"N2")])
        self.assertEqual(list(wd.iterateWild("c")), [(None,"N1"), (None,"N2")])
        return

    # Additional WildDict test for iteration logic
    def testWildDictIterate(self):
        Trace("testWildDictIterate","TestEventPubSub")
        wd = WildDict()
        wd.insert("a","A1")
        wd.insert(None,"N1")
        wd.insert("","N2")      # Blank is also a wildcard like None
        cnt1 = 0
        for entry in wd.iterate("a"):
            cnt1 = cnt1 + 1
        self.assertEqual(cnt1, 3)
        cnt1 = 0
        for entry in wd.iterate(""):
            cnt1 = cnt1 + 1
        self.assertEqual(cnt1, 2)
        cnt1 = 0
        for entry in wd.iterate(None):
            cnt1 = cnt1 + 1
        self.assertEqual(cnt1, 2)

    # Test basic event+source keyed dictionary functions
    def testEventTypeSourceDict1(self):
        Trace("testEventTypeSourceDict1","TestEventPubSub")
        ed = EventTypeSourceDict()
        # Basic insertion tests
        self.assertEqual(ed.find("at","as"), [])
        self.assertEqual(ed.find("bt","bs"), [])
        ed.insert("at","as","A1")
        ed.insert(None,None,"N1")
        self.assertEqual(ed.find("at","as"), ["A1","N1"])
        self.assertEqual(ed.find("bt","bs"), ["N1"])
        ed.insert("at","as","A2")
        ed.insert("bt","bs","B1")
        ed.insert("bt","bs","B2")
        ed.insert(None,None,"N2")
        self.assertEqual(ed.find("at","as"), ["A1","A2","N1","N2"])
        self.assertEqual(ed.find("bt","bs"), ["B1","B2","N1","N2"])
        # Scan contents
        tsvs = [ ("bt","bs","B1"), ("bt","bs","B2")
               , ("at","as","A1"), ("at","as","A2")
               , (None,None,"N1"), (None,None,"N2")
               ]
        self.assertEqual(list(ed.iterateAll()), tsvs)
        self.assertEqual(ed.count(), 6)
        # Basic removal tests
        b1 = ed.remove("bt","bs","B1")
        self.assertEqual(b1, ["B1"])
        self.assertEqual(ed.find("bt","bs"), ["B2","N1","N2"])
        b2 = ed.remove("bt","bs","B2")
        self.assertEqual(b2, ["B2"])
        self.assertEqual(ed.find("bt","bs"), ["N1","N2"])
        n2 = ed.remove(None,None,"N2")
        self.assertEqual(n2, ["N2"])
        self.assertEqual(ed.find("at","as"), ["A1","A2","N1"])
        self.assertEqual(ed.find("bt","bs"), ["N1"])
        n1 = ed.remove(None,None,"N1")
        self.assertEqual(n1, ["N1"])
        self.assertEqual(ed.find("at","as"), ["A1","A2"])
        self.assertEqual(ed.find("bt","bs"), [])
        # Scan contents
        tsvs = [ ("at","as","A1"), ("at","as","A2") ]
        self.assertEqual(list(ed.iterateAll()), tsvs)
        self.assertEqual(ed.count(), 2)
        # Multiple-value insertion tests
        ed.insert("ct","cs","C")
        ed.insert(None,None,"N")
        ed.insert("ct","cs","C")
        ed.insert(None,None,"N")
        self.assertEqual(ed.find("ct","cs"), ["C","C","N","N"])
        # Scan contents
        tsvs = [ ("at","as","A1"), ("at","as","A2")
               , ("ct","cs","C"),  ("ct","cs","C")
               , (None,None,"N"),  (None,None,"N")
               ]
        self.assertEqual(list(ed.iterateAll()), tsvs)
        self.assertEqual(ed.count(), 6)
        # Multiple-value removal tests
        el = ed.remove("ct","cs","C1")
        self.assertEqual(el, [])
        self.assertEqual(ed.find("ct","cs"), ["C","C","N","N"])
        cc = ed.remove("ct","cs","C")
        self.assertEqual(cc, ["C","C"])
        self.assertEqual(ed.find("ct","cs"), ["N","N"])
        el = ed.remove("ct","cs","C")
        self.assertEqual(el, [])
        self.assertEqual(ed.find("ct","cs"), ["N","N"])
        el = ed.remove(None,None,"C")
        self.assertEqual(el, [])
        self.assertEqual(ed.find("ct","cs"), ["N","N"])
        nn = ed.remove(None,None,"N")
        self.assertEqual(nn, ["N","N"])
        self.assertEqual(ed.find("ct","cs"), [])
        el = ed.remove(None,None,"N")
        self.assertEqual(el, [])
        self.assertEqual(ed.find("at","as"), ["A1","A2"])
        self.assertEqual(ed.find("bt","bs"), [])
        self.assertEqual(ed.find("ct","cs"), [])
        # Scan contents
        tsvs = [ ("at","as","A1"), ("at","as","A2") ]
        self.assertEqual(list(ed.iterateAll()), tsvs)
        self.assertEqual(ed.count(), 2)
        # Partial wildcard tests
        ed.insert("dt","ds","D1ts")
        ed.insert("dt","ds","D2ts")
        ed.insert("dt",None,"D1tn")
        ed.insert(None,"ds","D1ns")
        ed.insert(None,None,"D1nn")
        self.assertEqual(ed.find("dt","ds"), ["D1ts","D2ts","D1tn","D1ns","D1nn"])
        # Scan contents
        tsvs = [ ("dt","ds","D1ts"), ("dt","ds","D2ts")
               , ("dt",None,"D1tn")
               , ("at","as","A1"),   ("at","as","A2")
               , (None,"ds","D1ns")
               , (None,None,"D1nn")
               ]
        self.assertEqual(list(ed.iterateAll()), tsvs)
        self.assertEqual(ed.count(), 7)
        # Partial wildcard tests in opposite order of insertion
        ed.insert(None,None,"E3nn")
        ed.insert(None,"es","E3ns")
        ed.insert("et",None,"E3tn")
        ed.insert("et","es","E4ts")
        ed.insert("et","es","E3ts")
        self.assertEqual(ed.find("et","es"), ["E4ts","E3ts","E3tn","E3ns","D1nn","E3nn"])        
        return

    # Test event+source keyed dictionary special wildcard scan functions
    def testEventTypeSourceDict2(self):
        Trace("testEventTypeSourceDict2","TestEventPubSub")
        # Construct a test dinctionary
        ed = EventTypeSourceDict()
        tsvs = [ ("bt","bs","B1"), ("bt","bs","B2")
               , ("at","as","A1"), ("at","as","A2")
               , (None,None,"N1"), (None,None,"N2")
               ]
        for (t,s,v) in tsvs: ed.insert(t, s, v)
        self.assertEqual(list(ed.iterateAll()), tsvs)
        self.assertEqual(ed.count(), 6)
        # Test wildcard scanning operations
        self.assertEqual(list(ed.iterateWild(None,None)), tsvs)
        self.assertEqual(list(ed.iterateWild("at","as")),
                         [("at","as","A1"), ("at","as","A2"), (None,None,"N1"), (None,None,"N2")])
        self.assertEqual(list(ed.iterateWild("at",None)),
                         [("at","as","A1"), ("at","as","A2"), (None,None,"N1"), (None,None,"N2")])
        self.assertEqual(list(ed.iterateWild(None,"as")),
                         [("at","as","A1"), ("at","as","A2"), (None,None,"N1"), (None,None,"N2")])
        self.assertEqual(list(ed.iterateWild("bt","bs")),
                         [("bt","bs","B1"), ("bt","bs","B2"), (None,None,"N1"), (None,None,"N2")])
        self.assertEqual(list(ed.iterateWild("bt",None)),
                         [("bt","bs","B1"), ("bt","bs","B2"), (None,None,"N1"), (None,None,"N2")])
        self.assertEqual(list(ed.iterateWild(None,"bs")),
                         [("bt","bs","B1"), ("bt","bs","B2"), (None,None,"N1"), (None,None,"N2")])
        self.assertEqual(list(ed.iterateWild("ct","cs")),
                         [(None,None,"N1"), (None,None,"N2")])
        self.assertEqual(list(ed.iterateWild("ct",None)),
                         [(None,None,"N1"), (None,None,"N2")])
        self.assertEqual(list(ed.iterateWild(None,"cs")),
                         [(None,None,"N1"), (None,None,"N2")])
        return

    # Test plain iteration over event+source keyed dictionary
    def testEventTypeSourceDictIterate(self):
        Trace("testEventTypeSourceDictIterate","TestEventPubSub")
        ed = EventTypeSourceDict()
        ed.insert("et","es","A1")
        ed.insert(None,None,"N1")
        ed.insert(None,"es","A1")
        ed.insert("et",None,"A1")
        cnt1 = 0
        for entry in ed.iterate("et","es"):
            cnt1 = cnt1 + 1
        self.assertEqual(cnt1, 4)
        cnt1 = 0
        for entry in ed.iterate("et",None):
            cnt1 = cnt1 + 1
        self.assertEqual(cnt1, 2)
        cnt1 = 0
        for entry in ed.iterate(None,"es"):
            cnt1 = cnt1 + 1
        self.assertEqual(cnt1, 2)
        cnt1 = 0
        for entry in ed.iterate(None,None):
            cnt1 = cnt1 + 1
        self.assertEqual(cnt1, 1)

    # Test publish/subscribe operations and event delivery
    def testPublishT1S1(self):
        Trace("testPublishT1S1","TestEventPubSub")
        self.setUpRouter()
        #                  A      B      C      D      E      F      G      H
        expectTriggered = (True,  False, False, False, True,  True,  True,  False)
        self.doTestPublish("t1","s1",expectTriggered)

    def testPublishT2S1(self):
        Trace("testPublishT2S1","TestEventPubSub")
        self.setUpRouter()
        #                  A      B      C      D      E      F      G      H
        expectTriggered = (False, True,  False, False, False, True,  True,  True)
        self.doTestPublish("t2","s1",expectTriggered)

    def testPublishT1S2(self):
        Trace("testPublishT1S2","TestEventPubSub")
        self.setUpRouter()
        #                  A      B      C      D      E      F      G      H
        expectTriggered = (False, False, True,  False, True,  False, True,  False)
        self.doTestPublish("t1","s2",expectTriggered)

    def testPublishT2S2(self):
        Trace("testPublishT2S2","TestEventPubSub")
        self.setUpRouter()
        #                  A      B      C      D      E      F      G      H
        expectTriggered = (False, False, False, True,  False, False, True,  False)
        self.doTestPublish("t2","s2",expectTriggered)

    def testPublishT1S3(self):
        Trace("testPublishT1S3","TestEventPubSub")
        self.setUpRouter()
        #                  A      B      C      D      E      F      G      H
        expectTriggered = (False, False, False, False, True,  False, True,  False)
        self.doTestPublish("t1","s3",expectTriggered)

    def testPublishT3S1(self):
        Trace("testPublishT3S1","TestEventPubSub")
        self.setUpRouter()
        #                  A      B      C      D      E      F      G      H
        expectTriggered = (False, False, False, False, False, True,  True,  False)
        self.doTestPublish("t3","s1",expectTriggered)

    def testPublishT3S3(self):
        Trace("testPublishT3S3","TestEventPubSub")
        self.setUpRouter()
        #                  A      B      C      D      E      F      G      H
        expectTriggered = (False, False, False, False, False, False, True,  False)
        self.doTestPublish("t3","s3",expectTriggered)

    def testUnsubscribe1(self):
        Trace("testUnsubscribe1","TestEventPubSub")
        self.setUpRouter()
        self.router.unsubscribe(self.handlers[0], evtype="t1", source="s1")
        self.router.unsubscribe(self.handlers[6])
        #                  A      B      C      D      E      F      G      H
        expectTriggered = (False, False, False, False, True,  True,  False, False)
        self.doTestPublish("t1","s1",expectTriggered)

    def testUnsubscribe2(self):
        Trace("testUnsubscribe2","TestEventPubSub")
        self.setUpRouter()
        self.router.unsubscribe(self.handlers[4], evtype="t1")
        self.router.unsubscribe(self.handlers[5], source="s1")
        #                  A      B      C      D      E      F      G      H
        expectTriggered = (True,  False, False, False, False, False, True,  False)
        self.doTestPublish("t1","s1",expectTriggered)

    def testUnsubscribe3(self):
        Trace("testUnsubscribe3","TestEventPubSub")
        self.setUpRouter()
        self.router.unsubscribe(self.handlers[6])
        self.router.unsubscribe(self.handlers[4], evtype="t1")
        self.router.unsubscribe(self.handlers[5], source="s1")
        self.router.unsubscribe(self.handlers[0], evtype="t1", source="s1")
        #                  A      B      C      D      E      F      G      H
        expectTriggered = (False, False, False, False, False, False, False, False)
        self.doTestPublish("t1","s1",expectTriggered)

    def testWatch1(self):
        Trace("testWatch1","TestEventPubSub")
        self.setUpRouter()
        h1 = MyEventHandler("H1")
        w1 = MyEventHandler("W1")
        w2 = MyEventHandler("W2")
        self.router.watch(5, w1, evtype="t1")
        self.router.watch(5, w2, evtype="t2")
        w1.resetWatched()
        w2.resetWatched()
        self.router.subscribe(60, h1, evtype="t1", source="s1")
        assert w1.isWatched(),"Watch for t1 not triggered on subscribe"
        assert not w2.isWatched(), "Watch t2 triggered on subscribe"

    def testWatch2(self):
        Trace("testWatch2","TestEventPubSub")
        self.setUpRouter()
        w1 = MyEventHandler("W1")
        w2 = MyEventHandler("W2")
        self.router.watch(5, w1, evtype="t1")
        self.router.watch(5, w2, evtype="t2")
        w1.resetWatched()
        w2.resetWatched()
        self.router.subscribe(60, self.handlers[0], evtype="t2")
        assert not w1.isWatched(), "Watch t1 triggered on subscribe"
        assert w2.isWatched(), "Watch t2 not triggered on subscribe"

    def testWatch3(self):
        Trace("testWatch3","TestEventPubSub")
        self.setUpRouter()
        self.router.subscribe(60, self.handlers[0], evtype="t1", source="s1")
        self.router.subscribe(60, self.handlers[0], evtype="t2")
        w1 = MyEventHandler("W1")
        w2 = MyEventHandler("W2")
        self.router.watch(5, w1, evtype="t1")
        self.router.watch(5, w2, evtype="t2")
        w1.resetWatched()
        w2.resetWatched()
        self.router.unsubscribe(self.handlers[0], evtype="t1", source="s1")
        assert w1.isWatched(), "Watch t1 not triggered on unsubscribe"
        assert not w2.isWatched(), "Watch t2 triggered on unsubscribe"

    def testWatch4(self):
        Trace("testWatch4","TestEventPubSub")
        self.setUpRouter()
        h1 = MyEventHandler("H1")
        w1 = MyEventHandler("W1")
        w2 = MyEventHandler("W2")
        self.router.subscribe(60, h1, evtype="t1", source="s1")
        self.router.subscribe(60, h1, evtype="t2")
        self.router.watch(5, w1, evtype="t1")
        self.router.watch(5, w2, evtype="t2")
        w1.resetWatched()
        w2.resetWatched()
        self.router.unsubscribe(h1, evtype="t2")
        assert not w1.isWatched(), "Watch t1 triggered on unsubscribe"
        assert w2.isWatched(), "Watch t2 not triggered on unsubscribe"

    # Watch with wildcard subscribe/unsubscribe
    def testWatch5(self):
        Trace("testWatch5","TestEventPubSub")
        self.setUpRouter()
        h1 = MyEventHandler("H1")
        w1 = MyEventHandler("W1")
        self.router.watch(5, w1, evtype="t1")
        w1.resetWatched()
        self.router.subscribe(60, h1)
        assert w1.isWatched(),"Watch t1 not triggered on wild subscribe"
        w1.resetWatched()
        assert not w1.isWatched(),"Watch not reset"
        self.router.unsubscribe(h1)
        assert w1.isWatched(),"Watch t1 not triggered on wild unsubscribe"

    # Wildcard watch with normal subscribe
    def testWatch6(self):
        Trace("testWatch6","TestEventPubSub")
        self.setUpRouter()
        h1 = MyEventHandler("H1")
        w1 = MyEventHandler("W1")
        self.router.watch(5, w1)
        w1.resetWatched()
        self.router.subscribe(60, h1, evtype="t1", source="s1")
        assert w1.isWatched(),"Watch * not triggered on subscribe"
        w1.resetWatched()
        self.router.unsubscribe(h1, evtype="t1", source="s1")
        assert w1.isWatched(),"Watch * not triggered on unsubscribe"

    # Wildcard watch with wildcard subscribe
    def testWatch7(self):
        Trace("testWatch7","TestEventPubSub")
        self.setUpRouter()
        h1 = MyEventHandler("H1")
        w1 = MyEventHandler("W1")
        self.router.watch(5, w1)
        w1.resetWatched()
        self.router.subscribe(60, h1)
        assert w1.isWatched(),"Watch * not triggered on wild subscribe"
        w1.resetWatched()
        self.router.unsubscribe(h1)
        assert w1.isWatched(),"Watch * not triggered on wild unsubscribe"

    # Test form of subscribe event delivered to watcher
    def testWatch8(self):
        Trace("testWatch8","TestEventPubSub")
        self.setUpRouter()
        h1 = MyEventHandler("H1")
        w1 = MyEventHandler("W1")
        self.router.watch(5, w1, evtype="t1")
        self.router.subscribe(60, h1, evtype="t1", source="s1")
        assert w1.isWatched(),"Watch for t1 not triggered on subscribe"
        ev = w1.getSubEvent()
        Trace("testWatch8 - ev %s:%s"%(str(ev),repr(ev.getPayload())),"TestEventPubSub")
        assert ev.getType() == URI.EventSubscribeType, "Subscribe event type must be URI.EventSubscribeType"
        assert ev.getSource() == h1.getUri(), "Subscribe event agent not handler URI"
        assert ev.getPayload()[0] == 60,   "Subscribe payload[0] not interval"
        assert ev.getPayload()[1] == "t1", "Subscribe payload[1] not subscribed event type"
        assert ev.getPayload()[2] == "s1", "Subscribe payload[2] not subscribed event source"
        return

    # Test watch event delivered for prior subscription
    def testWatchPrior1(self):
        Trace("testWatchPrior1","TestEventPubSub")
        self.setUpRouter()
        h1 = MyEventHandler("H1")
        w1 = MyEventHandler("W1")
        self.router.subscribe(60, h1, evtype="t1", source="s1")
        self.router.watch(5,w1,evtype="t1")
        assert w1.isWatched(),"Watch t1 not triggered for subscribe that precedes watch"

    # Test watch event is delivered for prior wildcard subscription
    def testWatchPrior2(self):
        Trace("testWatchPrior2","TestEventPubSub")
        self.setUpRouter()
        h1 = MyEventHandler("H1")
        w1 = MyEventHandler("W1")
        self.router.subscribe(60, h1)
        self.router.watch(5, w1, evtype="t1")
        assert w1.isWatched(),"Watch t1 not triggered for prior wildcard subscribe"

    # Test wildcard watch event is delivered for prior subscription
    def testWatchPrior3(self):
        Trace("testWatchPrior3","TestEventPubSub")
        self.setUpRouter()
        h1 = MyEventHandler("H1")
        w1 = MyEventHandler("W1")
        self.router.subscribe(60, h1, evtype="t1", source="s1")
        self.router.watch(5, w1)
        assert w1.isWatched(),"Watch * not triggered for prior wildcard subscribe"

    # Test wildcard watch event is delivered for prior wildcard subscription
    def testWatchPrior4(self):
        Trace("testWatchPrior4","TestEventPubSub")
        self.setUpRouter()
        h1 = MyEventHandler("H1")
        w1 = MyEventHandler("W1")
        self.router.subscribe(60, h1)
        self.router.watch(5, w1)
        assert w1.isWatched(),"Watch * not triggered for prior wildcard subscribe"

    # Placeholder/sentinel test cases

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
            , "testWildDict1"
            , "testWildDict2"
            , "testWildDictIterate"
            , "testEventTypeSourceDict1"
            , "testEventTypeSourceDict2"
            , "testEventTypeSourceDictIterate"
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
            , "testWatch1"
            , "testWatch2"
            , "testWatch3"
            , "testWatch4"
            , "testWatch5"
            , "testWatch6"
            , "testWatch7"
            , "testWatchPrior1"
            , "testWatchPrior2"
            , "testWatchPrior3"
            , "testWatchPrior4"
            ],
        "component":
            [ "testComponents"
            ],
        "integration":
            [ "testIntegration"
            ],
        "pending":
            [ "testPending"
            , "testWatch8"
            ]
        }
    return TestUtils.getTestSuite(TestEventPubSub, testdict, select=select)

# Run unit tests directly from command line
if __name__ == "__main__":
    TestUtils.runTests("TestEventPubSub.log", getTestSuite, sys.argv)

# End.
