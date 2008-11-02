// $Id$
//
// Copyright (c) 2008 WebBrick Systems Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php
//
// HTTP client event router implementation.
// 
// HTTP server and client event routers are connected:  all events, and forwarding 
// subscriptions received by one party are forwarded to the other.  Further, all 
// local subscriptions and event publication are handled as for a standard event router.
// 

/*global EventAgent, EventRouter, EventUriRouterBase, MochiKit, 
         Status, StatusUriBase, StatusVal, constructEnvelope,
         makeClosedownData, makeDeferred, makeEnvelopeData, makeEvent, makeEventAgentUri, 
         parseMessageData, uriJoin */

// Construct a new event router object
//
// This is a derivation of the EventRouter class that provides the same basic
// interface, but which also sends and reveives events using an HTTP connection.
// 
// The constructed class is an unmodified EventRouter, but the initializer also 
// creates an HTTP client event relay (see below) and hooks it up to the
// EventRouter constructed here.
//
function EventRouterHTTPC(uri, host, port, path) {
    this.init(uri, host, port, path);
    return;
}

EventRouterHTTPC.prototype = new EventRouter(null);

// Function called to initialize an EventRouterHTTPC object
EventRouterHTTPC.prototype.init = function(uri, host, port, path) {
    if ( !host ) { host = null; }
    if ( !port ) { port = 8082; }
    if ( !path ) { path = "/DefaultEventRouterPath"; }
    // Invoke EventRouter initializer
    // Initializes local event subscription data
    EventRouter.prototype.init.call(this,uri);
    // Create and hook up HTTP client event relay
    var relayuri = this.getUri()+"/HTTPC";
    this._relay  = new EventRelayHTTPC(this, relayuri, host, port, path);
    return;
};

// String representation of an EventRouterHTTPC object
EventRouterHTTPC.prototype.toString = function() {
    return "EventRouterHTTPC("+this._uri+")";
}

// Function called to close down event router.
EventRouterHTTPC.prototype.close = function() {
    // See: 
    // http://truecode.blogspot.com/2006/08/object-oriented-super-class-method.html
    this._relay.close();
    return EventRouter.prototype.close.call(this);
};

// Implements an HTTP client event router that runs as a separate sequence of
// callbacks, running in tandem with a simple event router, and provides a tiny 
// subset of the event router interface (receive).
//
// The HTTP connection operates as a half duplex channel for sending and
// receiving events, with the direction of flow being controlled by the
// client:  a GET request is implicitly a request for an event to be delivered
// and blocks until an event is available, the request timeout period expires,
// or the client cancels the request;  a POST request supplies an event to be 
// delivered and/or forwarded.
//
// Incoming events are queued for the client process, and are handled by the 
// HTTP client running as a sequence of related callbacks.
// 
// Interaction with the indicated EventRouter object takes place primarily
// through the 'receive' methods of this class and the supplied router.
// Because messages received from HTTP are sent onwards using the normal
// forwarding mechanisms, this class must perform loop-detection to stop 
// events being bounced back to the HTTP connection.
//
function EventRelayHTTPC(router, uri, host, port, path) {
    this.init(router, uri, host, port, path);
    return;
}

EventRelayHTTPC.prototype = new EventAgent(null);

// Initialize a new HTTP client event passing object
//         
// An HTTP client is associated with an existing event router, and
// sends all messages received from that router to the HTTP connection,
// and forwards all messages received from the HTTP connection to the
// router.
//        
EventRelayHTTPC.prototype.init = function(router, uri, host, port, path) {
    if ( !router ) { router = null; }
    if ( !host )   { host   = null; }
    if ( !port )   { port   = 8080; }
    if ( !path )   { path   = "/";  }
    // Set event router URI and other values
    this._uri     = makeEventAgentUri(EventUriRouterBase, uri);
    this._router  = router;
    this._closing = false;
    this._sadr    = host + (port == 80 ? '' : ':'+port);    // Server address (host:port)
    this._suri    = "http://"+this._sadr+path;              // Server request URI
    this._delay_on_error_min = 0.125;                       // Minimum retry interval for GET..
    this._delay_on_error_max = 30.0;                        // .. backing off to this
    this._delay_on_error     = this._delay_on_error_min;    // Initialize retry interval on error
    // Have 'router' send all subscriptions and events to this object
    router.routeEventFrom(null, null, this);                // Static route for subscriptions
    router.doSubscribeRequest(this, -1, null, null);        // Subscribe to all events
    // Start listening for incoming events
    this.listenEvent();
    return;
};

// String representation of an EventRelayHTTPC object
EventRelayHTTPC.prototype.toString = function() {
    return "EventRelayHTTPC("+this._uri+")";
}

// Stop responding to events
//
EventRelayHTTPC.prototype.close = function() {
    this._closing = true;
    this.post(makeClosedownData());
    return;
};

// This function receives messages from the associated router and
// transmits them on the HTTP interface.
// 
// NOTE: receive and forward functions perform loop-check for outgoing events
// (via 'unWrap'), and add the extra envelope hop for incoming.  The sole 
// purpose of this  loop-check is to prevent incoming HTTP events from being 
// sent out again on the same HTTP connection.
//
EventRelayHTTPC.prototype.receive = function(fromrouter, envelope) {
    function post_succ(v) {
        return StatusVal.OK;
    }
    function post_err(e) {
        // Trace(here._uri+" HTTP POST error "+e, "EventRelayHTTPC");
        return new Status(uriJoin(StatusUriBase, "HTTP_POST_error"), "POST error: "+e);
    }
    var here  = this;
    var event = envelope.unWrap(this._uri);
    if (event) {
        if ( false && !isSubscribeEvent(event.getType()) ) {
            debugger;   // GETTING HERE
        }
        // Trace("%s receive %s from %s"%(self._uri,event,fromrouter), "EventRelayHTTPC")
        if (!self._closing) {
            var req = this.post(makeEnvelopeData(envelope));
            req.addCallbacks(post_succ, post_err);
            return req;
        }
    }
    return makeDeferred(StatusVal.OK);
};

// Internal function to process event received from HTTP connection: 
// add new hop to envelope and pass it straight on to the associated router object.
//
EventRelayHTTPC.prototype.forward = function(event, env) {
    if ( false && !isSubscribeEvent(event.getType()) ) {
        debugger;   // Seen here
        }
    // Trace("%s forward %s"%(self._uri,event), "EventRelayHTTPC")
    return this._router.receive(this, env.nextHop(this._uri));
};

// Perform an HTTP POST request, to send a supplied event or other message
// to the  HTTP server.
//
// Returns Deferred HTTP request object
//
EventRelayHTTPC.prototype.post = function(msg) {
    // Trace(this._uri+" HTTP POST "+this._suri), "EventRelayHTTPC")
    this._delay_on_error = this._delay_on_error_min;
    var hdrs = { "Content-type":   "text/plain"
               , "Accept":         "text/plain"
               , "Content-length": msg.length.toString()
               };
    return MochiKit.Async.doXHR(this._suri,
        { "method":      'POST'
        , "sendContent": msg
        , "headers":     hdrs
        });
};

// Perform an HTTP GET request to receive an event or other message 
// from the server.
//
// Returns Deferred HTTP request object
//
EventRelayHTTPC.prototype.get = function() {
    // Trace(this._uri+" HTTP GET "+this._suri), "EventRelayHTTPC")
    var hdrs = { "Accept":         "text/plain"
               };
    return MochiKit.Async.doXHR(this._suri,
        { "method":  'GET'
        , "headers": hdrs
        });
};

// Establish listening HTTP request for incoming events, which are dispatched
// by forwarding to the main event router with which this client is associated
// (see 'forward' function above).
//
// No value is returned: any error conditions are handled locally.
//
// Stops listening when the event router is closed down (see 'close' function above).
//
EventRelayHTTPC.prototype.listenEvent = function() {
    var here = this;
    // Handle HTTP GET success
    var req_ok = function (req) {
        here._delay_on_error = here._delay_on_error_min;
        var msgbody = req.responseText;
        // Trace(self._uri+" GET msgbody: "+msgbody, EventRelayHTTPC");
        var msgdata = parseMessageData(msgbody);
        // Trace(self._uri+" GET msgdata: "+msgdata, EventRelayHTTPC");
        if (msgdata === null) {
            // Trace(self._uri+" response body malformed", EventRelayHTTPC");
        }
        else
        if (msgdata[0] == "forward") {
            // ["forward", [['R1', 'R2', 'R3'], 'ev:typ', 'ev:src', 'payload']]
            var ev  = makeEvent(msgdata[1][1],msgdata[1][2],msgdata[1][3]);
            var env = constructEnvelope(msgdata[1][0], ev);
            if ( false && !isSubscribeEvent(ev.getType()) ) {
                debugger;   // Seen here
                }
            here.forward(ev, env);
        }
        else
        if (msgdata[0] == "idle") {
            // No turnaround logic needed here
        }
        else {
            // Trace(self._uri+" response body unrecognized option: "+msgdata[0], EventRelayHTTPC");
        }
        req_next();
    };
    // Handle HTTP GET error
    var req_err = function (err) {
        // Trace(here._uri+" HTTP GET error "+err), "EventRelayHTTPC")
        if (here._delay_on_error < here._delay_on_error_max) {
            here._delay_on_error *= 2;
        }
        MochiKit.Async.callLater(here._delay_on_error, req_next);
        return;
    };
    // Issue HTTP GET request
    var req_next = function () {
        if (!here._closing) {
            here.get().addCallbacks(req_ok, req_err);
        }
        return;
    };
    req_next();
    return;
};

// End.
// 456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789:
