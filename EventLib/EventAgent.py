# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
"""
Event agent information.

An event agent is a sender or handler of an event, or both.

An EventAgent object provides identification (URI) of the agent, 
and may in future be used to hold context information for security 
and access control options.
"""

from URI import EventAgentBase, uriDate, uriTime, uriDateTime

class EventAgent(object):
    """
    Represents an event agent, which may be a sender, handler or router of an event.

    An event agent is identified by a URI.

    It is anticipated that future developments will also include some
    kind of security context information so that event publication can be
    controlled for sensitive targets.
    """

    def __init__(self, uri):
        """
        Initialize a new event agent object.
        """
        assert isinstance( uri, basestring ), "uri must be a string"
        self._uri = uri

    def __eq__(self, other):
        """
        Event agents are considered equal if they have the same URI
        """
        return other and isinstance(other,EventAgent) and (self._uri == other._uri)

    def __str__(self):
        """
        String representation of an event agent is its URI.
        """
        return self._uri

    def getUri(self):
        """
        Retrieve the event agent identifying URI.
        """
        return self._uri

EventAgentSequence = 0    # sequence number for URI generation

def makeEventAgent(uri=None):
    """
    Make a new event agent value using the supplied URI.
    
    If no URI is supplied, a new value may be generated.
    """
    global EventAgentSequence
    if not uri:
        EventAgentSequence += 1
        seq = EventAgentSequence
        uri = EventAgentBase+uriDate()+"/"+uriTime()+"/"+str(seq)
    return EventAgent(uri)

# End.
