# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
"""
Event handler framework.
"""

from MiscLib.Logging import Trace, Info, Warn

from URI             import EventTargetBase, uriDate, uriTime, uriDateTime
from Status          import StatusVal
from SyncDeferred    import makeDeferred
from EventAgent      import EventAgent

class EventHandler(EventAgent):
    """
    Represents an event handler.

    Any event handler can also be used as an event source.

    Currently, an event handler is identified by a URI, and has methods for
    event delivery, start of subscription and termination of subscription.

    It is anticipated that future developments will also include some
    kind of security context information so that event subscription can be
    controlled for sensitive events.
    """

    def __init__(self, uri, handleEvent, initSubscription=None, endSubscription=None):
        """
        Initialize a new event handler object.
        
        'target' is a string containing a uri for the event target.
        """
        EventAgent.__init__(self, uri)
        self._handleEvent      = handleEvent
        self._initSubscription = initSubscription
        self._endSubscription  = endSubscription

    def handleEvent(self, event):
        """
        Handle an incoming event.  If defined, the handler function is called with
        this event handler object and the event itself as arguments.
        
        Exceptions are logged then ignored.
        """
        sts = makeDeferred(StatusVal.OK)
        if self._handleEvent:
            try:
                sts = self._handleEvent(self, event)
            except Exception, ex:
                # if any handler throws an exception, log and continue.
                Info("Exception %s"%(ex), "EventLib.EventHandler")
        Trace("handleEvent(%s,%s) -> %s"%(str(self),str(event),str(sts)), "EventLib.EventHandler")
        return sts

    def initSubscription(self, status):
        """
        Subscription notification. If defined, the notification function is called 
        with this event handler object and the subscription status value as arguments.
        """
        if self._initSubscription:
            sts = self._initSubscription(self, status)
        else:
            sts = makeDeferred(status)
        ### Trace("initSubscription(%s,%s) -> %s"%(str(self),str(status),str(sts)), "EventLib.EventHandler")
        return sts

    def endSubscription(self, status):
        """
        Subscription termination notification.  If defined, the notification function 
        is called with this event handler object and the subscription statuis value 
        as arguments.
        """
        if self._endSubscription:
            sts = self._endSubscription(self, status)
        else:
            sts = makeDeferred(status)
        ### Trace("endSubscription(%s,%s) -> %s"%(str(self),str(status),str(sts)), "EventLib.EventHandler")
        return sts

# Function to create an event handler object

EventTargetSequence = 0    # sequence number for URI generation

def makeEventHandler(uri=None, handler=None, initSubscription=None, endSubscription=None):
    """
    Make a new event handler value using the supplied URI.
    
    'uri'       is an identifying URI for this handler.
    'handler'   is a function called when a subscribed event is published, with the 
                new event handler itself as its first argument, and the event object
                as its second argument.
    'initSubscription' and 'endSubscription' are called with the new event handler 
                itself as their first argument, and the status code as their second.
                TODO: review this to consider also providing event type/source values
    
    If no URI is supplied, a new value may be generated.
    """
    global EventTargetSequence
    if not uri:
        EventTargetSequence += 1
        seq = EventTargetSequence
        uri = EventTargetBase+uriDate()+"/"+uriTime()+"/"+str(seq)
    return EventHandler(uri, handler, initSubscription, endSubscription)

# End.
