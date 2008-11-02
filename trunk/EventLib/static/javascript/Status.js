// $Id$
//
// Copyright (c) 2008 WebBrick Systems Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php
//
// Define a type for status values, and some specific status values.
//
// import URI
// from Event import Event
//
// Represent an exception exception constructed from status values.
//
function StatusException(status) {
    this._status = status;
}

new StatusException();      // Force existence of prototype

StatusException.prototype.getStatus = function () {
    return this._status;
}

StatusException.prototype.toString = function () {
    return str(this._status);
}


// Represents a status value.
//
// A status value may be used as a basis for creating event values
// or exceptions.  It also has an associated URI that can be used 
// to communicate the status value between systems, and is also used 
// as the event type when constructing an event object.
//
// Status values may be compared, where the status URI alone is used.
//
// Any additional values are used for diagnostic purposes only.
//
function Status(uri, message, values) {
    // Initialize a new status object
    if (message === undefined) message = "";
    if (values  === undefined) values  = null;
    this._uri     = uri
    this._message = message
    this._values  = values
}

new Status() ;              // Force existence of prototype

Status.prototype.eq = function (other) {
    return this._uri == other._uri;
}

Status.prototype.toString = function () {
    var msg = ""
    if (this._message) {
        msg = ": " + this._message;
    }
    return this._uri + msg;
}

Status.prototype.getUri = function () {
    return this._uri;
}

Status.prototype.getMessage = function () {
    return this._message;
}

Status.prototype.getValues = function () {
    return this._values;
}

Status.prototype.makeException = function () {
    return new StatusException(this);
}

Status.prototype.makeEvent = function (source) {
    return new Event(this._uri, source, this);
}

// Define some common status values
StatusVal =
    {
    OK           : new Status(StatusUri.OK),
    NONE         : new Status(StatusUri.NONE),
    SUBSCRIBED   : new Status(StatusUri.SUBSCRIBED),
    TRIGGERED    : new Status(StatusUri.TRIGGERED),
    UNSUBSCRIBED : new Status(StatusUri.UNSUBSCRIBED)
    }

// End.
