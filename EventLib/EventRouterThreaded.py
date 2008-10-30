# $Id$
#
# Copyright (c) 2008 O2M8 Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
"""
Threaded event routing implementation.
"""

from Queue     import Queue
from threading import Thread, Event

from URI            import EventCloseType
from Status         import StatusVal
from Event          import makeEvent
from QueueDeferred  import makeQueueDeferred
from EventRouter    import EventRouter

from MiscLib.Logging   import Error

class EventRouterThreaded(EventRouter):
    """
    Implements a threaded event router, based on the simple event router,
    which runs as a separate thread until explicitly closed.  This allows
    the event router to run asynchronously from event publishers in the
    same process.

    Incoming events are serialized using a thread-safe Queue object
    """

    def __init__(self, uri=None):
        """
        Initialize a new threaded event router object
        """
        super(EventRouterThreaded, self).__init__(uri)
        self._queue   = Queue()
        self._event   = Event()
        self._closing = False
        self._thread  = Thread(name=uri, target=self.processEvent)
        # Create new thread as daemon so it doesn't block process termination while active
        self._thread.setDaemon(True)
        self._thread.start()
        return

    def publish(self, agent, event):
        """
        Publish an event.  The event source is taken from the event itself;  the 'agent'
        parameter provides an EventAgent context that may be used for diagnostic or
        security purposes.
        """
        if not self._closing:
            self._queue.put( (agent, event) )       # Let the router thread handle the event
            return makeQueueDeferred(StatusVal.OK, self._queue, self._event)
        return makeDeferred(Status.OK)

    def close(self):
        """
        Shut down the event router thread
        """
        # 'EventCloseType' is a private event type used to shut down the event router,
        # which is otherwise ignored.
        self._closing = True
        self._queue.put( (self.getUri(), makeEvent(evtype=EventCloseType, source=self.getUri())) )
        self._thread.join()
        return

    def processEvent(self):
        """
        This function is the event router worker thread.
        """
        # Note: break out of event dispatch loop when closedown event is received
        # and closing flag is set.  This is to prevent DoS attack by faked closedown 
        # event type, and to ensure that prior events received are all processed.
        while True:
            (pubsrc,event) = self._queue.get()
            self._event.set()
            if event.getType() == EventCloseType:
                if self._closing: break
            else:
                try:
                    super(EventRouterThreaded, self).publish(pubsrc,event)
                except Exception, ex:
                    # log it.
                    Error("exception %s" % (ex), context="EventLib.EventRouterThreaded")
        return

# End.

