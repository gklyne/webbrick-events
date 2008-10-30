# $Id$
#
# Copyright (c) 2008 O2M8 Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
"""
Event forwarding envelope.
"""

from Event             import Event, makeEvent

class EventEnvelope:
    """
    Helper class implements a wrapper for forwarded events.
    
    One function of this wrapper is to carry a trail of previous routers through
    which the event has been forwarded, used to detect and block event routing 
    loops.

    An event envelope is represented by a sequence of hops terminating with the
    envelope itself.  Each hop contains a counter that can be used for quick 
    detection of over-long routing paths.
    
    Note: the EventEnvelope itself is immutable once created:  multiple hops
    are encoded as a list of EventEnvelope values, terminating in one with a 
    count of zero and a pointer to the event itself.
    """

    def __init__(self, trail, routerURI, count=0):
        """
        Create an initial routing envelope for a supplied event.
        """
        self._trail = trail         # Previous envelope or event
        self._route = routerURI     # Router URI from which event is forwarded
        self._count = count         # Number of hops in route

    def nextHop(self, routerURI):
        """
        Returns a new envelope for the next event routing hop via the designated 
        event router.
        """
        return EventEnvelope(self, routerURI, count=self._count+1)

    def unWrap(self, routerURI=None, maxhop=0):
        """
        Performs there functions:
        (1) tests if the event has already been routed via the specified router, 
        (2) tests if the event has been routed through a given maximum number of hops, and
        (3) extracts the event from its envelope.
        
        If the event has already been routed via the designated router, or has been
        via the designated number of hops, returns None, otherwise returns the event
        object without the routing envelope.
        """
        if maxhop and self._count > maxhop: return None
        e = self
        while (e._count > 0):
            if e._route == routerURI: return None
            e = e._trail
        assert isinstance(e._trail, Event)
        return e._trail

    def flatten(self, path=None):
        """
        Flattens an envelope and contained event, returning a pair:
          (event,path)
        """
        if not path: path = []      # Create a new empty list each time called
        path[0:0] = [self._route]
        if self._count > 0: return self._trail.flatten(path)
        assert isinstance(self._trail, Event)
        return (self._trail, path)

def constructEnvelope(path, event):
    """
    Constructs an event envelope given an event and a list of URIs
    """
    assert path, "constructEnvelope: Event routing path must be non-empty"
    env = EventEnvelope(event, path[0])
    for u in path[1:]:
        env = env.nextHop(u)
    return env

# End.
