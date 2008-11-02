// $Id$
//
// Copyright (c) 2008 WebBrick Systems Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php
//
// EventAgent object: represents an event source or receiving agent.
//
// Currently, an event agent is represented by just a URI.
// It is anticipated that future developments will also include some
// kind of security context information so that event publication can be
// controlled for sensitive targets.
//
function EventAgent(source) {
        this._uri = source
}

new EventAgent();  // Force prototype into existence

// Event sources (and handlers) are considered equal if they have the same URI
EventAgent.prototype.eq = function (other) {
    return this._uri == other._uri;
}

// String representation of an event source is its URI.
EventAgent.prototype.toString = function() {
    return "EventAgent("+this._uri+")";
}

// Retrieve the event source identifying URI.
EventAgent.prototype.getUri = function() {
    return this._uri;
}


// Make a new event source value using the supplied URI.
//
// If no URI is supplied, a new value may be generated.
function makeEventAgent(source) {
    return new EventAgent(makeEventAgentUri(EventUriSourceBase, source));
}


// Helper functionto mint a unique URI for an event router using the
// specified base URI, if no URI is supplied.
//
var EventAgentSequence = 0;   // sequence number for URI generation
function makeEventAgentUri(base, uri) {
    // global EventAgentSequence
    if (!uri) {
        EventAgentSequence++;
        uri = base+uriDate()+"/"+uriTime()+"/"+EventAgentSequence;
    }
    return uri;
}

// End.
