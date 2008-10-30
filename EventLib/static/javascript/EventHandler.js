// $Id$
//
// Copyright (c) 2008 O2M8 Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php
//
// Event handler framework.
//

// EventHandler object: represents an event handler, which may also be an event source.
//
// Any event handler can also be used as an event source.
//
// Currently, an event handler is identified by a URI, and has methods for
// event delivery, start of subscription and termination of subscription.
//
// It is anticipated that future developments will also include some
// kind of security context information so that event subscription can be
// controlled for sensitive events.

// Initialize a new event source object.
// 'target' is a string containing a uri for the event target.
// 'handleEvent' is a function called when an evemnt is received.
//          Called as:  handleEvent(handler, event))
// 'initSubscription' is a function called when a new subscription is created for
//          the current event handler.
//          Called as: initSubscription(handler, status)
//          TODO: review this to consider also providing event type/source values
// 'endSubscription' is a function called when a subscription is terminated for
//          the current event handler.
//          Called as: endSubscription(handler, status)
//          TODO: review this to consider also providing event type/source values
//
function EventHandler(target, handleEvent, initSubscription, endSubscription) {
    this._uri              = target;
    this._handleEvent      = handleEvent;
    this._initSubscription = initSubscription;
    this._endSubscription  = endSubscription;
}

EventHandler.prototype = new EventAgent(undefined);    // Inherit EventAgent methods

// Function called by external code to deliver an incoming event.  If defined, the handler 
// function is called with this event handler object and the event itself as arguments.
//
// Returns a deferred return status from the event handler.
//
EventHandler.prototype.handleEvent = function(event) {
    var sts;
    if (typeof(this._handleEvent) == 'function') {
        sts = this._handleEvent(this, event);
        if (sts == undefined) {
            sts = makeDeferred(StatusVal.OK);
        }
    }
    else {
        sts = makeDeferred(StatusVal.OK);
    }
    // ok(true, "handleEvent("+this+","+event+") -> "+sts);
    return sts;
}

// Subscription notification. If defined, the notification function is called 
// with this event handler object and the subscription status value as arguments.
//
// Returns a deferred return status from the handler or subscription status.
//
EventHandler.prototype.initSubscription = function(status) {
    var sts;
    if (typeof(this._initSubscription) == 'function') {
        // Note that in Javascript, the following is a call to a function stored 
        // in a member variable, not a call to a member function...
        sts = this._initSubscription(this, status);
    }
    else {
        sts = makeDeferred(status);
    }
    // ok(true, "initSubscription("+this+","+status+") -> "+sts);
    return sts
}

// Subscription termination notification.  If defined, the notification function 
// is called with this event handler object and the subscription statuis value 
// as arguments.
//
// Returns a deferred return status from the handler or unsubscription status.
//
EventHandler.prototype.endSubscription = function(status) {
    var sts;
    if (typeof(this._endSubscription) == 'function') {
        // Note that in Javascript, the following is a call to a function stored 
        // in a member variable, not a call to a member function...
        sts = this._endSubscription(this, status);
    }
    else {
        sts = makeDeferred(status);
    }
    // ok(true, "initSubscription("+this+","+status+") -> "+sts);
    return sts
}

// Function to create an event handler object

var EventTargetSequence = 0     // sequence number for URI generation

// Make a new event handler value using the supplied URI.
//
// 'target'    is an event source or target URI for this handler.
// 'handler'   is a function called when a subscribed event is published, with the 
//             new event handler itself as its first argument, and the event object
//             as its second argument.
// 'initSubscription' and 'endSubscription' are called with the new event handler 
//             itself as their first argument, and the status code as their second.
//             TODO: review this to consider also providing event type/source values
// If no URI is supplied, a new value may be generated.
//
function makeEventHandler(target, handler, initSubscription, endSubscription) {
    if (!target) {
        EventTargetSequence++ ;
        target  = EventUriTargetBase+uriDate()+"/"+uriTime()+"/"+EventTargetSequence;
    }
    return new EventHandler(target, handler, initSubscription, endSubscription)
}

// Helper function to create deferred value result
function makeDeferred(val) {
    return MochiKit.Async.succeed(val);
}

// End.
