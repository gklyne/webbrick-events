// $Id$
//
// Copyright (c) 2008 O2M8 Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php
//
// Basic event routing implementation.

/* declare for JSLint... */
/*global DeferredMonad, EventAgent, EventEnvelope, EventUri, EventUriRouterBase, 
         MochiKit, StatusVal, assert, 
         getEventTypeSource, isSubscribeEvent, 
         makeDeferred, makeEvent, makeEventAgentUri, makeSubscribeData,
         openSubscribeEvent, parseSubscribeData */

// -----------------------------------------------------------
// ---- EventPubSub provides local event publish-subscribe ----
// -----------------------------------------------------------
//
// Implements the simplest form of event router, where all events are 
// published and subscribed using a single router instance.
//
// This implementation also ignores timeouts (other than treating an 
// interval of zero as an unsubscribe operation)
//
// Note: the set of event types is presumed to be finite and relatively small.
// Once an event type is seen, space is allocated to subscriptions for that
// type, and is not recovered when there are no outstanding subscriptions.    
//

// Construct a new event publish-subscribe object
//
// Implements the simplest form of event router, where all events are 
// published and subscribed using a single router instance.
//    
// This implementation also ignores timeouts (other than treating an 
// interval of zero as an unsubscribe operation)
//
function EventPubSub(uri) {
    this.init(uri);
    return this;
}

EventPubSub.prototype = new EventAgent(null);

// Function called to initialize an EventPubSub object,
EventPubSub.prototype.init = function(uri) {
    // Set event router URI
    this._uri      = makeEventAgentUri(EventUriRouterBase, uri);
    // Subscription table for local delivery of events
    this._sub      = new EventTypeSourceDict(this._uri);
    this._subcount = 0;
    return;
};

// String representation of an EventPubSub object
EventPubSub.prototype.toString = function() {
    return "EventPubSub("+this._uri+")";
}

// Function called to close down event router.
EventPubSub.prototype.close = function() {
    return;
};

// Subscribe an event handler to an event/source combination.
//
// interval     is a time interval, in seconds, for which the subscription 
//              is maintained.
// handler      is an event handler to received subscribed events
// evtype       if defined, is the event type to subscribe to
// source       if defined, is the event source to subscribe to
//
// A Deferred status value is returned indicating the outcome of 
// the subscribe operation.
//
EventPubSub.prototype.subscribe = 
function(interval, handler, evtype, source) {
    //--ok(true,"TRACE:subscribe "+this+" -> "+interval+", "+handler+", "+evtype+", "+source);
    if (evtype === undefined) { evtype = null; }
    if (source === undefined) { source = null; }
    var here = this;    // 'this' is rebound when deferred steps are executed
    var m    = new DeferredMonad("subscribe "+handler);
    m.bind("sts", 
        function (m) { return here.unsubscribe(handler, evtype, source); });
    if (interval !== 0) {
        m.bind("sts",
            function (m) {
                // Register new subscription
                here._sub.insert(evtype, source, handler);
                here._subcount += 1;
                handler.initSubscription(StatusVal.SUBSCRIBED);
                // Publish subscribe request and notify events
                return here.publishSubscription(
                    handler, interval, evtype, source);
            });
        m.bind("sts",
            function (m) {
                //--ok(true,"TRACE:subscribe "+here+" -> publishSubscription sts "+m.sts);
                if (m.sts != StatusVal.OK) {
                    return here.unsubscribe(handler, evtype, source);
                }
                return StatusVal.SUBSCRIBED;
            });
    }
    m.eval(function (m) { return m.sts; });
    var res = m.run(StatusVal.OK);
    //--ok(true,"TRACE:subscribe "+this+" -> return "+res);
    return res;
};

// Unsubscribe an event handler from an event/source combination.
//
// A Deferred status value is returned indicating the outcome of the 
// unsubscribe operation.
//
EventPubSub.prototype.unsubscribe =
function(handler, evtype, source) {
    //--ok(true,"TRACE:unsubscribe "+this+" -> "+handler+", "+evtype+", "+source);
    if (evtype === undefined) { evtype = null; }
    if (source === undefined) { source = null; }
    var here = this;    // 'this' is rebound when deferred steps are executed
    var removed = this._sub.remove(evtype, source, handler);
    if (removed.length === 0) { return makeDeferred(StatusVal.UNSUBSCRIBED); }
    // At least one subscription was cancelled...
    this._subcount -= removed.length;
    handler.endSubscription(StatusVal.UNSUBSCRIBED);
    var m = new DeferredMonad("unsubscribe "+this);
    m.bind("sts",
        function (m) {
            return here.publishSubscription(handler, 0, evtype, source);
        });
    m.eval(
        function (m) {
            if (m.sts == StatusVal.OK) {
                return StatusVal.UNSUBSCRIBED;
            } 
            else {
                return m.sts;
            }
        });
    var res = m.run(StatusVal.OK);
    return res;
};

// Local helper to propagate a subscribe or unsubscribe request
// (unsubscribe is distinguished by interval=0).
//
// Don't publish subscriptions to subscribe events (watch requests) as the encoding hack
// used means these appear as encoded subscription of the kind we're trying to watch.
// And in any case, there's no point in publishing events for watch requests.
//
EventPubSub.prototype.publishSubscription = 
function(handler, interval, evtype, source) {
    //--ok(true,"TRACE:publishSubscription "+this+" -> "+interval+", "+evtype+", "+source);
    var sts = makeDeferred(StatusVal.OK);
    if (!isSubscribeEvent(evtype)) {
        var subreq = makeSubscribeEvent(
            EventUri.SubscribeType, handler.getUri(), interval, evtype, source);
        sts = this.publish(this.getUri(), subreq);
    }
    return sts;
};

// Return count of current subscriptions.
//
// This function is provided for testing purposes
//
EventPubSub.prototype.getSubscriptionCount = function() {
    assert("getSubscriptionCount", this._subcount == this._sub.count());
    return this._subcount;
};

// Publish an event.  The event source is taken from the event itself;  the 'source'
// parameter provides an EventAgent context that may be used for diagnostic or
// security purposes.
//
// Note that this.publish has the same interface as an event callback function 
// provided to makeHandler
//
EventPubSub.prototype.publish = function(source, event) {
    //--ok(true,"TRACE:publish "+this+" -> "+event+", "+source);
    var here = this;    // 'this' is rebound when DeferredMonad steps are executed
    var m    = new DeferredMonad("publish "+source);
    m.bind("sts", 
        function (m,v) {
            if ( false && !isSubscribeEvent(event.getType()) ) {
                debugger;       // SEEN HERE
            }
            return here.deliver(event);
        });
    m.bind("sts",
        function (m,v) {
            if ( false && !isSubscribeEvent(event.getType()) ) {
                debugger;       // SEEN HERE
            }
            if (m.sts == StatusVal.OK) {
                return here.forward(
                    event, new EventEnvelope(event, here.getUri()));
            }
            else {
                return m.sts;
            }
        });
    var res = m.run(StatusVal.OK);
    if ( false && !isSubscribeEvent(event.getType()) ) {
        debugger;       // SEEN HERE
    }
    return res;
};

// Local delivery of an event.
//
// Returns a Deferred object with the final status of the deliver operation.
//
EventPubSub.prototype.deliver = function(event) {
    //--ok(true,"TRACE:deliver "+this+" -> "+event);
    var r = this;
    var m = new DeferredMonad("deliver");
    // Local function executed in monad to call next event handler if
    // no error has been seen yet.
    function dodel(h,m,v) {
        if (v == StatusVal.OK) {
            v = h.handleEvent(event);
            return v;
        }
    }
    // Iterator function adds handler delivery call to monad
    function cbdel(handler) {
        m.eval(MochiKit.Base.partial(dodel,handler));
    }
    // Iterator function adds watch delivery call to monad
    // (only if subscribed event type is "subscribe")
    function cbwat(e,t,handler) {
        if (e == EventUri.SubscribeType) {
            cbdel(handler);
        }
    }

    // Main function
    var evtypsrc = getEventTypeSource(event); // [evtyp, evsrc]
    if (isSubscribeEvent(evtypsrc[0])) {
        // Subscribe event: 
        // Deliver to watchers only, don't match wilcard event subscriptions
        this._sub.iterateWild(evtypsrc[0], evtypsrc[1], cbwat);
    }
    else {
        // Non-subscribe event
        this._sub.iterate(evtypsrc[0], evtypsrc[1], cbdel);
    }
    // Execute monad with initial status value
    return m.run(StatusVal.OK);
};

// Dummy forwarding function called by publish method: 
// this is overridden in EventRouter instances.
//
EventPubSub.prototype.forward = function(event, envelope) {
    //--ok(true,"TRACE:EventPubSub.forward "+this+" -> "+event);
    return makeDeferred(StatusVal.OK);
};

// ----------------------------------------------------------------
// ---- EventRouter adds event forwarding logic to EventPubSub ----
// ----------------------------------------------------------------

// Construct a new event router object
function EventRouter(uri) {
    this.init(uri);
    return this;
}

EventRouter.prototype = new EventPubSub(null);

// Function called to initialize an EventRouter object,
EventRouter.prototype.init = function(uri) {
    // Invoke EventPubSub initializer
    // Initializes local event subscription data
    EventPubSub.prototype.init.call(this,uri);
    // Forward routing table: this is effectively a static routing table
    // for event forwarding, indicating the sources to subscribe to for 
    // relaying of given event+source combinations.
    //
    // For subscribe request routing, entries are added to the target node's
    // forward routing table for subscribe events to the corrresponding
    // event type.  See method routeEventFrom for details.
    this._fwdroute = new EventTypeSourceDict(this._uri+"/fwdroute");
    // Forwarding table: this is a dynamic routing table indicating
    // the subscribed routers to which events should be forwarded.
    this._fwdtable = new EventTypeSourceDict(this._uri+"/fwdtable");
    this._fwdcount = 0;
    return;
};

// String representation of an EventRouter object
EventPubSub.prototype.toString = function() {
    return "EventRouter("+this._uri+")";
}

// Function called to close down event router.
EventRouter.prototype.close = function() {
    // See: 
    // http://truecode.blogspot.com/2006/08/object-oriented-super-class-method.html
    // (I can live with the hard-coded superclass here.)
    EventPubSub.prototype.close.call(this);
    return;
};

// Forward an event to any external event routers that have subscribers for
// this event.
//
// The event to be delivered is supplied bare and also wrapped in a forwarding 
// envelope, which contains additional information about the event delivery path 
// that is used,  possibly among other things, to detect event forwarding loops.
//
// Returns a Deferred object with the final status of the forward operation.
//
EventRouter.prototype.forward = function(event, envelope) {
    //--ok(true,"TRACE:forward "+this+" -> "+event);
    var here = this;
    var m    = new DeferredMonad("forward");
    if ( false && !isSubscribeEvent(event.getType()) ) {
        debugger;   // seen here
        }
    // Local function executed in monad to call next receiver
    // if no error has been seen yet.
    function dofwd(r,m,v) {
        //--ok(true,"TRACE:forward dofwd "+here+" -> r "+r+", m "+m+", v "+v);
        if (v == StatusVal.OK) {
            v = r.receive(here, envelope);
        //--ok(true,"TRACE:forward dofwd "+here+" -> return "+v);
        return v;
        }
    }
    // Iterator function adds handler delivery call to monad
    // Called once for each router to which the event shoukld be forwarded.
    function itfwd(router) {
        m.eval(MochiKit.Base.partial(dofwd, router));
    }
    // Main function
    var sub = openSubscribeEvent(isSubscribeEvent, event);
    if (sub) {
        //--ok(true,"TRACE:forward sub "+this+" -> "+sub);
        // Subscribe events routed per static routing table and subscribed event type/source
        this._fwdroute.iterate(sub[3], sub[4], itfwd);
    }
    else {
        // Other events routed per dynamic routing table and event type/source
        this._fwdtable.iterate(event.getType(), event.getSource(), itfwd);
    }
    var sts = m.run(StatusVal.OK);
    //--ok(true,"TRACE:forward "+this+" -> return "+sts);
    return sts;
};

// Receive an event from an external event router.
//
// The event received is wrapped in a forwarding envelope, which contains
// additional information about the event delivery path that is used, possibly
// among other things, to detect event forwarding loops.
//
// Returns a Deferred object with the final status of the receive operation.
//
EventRouter.prototype.receive = function(fromrouter, envelope) {
    var here  = this;
    var m     = new DeferredMonad("receive from "+fromrouter);
    var event = envelope.unWrap(this.getUri());     // unWrap handles loop-detection
    //--ok(true,">> TRACE:receive "+this+" -> from "+fromrouter);
    if (event) {
        //--ok(true,"   TRACE:receive "+this+" -> event "+event+", "+event.getPayload());
        // Local event delivery
        m.eval(
            function (m,v) { 
                return here.deliver(event); 
            });
        var sub = openSubscribeEvent(isSubscribeEvent, event);
        // Handle new subscription request
        if (sub) {
            //--ok(true,"   TRACE:receive sub "+this+" -> "+sub);
            m.eval(
                function (m,v) {
                    return here.doSubscribeRequest(
                        fromrouter, sub[2], sub[3], sub[4]);
                });
        }
        // Foreward event to next router
        var newenv = envelope.nextHop(this.getUri());
        m.eval(
            function (m,v) {
                //--ok(true,"   TRACE:receive fwd "+here+" -> addhop "+here.getUri());
                var sts = here.forward(event, newenv);
                //--ok(true,"   TRACE:receive fwd "+here+" -> sts "+sts);
                return sts;
            });
        // Undo subscription if forwarding failed
        m.eval(
            function (m,v) {
                //--ok(true,"   TRACE:receive unsub? "+here+" -> sts "+v);
                if (sub && sub[2] !== 0 && v !== StatusVal.OK) {
                    v = here.doSubscribeRequest(
                        fromrouter, 0, sub[3], sub[4]);
                }
                //--ok(true,"   TRACE:receive unsub! "+here+" -> sts "+v);
                return v;
            });
    }
    var sts = m.run(StatusVal.OK);
    //--ok(true,"<< TRACE:receive "+this+" -> return "+sts);
    return sts;
};

// Helper function to register an event forwarding subscription for 
// the designated event type and source with the routers from which
// such events may be received.
//
// TODO: logic to keep maximum subscription interval
//
EventRouter.prototype.doSubscribeRequest = 
function (fromrouter, interval, evtype, source) {
    //--ok(true,"TRACE:doSubscribeRequest "+
    //--    this+" -> "+fromrouter+", "+interval+", "+evtype+", "+source);
    if (interval !== 0) {
        // subscribing
        if (!this._fwdtable.hasValue(evtype, source, fromrouter)) {
            // new subscription
            this._fwdtable.insert(evtype, source, fromrouter);
            this._fwdcount += 1;
            //--ok(true,"TRACE:doSubscribeRequest "+this+" -> subscribed "+this._fwdcount);
        }
    }
    else {
        // unsubscribing
        var removed = this._fwdtable.remove(evtype, source, fromrouter);
        this._fwdcount -= removed.length;
            //--ok(true,"TRACE:doSubscribeRequest "+this+" -> unsubscribed "+this._fwdcount);
    }
    return "doSubscribeRequest" ;   // Diagnostic sentinel only
};

// --- Interrogate subscription status ---

// Return count of current forwarding subscriptions.
//
// This function is provided for testing purposes
//
EventRouter.prototype.getForwardCount = function() {
    assert("getForwardCount", this._fwdcount == this._fwdtable.count());
    return this._fwdcount;
};

// --- Specify event routing ---

// Define event routing.  When a subscription is received for an event matching
// the supplied type and source, a new subscription to the specified router is 
// established so that events can be received from that router and republished
// to local subscribers.
//
// (Remember the old programmer's joke about the COME FROM in Fortran?
// This might be regarded as a realization of that.
// See: http://www.fortran.com/come_from.html)
//
EventRouter.prototype.routeEventFrom = function(evtype,source,router) {
    this._fwdroute.insert(evtype,source,router);
    return;
};

// Obtain a copy of the routing table.  Used for debugging only.
//
EventRouter.prototype.getRouteTable = function() {
    return this._fwdroute.list();
};

// --------------------------------------------------------------
// ---- Dictionary keyed by (event type, event source) pairs ----
// --------------------------------------------------------------

// Helper class implements a dictionary like structure indexed by event type 
// and  event source values (URIs), where None may be used as a catch-all 
// for either value.
//
// This class is used in implementing dispatching for event publication, 
// subscription forwarding between multiple routers and subscription tracking 
// so that forwarded subscriptions can be terminated when no longer needed.
//
// Note: the set of event types is presumed to be finite and relatively small.
// Once an event type is seen, space ios allocated to subscriptions for that
// type, and is not recovered when there are no outstanding subscriptions.    
//

// Initialize a new event type+source distionary
function EventTypeSourceDict(id) {
    this._typd = new WildDict(id);  // Indexed by event type; 
                                    // Values are WildDicts indexed by event source
}

// Insert value into the dictionary indexed by evtype and evsrc.
//
// Returns a resulting list of values for the given index.
//
EventTypeSourceDict.prototype.insert = function(evtype, evsrc, value) {
    // Local function updates the "WildDict" entry for the indicated event type,
    // which is a list of "WildDict" values mapping event sources to 
    // subscription lists
    function upd(srcd) {
        // Entry is an empty list or singleton list with 1 dictionary.
        // Create a singleton list of dictionaries on first use.
        if (srcd.length === 0) { srcd = [new WildDict(evtype)]; }
        var inserted = srcd[0].insert(evsrc, value);
        return [inserted, srcd];
    }
    // Main function here
    return this._typd.update(evtype, upd);
};

// Remove a value from the dictionary.
//
// Returns a list of values removed.
//
EventTypeSourceDict.prototype.remove = function(evtype, evsrc, value) {
    // Local function updates the "WildDict" entry for the indicated event type,
    // which is a list of "WildDict" values mapping event sources to subscription lists
    function upd(srcd) {
        var removed = [];
        if (srcd.length !== 0) {
            removed = srcd[0].remove(evsrc, value);
        }
        return [removed, srcd];
    }
    // Main function here
    return this._typd.update(evtype,upd);
};

// Find an entry matching  exactly the supplied event type and event source 
// (either of which may be None).
//
// Returns the list of values for this entry, or an empty list.
//
EventTypeSourceDict.prototype.findEntry = function(evtype, evsrc) {
    // Local functions simply returns the entry value list as the result and 
    // for the new entry value.
    function upd(srcd) {
        var entry = [];
        if (srcd.length !== 0) {
            entry = srcd[0].findEntry(evsrc);
        }
        return [entry, srcd];
    }
    // Main function here
    return this._typd.update(evtype, upd);
};

// Look for an entry matching the supplied key, equal to the supplied value.
//
// Returns 'true' if a macthing entry is found, otherwise 'false'
//
EventTypeSourceDict.prototype.hasValue = function(evtype, evsrc, val) {
    // Local function tests each keyed value
    var found = false;
    function testval(entry) {
        found = found || entry == val;
        return;
    }
    this.iterate(evtype, evsrc, testval);
    return found;
};

// Return a list of values in the table, including catch-all values, 
// matching the supplied event type and source.
//
EventTypeSourceDict.prototype.find = function(evtype, evsrc) {
    var vals = [];
    function addval(val) {
        vals.push(val);
    }
    this.iterate(evtype, evsrc, addval);
    return vals;
};

// Iterates over entries matching the supplied event type and source;
// that is, all entries with the specified values, and also all wildcard entries.  
// The iterator returns wildcard entries after non-wildcard entries, with wildcard
// event values after wildcard source values.
//
// Iteration works through a callback to 'yield' for each matching entry found,
// with the entry value being the supplied parameter value.
//
EventTypeSourceDict.prototype.iterate = function(evtype, evsrc, yield) {
    function is(srcd) {
        srcd.iterate(evsrc, yield);
    }
    this._typd.iterate(evtype, is);
    return;
};

// Iterates over entries matching the supplied event type and source;
// that is, all entries with the specified values, and also all wildcard 
// entries.  The iterator returns wildcard entries after non-wildcard 
// entries, with wildcard event types after wildcard event source.
//
// Iteration works through a callback to 'yield' for each matching entry found,
// with the event type, source and entry value being the supplied parameter 
// values.
//
EventTypeSourceDict.prototype.iterateKey = function(evtype, evsrc, yield) {
    function is(evtyp, srcd) {
        function ysv(s,v) { yield(evtyp,s,v); }
        srcd.iterateKey(evsrc, ysv);
    }
    this._typd.iterateKey(evtype, is);
    return;
};

// Iterates over entries matching the supplied event type and source;
// that is, all entries with the specified values, and also all wildcard entries.  
// The iterator returns wildcard entries after non-wildcard entries, with wildcard
// event values after wildcard source values.
//
// This function is like iterateKey, except that null supplied parameters are
// themselves treated as wildcard values.
//
EventTypeSourceDict.prototype.iterateWild = function(evtype, evsrc, yield) {
    function yts(evtyp, srcd) {
        function ysv(s,v) { yield(evtyp,s,v); }
        srcd.iterateWild(evsrc, ysv);
    }
    this._typd.iterateWild(evtype, yts);    
    return;
};

// Iterates over all entries in an EventTypeSource dictionary.
// The iterator returns wildcard entries after non-wildcard entries, 
// with wildcard event values after wildcard source values.
//
EventTypeSourceDict.prototype.iterateAll = function(yield) {
    this.iterateWild(null, null, yield);
    return;
};

// Scan all members in table.  Iterator returns (type,source,value) triples.
//
EventTypeSourceDict.prototype.scan = function(yield) {
    function ss(evtype,srcd) {
        srcd.scan(MochiKit.Base.partial(yield, evtype));
    }
    this._typd.scan(ss);
    return;
};

// Returns a list of [type,source,value] values
//
EventTypeSourceDict.prototype.list = function() {
    var tsvs = [];
    function ls(t, s, v) {
        tsvs.push([t,s,v]);
    }
    this.scan(ls);
    return tsvs;
};

// Returns a count of members.  Used for testing.
//
EventTypeSourceDict.prototype.count = function() {
    var count = 0;
    function cs(t,s,v) {
        count++;
    }
    this.scan(cs);
    return count;
};

// -----------------------------------------------
// ---- Dictionary keyed by value or wildcard ----
// -----------------------------------------------

// Helper class implements a dictionary-like structure supporting wildcard entries,
// and also supports returning multiple results per lookup.
// (That is, entries which match any key, as opposed to wildcard keys that match any entry).
//
// Stored values, as well as keys, must support equality test so that they can be
// identified for removal.
//

// Initialize an empty lookup table
//
function WildDict(ident) {
    this._id    = ident;    // identifier string
    this._wild  = [];       // List of wild-match entries
    this._keyed = {};       // Dictionary of keyed entries
}

// Equality based on identifier string; allows WildDicts to contain other WildDicts as values
//
WildDict.prototype.eq = function(other) {
    return this._id == other._id;
};

// String form shows identifier.
//
WildDict.prototype.toString = function() {
    return "WildDict("+this._id+")";
};

// Function to apply an update to a WildDict entry:  key indicates the entry to be
// updated (may be None), and updater is a function that applies the update.
//
// This function is modelled loosely on the Haskell monadic bind function, where
// the located entry is treated like a state monad and the supplied updater function
// both updates the monad value and returns a derived value to the calling program.
//
// The updater function is applied to the list of matching table values (or empty list), 
// and must return a pair, the first of which is returned to the calling program, 
// and the second is a new list that replaces the previous list of values.  
// (Note: if the previous list is updated in situ, that list should be returned.)  
// If an empty replacement list is returned, the entry is removed.
//
WildDict.prototype.update = function(key, updater) {
    var upd;                                // receives [result,new values]
    if (key) {
        if (this._keyed.hasOwnProperty(key)) {
            upd = updater(this._keyed[key]);
            if (upd[1].length > 0) {        // new list of values value
                this._keyed[key] = upd[1];
            }
            else {
                delete this._keyed[key];
            }
        }
        else {
            upd = updater([]);
            if (upd[1]) { this._keyed[key] = upd[1]; }
        }
    }
    else {
        upd = updater(this._wild);
        this._wild = upd[1];
    }
    return upd[0];
};

// Inserts a new entry into the lookup table.  If key is null, then this is
// a wildcard entry that matches any key.
//
// Returns the updated table entry.
//
WildDict.prototype.insert = function(key, value) {
    function upd(entry) {
        entry.push(value);
        return [entry,entry];
    }
    return this.update(key, upd);
};

// Removes entries from the lookup table.  If key is null, then only wildcard
// entries are removed.  If key is not null, then only non-wildcard entries
// are removed.  Multiple entries with the given key and value may be removed.
//
// Returns a list of entries removed.
//
WildDict.prototype.remove = function(key, value) {
    function upd(entry) {
        return filterSplit(isEq(value), entry);
    }
    return this.update(key, upd);
};

// Find an entry matching exactly the supplied key value (which may be null).
//
// Returns the list of values for this entry, or an empty list.
//
WildDict.prototype.findEntry = function(key) {
    function upd(entry) {
        return [entry,entry];
    }
    return this.update(key, upd);
};

// Returns an array of entries matching the supplied key; that is, all 
// entries with the specified key, and also all wildcard entries.  The list
// returns wildcard entries after non-wildcard entries.  If key is null, 
// then only wildcard entries are returned.
//
WildDict.prototype.find = function(key) {
    var vals = [];
    function addval(val) {
        vals.push(val);
    }
    this.iterate(key, addval);
    return vals;
};

// Returns an iterator over entries matching the supplied key; that is, all 
// entries with the specified key, and also all wildcard entries.  The iterator
// returns wildcard entries after non-wildcard entries.
//
// If key is null or undefined, then only wildcard entries are returned.
//
// 'yield' is a callbacxk function that is invoked with the each dictionary 
// value found (the corresponding key is not passed to the callback)
//
// TODO: reimplement using iterateKey
//
WildDict.prototype.iterate = function(key, yield) {
    var i;
    if (key && this._keyed.hasOwnProperty(key)) {
        for (i in this._keyed[key]) { yield(this._keyed[key][i]); }
    }
    for (i in this._wild) { yield(this._wild[i]); }
    return;
};

// Returns an iterator over entries matching the supplied key; that is, all 
// entries with the specified key, and also all wildcard entries.  The iterator
// returns wildcard entries after non-wildcard entries.
//
// If key is null or undefined, then all entries are returned.
//
// 'yield' is a callback function that is invoked with the key and value
// for each dictionary entry found.
//
WildDict.prototype.iterateWild = function(key, yield) {
    if (key) { 
        this.iterateKey(key, yield); 
    } else {
        this.iterateAll(yield);
    }
    return;
};

// Returns an iterator over entries matching the supplied key; that is, all 
// entries with the specified key, and also all wildcard entries.  The iterator
// returns wildcard entries after non-wildcard entries.
//
// If key is null or undefined, then only wildcard entries are returned.
//
// 'yield' is a callbacxk function that is invoked with the key and value
// for each dictionary entry found.
//
WildDict.prototype.iterateKey = function(key, yield) {
    var i;
    if (key && this._keyed.hasOwnProperty(key)) {
        for (i in this._keyed[key]) { yield(key, this._keyed[key][i]); }
    }
    for (i in this._wild) { yield(null, this._wild[i]); }
    return;
};

// Returns an iterator over all entries in the dictionaryu.
// The iterator returns wildcard entries after non-wildcard entries.
//
// 'yield' is a callbacxk function that is invoked with the key and value
// for each dictionary entry found.
//
WildDict.prototype.iterateAll = function(yield) {
    var i;
    for (var key in this._keyed) {
        for (i in this._keyed[key]) { yield(key, this._keyed[key][i]); }
    }
    for (i in this._wild) { yield(null, this._wild[i]); }
    return;
};

// Scan all members in table.  Iterator returns (key,value) pairs.
//
WildDict.prototype.scan = function(yield) {
    var i;
    for (var key in this._keyed) {
        for (i in this._keyed[key]) { yield(key, this._keyed[key][i]); }
    }
    for (i in this._wild) { yield(null, this._wild[i]); }
    return;
};

// Returns a list of [key,member] values
//
WildDict.prototype.list = function() {
    var kvs = [];
    function ls(k,v) {
        kvs.push([k,v]);
    }
    this.scan(ls);
    return kvs;
};

// Returns a count of members.  Used for testing.
//
WildDict.prototype.count = function() {
    var count = 0;
    function cs(k,v) {
        count++;
    }
    this.scan(cs);
    return count;
};

// --------------------------------------
// --- Miscellaneous helper functions ---
// --------------------------------------

// Function filters a list into two sub-lists, the first containing entries
// satisfying the supplied predicate p, and the second of entries not satisfying p.
//
function filterSplit(p, values) {
    var satp = [];
    var notp = [];
    for (var i in values) {
        if (p(values[i])) {
            satp.push(values[i]);
        }
        else {
            notp.push(values[i]);
        }
    }
    return [satp,notp];
}

// Return a function that tests for equality with the supplied value, using
// its 'eq' method. (Partially applied equality function.)
//
function isEq(v) {
    if ( typeof v.eq == "function" ) {   
        return MochiKit.Base.bind(v.eq,v);
    }
    else {
        return MochiKit.Base.partial(MochiKit.Base.operator.eq,v);
    }
}

// Return an event object to convey the supplied subscription details.
//
// interval=0 for unsubscribe.
//
function makeSubscribeEvent(subtype, subscriber, interval, evtype, source) {
    var payload = makeSubscribeData(interval, evtype, source);
    return makeEvent(subtype, subscriber, payload);
}

// Return details from a subscribe event, 
// or null if it is not a subscribe event.
// 
// 'subtype' is a function that tests if the supplied event type is a 
// subscription event type.
//
// Returns a list: [subscribe event type, 
//                  subscriber URI, 
//                  interval, subscribed event type, subscribed event source]
// 
// For unsubscribe, interval=0
//
function openSubscribeEvent(subtype, event) {
    if (subtype(event.getType())) {
        var evsub = parseSubscribeData(event.getPayload());
        if (evsub !== null) {
            return [event.getType(),event.getSource()].concat(evsub);
        }
    }
    return null;
}

// Returns the event type and source for the supplied event, taking account
// of different source rules for subscription releated events.
//
function getEventTypeSource(event) {
    var evtyp = event.getType();
    var evsrc = event.getSource();
    if (isSubscribeEvent(evtyp)) {
        var evsub = parseSubscribeData(event.getPayload());
        if (evsub) { evsrc = evsub[1]; }
    }
    return [evtyp,evsrc];
}

// Test event type for subscribe event
function isSubscribeEvent(evtype) {
    return evtype == EventUri.SubscribeType;
}

// End.
// 456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789: