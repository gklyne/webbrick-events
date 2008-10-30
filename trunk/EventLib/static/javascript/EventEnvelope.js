// $Id$
//
// Copyright (c) 2008 O2M8 Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php
//
// Event forwarding envelope.

//
// from Event             import Event, makeEvent
//

// Helper class THAT implements a wrapper for forwarded events.
//    
// One function of this wrapper is to carry a trail of previous routers through
// which the event has been forwarded, used to detect and block event routing 
// loops.
//
// An event envelope is represented by a sequence of hops terminating with the
// envelope itself.  Each hop contains a counter that can be used for quick 
// detection of over-long routing paths.
//    
// Note: the EventEnvelope itself is immutable once created:  multiple hops
// are encoded as a list of EventEnvelope values, terminating in one with a 
// count of zero and a pointer to the event itself.

// Create an initial routing envelope for a supplied event, or
// to extend an existing envelope with an additional routing hop.
//
// External use is generally of the form:
//   new EventEnvelope(event,senderURI)
//
function EventEnvelope(trail, routerURI, count) {
    // Initialize a new event object
    // Use blank string consistently for undefined fields
    this._trail = trail     || null;        // Previous envelope or event
    this._route = routerURI || null;        // Router URI from which event is forwarded
    this._count = count     || 0;           // Number of hops in route
}

new EventEnvelope();                        // Create prototype

// Return a new envelope for the next event routing hop 
// via the designated event router.
EventEnvelope.prototype.nextHop = function(routerURI) {
    return new EventEnvelope(this, routerURI, count=this._count+1)
}

// Performs three functions:
// (1) tests if the event has already been routed via the specified router, 
// (2) tests if the event has been routed through a given maximum number of hops, and
// (3) extracts the event from its envelope.
// 
// If the event has already been routed via the designated router, or has been
// via the designated number of hops, returns null, otherwise returns the event
// object without the routing envelope.
//
EventEnvelope.prototype.unWrap = function(routerURI, maxhop) {
    if (maxhop && this._count > maxhop) return null;
    var e = this;
    while (e._count > 0) {
        if (e._route === routerURI) return null;
        e = e._trail;
    }
    if (!(e._trail instanceof Event)) {
        throw new Error("EventEnvelope chain must end with Event object");
    }
    return e._trail
}

// Flattens an envelope and contained event, returning a pair:
//   [event,path]
// where path is a list of router URIs from the envelope chain
//
EventEnvelope.prototype.flatten = function(path) {
    if (path === undefined) path = [];      // Create a new empty list each time called
    path.unshift(this._route);              // Insert next hop router id
    if (this._count > 0) return this._trail.flatten(path);
    if (!(this._trail instanceof Event)) {
        throw new Error("EventEnvelope chain must end with Event object");
    }
    return [this._trail, path];
}

// Constructs an event envelope given an event and a list of URIs
// This is the approximate inverse of flatten
function constructEnvelope(path, event) {
    if (!(event instanceof Event)) {
        throw new Error("constructEnvelope must be called with an Event object");
    }
    if (!path || !(path instanceof Array)) {
        throw new Error("constructEnvelope path must be a non-empty array");
    }
    var env = new EventEnvelope(event, path[0]);
    for (var i = 1 ; i < path.length ; i++) {
        env = env.nextHop(path[i])
    }
    return env
}

// End.
