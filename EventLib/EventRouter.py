# $Id$
#
# Copyright (c) 2008 O2M8 Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
"""
Basic event routing implementation.
"""

from MiscLib.Logging   import Trace
from MiscLib.Functions import filterSplit, isEq
from Status            import StatusVal
from SyncDeferred      import makeDeferred
from Event             import Event, makeEvent
from EventEnvelope     import EventEnvelope
from EventAgent        import EventAgent
from EventHandler      import makeEventHandler
import URI

# ------------------
# Exported constants
# ------------------

MaxSubscriptionInterval = 32000

# -----------
# EventPubSub
# -----------

class EventPubSub(EventAgent):
    """
    Implements the simplest form of event router, where all events are 
    published and subscribed using a single router instance.
    
    This implementation also ignores timeouts (other than treating an 
    interval of zero as an unsubscribe operation)
    """

    def __init__(self, uri=None):
        """
        Initialize a new EventPubSub object
        """
        if not uri: uri = "(EventPubSub %u)"%(id(self))
        Trace("%s Init"%(uri), context="EventLib.EventPubSub")
        super(EventPubSub, self).__init__(uri)
        # Subscription table for local delivery of events
        self._sub        = EventTypeSourceDict()
        self._subcount   = 0
        return

    def close(self):
        """
        Function called to close down event router.
        """
        return

    def subscribe(self, interval, handler, evtype=None, source=None):
        """
        Subscribe an event handler to an event/source combination.
        
        'interval' is a time interval, in seconds, for which the subscription 
        is to be maintained - if zero, no subscription is created, and any 
        existing subscription is cancelled.
        
        Returns a Deferred status value is returned indicating the outcome 
        of the operation.
        """
        Trace("%s subscribe %us, handler %s to (%s,%s)"%
                  (self.getUri(), interval, str(handler), evtype, source), 
              context="EventLib.EventPubSub")
        sts = self.unsubscribe(handler, evtype, source)
        if interval != 0:
            self._sub.insert(evtype, source, handler)
            self._subcount += 1
            handler.initSubscription(StatusVal.SUBSCRIBED)
            # Publish subscribe request and notify events
            sts = self.publishSubscription(handler, interval, evtype, source)
            if sts.syncValue() != StatusVal.OK:
                Trace("publish subscription returns %s"%(str(sts.syncValue())), context="EventLib.EventPubSub")
                self.unsubscribe(handler, evtype, source)
            else:
                sts = makeDeferred(StatusVal.SUBSCRIBED)
        return sts

    def unsubscribe(self, handler, evtype=None, source=None):
        """
        Unsubscribe an event handler from an event/source combination.
        
        A Deferred status value is returned indicating the outcome of the 
        unsubscribe operation.
        """
        Trace("%s unsubscribe (%s,%s) from %s"%(self.getUri(), evtype, source, str(handler)), 
              context="EventLib.EventPubSub")
        removed = self._sub.remove(evtype, source, handler)
        Trace("removed: %s"%(map(str,removed)), context="EventLib.EventPubSub")
        sts = makeDeferred(StatusVal.UNSUBSCRIBED)
        if removed:
            self._subcount -= len(removed)
            Trace("self._subcount: %u"%(self._subcount), context="EventLib.EventPubSub")
            handler.endSubscription(StatusVal.UNSUBSCRIBED)
            # Publish unsubscribe event
            sts = self.publishSubscription(handler, 0, evtype, source)
            if sts.syncValue() != StatusVal.OK:
                Trace("publish unsubscription returns %s"%(str(sts.syncValue())), context="EventLib.EventPubSub")
            else:
                sts = makeDeferred(StatusVal.UNSUBSCRIBED)
        return sts

    def publishSubscription(self, handler, interval, evtype, source):
        """
        Local helper to propagate a subscribe or unsubscribe request
        (unsubscribe is distinguished by interval=0).
        
        Don't publish subscriptions to subscribe events (watch requests) as the encoding hack
        used means these appear as encoded subscription of the kind we're trying to watch.
        And in any case, there's no point in publishing events for watch requests.
        """
        sts = makeDeferred(StatusVal.OK)
        if not isSubscribeEvent(evtype):
            subreq = makeSubscribeEvent(URI.EventSubscribeType, handler.getUri(), interval, evtype, source)
            sts = self.publish(self.getUri(), subreq)
        return sts

    def watch(self, interval, handler, evtype=None):
        """
        Request to receive notice of subscribe/unsubscribe events for a given
        event type.
        
        (Currently there is no option to also select on subscriber.)

        Returns a Deferred status value is returned indicating the outcome of the subscribe 
        operation - StatusVal.SUBSCRIBED indicates a successful outcome.
        
        HACK:  for subscription notification events, the subscribed event type is treated as 
        the source for subscription.  This avoids having to keep a separate table for watchers.
        """
        Trace("%s watch %us, handler %s to %s"%(self.getUri(), interval, str(handler), evtype), 
              context="EventLib.EventPubSub")
        sts = self.subscribe(interval, handler, evtype=URI.EventSubscribeType, source=evtype)
        if sts.syncValue() == StatusVal.SUBSCRIBED:
            # Scan existing subscriptions for immediate watch events
            Trace("- scanning subscriptions", context="EventLib.EventPubSub")
            event = makeEvent(evtype=URI.EventSubscribeType, source=evtype)
            for (t,s,h) in self._sub.iterateWild(evtype, None):
                Trace("- subscribed (%s,%s,%s)"%(t,s,h), context="EventLib.EventPubSub")
                handler.handleEvent(event)
            pass
        return sts

    def endWatch(self, handler, evtype=None):
        """
        Terminate request to receive notice of subscribe/unsubscribe events for 
        a given event type.
        """
        Trace("%s endWatch %s from %s"%(self.getUri(), evtype, str(handler)), 
              context="EventLib.EventPubSub")
        return self.unsubscribe(handler, evtype=URI.EventSubscribeType, source=evtype)

    # --- Interrogate subscription status ---

    def getSubscriptionCount(self):
        """
        Return count of current subscriptions.

        This function is provided for testing purposes
        """
        assert self._subcount == self._sub.count()
        return self._subcount

    # --- Event publication and delivery ---

    def publish(self, agent, event):
        """
        Publish an event.  The event source is taken from the event itself;  the 'agent'
        parameter provides an EventAgent context that may be used for diagnostic or
        security purposes.
        
        Note that self.publish has the same interface as an event callback function 
        provided to makeHandler
        
        Returns a Deferred object with the final status of the publish operation.
        """
        Trace("%s publish (%s,%s,%s) from %s"%
              (self.getUri(), event.getType(), event.getSource(), event.getPayload(), agent), 
              context="EventLib.EventPubSub")
        sts = self.deliver(event)
        if sts.syncValue() == StatusVal.OK:
            sts = self.forward(event, EventEnvelope(event, self.getUri()))
        return sts

    def deliver(self, event):
        """
        Local delivery of an event.
        
        Returns a Deferred object with the final status of the deliver operation.
        """
        Trace("%s deliver (%s,%s,%s)"%
              (self.getUri(), event.getType(), event.getSource(), event.getPayload()), 
              context="EventLib.EventPubSub")
        (evtyp, evsrc) = getEventTypeSource(event)
        if isSubscribeEvent(evtyp):
            for (e,t,handler) in self._sub.iterateWild(evtyp, evsrc):
                # Deliver to watchers only (no wildcard event type)
                if e == URI.EventSubscribeType:
                    Trace("%s - to watcher %s"%(self.getUri(), handler.getUri()), 
                        context="EventLib.EventPubSub")
                    sts = handler.handleEvent(event)
                    if sts.syncValue() != StatusVal.OK: return sts
        else:
            for handler in self._sub.iterate(evtyp, evsrc):
                Trace("%s - to handler %s (%s,%s)"%(self.getUri(), handler.getUri(), event.getType(), event.getSource()), 
                    context="EventLib.EventPubSub")
                sts = handler.handleEvent(event)
                if sts.syncValue() != StatusVal.OK: return sts
        return makeDeferred(StatusVal.OK)

    def forward(self, event, envelope):
        """
        Forward an event to any external event routers that have subscribers for
        this event.  This version is a dummy function that must be overridden for 
        event distribution nodes that may route events to other nodes.
        
        Returns a Deferred object with the final status of the forward operation.
        """
        return makeDeferred(StatusVal.OK)

# -----------
# EventRouter
# -----------

class EventRouter(EventPubSub):
    """
    Implements an event relay, where events may be forwarded to nodes other
    than the one at which they are published.
    
    TODO: This implementation also ignores timeouts (other than treating an 
    interval of zero as an unsubscribe operation)
    """

    def __init__(self, uri=None):
        """
        Initialize a new event router object
        """
        if not uri: uri = "(EventRouter %u)"%(id(self))
        super(EventRouter, self).__init__(uri)
        # Forward routing table: this is effectively a static routing table
        # for event forwarding, indicating the sources to subscribe to for 
        # relaying of given event type+source combinations.
        #
        # For subscribe request routing, entries are added to the target node's
        # forward routing table for subscribe events to the corrresponding
        # event type.  See method routeEventFrom for details.
        self._fwdroute = EventTypeSourceDict()
        # Forwarding table: this is a dynamic routing table indicating
        # the routers to which events should be forwarded.
        self._fwdtable   = EventTypeSourceDict()
        self._fwdcount   = 0
        return

    # --- Event forwarding ---

    def forward(self, event, envelope):
        """
        Forward an event to any external event routers that have subscribers for
        this event.
        
        The event to be delivered is supplied bare and also wrapped in a forwarding 
        envelope, which contains additional information about the event delivery path 
        that is used,  possibly among other things, to detect event forwarding loops.
        
        Returns a Deferred object with the final status of the forward operation.
        """
        Trace("%s forward %s"%(self.getUri(),str(event)), "EventLib.EventRouter")
        sub = openSubscribeEvent(isSubscribeEvent, event)
        if sub:
            # Subscribe events routed per static routing table and subscribed event type/source
            for router in self._fwdroute.iterate(sub[3], sub[4]):
                sts = router.receive(self, envelope)
                if sts.syncValue() != StatusVal.OK: return sts
        else:
            # Other events routed per dynamic routing table and event type/source
            for router in self._fwdtable.iterate(event.getType(), event.getSource()):
                sts = router.receive(self, envelope)
                if sts.syncValue() != StatusVal.OK: return sts
        return makeDeferred(StatusVal.OK)

    def receive(self, fromrouter, envelope):
        """
        Receive an event from an external event router.
        
        The event received is wrapped in a forwarding envelope, which contains
        additional information about the event delivery path that is used, possibly
        among other things, to detect event forwarding loops.
        
        Returns a Deferred object with the final status of the receive operation.
        """
        sts   = makeDeferred(StatusVal.OK)
        event = envelope.unWrap(self.getUri())      # unWrap handles loop-detection
        if event:
            Trace("%s receive %s from %s"%(self.getUri(),str(event), fromrouter), "EventLib.EventRouter")
            self.deliver(event)
            sub = openSubscribeEvent(isSubscribeEvent, event)
            Trace("%s openSubscribeEvent %s"%(self.getUri(),sub), "EventLib.EventRouter")
            if sub:
                # New subscription request
                self.doSubscribeRequest(fromrouter, sub[2], sub[3], sub[4])
            newenv = envelope.nextHop(self.getUri())
            sts = self.forward(event, newenv)
            if sub and sub[2] != 0 and sts.syncValue() != StatusVal.OK:
                # Undo subscription
                self.doSubscribeRequest(fromrouter, 0, sub[3], sub[4])
        return sts

    def doSubscribeRequest(self, fromrouter, interval, evtype, source):
        """
        Helper function to register an event forwarding subscription for 
        the designated event type and source with the routers from which
        such events may be received.
        
        TODO: logic to keep maximum subscription interval
        """
        ### Trace("%s doSubscribeRequest %us, (%s,%s) from %s"%(self.getUri(),interval,evtype,source,fromrouter), "EventLib.EventRouter")
        if interval != 0:
            # subscribing
            fwds = self._fwdtable.find(evtype, source)
            if fromrouter not in self._fwdtable.find(evtype, source):
                # new subscription
                self._fwdtable.insert(evtype, source, fromrouter)
                Trace("%s _fwdtable inserted: (%s,%s) -> %s"%(self.getUri(),evtype,source,str(fromrouter)), context="EventLib.EventRouter")
                self._fwdcount += 1
        else:
            # unsubscribing
            removed = self._fwdtable.remove(evtype, source, fromrouter)
            Trace("%s _fwdtable removed: %s"%(self.getUri(),map(str,removed)), context="EventLib.EventRouter")
            if removed:
                self._fwdcount -= len(removed)
                Trace("self._fwdcount: %u"%(self._subcount), context="EventLib.EventRouter")
        return

    # --- Interrogate subscription status ---

    def getForwardCount(self):
        """
        Return count of current forwarding subscriptions.

        This function is provided for testing purposes
        """
        assert self._fwdcount == self._fwdtable.count()
        return self._fwdcount

    # --- Specify event routing ---

    def routeEventFrom(self,evtype=None,source=None,router=None):
        """
        Define event routing.  When a subscription is received for an event matching
        the supplied type and source, a new subscription to the specified router is 
        established so that events can be received from that router and republished
        to local subscribers.
        
        (Remember the old programmer's joke about the COME FROM in Fortran?
        This might be regarded as a realization of that.
        See: http://www.fortran.com/come_from.html)
        """
        ### Trace("%s routeEventFrom: (%s,%s) from %s"%(self.getUri(),evtype,source,str(router)), context="EventLib.EventRouter")
        self._fwdroute.insert(evtype,source,router)
        Trace("%s _fwdroute inserted: (%s,%s) -> %s"%(self.getUri(),evtype,source,str(router)), context="EventLib.EventRouter")
        return

    def getRouteTable(self):
        """
        Obtain a copy of the static routing table.  Used for debugging only.
        """
        return list(self._fwdroute.iterateAll())

# -------------------
# EventTypeSourceDict
# -------------------

class EventTypeSourceDict:
    """
    Helper class implements a dictionary like structure indexed by event type and 
    event source values (URIs), where None may be used as a catch-all for either value.
    
    This class is used in implementing dispatching for event publication, subscription
    forwarding between multiple routers and subscription tracking so that forwarded
    subscriptions can be terminated when no longer needed.
    
    Note: the set of event types is presumed to be finite and relatively small.
    Once an event type is seen, space ios allocated to subscriptions for that
    type, and is not recovered when there are no outstanding subscriptions.    
    """

    def __init__(self):
        """
        Initialize a new event type+source distionary
        """
        self._sub = WildDict()      # Indexed by event type; 
                                    # values are WildDicts indexed by source

    def insert(self, evtype, evsrc, value):
        """
        Insert value into the dictionary indexed by evtype and evsrc.
        
        Returns a resulting list of values for the given indexex.
        """
        # Local function updates the "WildDict" entry for the indicated event type,
        # which is a list of "WildDict" values mapping event sources to subscription lists
        def upd(srcd):
            if not srcd: srcd = (WildDict(evtype),)     # Tuple of 1 prevents adding new instances
            inserted = srcd[0].insert(evsrc, value)
            return (inserted, srcd)
        # Main function here
        return self._sub.update(evtype, upd)

    def remove(self, evtype, evsrc, value):
        """
        Remove a value from the dictionary.
        
        Returns a list of values removed.
        """
        # Local function updates the "WildDict" entry for the indicated event type,
        # which is a list of "WildDict" values mapping event sources to subscription lists
        def upd(srcd):
            if srcd:
                removed = srcd[0].remove(evsrc, value)
            else:
                removed = []
            return (removed, srcd)
        # Main function here
        return self._sub.update(evtype,upd)

    def findEntry(self, evtype, evsrc):
        """
        Find an entry matching  exactly the supplied event type and event source 
        (either of which may be None).
        
        Returns the list of values for this entry, or an empty list.
        """
        # Local functions simply returns the entry value list as the result and 
        # for the new entry value.
        def upd(srcd):
            if srcd:
                entry = srcd[0].findEntry(evsrc)
            else:
                entry = []
            return (entry, srcd)
        # Main function here
        return self._sub.update(evtype, upd)

    def find(self, evtype, evsrc):
        """
        Return a list of values in the table, including catch-all values, 
        matching the supplied event type and source.
        """
        return list(self.iterate(evtype, evsrc))

    def iterate(self, evtype, evsrc):
        """
        Returns an interator over entries matching the supplied event type and source;
        that is, all entries with the specified values, and also all wildcard entries.  
        The iterator returns wildcard entries after non-wildcard entries, with wildcard
        event values after wildcard source values.
        """
        for d in self._sub.iterate(evtype):
            for v in d.iterate(evsrc):
                yield v
        return

    def iterateWild(self, evtype, evsrc):
        """
        Returns an interator over entries matching the supplied key; that is, all 
        entries with the specified key, and also all wildcard entries.  The iterator
        returns wildcard entries after non-wildcard entries.
        
        If the supplied type and/or source values are None or empty, they are treated as a 
        wildcard and all corresponding entries are returned.
        """
        for (t,d) in self._sub.iterateWild(evtype):
            for (s,v) in d.iterateWild(evsrc):
                yield (t,s,v)
        return

    def iterateKey(self, evtype, evsrc):
        """
        Returns an interator over entries matching the supplied key; that is, all 
        entries with the specified key, and also all wildcard entries.  The iterator
        returns wildcard entries after non-wildcard entries.
        
        If the supplied key is None, only wildcard table entries are returned.
        """
        for (t,d) in self._sub.iterateKey(evtype):
            for (s,v) in d.iterateKey(evsrc):
                yield (t,s,v)
        return

    def iterateAll(self):
        """
        Iterate over all members in table.  Iterator returns (type,source,value) triples.
        """
        for (t,d) in self._sub.iterateAll():
            for (s,v) in d.iterateAll():
                yield (t,s,v)
        return

    def count(self):
        """
        Returns a count of members.  Used for testing.
        """
        count = 0
        for v in self.iterateAll(): count += 1
        return count

# --------
# WildDict
# --------

class WildDict:
    """
    Helper class implements a dictionary-like structure supporting wildcard entries,
    and also supports returning multiple results per lookup.
    (That is, entries which match any key, as opposed to wildcard keys that match any entry).
    
    Stored values, as well as keys, must support equality so that they can be
    identified for removal.
    """

    def __init__(self, ident=None):
        """
        Initialize an empty lookup table
        """
        self._id    = ident # identifier string
        self._wild  = []    # List of wild-match entries
        self._keyed = {}    # Dictionary of keyed entries

    def __eq__(self, other):
        """
        Equality based on identifer string; allows WildDicts to contain other WildDicts as values
        """
        return self._ident == other._ident

    def update(self, key, updater):
        """
        Function to apply an update to a WildDict entry:  key indicates the entry to be
        updated (may be None), and updater is a function that applies the update.
        
        This function is modelled loosely on the Haskell monadic bind function, where
        the located entry is treated as a monad and the supplied updater function
        both updates the monad value and returns a derived value to the calling program.
        
        The updater function is applied to the table entry, and must return a pair of values: 
        the first is returned to the calling program, and the second is a new value that
        replaces the previous entry.  (Note: if the previous entry is updated in situ, that
        value should be returned.)
        """
        if key:
            if key in self._keyed:
                (res,new) = updater(self._keyed[key])
                if new:
                    self._keyed[key] = new
                else:
                    del self._keyed[key]
            else:
                (res,new) = updater([])
                if new: self._keyed[key] = new
        else:
            (res,self._wild) = updater(self._wild)
        return res

    def insert(self, key, value):
        """
        Inserts a new entry into the lookup table.  If key is None, then this is
        a wildcard entry that matches any key.
        
        Returns the updated table entry.
        """
        def upd(entry):
            entry.append(value)
            return (entry,entry)
        return self.update(key, upd)

    def remove(self, key, value):
        """
        Removes entries from the lookup table.  If key is None, then only wildard
        entries are removed.  If key is not None, then only non-wildcard entries
        are removed.  Multiple entries with the given key and value may be removed.
        
        Returns a list of entries removed.
        """
        def upd(entry):
            return filterSplit(isEq(value),entry)
        return self.update(key, upd)

    def findEntry(self, key):
        """
        Find an entry matching exactly the supplied key value (which may be None).
        
        Returns the list of values for this entry, or an empty list.
        """
        # Local functions simply returns the entry value list as the result and 
        # for the new entry value.
        def upd(entry):
            return (entry,entry)
        # Main function here
        return self.update(key, upd)

    def find(self, key):
        """
        Returns a list of entries matching the supplied key; that is, all 
        entries with the specified key, and also all wildcard entries.  The list
        contains wildcard entries after non-wildcard entries.  If key is None, then
        only wildcard entries are returned.
        """
        return list(self.iterate(key))

    def iterate(self, key):
        """
        Returns an interator over entries matching the supplied key; that is, all 
        entries with the specified key, and also all wildcard entries.  The iterator
        returns wildcard entries after non-wildcard entries.  If key is None, then
        only wildcard entries are returned.
        """
        for (k,v) in self.iterateKey(key): yield v
        return

    def iterateWild(self, key):
        """
        Returns an interator over entries matching the supplied key; that is, all 
        entries with the specified key, and also all wildcard entries.  The iterator
        returns wildcard entries after non-wildcard entries.
        
        If the supplied key is None, it is treated as a wildcard and all entries 
        are returned.
        """
        if key: return self.iterateKey(key)
        return self.iterateAll()

    def iterateKey(self, key):
        """
        Returns an interator over entries matching the supplied key; that is, all 
        entries with the specified key, and also all wildcard entries.  The iterator
        returns wildcard entries after non-wildcard entries.
        
        If the supplied key is None, only wildcard table entries are returned.
        """
        if key and key in self._keyed:
            for v in self._keyed[key]: yield (key, v)
        for v in self._wild: yield (None, v)
        return

    def iterateAll(self):
        """
        Iterate over all members in table.  Iterator returns (key,value) pairs.
        """
        for key in self._keyed:
            for v in self._keyed[key]: yield (key, v)
        for v in self._wild: yield (None, v)

    def count(self):
        """
        Returns a count of members.  Used for testing.
        """
        count = 0
        for v in self.iterateAll(): count += 1
        return count

# ----------------
# Helper functions
# ----------------

def makeSubscribeEvent(subtype, subscriber, interval, evtype, source):
    """
    Return an event object to convey the supplied subscription details.

    interval=0 for unsubscribe.
    """
    payload = [interval, evtype, source]
    return makeEvent(subtype, subscriber, payload)

def openSubscribeEvent(subtype, event):
    """
    Return details from a subscribe event, or None if it is not a subscribe event.

    'subtype' is a function that tests if the supplied event type is a 
    subscription event type.
    
    Returns a list: [subscribe event type, 
                     subscriber URI, 
                     interval, subscribed event type, subscribed event source]
    
    For unsubscribe, interval=0
    """
    if subtype(event.getType()):
        evsrc = event.getSource()
        evsub = event.getPayload()
        if evsub != None: return [event.getType(),evsrc]+evsub
    return None

def getEventTypeSource(event):
    """
    Returns the event type and source for the supplied eventy, taking account
    of different source rules for subscription releated events.
    """
    evtyp = event.getType()
    evsrc = event.getSource()
    if isSubscribeEvent(evtyp):
        evsub = event.getPayload()      # [interval, type, source]
        if evsub:
            evsrc = evsub[1]
    return (evtyp,evsrc)

def isSubscribeEvent(evtype):
    return evtype == URI.EventSubscribeType

# End.
