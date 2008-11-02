// $Id$
//
// Copyright (c) 2008 WebBrick Systems Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php
//
// Event and event subscription serialization and deserialization.
//
// This module provides functions for converting event forwarding envelopes,
// event subsubscriptions and event unsubsubscriptions to and from a
// serialized text format used for transmission between processes.
//
// from Event          import Event, makeEvent
// from EventEnvelope  import EventEnvelope

// Serialize subscription forwarding request for transmission.
//    
// Format is 'subscribe:int,<evtype>,<source>',
// where <evtype> and/or <source> may be blank if they are
// not specified.
//
function makeSubscribeData(interval, evtype, source) {
    return [interval, evtype, source];
}

// Serialize unsubscription forwarding request for transmission.
//
// Format is: 'unsubscribe:<evtype>,<source>',
// where <evtype> and/or <source> may be blank if they are
// not specified.
//
function makeUnsubscribeData(evtype, source) {
    return makeSubscribeData(0, evtype, source);
}

// Serialize event envelope for transmission.
//    
// Format is ["forward",[path],<evtype>,<source>,<payload>]
// where 'path' is a list of one or more comma-separated router URI strings
// describing the path of event forwarding so far.
//
function makeEnvelopeData(envelope) {
    var ep = envelope.flatten();
    var ed = [ "forward", [ep[1], ep[0].getType(), ep[0].getSource(), ep[0].getPayload()]]
    return MochiKit.Base.serializeJSON(ed)
}

// Make a message payload that signifies closedown of the event router.
function makeClosedownData() {
    return '["closedown", []]';
}

// Make a message payload that signifies an idle (no-op) response on the connection.
function makeIdleData() {
    return '["idle", []]';
}

// Parse and return JSON value
// Performs a safety check on the JSON value...
//
// From http://www.ietf.org/rfc/rfc4627.txt:
//
//   A JSON text can be safely passed into JavaScript's eval() function
//   (which compiles and executes a string) if all the characters not
//   enclosed in strings are in the set of characters that form JSON
//   tokens.  This can be quickly determined in JavaScript with two
//   regular expressions and calls to the test and replace methods.
//
//      var my_JSON_object = !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
//             text.replace(/"(\\.|[^"\\])*"/g, ''))) &&
//         eval('(' + text + ')');
//
// (text,replace(...) strips out all quoted strings, then !(/.../).test()
// returns false if any non-value characters are in the string.
//
// If the expression is not valid JSON, return null.
//
function parseJSON(text) {
    if (/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(text.replace(/"(\\.|[^"\\])*"/g, ''))) {
        return null;
    }
    try {
        return eval('(' + text + ')');
    }
    catch (ex) {
        return null;
    }
}

// Parse serialized subscription data, returning a triple:
// (interval, evtype, source)
// or null if the serialized data does not match.
//
function parseSubscribeData(val) {
    //var val = parseJSON(data);
    if (val) {
        if (typeof val != "object")        return null;
        if (typeof val.length != "number") return null;
        if (val.length != 3 )              return null;
        if (typeof val[0] != "number" )    return null;
        if (val[1] && typeof val[1] != "string" ) return null;
        if (val[2] && typeof val[2] != "string" ) return null;
    }
    return val;
}

// Parse serialized unsubscription data, returning a pair
// [evtype, source], or null if the serialized data does not match.
//
function parseUnsubscribeData(data) {
    var val = parseSubscribeData(data);
    if (val && val[0] == 0) return [val[1], val[2]];
    return null;
}

// Parse serialized event forwarding envelope data, returning a list:
// [[route,...], evtype, source, payload]
// or null if the serialized data does not match ["forward", [...]]
//
function parseEnvelopeData(data) {
    var val = parseMessageData(data)
    if (val && val[0] == "forward") return val[1];
    return null;
}

// Parse serialized message data, returning a pair:
// [type, data]
// where 'data' is the individual message parse, and type is one
// of "forward", "idle" or "closedown"
// or return null if the serialized data does not match.
//
function parseMessageData(data) {
    var val = parseJSON(data);
    if (val) {
        if (typeof val != "object")           return null;
        if (typeof val.length != "number")    return null;
        if (val.length != 2 )                 return null;
        if (typeof val[0] != "string" )       return null;
        if (typeof val[1] != "object" )       return null;
        if (typeof val[1].length != "number") return null;
        // We have confirmed a pair [string,list]
        if ((val[0] == "idle" || val[0] == "closedown") && val[1].length == 0) return val;
        if ((val[0] == "forward")                       && val[1].length == 4) return val;
    }
    return null;
}

// End.
