# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
"""
Define a type for status values, and some specific status values.
"""

import URI
from Event import Event

class Status:
    """
    Represents a status value.

    A status value may be used as a basis for creating event values
    or python exceptions.  It also has an associated URI that can be used 
    to communicate the status value between systems, and is also used 
    as the event type when constructing an event object.
    
    Status values may be compared, where the status URI alone is used.
    
    Any additional values are used for diagnostic purposes only.
    """

    def __init__(self, uri, message="", values=None):
        """
        Initialize a new status object
        """
        self._uri     = uri
        self._message = message
        self._values  = values

    def __eq__(self, other):
        return self._uri == other._uri

    def __str__(self):
        msg = ""
        if self._message:
            msg = ": " + self._message
        return self._uri + msg

    def getUri(self):
        return self._uri

    def getMessage(self):
        return self._message

    def getValues(self):
        return self._values

    def makeException(self):
        return StatusException(self)

    def makeEvent(self, source):
        return Event(evtype=self._uri, source=source, payload=self)

class StatusException(Exception):
    """
    Class for exceptions constructed from status values.
    """
    def __init__(self, status):
        Exception.__init__(self, status)
        self._status=status

    def getStatus(self):
        return self._status

# Define some common status values
class StatusVal:
    OK           = Status(URI.Status_OK)
    NONE         = Status(URI.Status_NONE)
    SUBSCRIBED   = Status(URI.Status_SUBSCRIBED)
    TRIGGERED    = Status(URI.Status_TRIGGERED)
    UNSUBSCRIBED = Status(URI.Status_UNSUBSCRIBED)

# End.
